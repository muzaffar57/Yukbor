from types import SimpleNamespace

from app.models.enums import LoadType, PaymentType, VehicleType
from app.services.telegram import build_cargo_message, build_driver_offer_message


def test_open_cargo_includes_phone_and_no_closed_stamp():
    cargo = SimpleNamespace(
        title="Paxta",
        description=None,
        weight=12000,
        volume=40,
        vehicle_type=VehicleType.FURA,
        load_type=LoadType.TOLIQ_MASHINA,
        loading_region="buxoro",
        loading_district="Gijduvon",
        loading_landmark=None,
        unloading_region="toshkent_shahar",
        unloading_district=None,
        unloading_landmark=None,
        distance_km=450,
        loading_lat=None,
        loading_lon=None,
        unloading_lat=None,
        unloading_lon=None,
        loading_date=None,
        price=8_000_000,
        payment_type=PaymentType.NAQD,
        owner=SimpleNamespace(full_name="Ali Valiyev", phone_number="+998901112233"),
    )
    text = build_cargo_message(cargo, closed=False)
    assert "Yangi yuk" in text
    assert "+998901112233" in text
    assert "YUK YOPILDI" not in text
    assert "yashirilgan" not in text


def test_closed_cargo_stamps_and_hides_phone():
    cargo = SimpleNamespace(
        title="Paxta",
        description=None,
        weight=12000,
        volume=40,
        vehicle_type=VehicleType.FURA,
        load_type=LoadType.TOLIQ_MASHINA,
        loading_region="buxoro",
        loading_district="Gijduvon",
        loading_landmark=None,
        unloading_region="toshkent_shahar",
        unloading_district=None,
        unloading_landmark=None,
        distance_km=450,
        loading_lat=None,
        loading_lon=None,
        unloading_lat=None,
        unloading_lon=None,
        loading_date=None,
        price=8_000_000,
        payment_type=PaymentType.NAQD,
        owner=SimpleNamespace(full_name="Ali Valiyev", phone_number="+998901112233"),
    )
    text = build_cargo_message(cargo, closed=True)
    assert "YUK YOPILDI" in text
    assert "+998901112233" not in text
    assert "Ali Valiyev" not in text
    assert "Mijoz raqami yashirilgan" in text


def test_closed_driver_offer_hides_phone():
    offer = SimpleNamespace(
        description="Bo'sh joy bor",
        vehicle_type=VehicleType.ISUZU,
        load_type=LoadType.QISMAN_YUK,
        available_weight=2000,
        available_volume=12,
        departure_region="samarqand",
        departure_district=None,
        departure_landmark=None,
        destination_region="toshkent_shahar",
        destination_district=None,
        destination_landmark=None,
        distance_km=280,
        departure_lat=None,
        departure_lon=None,
        departure_date=__import__("datetime").datetime(2026, 9, 20, 8, 0),
        price_expectation=None,
        payment_type=None,
        driver=SimpleNamespace(full_name="Hasan", phone_number="+998907778899"),
    )
    text = build_driver_offer_message(offer, closed=True)
    assert "TRANSPORT YOPILDI" in text
    assert "+998907778899" not in text
    assert "Hasan" not in text
