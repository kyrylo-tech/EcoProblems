from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy import func, or_, select

from app.config import settings
from app.db import DbSession
from app.deps import CurrentUser, OptionalUser
from app.enums import EcoProblemKind, PointStatus, PointType, WasteKind
from app.geocoding import Geocoder, get_geocoder
from app.models import Comment, Point, PointPhoto, PointWasteKind
from app.schemas.comment import CommentCreate, CommentOut
from app.schemas.common import Page
from app.schemas.point import PhotoOut, PointCreate, PointDetail, PointFields, PointSummary, PointUpdate
from app.services import points as svc
from app.storage import delete_media, save_point_photo

router = APIRouter(prefix="/points", tags=["Точки"])

GeocoderDep = Annotated[Geocoder, Depends(get_geocoder)]


@router.get("", summary="Публічні точки (для карти та списків)")
def list_points(
    db: DbSession,
    type: PointType | None = None,
    problem_kind: EcoProblemKind | None = None,
    waste: Annotated[list[WasteKind] | None, Query(description="Приймає хоча б один із видів")] = None,
    q: Annotated[str | None, Query(max_length=100, description="Пошук за назвою, містом, вулицею")] = None,
    city: Annotated[str | None, Query(max_length=120)] = None,
    min_lat: Annotated[float | None, Query(ge=-90, le=90)] = None,
    max_lat: Annotated[float | None, Query(ge=-90, le=90)] = None,
    min_lng: Annotated[float | None, Query(ge=-180, le=180)] = None,
    max_lng: Annotated[float | None, Query(ge=-180, le=180)] = None,
    near_lat: Annotated[float | None, Query(ge=-90, le=90, description="Сортувати за відстанню")] = None,
    near_lng: Annotated[float | None, Query(ge=-180, le=180)] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PointSummary]:
    stmt = svc.public_points()

    if type is not None:
        stmt = stmt.where(Point.type == type)
    if problem_kind is not None:
        stmt = stmt.where(Point.problem_kind == problem_kind)
    if waste:
        stmt = stmt.where(Point.waste_links.any(PointWasteKind.kind.in_(waste)))
    if q and q.strip():
        needle = f"%{q.strip().casefold()}%"
        stmt = stmt.where(
            or_(
                func.casefold(Point.title).like(needle),
                func.casefold(Point.city).like(needle),
                func.casefold(Point.street).like(needle),
            )
        )
    if city and city.strip():
        stmt = stmt.where(func.casefold(Point.city) == city.strip().casefold())

    bbox = (min_lat, max_lat, min_lng, max_lng)
    if any(v is not None for v in bbox):
        if any(v is None for v in bbox):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, "Для фільтра за областю потрібні min_lat, max_lat, min_lng, max_lng"
            )
        stmt = stmt.where(Point.latitude.between(min_lat, max_lat), Point.longitude.between(min_lng, max_lng))

    near = (near_lat, near_lng)
    if (near_lat is None) != (near_lng is None):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Для сортування за відстанню потрібні near_lat і near_lng")

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    if near_lat is not None and near_lng is not None:
        stmt = stmt.order_by(svc.approx_distance_order(near_lat, near_lng), Point.id)
    else:
        stmt = stmt.order_by(Point.created_at.desc(), Point.id.desc())

    items = []
    for point in db.scalars(stmt.limit(limit).offset(offset)):
        item = PointSummary.model_validate(point)
        if near_lat is not None and near_lng is not None:
            distance = svc.haversine_km(*near, point.latitude, point.longitude)
            item = item.model_copy(update={"distance_km": round(distance, 2)})
        items.append(item)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.get("/mine", summary="Мої точки (з усіма статусами)")
def my_points(
    db: DbSession,
    user: CurrentUser,
    status_: Annotated[PointStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PointDetail]:
    stmt = select(Point).where(Point.author_id == user.id)
    if status_ is not None:
        stmt = stmt.where(Point.status == status_)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(Point.created_at.desc(), Point.id.desc()).limit(limit).offset(offset))
    return Page(items=[svc.to_detail(db, p) for p in rows], total=total, limit=limit, offset=offset)


@router.get("/{point_id}", summary="Точка")
def get_point(point_id: int, db: DbSession, user: OptionalUser) -> PointDetail:
    return svc.to_detail(db, svc.get_visible_point(db, point_id, user))


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Додати точку",
    description="Точка потрапляє на модерацію (від адміністратора — одразу схвалена). "
    "Місто та вулиця визначаються автоматично, якщо не передані. Фото додаються окремо: POST /points/{id}/photos.",
)
def create_point(data: PointCreate, db: DbSession, user: CurrentUser, geocoder: GeocoderDep) -> PointDetail:
    data = svc.fill_address(data, geocoder)
    point = Point(author_id=user.id)
    svc.apply_fields(point, data)
    svc.mark_submitted(point, user)
    db.add(point)
    db.commit()
    return svc.to_detail(db, point)


