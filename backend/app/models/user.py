from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, TimestampMixin, enum_column
from app.enums import UserRole

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.point import Point


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(enum_column(UserRole), default=UserRole.USER)

    points: Mapped[list["Point"]] = relationship(
        back_populates="author", foreign_keys="Point.author_id", passive_deletes=True
    )
    comments: Mapped[list["Comment"]] = relationship(back_populates="author", passive_deletes=True)

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN
