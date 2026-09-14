from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_driver, get_current_user
from app.crud.driver_offer import (
    create_driver_offer,
    get_driver_offer_by_id,
    list_driver_offers,
    list_my_driver_offers,
    update_driver_offer_status,
)
from app.db.session import get_db
from app.models.enums import CargoStatus, LoadType, Region, VehicleType
from app.models.user import User
from app.schemas.driver_offer import (
    DriverOfferCreate,
    DriverOfferListOut,
    DriverOfferOut,
    DriverOfferStatusUpdate,
)
from app.services.telegram import post_driver_offer_to_channel

router = APIRouter(prefix="/driver-offers", tags=["Driver Offers (Bo'sh transport e'lonlari)"])


@router.post(
    "/",
    response_model=DriverOfferOut,
    status_code=status.HTTP_201_CREATED,
    summary="Bo'sh transport e'lonini yaratish (faqat haydovchi) + Telegram kanalga avto-post",
)
async def create_driver_offer_endpoint(
    data: DriverOfferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_driver),
) -> DriverOfferOut:
    offer = await create_driver_offer(db, data, driver=current_user)
    await post_driver_offer_to_channel(offer)
    return DriverOfferOut.model_validate(offer)


@router.get(
    "/",
    response_model=DriverOfferListOut,
    summary="Bo'sh transportlar ro'yxati (yo'nalish, mashina turi, yuk turi bo'yicha filtrlash)",
)
async def list_driver_offers_endpoint(
    db: AsyncSession = Depends(get_db),
    departure_region: Region | None = None,
    destination_region: Region | None = None,
    vehicle_type: VehicleType | None = None,
    load_type: LoadType | None = None,
    status_filter: CargoStatus | None = Query(default=CargoStatus.ACTIVE, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> DriverOfferListOut:
    items, total = await list_driver_offers(
        db,
        departure_region=departure_region,
        destination_region=destination_region,
        vehicle_type=vehicle_type,
        load_type=load_type,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return DriverOfferListOut(
        total=total,
        limit=limit,
        offset=offset,
        items=[DriverOfferOut.model_validate(o) for o in items],
    )


@router.get(
    "/mine",
    response_model=list[DriverOfferOut],
    summary="Mening bo'sh transport e'lonlarim (barcha statuslar, faqat o'zim yaratganlar)",
)
async def list_my_driver_offers_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DriverOfferOut]:
    items = await list_my_driver_offers(db, driver_id=current_user.id)
    return [DriverOfferOut.model_validate(o) for o in items]


@router.get("/{offer_id}", response_model=DriverOfferOut, summary="Bitta bo'sh transport e'loni haqida to'liq ma'lumot")
async def get_driver_offer_endpoint(offer_id: int, db: AsyncSession = Depends(get_db)) -> DriverOfferOut:
    offer = await get_driver_offer_by_id(db, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bunday e'lon topilmadi.")
    return DriverOfferOut.model_validate(offer)


@router.patch(
    "/{offer_id}/status",
    response_model=DriverOfferOut,
    summary="E'lon statusini o'zgartirish (faqat e'lon egasi)",
)
async def update_driver_offer_status_endpoint(
    offer_id: int,
    data: DriverOfferStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DriverOfferOut:
    offer = await get_driver_offer_by_id(db, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bunday e'lon topilmadi.")
    if offer.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat e'lon egasi statusni o'zgartira oladi.",
        )
    updated = await update_driver_offer_status(db, offer, data.status)
    return DriverOfferOut.model_validate(updated)
