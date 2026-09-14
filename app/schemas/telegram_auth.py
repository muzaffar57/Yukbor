from pydantic import BaseModel, Field

from app.models.enums import UserRole
from app.schemas.token import Token
from app.schemas.user import UserOut


class TelegramLoginRequest(BaseModel):
    init_data: str = Field(
        description="Telegram.WebApp.initData qatori (frontend'dan o'zgarishsiz yuboriladi)"
    )


class TelegramProfileOut(BaseModel):
    """Telegram'dan kelgan, hali bizning bazamizda ro'yxatdan o'tmagan foydalanuvchi ma'lumoti."""

    telegram_id: int
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None


class TelegramLoginResult(BaseModel):
    registered: bool
    access_token: str | None = None
    token_type: str = "bearer"
    user: UserOut | None = None
    telegram_profile: TelegramProfileOut | None = None


class TelegramRegisterRequest(BaseModel):
    init_data: str = Field(description="Telegram.WebApp.initData qatori")
    full_name: str
    phone_number: str
    role: UserRole


class TelegramMockLoginRequest(BaseModel):
    """Faqat TELEGRAM_MOCK_AUTH_ENABLED=true bo'lganda ishlaydi (lokal test uchun)."""

    telegram_id: int
    first_name: str = "Test"
    username: str | None = None
    full_name: str | None = None
    phone_number: str | None = None
    role: UserRole | None = None
