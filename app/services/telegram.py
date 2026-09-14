"""Yangi yuk e'lonini Telegram kanalga avtomatik post qilish xizmati.

Agar TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID sozlanmagan bo'lsa (hali bot
yaratilmagan), tizim ishlashda davom etadi -- faqat log yoziladi. Bu asosiy
API ishlashiga hech qanday xalaqit bermaydi.
"""
import logging

from aiogram import Bot
from aiogram.exceptions import TelegramAPIError

from app.core.config import settings
from app.models.cargo import Cargo
from app.models.enums import PaymentType, VehicleType

logger = logging.getLogger("telegram_service")

VEHICLE_TYPE_LABELS: dict[VehicleType, str] = {
    VehicleType.BORTOVOY: "Bortovoy",
    VehicleType.TENTOVKA: "Tento'vka",
    VehicleType.IZOTERM: "Izoterm (Xolodilnik)",
    VehicleType.FURA: "Fura",
    VehicleType.ISUZU: "Isuzu",
    VehicleType.LABO_CHANGAN: "Labo/Changan",
    VehicleType.BOSHQA: "Boshqa",
}

PAYMENT_TYPE_LABELS: dict[PaymentType, str] = {
    PaymentType.NAQD: "Naqd",
    PaymentType.OTKAZMA: "O'tkazma",
}

REGION_LABELS: dict[str, str] = {
    "toshkent_shahar": "Toshkent shahri",
    "toshkent_viloyati": "Toshkent viloyati",
    "andijon": "Andijon",
    "fargona": "Farg'ona",
    "namangan": "Namangan",
    "sirdaryo": "Sirdaryo",
    "jizzax": "Jizzax",
    "samarqand": "Samarqand",
    "buxoro": "Buxoro",
    "navoiy": "Navoiy",
    "qashqadaryo": "Qashqadaryo",
    "surxondaryo": "Surxondaryo",
    "xorazm": "Xorazm",
    "qoraqalpogiston": "Qoraqalpog'iston",
}


def _region_label(region) -> str:
    return REGION_LABELS.get(getattr(region, "value", region), str(region))


def _yandex_maps_link(lat: float, lon: float) -> str:
    # Yandex Xaritalar pt parametrida tartib: uzunlik(lon),kenglik(lat)
    return f"https://yandex.uz/maps/?pt={lon},{lat}&z=16&l=map"


def build_cargo_message(cargo: Cargo) -> str:
    lines = ["🚚 <b>Yangi yuk!</b>", ""]
    lines.append(f"📦 <b>{cargo.title}</b>")
    if cargo.description:
        lines.append(f"📝 {cargo.description}")
    lines.append(f"⚖️ Og'irligi: {cargo.weight} kg")
    if cargo.volume:
        lines.append(f"📐 Hajmi: {cargo.volume} m³")
    lines.append(f"🚛 Mashina turi: {VEHICLE_TYPE_LABELS.get(cargo.vehicle_type, cargo.vehicle_type)}")
    lines.append("")

    loading_line = f"📍 Ortish: {_region_label(cargo.loading_region)}"
    if cargo.loading_district:
        loading_line += f", {cargo.loading_district}"
    if cargo.loading_landmark:
        loading_line += f" ({cargo.loading_landmark})"
    lines.append(loading_line)

    unloading_line = f"🏁 Tushirish: {_region_label(cargo.unloading_region)}"
    if cargo.unloading_district:
        unloading_line += f", {cargo.unloading_district}"
    if cargo.unloading_landmark:
        unloading_line += f" ({cargo.unloading_landmark})"
    lines.append(unloading_line)

    if cargo.distance_km:
        lines.append(f"🛣 Taxminiy masofa: ~{cargo.distance_km} km")

    if cargo.loading_lat is not None and cargo.loading_lon is not None:
        lines.append(f"🗺 Xarita (ortish joyi): {_yandex_maps_link(cargo.loading_lat, cargo.loading_lon)}")

    lines.append("")
    if cargo.loading_date:
        lines.append(f"📅 Ortish sanasi: {cargo.loading_date.strftime('%d.%m.%Y')}")
    lines.append(f"💰 Narx: {cargo.price:,.0f} so'm ({PAYMENT_TYPE_LABELS.get(cargo.payment_type, cargo.payment_type)})")
    lines.append("")
    lines.append(f"👤 {cargo.owner.full_name}")
    lines.append(f"📞 {cargo.owner.phone_number}")

    return "\n".join(lines)


async def post_cargo_to_channel(cargo: Cargo) -> None:
    message_text = build_cargo_message(cargo)

    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHANNEL_ID:
        logger.info("[TELEGRAM MOCK] Bot token/kanal sozlanmagan. Yuborilishi kerak bo'lgan xabar:\n%s", message_text)
        return

    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        try:
            await bot.send_message(
                chat_id=settings.TELEGRAM_CHANNEL_ID,
                text=message_text,
                parse_mode="HTML",
            )
        finally:
            await bot.session.close()
    except TelegramAPIError:
        logger.exception("Telegram kanalga post yuborishda xatolik yuz berdi")
    except Exception:  # noqa: BLE001
        logger.exception("Telegram xizmatida kutilmagan xatolik")
