from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.crud.user import create_user, get_user_by_phone
from app.db.session import get_db
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserOut

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
    if user is None or not verify_password(form_data.password, user.password_hash):
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
