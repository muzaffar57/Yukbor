from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.enums import CargoStatus, LoadType, PaymentType, Region, VehicleType


class DriverOffer(Base):
    """Haydovchining "bo'sh transport" e'loni.

    Bu Cargo'ning aksi: bu yerda HAYDOVCHI o'zining mashinasi, yo'nalishi va
    bo'sh joyini (kg/m3) e'lon qiladi, YUK BERUVCHI esa uni qidirib topadi.
    """

    __tablename__ = "driver_offers"

    id: Mapped[int] = mapped_column(primary_key=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Jo'nash nuqtasi (A)
    departure_region: Mapped[Region] = mapped_column(String(30), nullable=False, index=True)
    departure_district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    departure_landmark: Mapped[str | None] = mapped_column(String(500), nullable=True)
    departure_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    departure_lon: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Manzil nuqtasi (B) -- IXTIYORIY. NULL bo'lsa "istalgan yo'nalish /
    # kelishuv bo'yicha" degani.
    destination_region: Mapped[Region | None] = mapped_column(String(30), nullable=True, index=True)
    destination_district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    destination_landmark: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Faqat destination_region berilgan bo'lsa hisoblanadi.
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)

    vehicle_type: Mapped[VehicleType] = mapped_column(String(20), nullable=False, index=True)
    load_type: Mapped[LoadType] = mapped_column(
        String(20), nullable=False, index=True, server_default=LoadType.QISMAN_YUK.value
    )

    available_weight: Mapped[float | None] = mapped_column(Float, nullable=True)  # kg, bo'sh joy
    available_volume: Mapped[float | None] = mapped_column(Float, nullable=True)  # m3, bo'sh joy

    price_expectation: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    payment_type: Mapped[PaymentType | None] = mapped_column(String(20), nullable=True)

    departure_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    status: Mapped[CargoStatus] = mapped_column(
        String(20), nullable=False, index=True, default=CargoStatus.ACTIVE
    )

    driver_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    telegram_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    driver: Mapped["User"] = relationship(back_populates="driver_offers")  # noqa: F821
