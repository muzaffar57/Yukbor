"""Loyihada ishlatiladigan barcha qat'iy ro'yxatlar (enum'lar).

Bularni qat'iy ro'yxat qilib qo'yish filtrlashni aniq va xatosiz qiladi
(erkin matn kiritilsa, xato yozilgan so'zlar filtrlarni buzib qo'yadi).
"""
import enum


class UserRole(str, enum.Enum):
    SHIPPER = "shipper"  # yuk beruvchi
    DRIVER = "driver"  # yuk tashuvchi (haydovchi)


class Region(str, enum.Enum):
    """O'zbekistonning 14 ta hududi (viloyat/shahar/respublika)."""

    TOSHKENT_SHAHAR = "toshkent_shahar"
    TOSHKENT_VILOYATI = "toshkent_viloyati"
    ANDIJON = "andijon"
    FARGONA = "fargona"
    NAMANGAN = "namangan"
    SIRDARYO = "sirdaryo"
    JIZZAX = "jizzax"
    SAMARQAND = "samarqand"
    BUXORO = "buxoro"
    NAVOIY = "navoiy"
    QASHQADARYO = "qashqadaryo"
    SURXONDARYO = "surxondaryo"
    XORAZM = "xorazm"
    QORAQALPOGISTON = "qoraqalpogiston"


class VehicleType(str, enum.Enum):
    KATTA_ISUZU = "katta_isuzu"
    KICHIK_ISUZU = "kichik_isuzu"
    PARAVOZ = "paravoz"
    SHALANDA = "shalanda"
    REF = "ref"
    TONAR = "tonar"
    CHAKMAN = "chakman"
    KAMAZ = "kamaz"
    LABO = "labo"
    BONGO = "bongo"
    FURA = "fura"
    TENTOVKA = "tentovka"
    BORTOVOY = "bortovoy"
    IZOTERM = "izoterm"  # xolodilnik / eski ref
    # Eski e'lonlar uchun saqlanadi, yangi formida chiqmaydi.
    ISUZU = "isuzu"
    LABO_CHANGAN = "labo_changan"
    BOSHQA = "boshqa"


class PaymentType(str, enum.Enum):
    NAQD = "naqd"
    OTKAZMA = "otkazma"


class CargoStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELED = "canceled"


class LoadType(str, enum.Enum):
    """Yuk butun mashinani band qiladimi, yoki qisman (lahtak) joy yetarlimi."""

    TOLIQ_MASHINA = "toliq_mashina"
    QISMAN_YUK = "qisman_yuk"  # lahtak -- boshqa yuk bilan birga ketishi mumkin
