from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    result = await db.execute(select(User).where(User.phone_number == phone_number))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_telegram_id(db: AsyncSession, telegram_id: int) -> User | None:
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user = User(
        full_name=data.full_name,
        phone_number=data.phone_number,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_user_from_telegram(
    db: AsyncSession,
    *,
    telegram_id: int,
    telegram_username: str | None,
    full_name: str,
    phone_number: str,
    role: UserRole,
) -> User:
    user = User(
        full_name=full_name,
        phone_number=phone_number,
        password_hash=None,
        telegram_id=telegram_id,
        telegram_username=telegram_username,
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
