from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, TimestampMixin, UTCDateTime, enum_column
from app.enums import EcoProblemKind, PointStatus, PointType, WasteKind

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.user import User


class Point(TimestampMixin, Base):
    __tablename__ = "points"
    __table_args__ = (
        Index("ix_points_public", "status", "is_hidden", "type"),
        Index("ix_points_coords", "latitude", "longitude"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[PointType] = mapped_column(enum_column(PointType))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text)

    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    city: Mapped[str | None] = mapped_column(String(120))
    street: Mapped[str | None] = mapped_column(String(255))

    # Only for type=eco_problem
    problem_kind: Mapped[EcoProblemKind | None] = mapped_column(enum_column(EcoProblemKind))
    # Only for type=collection. JSON {"mon": {"opens": "08:00", "closes": "20:00"} | null, ...};
    # NULL means "no restrictions" (24/7)
    schedule: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    # Moderation
    status: Mapped[PointStatus] = mapped_column(enum_column(PointStatus), default=PointStatus.PENDING)
    rejection_reason: Mapped[str | None] = mapped_column(String(500))
    moderated_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    moderated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    author: Mapped["User"] = relationship(back_populates="points", foreign_keys=[author_id])
    waste_links: Mapped[list["PointWasteKind"]] = relationship(
        cascade="all, delete-orphan", passive_deletes=True, lazy="selectin"
    )
    photos: Mapped[list["PointPhoto"]] = relationship(
        cascade="all, delete-orphan", passive_deletes=True, lazy="selectin", order_by="PointPhoto.position"
    )
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="point", cascade="all, delete-orphan", passive_deletes=True
    )

    @property
    def accepted_waste(self) -> list[WasteKind]:
        return sorted((link.kind for link in self.waste_links), key=list(WasteKind).index)

    @accepted_waste.setter
    def accepted_waste(self, kinds: list[WasteKind]) -> None:
        wanted = set(kinds)
        self.waste_links = [link for link in self.waste_links if link.kind in wanted]
        existing = {link.kind for link in self.waste_links}
        self.waste_links.extend(PointWasteKind(kind=k) for k in WasteKind if k in wanted and k not in existing)

    @property
    def is_public(self) -> bool:
        return self.status == PointStatus.APPROVED and not self.is_hidden


class PointWasteKind(Base):
    """Which waste kinds a collection point accepts (one row per kind)."""

    __tablename__ = "point_waste_kinds"

    point_id: Mapped[int] = mapped_column(ForeignKey("points.id", ondelete="CASCADE"), primary_key=True)
    kind: Mapped[WasteKind] = mapped_column(enum_column(WasteKind), primary_key=True, index=True)


class PointPhoto(TimestampMixin, Base):
    __tablename__ = "point_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    point_id: Mapped[int] = mapped_column(ForeignKey("points.id", ondelete="CASCADE"), index=True)
    path: Mapped[str] = mapped_column(String(255))  # relative to settings.media_dir
    position: Mapped[int] = mapped_column(Integer, default=0)
