from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import CargoStatus, LoadType, PaymentType, Region, VehicleType


class DriverOfferCreate(BaseModel):
    description: str | None = Field(default=None, max_length=2000)

    departure_region: Region
    departure_district: str | None = Field(default=None, max_length=255)
    departure_landmark: str | None = Field(default=None, max_length=500)
    departure_lat: float | None = Field(default=None, ge=-90, le=90)
    departure_lon: float | None = Field(default=None, ge=-180, le=180)

    # Ixtiyoriy: bo'sh qoldirilsa "istalgan yo'nalish / kelishuv bo'yicha" deb qaraladi.
    destination_region: Region | None = None
    destination_district: str | None = Field(default=None, max_length=255)
    destination_landmark: str | None = Field(default=None, max_length=500)

    vehicle_type: VehicleType
    load_type: LoadType = Field(
        default=LoadType.QISMAN_YUK,
        description="To'liq mashina bo'shmi, yoki qisman/lahtak joy bormi",
    )

    available_weight: float | None = Field(default=None, gt=0, description="Bo'sh joy, kg")
    available_volume: float | None = Field(default=None, gt=0, description="Bo'sh joy, m3")

    price_expectation: float | None = Field(default=None, gt=0)
    payment_type: PaymentType | None = None

    departure_date: datetime

    @model_validator(mode="after")
    def validate_gps_pair(self) -> "DriverOfferCreate":
        has_lat = self.departure_lat is not None
        has_lon = self.departure_lon is not None
        if has_lat != has_lon:
            raise ValueError("departure_lat va departure_lon ikkisi birga berilishi kerak")
        return self


class DriverOfferStatusUpdate(BaseModel):
    status: CargoStatus


class DriverOfferDriverOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone_number: str


class DriverOfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str | None

    departure_region: Region
    departure_district: str | None
    departure_landmark: str | None
    departure_lat: float | None
    departure_lon: float | None

    destination_region: Region | None
    destination_district: str | None
    destination_landmark: str | None

    distance_km: float | None

    vehicle_type: VehicleType
    load_type: LoadType

    available_weight: float | None
    available_volume: float | None

    price_expectation: float | None
    payment_type: PaymentType | None

    departure_date: datetime
    status: CargoStatus

    driver: DriverOfferDriverOut
    created_at: datetime


class DriverOfferListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[DriverOfferOut]
