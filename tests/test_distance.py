from app.models.enums import Region
from app.services.distance import estimate_cargo_distance_km, estimate_distance_km


def test_region_distance_is_positive():
    km = estimate_distance_km(Region.BUXORO, Region.TOSHKENT_SHAHAR)
    assert 400 < km < 700


def test_two_gps_pins_override_region_centers():
    # Buxoro shahar ~ Toshkent shahar pinlari
    region_km = estimate_distance_km(Region.BUXORO, Region.TOSHKENT_SHAHAR)
    gps_km = estimate_cargo_distance_km(
        Region.BUXORO,
        Region.TOSHKENT_SHAHAR,
        loading_lat=39.768,
        loading_lon=64.455,
        unloading_lat=41.311,
        unloading_lon=69.279,
    )
    assert gps_km > 400
    # Pinlar viloyat markaziga yaqin, lekin bir xil formula — farq katta bo'lmasin
    assert abs(gps_km - region_km) < 80


def test_same_spot_gps_falls_back_to_regions():
    region_km = estimate_distance_km(Region.BUXORO, Region.TOSHKENT_SHAHAR)
    km = estimate_cargo_distance_km(
        Region.BUXORO,
        Region.TOSHKENT_SHAHAR,
        loading_lat=39.77,
        loading_lon=64.43,
        unloading_lat=39.7701,
        unloading_lon=64.4301,
    )
    assert km == region_km
