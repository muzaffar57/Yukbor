import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.enums import UserRole

PHONE_PATTERN = re.compile(r"^\+998\d{9}$")


class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    password: str
    role: UserRole

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Ism-familiya kamida 2 belgidan iborat bo'lishi kerak")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        v = v.strip().replace(" ", "")
        if not PHONE_PATTERN.match(v):
            raise ValueError("Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Parol kamida 6 belgidan iborat bo'lishi kerak")
        return v


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone_number: str
    role: UserRole
    is_active: bool
    is_admin: bool
    subscription_expires_at: datetime | None
    created_at: datetime
