"""Viloyatlar orasidagi taxminiy masofani (km) hisoblash xizmati.

Nega bunday qilingan?
---------------------
Google/Yandex Xarita API orqali aniq yo'l masofasini olish pullik va MVP
uchun ortiqcha xarajat. Shuning uchun har bir hudud (viloyat) markazining
GPS koordinatasi (kenglik/uzunlik) oldindan kiritilgan, va ikki nuqta
orasidagi masofa "Haversine" formulasi bilan hisoblanadi, so'ngra yo'lning
to'g'ri chiziq bo'lmasligini (aylanma yo'llar, tog' oshirmalar va h.k.)
hisobga olib, ROAD_DISTANCE_FACTOR ga ko'paytiriladi.

Bu -- TAXMINIY qiymat, aniq GPS-marshrut emas. Kelajakda haqiqiy xarita
API (masalan Yandex Router API) ulansa, shu funksiyani almashtirish kifoya
-- boshqa hech narsa o'zgarmaydi.
"""
import math

from app.models.enums import Region

# Har bir hudud markazining taxminiy GPS koordinatasi (kenglik, uzunlik).
REGION_COORDINATES: dict[Region, tuple[float, float]] = {
    Region.TOSHKENT_SHAHAR: (41.2995, 69.2401),
    Region.TOSHKENT_VILOYATI: (41.0333, 69.3417),
    Region.ANDIJON: (40.7821, 72.3442),
    Region.FARGONA: (40.3842, 71.7843),
    Region.NAMANGAN: (40.9983, 71.6726),
    Region.SIRDARYO: (40.4897, 68.7842),
    Region.JIZZAX: (40.1158, 67.8422),
    Region.SAMARQAND: (39.6542, 66.9597),
    Region.BUXORO: (39.7747, 64.4286),
    Region.NAVOIY: (40.0844, 65.3792),
    Region.QASHQADARYO: (38.8606, 65.7891),
    Region.SURXONDARYO: (37.2242, 67.2783),
    Region.XORAZM: (41.5506, 60.6317),
    Region.QORAQALPOGISTON: (42.4531, 59.6103),
}

# Yo'lning to'g'ri chiziq bo'lmasligi uchun tuzatish koeffitsiyenti.
ROAD_DISTANCE_FACTOR = 1.2

# Agar ortish va tushirish bir xil viloyatda bo'lsa, o'rtacha shahar/tuman
# ichi masofa sifatida ishlatiladigan taxminiy qiymat.
INTRA_REGION_DISTANCE_KM = 50.0

EARTH_RADIUS_KM = 6371.0


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def estimate_distance_km(loading_region: Region, unloading_region: Region) -> float:
    """Ikki hudud orasidagi taxminiy yo'l masofasini (km) qaytaradi."""
    if loading_region == unloading_region:
        return INTRA_REGION_DISTANCE_KM

    lat1, lon1 = REGION_COORDINATES[loading_region]
    lat2, lon2 = REGION_COORDINATES[unloading_region]
    straight_line_km = _haversine_km(lat1, lon1, lat2, lon2)
    return round(straight_line_km * ROAD_DISTANCE_FACTOR, 1)
