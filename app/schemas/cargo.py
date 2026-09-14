from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import CargoStatus, LoadType, PaymentType, Region, VehicleType


class CargoCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)

    weight: float = Field(gt=0, description="Og'irligi, kg")
    volume: float | None = Field(default=None, gt=0, description="Hajmi, m3")

    loading_region: Region
    loading_district: str | None = Field(default=None, max_length=255)
    loading_landmark: str | None = Field(default=None, max_length=500)
    loading_lat: float | None = Field(default=None, ge=-90, le=90)
    loading_lon: float | None = Field(default=None, ge=-180, le=180)

    unloading_region: Region
    unloading_district: str | None = Field(default=None, max_length=255)
    unloading_landmark: str | None = Field(default=None, max_length=500)

    vehicle_type: VehicleType
    load_type: LoadType = Field(
        default=LoadType.TOLIQ_MASHINA,
        description="To'liq mashina kerakmi, yoki qisman/lahtak joy yetarli",
    )
    price: float = Field(gt=0)
    payment_type: PaymentType
    loading_date: date | None = None

    @model_validator(mode="after")
    def validate_gps_pair(self) -> "CargoCreate":
        has_lat = self.loading_lat is not None
        has_lon = self.loading_lon is not None
        if has_lat != has_lon:
            raise ValueError("loading_lat va loading_lon ikkisi birga berilishi kerak")
        return self


class CargoPhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    created_at: datetime


class CargoStatusUpdate(BaseModel):
    status: CargoStatus


class CargoOwnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone_number: str


class CargoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    weight: float
    volume: float | None

    loading_region: Region
    loading_district: str | None
    loading_landmark: str | None
    loading_lat: float | None
    loading_lon: float | None

    unloading_region: Region
    unloading_district: str | None
    unloading_landmark: str | None

    distance_km: float | None

    vehicle_type: VehicleType
    load_type: LoadType
    price: float
    payment_type: PaymentType
    loading_date: date | None
    status: CargoStatus

    owner: CargoOwnerOut
    photos: list[CargoPhotoOut] = []
    created_at: datetime


class CargoListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[CargoOut]
