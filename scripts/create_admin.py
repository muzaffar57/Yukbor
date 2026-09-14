"""Birinchi administratorni yaratish (yoki mavjud foydalanuvchini admin qilish) skripti.

Nega alohida skript?
---------------------
Xavfsizlik uchun API orqali (masalan register endpointi) hech kim o'zini
admin qilib belgilay olmaydi. Admin faqat shu skript orqali, to'g'ridan-to'g'ri
serverga kirish huquqi bo'lgan odam tomonidan yaratiladi.

Ishlatish:
    source .venv/bin/activate
    python -m scripts.create_admin +998901234567

Agar shu raqamli foydalanuvchi mavjud bo'lmasa, skript sizdan ism va parol
so'raydi va yangi admin-foydalanuvchi yaratadi.
"""
import asyncio
import sys

from app.db.base import Base  # noqa: F401  (barcha modellarni ro'yxatdan o'tkazish uchun)
from app.core.security import hash_password
from app.crud.user import get_user_by_phone
from app.db.session import AsyncSessionLocal
from app.models.enums import UserRole
from app.models.user import User


async def main(phone_number: str) -> None:
    async with AsyncSessionLocal() as db:
        user = await get_user_by_phone(db, phone_number)
        if user is not None:
            user.is_admin = True
            await db.commit()
            print(f"OK: {phone_number} endi administrator huquqiga ega.")
            return

        full_name = input("Yangi admin uchun ism-familiya: ").strip()
        password = input("Yangi admin uchun parol (kamida 6 belgi): ").strip()
        new_user = User(
            full_name=full_name or "Administrator",
            phone_number=phone_number,
            password_hash=hash_password(password or "admin123456"),
            role=UserRole.SHIPPER,
            is_admin=True,
        )
        db.add(new_user)
        await db.commit()
        print(f"OK: {phone_number} nomli yangi administrator yaratildi.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Ishlatish: python -m scripts.create_admin +998901234567")
        sys.exit(1)
    asyncio.run(main(sys.argv[1]))
