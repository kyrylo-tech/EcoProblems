from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, EmailStr, Field

from app.enums import UserRole
from app.schemas.common import InputSchema, Schema

NormalizedEmail = Annotated[EmailStr, AfterValidator(str.lower)]


class UserPublic(Schema):
    """What other people see about an author."""

    id: int
    first_name: str
    last_name: str


class UserOut(UserPublic):
    email: str
    role: UserRole
    created_at: datetime


class RegisterIn(InputSchema):
    first_name: str = Field(min_length=1, max_length=100, examples=["Олена"])
    last_name: str = Field(min_length=1, max_length=100, examples=["Коваленко"])
    email: NormalizedEmail = Field(examples=["olena@example.com"])
    password: str = Field(min_length=8, max_length=128, description="Мінімум 8 символів")


class LoginIn(InputSchema):
    email: NormalizedEmail
    password: str = Field(min_length=1, max_length=128)


class TokenOut(Schema):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserOut


class RoleUpdate(InputSchema):
    role: UserRole
