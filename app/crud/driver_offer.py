from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.driver_offer import DriverOffer
from app.models.enums import CargoStatus, LoadType, Region, VehicleType
from app.models.user import User
from app.schemas.driver_offer import DriverOfferCreate
from app.services.distance import estimate_distance_km


async def create_driver_offer(db: AsyncSession, data: DriverOfferCreate, driver: User) -> DriverOffer:
    distance_km = None
    if data.destination_region is not None:
        distance_km = estimate_distance_km(data.departure_region, data.destination_region)

    offer = DriverOffer(
        description=data.description,
        departure_region=data.departure_region,
        departure_district=data.departure_district,
        departure_landmark=data.departure_landmark,
        departure_lat=data.departure_lat,
        departure_lon=data.departure_lon,
        destination_region=data.destination_region,
        destination_district=data.destination_district,
        destination_landmark=data.destination_landmark,
        distance_km=distance_km,
        vehicle_type=data.vehicle_type,
        load_type=data.load_type,
        available_weight=data.available_weight,
        available_volume=data.available_volume,
        price_expectation=data.price_expectation,
        payment_type=data.payment_type,
        departure_date=data.departure_date,
        status=CargoStatus.ACTIVE,
        driver_id=driver.id,
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return await get_driver_offer_by_id(db, offer.id)


async def get_driver_offer_by_id(db: AsyncSession, offer_id: int) -> DriverOffer | None:
    result = await db.execute(
        select(DriverOffer).options(selectinload(DriverOffer.driver)).where(DriverOffer.id == offer_id)
    )
    return result.scalar_one_or_none()


async def list_driver_offers(
    db: AsyncSession,
    *,
    departure_region: Region | None = None,
    destination_region: Region | None = None,
    vehicle_type: VehicleType | None = None,
    load_type: LoadType | None = None,
    status: CargoStatus = CargoStatus.ACTIVE,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[DriverOffer], int]:
    query = select(DriverOffer).options(selectinload(DriverOffer.driver))
    count_query = select(func.count()).select_from(DriverOffer)

    filters = []
    if status is not None:
        filters.append(DriverOffer.status == status)
    if departure_region is not None:
        filters.append(DriverOffer.departure_region == departure_region)
    if destination_region is not None:
        filters.append(DriverOffer.destination_region == destination_region)
    if vehicle_type is not None:
        filters.append(DriverOffer.vehicle_type == vehicle_type)
    if load_type is not None:
        filters.append(DriverOffer.load_type == load_type)

    for f in filters:
        query = query.where(f)
        count_query = count_query.where(f)

    query = query.order_by(DriverOffer.departure_date.asc()).limit(limit).offset(offset)

    items_result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = list(items_result.scalars().all())
    total = total_result.scalar_one()
    return items, total


async def list_my_driver_offers(db: AsyncSession, driver_id: int) -> list[DriverOffer]:
    result = await db.execute(
        select(DriverOffer)
        .options(selectinload(DriverOffer.driver))
        .where(DriverOffer.driver_id == driver_id)
        .order_by(DriverOffer.created_at.desc())
    )
    return list(result.scalars().all())


async def update_driver_offer_status(db: AsyncSession, offer: DriverOffer, new_status: CargoStatus) -> DriverOffer:
    offer.status = new_status
    await db.commit()
    await db.refresh(offer)
    return await get_driver_offer_by_id(db, offer.id)