@router.patch(
    "/{point_id}",
    summary="Редагувати точку",
    description="Після редагування автором точка знову йде на модерацію.",
)
def update_point(
    point_id: int, data: PointUpdate, db: DbSession, user: CurrentUser, geocoder: GeocoderDep
) -> PointDetail:
    point = svc.get_editable_point(db, point_id, user)
    changes = data.model_dump(exclude_unset=True)
    if not changes:
        return svc.to_detail(db, point)

    current = PointDetail.model_validate(point).model_dump(mode="json")
    moved = ("latitude" in changes or "longitude" in changes) and (
        changes.get("latitude", point.latitude) != point.latitude
        or changes.get("longitude", point.longitude) != point.longitude
    )
    if moved:  # re-detect the address unless the caller sent it explicitly
        current["city"] = None
        current["street"] = None
    if changes.get("type") == PointType.ECO_PROBLEM:
        current.update(accepted_waste=[], schedule=None)
    elif changes.get("type") == PointType.COLLECTION:
        current["problem_kind"] = None

    merged = {k: current[k] for k in PointFields.model_fields} | data.model_dump(mode="json", exclude_unset=True)
    try:
        validated = PointFields.model_validate(merged)
    except ValidationError as exc:  # the patch is valid alone but the resulting point is not
        raise RequestValidationError(
            [{**err, "loc": ("body", *err["loc"])} for err in exc.errors(include_url=False)]
        ) from exc
    validated = svc.fill_address(validated, geocoder)

    svc.apply_fields(point, validated)
    svc.mark_submitted(point, user)
    db.commit()
    return svc.to_detail(db, point)


@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Видалити точку")
def delete_point(point_id: int, db: DbSession, user: CurrentUser) -> Response:
    point = svc.get_editable_point(db, point_id, user)
    paths = [photo.path for photo in point.photos]
    db.delete(point)
    db.commit()
    for path in paths:
        delete_media(path)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Photos ---------------------------------------------------------------------------------------


@router.post(
    "/{point_id}/photos",
    status_code=status.HTTP_201_CREATED,
    summary="Додати фото до точки",
    description=f"JPEG, PNG або WebP, до {settings.max_photo_size_mb} МБ кожне, "
    f"не більше {settings.max_photos_per_point} на точку. Фото від автора відправляють точку на модерацію.",
)
def upload_photos(
    point_id: int,
    files: Annotated[list[UploadFile], File(description="Одне або кілька зображень")],
    db: DbSession,
    user: CurrentUser,
) -> list[PhotoOut]:
    point = svc.get_editable_point(db, point_id, user)
    if len(point.photos) + len(files) > settings.max_photos_per_point:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"До точки можна додати не більше {settings.max_photos_per_point} фото"
        )

    saved: list[str] = []
    try:
        for upload in files:
            saved.append(save_point_photo(point.id, upload))
    except HTTPException:
        for path in saved:
            delete_media(path)
        raise

    start = max((p.position for p in point.photos), default=-1) + 1
    point.photos.extend(PointPhoto(path=path, position=start + i) for i, path in enumerate(saved))
    if point.status == PointStatus.APPROVED and not user.is_admin:
        svc.mark_submitted(point, user)
    db.commit()
    return [PhotoOut.model_validate(p) for p in point.photos]


@router.delete("/{point_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Видалити фото")
def delete_photo(point_id: int, photo_id: int, db: DbSession, user: CurrentUser) -> Response:
    point = svc.get_editable_point(db, point_id, user)
    photo = next((p for p in point.photos if p.id == photo_id), None)
    if photo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Фото не знайдено")
    point.photos.remove(photo)
    db.commit()
    delete_media(photo.path)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Comments -------------------------------------------------------------------------------------


@router.get("/{point_id}/comments", summary="Коментарі до точки")
def list_comments(
    point_id: int,
    db: DbSession,
    user: OptionalUser,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[CommentOut]:
    svc.get_visible_point(db, point_id, user)
    stmt = select(Comment).where(Comment.point_id == point_id)
    if not (user and user.is_admin):
        stmt = stmt.where(Comment.is_hidden.is_(False))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(Comment.created_at.desc(), Comment.id.desc()).limit(limit).offset(offset))
    return Page(items=[CommentOut.model_validate(c) for c in rows], total=total, limit=limit, offset=offset)


@router.post(
    "/{point_id}/comments",
    status_code=status.HTTP_201_CREATED,
    summary="Додати коментар",
    description="Коментар публікується одразу; адміністратор може його приховати.",
)
def create_comment(point_id: int, data: CommentCreate, db: DbSession, user: CurrentUser) -> CommentOut:
    point = svc.get_visible_point(db, point_id, user)
    if not point.is_public:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Коментувати можна лише опубліковані точки")
    comment = Comment(point_id=point.id, author_id=user.id, text=data.text)
    db.add(comment)
    db.commit()
    return CommentOut.model_validate(comment)
