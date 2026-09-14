import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.core.telegram_auth import TelegramInitDataError, parse_and_verify_init_data
from app.api.deps import get_current_user
from app.crud.user import (
    create_user,
    create_user_from_telegram,
    get_user_by_phone,
    get_user_by_telegram_id,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.telegram_auth import (
    TelegramLoginRequest,
    TelegramLoginResult,
    TelegramMockLoginRequest,
    TelegramProfileOut,
    TelegramRegisterRequest,
)
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth (Ro'yxatdan o'tish / Kirish)"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi foydalanuvchi ro'yxatdan o'tkazish",
)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)) -> UserOut:
    existing = await get_user_by_phone(db, data.phone_number)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan.",
        )
    user = await create_user(db, data)
    return UserOut.model_validate(user)


@router.post(
    "/login",
    response_model=Token,
    summary="Tizimga kirish (telefon raqami = username, parol = password)",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = await get_user_by_phone(db, form_data.username.strip().replace(" ", ""))
    if (
        user is None
        or user.password_hash is None
        or not verify_password(form_data.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Telefon raqami yoki parol noto'g'ri.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hisobingiz bloklangan. Administrator bilan bog'laning.",
        )

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Joriy tizimga kirgan foydalanuvchi ma'lumotlari (token orqali)",
)
async def read_current_user(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.post(
    "/telegram/login",
    response_model=TelegramLoginResult,
    summary="Telegram WebApp orqali avtomatik kirish (agar avval ro'yxatdan o'tgan bo'lsa)",
)
async def telegram_login(
    data: TelegramLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TelegramLoginResult:
    try:
        telegram_user = parse_and_verify_init_data(data.init_data)
    except TelegramInitDataError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    telegram_id = int(telegram_user["id"])
    user = await get_user_by_telegram_id(db, telegram_id)

    if user is None:
        return TelegramLoginResult(
            registered=False,
            telegram_profile=TelegramProfileOut(
                telegram_id=telegram_id,
                first_name=telegram_user.get("first_name"),
                last_name=telegram_user.get("last_name"),
                username=telegram_user.get("username"),
                photo_url=telegram_user.get("photo_url"),
            ),
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hisobingiz bloklangan. Administrator bilan bog'laning.",
        )

    access_token = create_access_token(subject=str(user.id))
    return TelegramLoginResult(
        registered=True,
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


@router.post(
    "/telegram/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Telegram WebApp orqali birinchi marta ro'yxatdan o'tish",
)
async def telegram_register(
    data: TelegramRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    try:
        telegram_user = parse_and_verify_init_data(data.init_data)
    except TelegramInitDataError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    telegram_id = int(telegram_user["id"])

    if await get_user_by_telegram_id(db, telegram_id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu Telegram hisobi allaqachon ro'yxatdan o'tgan.",
        )

    phone_number = data.phone_number.strip().replace(" ", "")
    if await get_user_by_phone(db, phone_number) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan.",
        )

    user = await create_user_from_telegram(
        db,
        telegram_id=telegram_id,
        telegram_username=telegram_user.get("username"),
        full_name=data.full_name,
        phone_number=phone_number,
        role=data.role,
    )
    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token)


@router.post(
    "/telegram/mock-login",
    response_model=Token,
    summary="[FAQAT DEV] Telegram'siz sinov uchun -- production'da o'chirilgan",
    include_in_schema=settings.TELEGRAM_MOCK_AUTH_ENABLED,
)
async def telegram_mock_login(
    data: TelegramMockLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    if not settings.TELEGRAM_MOCK_AUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu endpoint faqat dev muhitida yoqilgan.",
        )

    user = await get_user_by_telegram_id(db, data.telegram_id)
    if user is None:
        if not data.full_name or not data.phone_number or not data.role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Yangi mock foydalanuvchi uchun full_name, phone_number, role kerak.",
            )
        phone_number = data.phone_number.strip().replace(" ", "")
        if await get_user_by_phone(db, phone_number) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu telefon raqami band.",
            )
        user = await create_user_from_telegram(
            db,
            telegram_id=data.telegram_id,
            telegram_username=data.username,
            full_name=data.full_name,
            phone_number=phone_number,
            role=data.role,
        )

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token)
