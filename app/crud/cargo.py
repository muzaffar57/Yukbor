from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cargo import Cargo
from app.models.cargo_photo import CargoPhoto
from app.models.enums import CargoStatus, Region, VehicleType
from app.models.user import User
from app.schemas.cargo import CargoCreate
from app.services.distance import estimate_distance_km


async def create_cargo(db: AsyncSession, data: CargoCreate, owner: User) -> Cargo:
    distance_km = estimate_distance_km(data.loading_region, data.unloading_region)

    cargo = Cargo(
        title=data.title,
        description=data.description,
        weight=data.weight,
        volume=data.volume,
        loading_region=data.loading_region,
        loading_district=data.loading_district,
        loading_landmark=data.loading_landmark,
        loading_lat=data.loading_lat,
        loading_lon=data.loading_lon,
        unloading_region=data.unloading_region,
        unloading_district=data.unloading_district,
        unloading_landmark=data.unloading_landmark,
        distance_km=distance_km,
        vehicle_type=data.vehicle_type,
        price=data.price,
        payment_type=data.payment_type,
        loading_date=data.loading_date,
        status=CargoStatus.ACTIVE,
        owner_id=owner.id,
    )
    db.add(cargo)
    await db.commit()
    await db.refresh(cargo)
    return await get_cargo_by_id(db, cargo.id)


async def get_cargo_by_id(db: AsyncSession, cargo_id: int) -> Cargo | None:
    result = await db.execute(
        select(Cargo)
        .options(selectinload(Cargo.owner), selectinload(Cargo.photos))
        .where(Cargo.id == cargo_id)
    )
    return result.scalar_one_or_none()


async def list_cargos(
    db: AsyncSession,
    *,
    loading_region: Region | None = None,
    unloading_region: Region | None = None,
    vehicle_type: VehicleType | None = None,
    min_volume: float | None = None,
    max_volume: float | None = None,
    status: CargoStatus = CargoStatus.ACTIVE,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Cargo], int]:
    query = select(Cargo).options(selectinload(Cargo.owner), selectinload(Cargo.photos))
    count_query = select(func.count()).select_from(Cargo)

    filters = []
    if status is not None:
        filters.append(Cargo.status == status)
    if loading_region is not None:
        filters.append(Cargo.loading_region == loading_region)
    if unloading_region is not None:
        filters.append(Cargo.unloading_region == unloading_region)
    if vehicle_type is not None:
        filters.append(Cargo.vehicle_type == vehicle_type)
    if min_volume is not None:
        filters.append(Cargo.volume >= min_volume)
    if max_volume is not None:
        filters.append(Cargo.volume <= max_volume)

    for f in filters:
        query = query.where(f)
        count_query = count_query.where(f)

    query = query.order_by(Cargo.created_at.desc()).limit(limit).offset(offset)

    items_result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = list(items_result.scalars().all())
    total = total_result.scalar_one()
    return items, total


async def update_cargo_status(db: AsyncSession, cargo: Cargo, new_status: CargoStatus) -> Cargo:
    cargo.status = new_status
    await db.commit()
    await db.refresh(cargo)
    return await get_cargo_by_id(db, cargo.id)


async def add_cargo_photo(db: AsyncSession, cargo_id: int, file_path: str) -> CargoPhoto:
    photo = CargoPhoto(cargo_id=cargo_id, file_path=file_path)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo
