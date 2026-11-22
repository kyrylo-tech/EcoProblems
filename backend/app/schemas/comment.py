from datetime import datetime

from pydantic import Field

from app.schemas.common import InputSchema, Schema
from app.schemas.user import UserPublic


class CommentCreate(InputSchema):
    text: str = Field(min_length=1, max_length=2000, examples=["Вчора здала сюди пластик, все прийняли."])


class CommentOut(Schema):
    id: int
    point_id: int
    text: str
    author: UserPublic
    is_hidden: bool
    created_at: datetime
