from pydantic import BaseModel

from app.enums import EcoProblemKind, PointStatus, PointType, UserRole, WasteKind, Weekday


class Option[T](BaseModel):
    value: T
    label: str


class WeekdayOption(Option[Weekday]):
    short_label: str


class EcoProblemKindOption(Option[EcoProblemKind]):
    description: str
    color: str


class WasteKindOption(Option[WasteKind]):
    description: str
    accepted: str
    not_accepted: str
    color: str


class Catalog(BaseModel):
    user_roles: list[Option[UserRole]]
    point_types: list[Option[PointType]]
    point_statuses: list[Option[PointStatus]]
    weekdays: list[WeekdayOption]
    eco_problem_kinds: list[EcoProblemKindOption]
    waste_kinds: list[WasteKindOption]
    preparation_tips: list[str]


class Stats(BaseModel):
    collection_points: int
    eco_problems: int
    cities: int
    waste_kinds: int


class GeoAddress(BaseModel):
    city: str | None
    street: str | None
