from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.point import Point
    from app.models.user import User


class Comment(TimestampMixin, Base):
    """Published immediately; an admin can hide it afterwards."""

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    point_id: Mapped[int] = mapped_column(ForeignKey("points.id", ondelete="CASCADE"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)

    point: Mapped["Point"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments", lazy="joined")
