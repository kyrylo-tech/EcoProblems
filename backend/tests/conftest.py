import itertools
import os
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path

# Must be set before the app (and its settings/engine) is imported
_TMP = Path(tempfile.mkdtemp(prefix="ecoguard-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_TMP / 'test.db').as_posix()}"
os.environ["MEDIA_DIR"] = str(_TMP / "media")
os.environ["SECRET_KEY"] = "test-secret-key-that-is-at-least-32-bytes-long"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.config import settings  # noqa: E402
from app.db import SessionLocal, engine  # noqa: E402
from app.enums import UserRole  # noqa: E402
from app.geocoding import Address, get_geocoder  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base, User  # noqa: E402

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64


class FakeGeocoder:
    def __init__(self) -> None:
        self.calls: list[tuple[float, float]] = []
        self.address = Address(city="Київ", street="вулиця Хрещатик, 1")

    def reverse(self, latitude: float, longitude: float) -> Address:
        self.calls.append((latitude, longitude))
        return self.address


@dataclass
class AuthedUser:
    id: int
    email: str
    token: str

    @property
    def headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}


def collection_payload(**overrides) -> dict:
    return {
        "type": "collection",
        "title": "Чисте місто",
        "latitude": 50.4501,
        "longitude": 30.5234,
        "city": "Київ",
        "street": "вул. Зелена, 12",
        "accepted_waste": ["glass", "plastic"],
        "schedule": {"mon": {"opens": "08:00", "closes": "20:00"}, "sat": {"opens": "10:00", "closes": "16:00"}},
        **overrides,
    }


def problem_payload(**overrides) -> dict:
    return {
        "type": "eco_problem",
        "title": "Звалище біля річки",
        "latitude": 49.8397,
        "longitude": 24.0297,
        "city": "Львів",
        "street": "вулиця Наукова, 7",
        "problem_kind": "illegal_dump",
        **overrides,
    }


@pytest.fixture(scope="session", autouse=True)
def _cleanup_tmp():
    yield
    engine.dispose()
    shutil.rmtree(_TMP, ignore_errors=True)


@pytest.fixture(autouse=True)
def _fresh_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    shutil.rmtree(settings.media_dir, ignore_errors=True)
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    yield


@pytest.fixture
def geocoder() -> FakeGeocoder:
    fake = FakeGeocoder()
    app.dependency_overrides[get_geocoder] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_geocoder, None)


@pytest.fixture
def client(geocoder) -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def make_user(client):
    counter = itertools.count(1)

    def _make(role: UserRole = UserRole.USER, password: str = "password123") -> AuthedUser:
        n = next(counter)
        email = f"{role.value}{n}@example.com"
        response = client.post(
            "/api/auth/register",
            json={"first_name": f"Ім'я{n}", "last_name": f"Прізвище{n}", "email": email, "password": password},
        )
        assert response.status_code == 201, response.text
        body = response.json()
        if role != UserRole.USER:
            with SessionLocal() as db:
                db.get(User, body["user"]["id"]).role = role
                db.commit()
        return AuthedUser(id=body["user"]["id"], email=email, token=body["access_token"])

    return _make


@pytest.fixture
def user(make_user) -> AuthedUser:
    return make_user()


@pytest.fixture
def other_user(make_user) -> AuthedUser:
    return make_user()


@pytest.fixture
def admin(make_user) -> AuthedUser:
    return make_user(UserRole.ADMIN)


@pytest.fixture
def create_point(client, user):
    def _create(payload: dict | None = None, by: AuthedUser | None = None) -> dict:
        response = client.post("/api/points", json=payload or collection_payload(), headers=(by or user).headers)
        assert response.status_code == 201, response.text
        return response.json()

    return _create


@pytest.fixture
def approve(client, admin):
    def _approve(point_id: int) -> dict:
        response = client.post(f"/api/admin/points/{point_id}/approve", headers=admin.headers)
        assert response.status_code == 200, response.text
        return response.json()

    return _approve


@pytest.fixture
def public_point(create_point, approve) -> dict:
    point = create_point()
    approve(point["id"])
    return point
