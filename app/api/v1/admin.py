from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.user import get_user_by_id
from app.db.session import get_db
from app.models.user import User
from app.schemas.subscription import SubscriptionExtendRequest, SubscriptionExtendResponse

router = APIRouter(prefix="/admin", tags=["Admin (Faqat administrator uchun)"])


@router.post(
    "/users/{user_id}/subscription/extend",
    response_model=SubscriptionExtendResponse,
    summary="Foydalanuvchi obunasini uzaytirish (to'lov qo'lda tasdiqlangandan keyin)",
)
async def extend_subscription_endpoint(
    user_id: int,
    data: SubscriptionExtendRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> SubscriptionExtendResponse:
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi.")

    now = datetime.now(timezone.utc)
    current_expiry = user.subscription_expires_at
    base_date = current_expiry if (current_expiry and current_expiry > now) else now
    new_expiry = base_date + timedelta(days=data.days)

    user.subscription_expires_at = new_expiry
    await db.commit()
    await db.refresh(user)

    return SubscriptionExtendResponse(
        user_id=user.id,
        phone_number=user.phone_number,
        subscription_expires_at=user.subscription_expires_at,
    )
