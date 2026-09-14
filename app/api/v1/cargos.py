import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_shipper, get_current_user
from app.core.config import settings
from app.crud.cargo import (
    add_cargo_photo,
    create_cargo,
    get_cargo_by_id,
    list_cargos,
    list_my_cargos,
    update_cargo_status,
)
from app.db.session import get_db
from app.models.enums import CargoStatus, LoadType, Region, VehicleType
from app.models.user import User
from app.schemas.cargo import CargoCreate, CargoListOut, CargoOut, CargoPhotoOut, CargoStatusUpdate
from app.services.telegram import post_cargo_to_channel

router = APIRouter(prefix="/cargos", tags=["Cargos (Yuklar)"])

ALLOWED_PHOTO_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png"}


@router.post(
    "/",
    response_model=CargoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi yuk e'loni yaratish (faqat yuk beruvchi) + Telegram kanalga avto-post",
)
async def create_cargo_endpoint(
    data: CargoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_shipper),
) -> CargoOut:
    cargo = await create_cargo(db, data, owner=current_user)
    await post_cargo_to_channel(cargo)
    return CargoOut.model_validate(cargo)


@router.get(
    "/",
    response_model=CargoListOut,
    summary="Yuklar ro'yxati (yo'nalish, mashina turi, hajm bo'yicha filtrlash)",
)
async def list_cargos_endpoint(
    db: AsyncSession = Depends(get_db),
    loading_region: Region | None = None,
    unloading_region: Region | None = None,
    vehicle_type: VehicleType | None = None,
    load_type: LoadType | None = None,
    min_volume: float | None = Query(default=None, ge=0),
    max_volume: float | None = Query(default=None, ge=0),
    status_filter: CargoStatus | None = Query(default=CargoStatus.ACTIVE, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> CargoListOut:
    items, total = await list_cargos(
        db,
        loading_region=loading_region,
        unloading_region=unloading_region,
        vehicle_type=vehicle_type,
        load_type=load_type,
        min_volume=min_volume,
        max_volume=max_volume,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return CargoListOut(
        total=total,
        limit=limit,
        offset=offset,
        items=[CargoOut.model_validate(c) for c in items],
    )


@router.get(
    "/mine",
    response_model=list[CargoOut],
    summary="Mening yuk e'lonlarim (barcha statuslar, faqat o'zim yaratganlar)",
)
async def list_my_cargos_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CargoOut]:
    items = await list_my_cargos(db, owner_id=current_user.id)
    return [CargoOut.model_validate(c) for c in items]


@router.get("/{cargo_id}", response_model=CargoOut, summary="Bitta yuk haqida to'liq ma'lumot")
async def get_cargo_endpoint(cargo_id: int, db: AsyncSession = Depends(get_db)) -> CargoOut:
    cargo = await get_cargo_by_id(db, cargo_id)
    if cargo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bunday yuk topilmadi.")
    return CargoOut.model_validate(cargo)


@router.patch(
    "/{cargo_id}/status",
    response_model=CargoOut,
    summary="Yuk statusini o'zgartirish (faqat yuk egasi)",
)
async def update_cargo_status_endpoint(
    cargo_id: int,
    data: CargoStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CargoOut:
    cargo = await get_cargo_by_id(db, cargo_id)
    if cargo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bunday yuk topilmadi.")
    if cargo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat yuk egasi statusni o'zgartira oladi.",
        )
    updated = await update_cargo_status(db, cargo, data.status)
    return CargoOut.model_validate(updated)


@router.post(
    "/{cargo_id}/photos",
    response_model=list[CargoPhotoOut],
    status_code=status.HTTP_201_CREATED,
    summary="Yukka rasm biriktirish (faqat yuk egasi, max 5MB, jpg/png)",
)
async def upload_cargo_photos_endpoint(
    cargo_id: int,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CargoPhotoOut]:
    cargo = await get_cargo_by_id(db, cargo_id)
    if cargo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bunday yuk topilmadi.")
    if cargo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat yuk egasi rasm biriktira oladi.",
        )
    if len(cargo.photos) + len(files) > settings.MAX_PHOTOS_PER_CARGO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bir yukka ko'pi bilan {settings.MAX_PHOTOS_PER_CARGO} ta rasm biriktirish mumkin.",
        )

    max_size_bytes = settings.MAX_PHOTO_SIZE_MB * 1024 * 1024
    cargo_dir = Path(settings.MEDIA_ROOT) / "cargos" / str(cargo_id)
    cargo_dir.mkdir(parents=True, exist_ok=True)

    created_photos = []
    for upload in files:
        if upload.content_type not in ALLOWED_PHOTO_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat JPG yoki PNG formatidagi rasmlar qabul qilinadi.",
            )
        contents = await upload.read()
        if len(contents) > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rasm hajmi {settings.MAX_PHOTO_SIZE_MB}MB dan oshmasligi kerak.",
            )

        extension = ".jpg" if upload.content_type in ("image/jpeg", "image/jpg") else ".png"
        filename = f"{uuid.uuid4().hex}{extension}"
        file_path_on_disk = cargo_dir / filename
        file_path_on_disk.write_bytes(contents)

        relative_path = f"cargos/{cargo_id}/{filename}"
        photo = await add_cargo_photo(db, cargo_id, relative_path)
        created_photos.append(photo)

    return [CargoPhotoOut.model_validate(p) for p in created_photos]
