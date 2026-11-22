"""Management commands.

    python -m app.cli create-admin --email admin@example.com --password ... --first-name Ім'я --last-name Прізвище
    python -m app.cli promote user@example.com
    python -m app.cli seed            # demo points for local development
"""

import argparse
import secrets
import sys

from sqlalchemy import func, select

from app.db import SessionLocal, utcnow
from app.enums import EcoProblemKind, PointStatus, PointType, UserRole, WasteKind
from app.models import Point, User
from app.security import hash_password

SEED_EMAIL = "demo@ecoguard.local"

WEEKDAYS_9_19 = {d: {"opens": "09:00", "closes": "19:00"} for d in ("mon", "tue", "wed", "thu", "fri")}
WEEK_8_20 = {d: {"opens": "08:00", "closes": "20:00"} for d in ("mon", "tue", "wed", "thu", "fri", "sat")}

P, G, PA, M, B, T = (
    WasteKind.PLASTIC,
    WasteKind.GLASS,
    WasteKind.PAPER,
    WasteKind.METAL,
    WasteKind.BATTERIES,
    WasteKind.TEXTILE,
)

# (title, city, street, lat, lng, accepted, schedule)
DEMO_COLLECTION = [
    ("Чисте місто", "Київ", "вул. Зелена, 12", 50.4501, 30.5234, [P, G, PA], WEEK_8_20),
    ("Друге життя", "Київ", "просп. Перемоги, 45", 50.4560, 30.4440, [T], WEEKDAYS_9_19),
    ("Еко-станція Поділ", "Київ", "вул. Набережна, 3", 50.4660, 30.5190, [P, M, B], None),
    ("Сортуй разом", "Львів", "вул. Городоцька, 120", 49.8350, 23.9900, [P, G, PA, M], WEEK_8_20),
    ("Батарейки, здавайтесь!", "Львів", "пл. Ринок, 1", 49.8419, 24.0315, [B], None),
    ("Еко-пункт Аркадія", "Одеса", "Французький бульв., 60", 46.4580, 30.7500, [P, G], WEEKDAYS_9_19),
    ("Пункт «Перероби»", "Харків", "вул. Сумська, 77", 50.0120, 36.2300, [P, PA, M], WEEK_8_20),
    ("Зелений Дніпро", "Дніпро", "просп. Яворницького, 50", 48.4647, 35.0462, [P, G, PA, M, B], None),
    ("Вторма Запоріжжя", "Запоріжжя", "просп. Соборний, 150", 47.8388, 35.1396, [M, PA], WEEKDAYS_9_19),
    ("Еко-точка Вінниця", "Вінниця", "вул. Соборна, 30", 49.2331, 28.4682, [P, G, B], WEEK_8_20),
    ("Полтава сортує", "Полтава", "вул. Європейська, 10", 49.5883, 34.5514, [P, PA], WEEK_8_20),
    ("Чернігівська вторсировина", "Чернігів", "просп. Миру, 21", 51.4982, 31.2893, [G, M], WEEKDAYS_9_19),
    ("Текстиль-бокс", "Житомир", "вул. Київська, 5", 50.2547, 28.6587, [T], None),
    ("Рівне без сміття", "Рівне", "вул. Соборна, 80", 50.6199, 26.2516, [P, G, PA], WEEK_8_20),
    ("Еко-хаб Тернопіль", "Тернопіль", "вул. Руська, 15", 49.5535, 25.5948, [P, M, B], WEEKDAYS_9_19),
    ("Карпатський сортувальник", "Івано-Франківськ", "вул. Незалежності, 40", 48.9226, 24.7111, [P, G, PA, T], None),
    ("Ужгород рециклінг", "Ужгород", "вул. Корзо, 9", 48.6208, 22.2879, [P, G], WEEK_8_20),
    ("Еко-пункт Чернівці", "Чернівці", "вул. Головна, 100", 48.2915, 25.9403, [PA, M], WEEKDAYS_9_19),
    ("Луцьк сортує", "Луцьк", "просп. Волі, 25", 50.7472, 25.3254, [P, B], WEEK_8_20),
    ("Черкаси еко", "Черкаси", "бульв. Шевченка, 200", 49.4444, 32.0598, [P, G, M], None),
    ("Суми вторма", "Суми", "вул. Соборна, 33", 50.9077, 34.7981, [PA, T], WEEKDAYS_9_19),
    ("Миколаїв перероблює", "Миколаїв", "просп. Центральний, 70", 46.9750, 31.9946, [P, G, PA], WEEK_8_20),
]

