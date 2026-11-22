import math

from fastapi import HTTPException, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.db import utcnow
from app.enums import PointStatus
from app.geocoding import Geocoder
from app.models import Comment, Point, User
from app.schemas.point import AdminPointOut, PointDetail, PointFields

EARTH_RADIUS_KM = 6371.0


def public_points() -> Select[tuple[Point]]:
    return select(Point).where(Point.status == PointStatus.APPROVED, Point.is_hidden.is_(False))


def can_view(point: Point, user: User | None) -> bool:
    return point.is_public or (user is not None and (user.is_admin or user.id == point.author_id))


def can_edit(point: Point, user: User) -> bool:
    return user.is_admin or user.id == point.author_id


def get_point_or_404(db: Session, point_id: int) -> Point:
    point = db.get(Point, point_id)
    if point is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Точку не знайдено")
    return point


def get_visible_point(db: Session, point_id: int, user: User | None) -> Point:
    point = get_point_or_404(db, point_id)
    if not can_view(point, user):  # don't reveal that unpublished points exist
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Точку не знайдено")
    return point


def get_editable_point(db: Session, point_id: int, user: User) -> Point:
    point = get_visible_point(db, point_id, user)
    if not can_edit(point, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Редагувати точку може лише її автор або адміністратор")
    return point


def apply_fields(point: Point, data: PointFields) -> None:
    point.type = data.type
    point.title = data.title
    point.description = data.description
    point.latitude = data.latitude
    point.longitude = data.longitude
    point.city = data.city
    point.street = data.street
    point.problem_kind = data.problem_kind
    point.accepted_waste = data.accepted_waste
    point.schedule = data.schedule.model_dump(mode="json") if data.schedule else None


def fill_address(data: PointFields, geocoder: Geocoder) -> PointFields:
    if data.city and data.street:
        return data
    address = geocoder.reverse(data.latitude, data.longitude)
    return data.model_copy(update={"city": data.city or address.city, "street": data.street or address.street})


def mark_submitted(point: Point, by: User) -> None:
    """New or changed content goes to moderation, unless an admin made the change."""
    if by.is_admin:
        point.status = PointStatus.APPROVED
        point.moderated_at = utcnow()
        point.moderated_by_id = by.id
    else:
        point.status = PointStatus.PENDING
        point.moderated_at = None
        point.moderated_by_id = None
    point.rejection_reason = None


def comments_count(db: Session, point_id: int) -> int:
    return db.scalar(
        select(func.count()).select_from(Comment).where(Comment.point_id == point_id, Comment.is_hidden.is_(False))
    ) or 0


def to_detail(db: Session, point: Point) -> PointDetail:
    return PointDetail.model_validate(point).model_copy(update={"comments_count": comments_count(db, point.id)})


def to_admin(db: Session, point: Point) -> AdminPointOut:
    return AdminPointOut.model_validate(point).model_copy(update={"comments_count": comments_count(db, point.id)})


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def approx_distance_order(lat: float, lng: float):
    """Equirectangular approximation — good enough for ordering within a country."""
    k = math.cos(math.radians(lat))
    return (Point.latitude - lat) * (Point.latitude - lat) + (Point.longitude - lng) * (Point.longitude - lng) * k * k
