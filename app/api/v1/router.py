from fastapi import APIRouter

from app.api.v1 import admin, auth, cargos

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(cargos.router)
api_router.include_router(admin.router)
