from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.enums import CargoStatus, LoadType, PaymentType, Region, VehicleType


class Cargo(Base):
    __tablename__ = "cargos"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    weight: Mapped[float] = mapped_column(Float, nullable=False)  # kg
    volume: Mapped[float | None] = mapped_column(Float, nullable=True)  # m3

    # A nuqta - ortish joyi
    loading_region: Mapped[Region] = mapped_column(String(30), nullable=False, index=True)
    loading_district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    loading_landmark: Mapped[str | None] = mapped_column(String(500), nullable=True)
    loading_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    loading_lon: Mapped[float | None] = mapped_column(Float, nullable=True)

    # B nuqta - tushirish joyi
    unloading_region: Mapped[Region] = mapped_column(String(30), nullable=False, index=True)
    unloading_district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unloading_landmark: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Avtomatik hisoblangan taxminiy masofa (viloyatlar orasidagi masofa
    # jadvali asosida). Bu aniq GPS-marshrut emas, taxminiy qiymat.
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)

    vehicle_type: Mapped[VehicleType] = mapped_column(String(20), nullable=False, index=True)
    # To'liq mashina kerakmi, yoki qisman/lahtak joy yetarlimi (boshqa yuk
    # bilan birga ketishi mumkin).
    load_type: Mapped[LoadType] = mapped_column(
        String(20), nullable=False, index=True, server_default=LoadType.TOLIQ_MASHINA.value
    )
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(String(20), nullable=False)

    loading_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    status: Mapped[CargoStatus] = mapped_column(
        String(20), nullable=False, index=True, default=CargoStatus.ACTIVE
    )

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Telegram kanalidagi post ID -- yopilganda shu xabarni tahrirlash uchun.
    telegram_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    owner: Mapped["User"] = relationship(back_populates="cargos")  # noqa: F821
    photos: Mapped[list["CargoPhoto"]] = relationship(  # noqa: F821
        back_populates="cargo", cascade="all, delete-orphan"
    )
