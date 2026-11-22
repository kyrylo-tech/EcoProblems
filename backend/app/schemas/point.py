from datetime import datetime, time
from typing import Annotated, Self

from pydantic import BeforeValidator, Field, computed_field, field_serializer, model_validator

from app.enums import EcoProblemKind, PointStatus, PointType, WasteKind
from app.schemas.common import InputSchema, Schema
from app.schemas.user import UserOut, UserPublic
from app.storage import media_url


def _blank_to_none(value: object) -> object:
    if isinstance(value, str) and not value.strip():
        return None
    return value


OptionalText = Annotated[str | None, BeforeValidator(_blank_to_none)]


# --- Schedule -------------------------------------------------------------------------------------


class DayHours(InputSchema):
    opens: time = Field(examples=["08:00"])
    closes: time = Field(examples=["20:00"])

    @model_validator(mode="after")
    def _check_order(self) -> Self:
        if self.closes <= self.opens:
            raise ValueError("Час закриття має бути пізніше за час відкриття")
        return self

    @field_serializer("opens", "closes")
    def _hhmm(self, value: time) -> str:
        return value.strftime("%H:%M")


class Schedule(InputSchema):
    """Working hours per weekday. A missing / null day is a day off."""

    mon: DayHours | None = None
    tue: DayHours | None = None
    wed: DayHours | None = None
    thu: DayHours | None = None
    fri: DayHours | None = None
    sat: DayHours | None = None
    sun: DayHours | None = None

    @model_validator(mode="after")
    def _at_least_one_day(self) -> Self:
        if all(getattr(self, day) is None for day in type(self).model_fields):
            raise ValueError(
                "Вкажіть хоча б один робочий день або передайте schedule: null (працює без обмежень)"
            )
        return self


# --- Input ----------------------------------------------------------------------------------------


class PointFields(InputSchema):
    type: PointType
    title: str = Field(min_length=3, max_length=120, examples=["Чисте місто"])
    description: OptionalText = Field(default=None, max_length=2000)
    latitude: float = Field(ge=-90, le=90, examples=[50.4501])
    longitude: float = Field(ge=-180, le=180, examples=[30.5234])
    city: OptionalText = Field(
        default=None, max_length=120, description="Якщо не вказано — визначається автоматично за координатами"
    )
    street: OptionalText = Field(
        default=None, max_length=255, description="Якщо не вказано — визначається автоматично за координатами"
    )
    problem_kind: EcoProblemKind | None = Field(default=None, description="Лише для type=eco_problem")
    accepted_waste: list[WasteKind] = Field(default_factory=list, description="Лише для type=collection")
    schedule: Schedule | None = Field(
        default=None, description="Лише для type=collection. null — працює без обмежень (цілодобово)"
    )

    @model_validator(mode="after")
    def _check_type_specific_fields(self) -> Self:
        self.accepted_waste = list(dict.fromkeys(self.accepted_waste))
        if self.type == PointType.ECO_PROBLEM:
            if self.problem_kind is None:
                raise ValueError("Для екопроблеми вкажіть вид проблеми (problem_kind)")
            if self.accepted_waste:
                raise ValueError("Види вторсировини вказуються лише для пунктів прийому")
            if self.schedule is not None:
                raise ValueError("Графік роботи вказується лише для пунктів прийому")
        else:
            if not self.accepted_waste:
                raise ValueError("Вкажіть, яку вторсировину приймає пункт (accepted_waste)")
            if self.problem_kind is not None:
                raise ValueError("Вид екопроблеми вказується лише для екопроблем")
        return self


class PointCreate(PointFields):
    pass


class PointUpdate(InputSchema):
    """Partial update: send only the fields you want to change."""

    type: PointType | None = None
    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: OptionalText = Field(default=None, max_length=2000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    city: OptionalText = Field(default=None, max_length=120)
    street: OptionalText = Field(default=None, max_length=255)
    problem_kind: EcoProblemKind | None = None
    accepted_waste: list[WasteKind] | None = None
    schedule: Schedule | None = None


class RejectIn(InputSchema):
    reason: str = Field(min_length=3, max_length=500, examples=["Фото не відповідає опису"])


# --- Output ---------------------------------------------------------------------------------------


class PhotoOut(Schema):
    id: int
    path: str = Field(exclude=True)
    created_at: datetime

    @computed_field
    @property
    def url(self) -> str:
        return media_url(self.path)


class PointSummary(Schema):
    """Lightweight item for maps and lists."""

    id: int
    type: PointType
    title: str
    latitude: float
    longitude: float
    city: str | None
    street: str | None
    problem_kind: EcoProblemKind | None
    accepted_waste: list[WasteKind]
    schedule: Schedule | None
    photos: list[PhotoOut] = Field(exclude=True)
    created_at: datetime
    distance_km: float | None = Field(default=None, description="Лише якщо передано near_lat/near_lng")

    @computed_field
    @property
    def cover_photo_url(self) -> str | None:
        return self.photos[0].url if self.photos else None


class PointDetail(PointSummary):
    description: str | None
    photos: list[PhotoOut]
    author: UserPublic
    status: PointStatus
    rejection_reason: str | None
    is_hidden: bool
    moderated_at: datetime | None
    updated_at: datetime
    comments_count: int = 0


class AdminPointOut(PointDetail):
    author: UserOut
