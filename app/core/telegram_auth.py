"""Telegram WebApp `initData`sini xavfsiz tekshirish.

Telegram Mini App ochilganda, Telegram brauzerga `initData` degan qatorni
beradi (foydalanuvchi ID, ism va h.k.). Bu ma'lumot mijoz (frontend)
tomonidan osongina qalbakilashtirilishi mumkin, shuning uchun har safar
serverda uni bot tokenimiz bilan raqamli imzo (HMAC) orqali tasdiqlaymiz.

Rasmiy algoritm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

from app.core.config import settings


class TelegramInitDataError(Exception):
    """initData yaroqsiz, qalbaki yoki muddati o'tgan bo'lsa ko'tariladi."""


def _build_secret_key(bot_token: str) -> bytes:
    return hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()


def parse_and_verify_init_data(init_data: str, max_age_seconds: int = 86400) -> dict:
    """`init_data`ni tekshiradi va ichidagi `user` obyektini (dict) qaytaradi.

    Muvaffaqiyatsiz bo'lsa `TelegramInitDataError` ko'taradi.
    """
    if not settings.TELEGRAM_BOT_TOKEN:
        raise TelegramInitDataError(
            "Server tomonda TELEGRAM_BOT_TOKEN sozlanmagan, Telegram orqali kirish ishlamaydi."
        )

    if not init_data:
        raise TelegramInitDataError("initData bo'sh.")

    pairs = parse_qsl(init_data, strict_parsing=True)
    data = dict(pairs)

    received_hash = data.pop("hash", None)
    if not received_hash:
        raise TelegramInitDataError("initData ichida 'hash' topilmadi.")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = _build_secret_key(settings.TELEGRAM_BOT_TOKEN)
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise TelegramInitDataError("initData imzosi noto'g'ri -- qalbaki bo'lishi mumkin.")

    auth_date = data.get("auth_date")
    if auth_date is not None:
        try:
            age = time.time() - int(auth_date)
        except ValueError:
            age = None
        if age is not None and age > max_age_seconds:
            raise TelegramInitDataError("initData muddati tugagan, sahifani qaytadan oching.")

    user_raw = data.get("user")
    if not user_raw:
        raise TelegramInitDataError("initData ichida foydalanuvchi ma'lumoti topilmadi.")

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError as exc:
        raise TelegramInitDataError("Foydalanuvchi ma'lumotini o'qib bo'lmadi.") from exc

    if "id" not in user:
        raise TelegramInitDataError("Foydalanuvchi ID topilmadi.")

    return user
