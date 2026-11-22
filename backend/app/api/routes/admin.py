from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select

from app.db import DbSession, utcnow
from app.deps import AdminUser, require_admin
from app.enums import PointStatus, PointType, UserRole
from app.models import Comment, Point, User
from app.schemas.comment import CommentOut
from app.schemas.common import Page
from app.schemas.point import AdminPointOut, RejectIn
from app.schemas.user import RoleUpdate, UserOut
from app.services import points as svc

router = APIRouter(prefix="/admin", tags=["Адміністрування"], dependencies=[Depends(require_admin)])

Limit = Annotated[int, Query(ge=1, le=200)]
Offset = Annotated[int, Query(ge=0)]


# --- Points ---------------------------------------------------------------------------------------


@router.get("/points", summary="Усі точки (черга модерації)")
def list_points(
    db: DbSession,
    status_: Annotated[PointStatus | None, Query(alias="status")] = None,
    is_hidden: bool | None = None,
    type: PointType | None = None,
    q: Annotated[str | None, Query(max_length=100)] = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[AdminPointOut]:
    stmt = select(Point)
    if status_ is not None:
        stmt = stmt.where(Point.status == status_)
    if is_hidden is not None:
        stmt = stmt.where(Point.is_hidden.is_(is_hidden))
    if type is not None:
        stmt = stmt.where(Point.type == type)
    if q and q.strip():
        needle = f"%{q.strip().casefold()}%"
        stmt = stmt.where(
            or_(
                func.casefold(Point.title).like(needle),
                func.casefold(Point.city).like(needle),
                func.casefold(Point.street).like(needle),
            )
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    # Oldest first: moderation queue is processed in submission order
    rows = db.scalars(stmt.order_by(Point.created_at, Point.id).limit(limit).offset(offset))
    return Page(items=[svc.to_admin(db, p) for p in rows], total=total, limit=limit, offset=offset)


def _moderate(db: DbSession, point_id: int, admin: AdminUser, new_status: PointStatus, reason: str | None):
    point = svc.get_point_or_404(db, point_id)
    point.status = new_status
    point.rejection_reason = reason
    point.moderated_at = utcnow()
    point.moderated_by_id = admin.id
    db.commit()
    return svc.to_admin(db, point)


@router.post("/points/{point_id}/approve", summary="Схвалити точку")
def approve_point(point_id: int, db: DbSession, admin: AdminUser) -> AdminPointOut:
    return _moderate(db, point_id, admin, PointStatus.APPROVED, None)


@router.post("/points/{point_id}/reject", summary="Відхилити точку")
def reject_point(point_id: int, data: RejectIn, db: DbSession, admin: AdminUser) -> AdminPointOut:
    return _moderate(db, point_id, admin, PointStatus.REJECTED, data.reason)


def _set_point_hidden(db: DbSession, point_id: int, hidden: bool) -> AdminPointOut:
    point = svc.get_point_or_404(db, point_id)
    point.is_hidden = hidden
    db.commit()
    return svc.to_admin(db, point)


@router.post("/points/{point_id}/hide", summary="Приховати точку")
def hide_point(point_id: int, db: DbSession) -> AdminPointOut:
    return _set_point_hidden(db, point_id, True)


@router.post("/points/{point_id}/unhide", summary="Показати приховану точку")
def unhide_point(point_id: int, db: DbSession) -> AdminPointOut:
    return _set_point_hidden(db, point_id, False)


# --- Comments -------------------------------------------------------------------------------------


@router.get("/comments", summary="Усі коментарі")
def list_comments(
    db: DbSession,
    is_hidden: bool | None = None,
    point_id: int | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[CommentOut]:
    stmt = select(Comment)
    if is_hidden is not None:
        stmt = stmt.where(Comment.is_hidden.is_(is_hidden))
    if point_id is not None:
        stmt = stmt.where(Comment.point_id == point_id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(Comment.created_at.desc(), Comment.id.desc()).limit(limit).offset(offset))
    return Page(items=[CommentOut.model_validate(c) for c in rows], total=total, limit=limit, offset=offset)


def _set_comment_hidden(db: DbSession, comment_id: int, hidden: bool) -> CommentOut:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Коментар не знайдено")
    comment.is_hidden = hidden
    db.commit()
    return CommentOut.model_validate(comment)


@router.post("/comments/{comment_id}/hide", summary="Приховати коментар")
def hide_comment(comment_id: int, db: DbSession) -> CommentOut:
    return _set_comment_hidden(db, comment_id, True)


@router.post("/comments/{comment_id}/unhide", summary="Показати прихований коментар")
def unhide_comment(comment_id: int, db: DbSession) -> CommentOut:
    return _set_comment_hidden(db, comment_id, False)


# --- Users ----------------------------------------------------------------------------------------


@router.get("/users", summary="Користувачі")
def list_users(
    db: DbSession,
    role: UserRole | None = None,
    q: Annotated[str | None, Query(max_length=100, description="Пошук за ім'ям, прізвищем, поштою")] = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[UserOut]:
    stmt = select(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
    if q and q.strip():
        needle = f"%{q.strip().casefold()}%"
        stmt = stmt.where(
            or_(
                func.casefold(User.first_name).like(needle),
                func.casefold(User.last_name).like(needle),
                func.casefold(User.email).like(needle),
            )
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(User.id).limit(limit).offset(offset))
    return Page(items=[UserOut.model_validate(u) for u in rows], total=total, limit=limit, offset=offset)


@router.patch("/users/{user_id}", summary="Змінити роль користувача")
def update_user_role(user_id: int, data: RoleUpdate, db: DbSession, admin: AdminUser) -> UserOut:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Користувача не знайдено")
    if user.id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Не можна змінити власну роль")
    user.role = data.role
    db.commit()
    return UserOut.model_validate(user)
