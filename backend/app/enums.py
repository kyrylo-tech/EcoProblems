from enum import StrEnum


class UserRole(StrEnum):
    USER = "user"
    ADMIN = "admin"


class PointType(StrEnum):
    ECO_PROBLEM = "eco_problem"
    COLLECTION = "collection"


class PointStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class EcoProblemKind(StrEnum):
    ILLEGAL_DUMP = "illegal_dump"
    OVERFLOWING_BINS = "overflowing_bins"
    WASTE_BURNING = "waste_burning"
    WATER_POLLUTION = "water_pollution"
    AIR_POLLUTION = "air_pollution"
    SOIL_CONTAMINATION = "soil_contamination"
    ILLEGAL_LOGGING = "illegal_logging"
    GREENERY_DAMAGE = "greenery_damage"
    HAZARDOUS_WASTE = "hazardous_waste"
    OTHER = "other"


class WasteKind(StrEnum):
    PLASTIC = "plastic"
    GLASS = "glass"
    PAPER = "paper"
    METAL = "metal"
    BATTERIES = "batteries"
    TEXTILE = "textile"


class Weekday(StrEnum):
    MON = "mon"
    TUE = "tue"
    WED = "wed"
    THU = "thu"
    FRI = "fri"
    SAT = "sat"
    SUN = "sun"
