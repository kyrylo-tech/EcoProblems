from fastapi import APIRouter
from sqlalchemy import distinct, func, select

from app.catalog import build_catalog
from app.db import DbSession
from app.enums import PointType, WasteKind
from app.models import Point
from app.schemas.catalog import Catalog, Stats
from app.services import points as svc

router = APIRouter(tags=["Довідники"])


@router.get("/catalog", summary="Довідники: типи, види проблем і вторсировини, дні тижня (укр.)")
def get_catalog() -> Catalog:
    return Catalog.model_validate(build_catalog())


@router.get("/stats", summary="Статистика для головної сторінки")
def get_stats(db: DbSession) -> Stats:
    public = svc.public_points().subquery()
    by_type = {row[0]: row[1] for row in db.execute(select(public.c.type, func.count()).group_by(public.c.type))}
    cities = db.scalar(
        select(func.count(distinct(func.casefold(public.c.city)))).where(public.c.city.is_not(None))
    )
    return Stats(
        collection_points=by_type.get(PointType.COLLECTION, 0),
        eco_problems=by_type.get(PointType.ECO_PROBLEM, 0),
        cities=cities or 0,
        waste_kinds=len(WasteKind),
    )
