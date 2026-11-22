# Import every model here so Alembic autogenerate and relationship() string lookups can see it
from app.db import Base
from app.models.comment import Comment
from app.models.point import Point, PointPhoto, PointWasteKind
from app.models.user import User

__all__ = ["Base", "Comment", "Point", "PointPhoto", "PointWasteKind", "User"]
