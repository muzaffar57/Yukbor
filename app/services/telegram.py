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
from app.models.driver_offer import DriverOffer
from app.models.enums import LoadType, PaymentType, VehicleType

logger = logging.getLogger("telegram_service")

VEHICLE_TYPE_LABELS: dict[VehicleType, str] = {
    VehicleType.KATTA_ISUZU: "Katta Isuzu",
    VehicleType.KICHIK_ISUZU: "Kichik Isuzu",
    VehicleType.PARAVOZ: "Paravoz",
    VehicleType.SHALANDA: "Shalanda",
    VehicleType.REF: "Ref",
    VehicleType.TONAR: "Tonar",
    VehicleType.CHAKMAN: "Chakman",
    VehicleType.KAMAZ: "Kamaz",
    VehicleType.LABO: "Labo",
    VehicleType.BONGO: "Bongo",
    VehicleType.FURA: "Fura",
    VehicleType.TENTOVKA: "Tento'vka",
    VehicleType.BORTOVOY: "Bortovoy",
    VehicleType.IZOTERM: "Izoterm (Xolodilnik)",
    VehicleType.ISUZU: "Isuzu",
    VehicleType.LABO_CHANGAN: "Labo/Changan",
    VehicleType.BOSHQA: "Boshqa",
}

LOAD_TYPE_LABELS: dict[LoadType, str] = {
    LoadType.TOLIQ_MASHINA: "To'liq mashina",
    LoadType.QISMAN_YUK: "Qisman/lahtak yuk (bo'lishish mumkin)",
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


def build_cargo_message(cargo: Cargo, *, closed: bool = False) -> str:
    if closed:
        lines = ["✅ <b>YUK YOPILDI</b>", ""]
    else:
        lines = ["🚚 <b>Yangi yuk!</b>", ""]
    lines.append(f"📦 <b>{cargo.title}</b>")
    if cargo.description:
        lines.append(f"📝 {cargo.description}")
    lines.append(f"⚖️ Og'irligi: {cargo.weight} kg")
    if cargo.volume:
        lines.append(f"📐 Hajmi: {cargo.volume} m³")
    lines.append(f"🚛 Mashina turi: {VEHICLE_TYPE_LABELS.get(cargo.vehicle_type, cargo.vehicle_type)}")
    lines.append(f"📦 Yuk turi: {LOAD_TYPE_LABELS.get(cargo.load_type, cargo.load_type)}")
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
    if cargo.unloading_lat is not None and cargo.unloading_lon is not None:
        lines.append(f"🗺 Xarita (tushirish joyi): {_yandex_maps_link(cargo.unloading_lat, cargo.unloading_lon)}")

    lines.append("")
    if cargo.loading_date:
        lines.append(f"📅 Ortish sanasi: {cargo.loading_date.strftime('%d.%m.%Y')}")
    lines.append(f"💰 Narx: {cargo.price:,.0f} so'm ({PAYMENT_TYPE_LABELS.get(cargo.payment_type, cargo.payment_type)})")
    lines.append("")
    if closed:
        lines.append("🔒 Mijoz raqami yashirilgan")
    else:
        lines.append(f"👤 {cargo.owner.full_name}")
        lines.append(f"📞 {cargo.owner.phone_number}")

    return "\n".join(lines)


async def _send_channel_message(text: str) -> int | None:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHANNEL_ID:
        logger.info("[TELEGRAM MOCK] Bot token/kanal sozlanmagan. Yuborilishi kerak bo'lgan xabar:\n%s", text)
        return None
    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        try:
            sent = await bot.send_message(
                chat_id=settings.TELEGRAM_CHANNEL_ID,
                text=text,
                parse_mode="HTML",
            )
            return sent.message_id
        finally:
            await bot.session.close()
    except TelegramAPIError:
        logger.exception("Telegram kanalga post yuborishda xatolik yuz berdi")
    except Exception:  # noqa: BLE001
        logger.exception("Telegram xizmatida kutilmagan xatolik")
    return None


async def _edit_channel_message(message_id: int, text: str) -> None:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHANNEL_ID:
        logger.info("[TELEGRAM MOCK] Kanal posti yangilanadi (id=%s):\n%s", message_id, text)
        return
    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        try:
            await bot.edit_message_text(
                chat_id=settings.TELEGRAM_CHANNEL_ID,
                message_id=message_id,
                text=text,
                parse_mode="HTML",
            )
        finally:
            await bot.session.close()
    except TelegramAPIError:
        logger.exception("Telegram kanal postini tahrirlashda xatolik yuz berdi")
    except Exception:  # noqa: BLE001
        logger.exception("Telegram xizmatida kutilmagan xatolik")


async def post_cargo_to_channel(cargo: Cargo) -> int | None:
    return await _send_channel_message(build_cargo_message(cargo, closed=False))


async def mark_cargo_closed_in_channel(cargo: Cargo) -> None:
    if cargo.telegram_message_id is None:
        logger.info("Yuk #%s uchun Telegram post ID yo'q -- kanalni yangilab bo'lmaydi", cargo.id)
        return
    await _edit_channel_message(cargo.telegram_message_id, build_cargo_message(cargo, closed=True))


def build_driver_offer_message(offer: DriverOffer, *, closed: bool = False) -> str:
    if closed:
        lines = ["✅ <b>TRANSPORT YOPILDI</b>", ""]
    else:
        lines = ["🚛 <b>BO'SH TRANSPORT (LAHTAK)</b>", ""]

    if offer.description:
        lines.append(f"📝 {offer.description}")

    lines.append(f"🚚 Mashina turi: {VEHICLE_TYPE_LABELS.get(offer.vehicle_type, offer.vehicle_type)}")
    lines.append(f"📦 Qabul qiladi: {LOAD_TYPE_LABELS.get(offer.load_type, offer.load_type)}")
    if offer.available_weight:
        lines.append(f"⚖️ Bo'sh joy (og'irlik): {offer.available_weight} kg")
    if offer.available_volume:
        lines.append(f"📐 Bo'sh joy (hajm): {offer.available_volume} m³")
    lines.append("")

    departure_line = f"📍 Jo'nash: {_region_label(offer.departure_region)}"
    if offer.departure_district:
        departure_line += f", {offer.departure_district}"
    if offer.departure_landmark:
        departure_line += f" ({offer.departure_landmark})"
    lines.append(departure_line)

    if offer.destination_region:
        destination_line = f"🏁 Yo'nalish: {_region_label(offer.destination_region)}"
        if offer.destination_district:
            destination_line += f", {offer.destination_district}"
        if offer.destination_landmark:
            destination_line += f" ({offer.destination_landmark})"
        lines.append(destination_line)
        if offer.distance_km:
            lines.append(f"🛣 Taxminiy masofa: ~{offer.distance_km} km")
    else:
        lines.append("🏁 Yo'nalish: Istalgan yo'nalish / Kelishuv bo'yicha")

    if offer.departure_lat is not None and offer.departure_lon is not None:
        lines.append(f"🗺 Xarita (jo'nash joyi): {_yandex_maps_link(offer.departure_lat, offer.departure_lon)}")

    lines.append("")
    lines.append(f"📅 Jo'nash sanasi: {offer.departure_date.strftime('%d.%m.%Y %H:%M')}")

    if offer.price_expectation:
        payment_label = PAYMENT_TYPE_LABELS.get(offer.payment_type, offer.payment_type) if offer.payment_type else ""
        lines.append(f"💰 Narx taklifi: {offer.price_expectation:,.0f} so'm" + (f" ({payment_label})" if payment_label else ""))
    else:
        lines.append("💰 Narx: Kelishuv bo'yicha")

    lines.append("")
    if closed:
        lines.append("🔒 Telefon raqami yashirilgan")
    else:
        lines.append(f"👤 {offer.driver.full_name}")
        lines.append(f"📞 {offer.driver.phone_number}")

    return "\n".join(lines)


async def post_driver_offer_to_channel(offer: DriverOffer) -> int | None:
    return await _send_channel_message(build_driver_offer_message(offer, closed=False))


async def mark_driver_offer_closed_in_channel(offer: DriverOffer) -> None:
    if offer.telegram_message_id is None:
        logger.info("Bo'sh transport #%s uchun Telegram post ID yo'q -- kanalni yangilab bo'lmaydi", offer.id)
        return
    await _edit_channel_message(offer.telegram_message_id, build_driver_offer_message(offer, closed=True))
