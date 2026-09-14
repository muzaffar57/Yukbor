from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)

    # Telegram WebApp orqali ro'yxatdan o'tgan foydalanuvchilarda parol
    # bo'lmaydi (ular faqat Telegram orqali kiradi) -- shuning uchun nullable.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Telegram WebApp integratsiyasi uchun -- har bir Telegram foydalanuvchisi
    # o'zining noyob (unique) Telegram ID'si bilan bog'lanadi. Bir marta
    # bog'langandan keyin, keyingi kirishlarda parol so'ralmaydi.
    telegram_id: Mapped[int | None] = mapped_column(
        BigInteger, unique=True, index=True, nullable=True
    )
    telegram_username: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        String(20), nullable=False, index=True
    )

    # Foydalanuvchini bloklash imkoniyati (kelajakda ishlatiladi)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Faqat admin foydalanuvchi obunani boshqara oladi. Bu maydon faqat
    # server tomonda (DB orqali) o'rnatiladi, ro'yxatdan o'tish endpointi
    # orqali hech qachon True qilib bo'lmaydi (xavfsizlik uchun).
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Kelajakdagi monetizatsiya (faqat haydovchilar uchun) uchun tayanch.
    # NULL = cheksiz/bepul (hozircha barcha foydalanuvchilar shu holatda).
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    cargos: Mapped[list["Cargo"]] = relationship(back_populates="owner")  # noqa: F821
    driver_offers: Mapped[list["DriverOffer"]] = relationship(back_populates="driver")  # noqa: F821
