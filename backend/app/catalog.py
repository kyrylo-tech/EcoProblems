"""Ukrainian labels and reference texts for every enum exposed by the API."""

from app.enums import EcoProblemKind, PointStatus, PointType, UserRole, WasteKind, Weekday

USER_ROLES: dict[UserRole, str] = {
    UserRole.USER: "Користувач",
    UserRole.ADMIN: "Адміністратор",
}

POINT_TYPES: dict[PointType, str] = {
    PointType.ECO_PROBLEM: "Екопроблема",
    PointType.COLLECTION: "Пункт прийому",
}

POINT_STATUSES: dict[PointStatus, str] = {
    PointStatus.PENDING: "На модерації",
    PointStatus.APPROVED: "Схвалено",
    PointStatus.REJECTED: "Відхилено",
}

WEEKDAYS: dict[Weekday, tuple[str, str]] = {
    Weekday.MON: ("Понеділок", "Пн"),
    Weekday.TUE: ("Вівторок", "Вт"),
    Weekday.WED: ("Середа", "Ср"),
    Weekday.THU: ("Четвер", "Чт"),
    Weekday.FRI: ("П'ятниця", "Пт"),
    Weekday.SAT: ("Субота", "Сб"),
    Weekday.SUN: ("Неділя", "Нд"),
}

ECO_PROBLEM_KINDS: dict[EcoProblemKind, dict[str, str]] = {
    EcoProblemKind.ILLEGAL_DUMP: {
        "label": "Стихійне сміттєзвалище",
        "description": "Сміття, викинуте поза контейнерами: у лісі, на узбіччі, біля водойм.",
        "color": "#B42318",
    },
    EcoProblemKind.OVERFLOWING_BINS: {
        "label": "Переповнені контейнери",
        "description": "Сміття давно не вивозили, контейнери переповнені.",
        "color": "#DC6803",
    },
    EcoProblemKind.WASTE_BURNING: {
        "label": "Спалювання сміття чи листя",
        "description": "Відкрите спалювання відходів, листя або сухої трави.",
        "color": "#E04F16",
    },
    EcoProblemKind.WATER_POLLUTION: {
        "label": "Забруднення води",
        "description": "Скиди у річки та озера, плівка на воді, мертва риба.",
        "color": "#1570EF",
    },
    EcoProblemKind.AIR_POLLUTION: {
        "label": "Забруднення повітря",
        "description": "Їдкий дим, викиди підприємств, сильний хімічний запах.",
        "color": "#667085",
    },
    EcoProblemKind.SOIL_CONTAMINATION: {
        "label": "Забруднення ґрунту",
        "description": "Розливи палива чи хімікатів, засолення, отруєна земля.",
        "color": "#93370D",
    },
    EcoProblemKind.ILLEGAL_LOGGING: {
        "label": "Незаконна вирубка дерев",
        "description": "Вирубка лісу чи міських дерев без дозволу.",
        "color": "#3B7C0F",
    },
    EcoProblemKind.GREENERY_DAMAGE: {
        "label": "Знищення зелених насаджень",
        "description": "Пошкоджені газони, клумби, парки та сквери.",
        "color": "#4CA30D",
    },
    EcoProblemKind.HAZARDOUS_WASTE: {
        "label": "Небезпечні відходи",
        "description": "Покинуті хімікати, ртутні лампи, шини, будівельне сміття.",
        "color": "#C11574",
    },
    EcoProblemKind.OTHER: {
        "label": "Інше",
        "description": "Інша екологічна проблема.",
        "color": "#475467",
    },
}

WASTE_KINDS: dict[WasteKind, dict[str, str]] = {
    WasteKind.PLASTIC: {
        "label": "Пластик",
        "description": "Пляшки, каністри та упаковка з маркуванням.",
        "accepted": "ПЕТ-пляшки (маркування 1), флакони та каністри HDPE (2), "
        "пакети й плівка LDPE (4), тара PP (5). Без залишків вмісту.",
        "not_accepted": "Пластик без маркування, PVC (3), пінопласт (6), одноразовий посуд, "
        "багатошарові пакети від чипсів і кави.",
        "color": "#2E7CC0",
    },
    WasteKind.GLASS: {
        "label": "Скло",
        "description": "Пляшки та банки без кришок.",
        "accepted": "Скляні пляшки та банки будь-якого кольору, без кришок і залишків їжі.",
        "not_accepted": "Віконне й автомобільне скло, дзеркала, кераміка, порцеляна, "
        "лампи та жароміцний посуд.",
        "color": "#1F7A4D",
    },
    WasteKind.PAPER: {
        "label": "Папір і картон",
        "description": "Газети, коробки, офісний папір.",
        "accepted": "Газети, журнали, книжки, офісний папір, картонні коробки (складені).",
        "not_accepted": "Чеки, ламінований і вощений папір, паперові стакани, серветки, "
        "картон, забруднений жиром.",
        "color": "#E08A2E",
    },
    WasteKind.METAL: {
        "label": "Метал",
        "description": "Алюмінієві та бляшані банки.",
        "accepted": "Алюмінієві банки, бляшанки з-під консервів, кришки, фольга (чиста).",
        "not_accepted": "Балончики під тиском, банки з залишками фарби чи хімії, "
        "великогабаритна техніка.",
        "color": "#6B7671",
    },
    WasteKind.BATTERIES: {
        "label": "Батарейки",
        "description": "Окремі контейнери для небезпечних відходів.",
        "accepted": "Пальчикові й мізинчикові батарейки, батарейки-таблетки, "
        "невеликі акумулятори від гаджетів.",
        "not_accepted": "Пошкоджені або протічні акумулятори, автомобільні акумулятори "
        "(здаються окремо).",
        "color": "#C2382B",
    },
    WasteKind.TEXTILE: {
        "label": "Одяг і текстиль",
        "description": "Речі в хорошому стані для другого життя.",
        "accepted": "Чистий і сухий одяг, взуття парами, постільна білизна, рушники.",
        "not_accepted": "Брудні, мокрі або вкриті цвіллю речі, одяг із сильними пошкодженнями.",
        "color": "#8E5CC2",
    },
}

PREPARATION_TIPS: list[str] = [
    "Перевірте графік і вимоги на сторінці пункту.",
    "Сполосніть тару від залишків їжі та напоїв.",
    "Зніміть кришки й етикетки, якщо пункт цього вимагає.",
    "Сплющіть пляшки та складіть коробки, щоб зекономити місце.",
    "Батарейки та лампи здавайте лише в спеціальні контейнери.",
]


def build_catalog() -> dict:
    return {
        "user_roles": [{"value": k, "label": v} for k, v in USER_ROLES.items()],
        "point_types": [{"value": k, "label": v} for k, v in POINT_TYPES.items()],
        "point_statuses": [{"value": k, "label": v} for k, v in POINT_STATUSES.items()],
        "weekdays": [{"value": k, "label": full, "short_label": short} for k, (full, short) in WEEKDAYS.items()],
        "eco_problem_kinds": [{"value": k, **v} for k, v in ECO_PROBLEM_KINDS.items()],
        "waste_kinds": [{"value": k, **v} for k, v in WASTE_KINDS.items()],
        "preparation_tips": PREPARATION_TIPS,
    }