# (title, city, street, lat, lng, kind, description)
DEMO_PROBLEMS = [
    ("Стихійне звалище в посадці", "Київ", "вул. Лісна, 2", 50.5150, 30.6100, EcoProblemKind.ILLEGAL_DUMP,
     "Біля посадки за житловим масивом звалище будівельного сміття."),
    ("Плівка на воді", "Дніпро", "Набережна Перемоги", 48.4440, 35.0800, EcoProblemKind.WATER_POLLUTION,
     "Райдужна плівка біля зливу, неприємний запах."),
    ("Палять листя щовечора", "Харків", "вул. Клочківська, 200", 50.0300, 36.2000, EcoProblemKind.WASTE_BURNING,
     "У приватному секторі щовечора спалюють листя."),
    ("Вирубка у сквері", "Одеса", "вул. Пушкінська, 40", 46.4750, 30.7400, EcoProblemKind.ILLEGAL_LOGGING,
     "Зрізали кілька дорослих дерев без табличок і дозволів."),
    ("Переповнені баки", "Львів", "вул. Шевченка, 300", 49.8600, 23.9500, EcoProblemKind.OVERFLOWING_BINS,
     "Контейнери не вивозили тиждень."),
]


def create_admin(email: str, password: str, first_name: str, last_name: str) -> None:
    with SessionLocal() as db:
        email = email.strip().lower()
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(email=email, first_name=first_name, last_name=last_name, password_hash=hash_password(password))
            db.add(user)
        user.role = UserRole.ADMIN
        db.commit()
        print(f"Адміністратор {email} готовий (id={user.id})")


def promote(email: str) -> None:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email.strip().lower()))
        if user is None:
            sys.exit(f"Користувача {email} не знайдено")
        user.role = UserRole.ADMIN
        db.commit()
        print(f"{email} тепер адміністратор")


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Point)):
            print("У базі вже є точки — пропускаю")
            return
        author = db.scalar(select(User).where(User.email == SEED_EMAIL))
        if author is None:
            author = User(
                email=SEED_EMAIL,
                first_name="Eco",
                last_name="Guard",
                role=UserRole.ADMIN,
                password_hash=hash_password(secrets.token_urlsafe(32)),  # nobody can log in as the seed user
            )
            db.add(author)
            db.flush()

        def add(**fields) -> None:
            point = Point(
                author_id=author.id,
                status=PointStatus.APPROVED,
                moderated_at=utcnow(),
                moderated_by_id=author.id,
                **{k: v for k, v in fields.items() if k != "accepted_waste"},
            )
            point.accepted_waste = fields.get("accepted_waste", [])
            db.add(point)

        for title, city, street, lat, lng, accepted, schedule in DEMO_COLLECTION:
            add(type=PointType.COLLECTION, title=title, city=city, street=street, latitude=lat, longitude=lng,
                accepted_waste=accepted, schedule=schedule)
        for title, city, street, lat, lng, kind, description in DEMO_PROBLEMS:
            add(type=PointType.ECO_PROBLEM, title=title, city=city, street=street, latitude=lat, longitude=lng,
                problem_kind=kind, description=description)
        db.commit()
        print(f"Додано демо-точки: пунктів прийому — {len(DEMO_COLLECTION)}, екопроблем — {len(DEMO_PROBLEMS)}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)

    p_admin = sub.add_parser("create-admin", help="Створити адміністратора (або підвищити існуючого)")
    p_admin.add_argument("--email", required=True)
    p_admin.add_argument("--password", required=True)
    p_admin.add_argument("--first-name", default="Адмін")
    p_admin.add_argument("--last-name", default="Eco Guard")

    p_promote = sub.add_parser("promote", help="Зробити користувача адміністратором")
    p_promote.add_argument("email")

    sub.add_parser("seed", help="Додати демо-точки")

    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.password, args.first_name, args.last_name)
    elif args.command == "promote":
        promote(args.email)
    elif args.command == "seed":
        seed()


if __name__ == "__main__":
    main()
