from fastapi import APIRouter

from app.api.routes import admin, auth, catalog, comments, geo, health, points

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(catalog.router)
api_router.include_router(points.router)
api_router.include_router(comments.router)
api_router.include_router(geo.router)
api_router.include_router(admin.router)
