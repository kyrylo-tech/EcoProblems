from sqlalchemy import select

from app import cli
from app.db import SessionLocal
from app.enums import UserRole
from app.models import User


def test_seed_creates_public_demo_points_once(client):
    cli.seed()

    stats = client.get("/api/stats").json()
    assert stats["collection_points"] == len(cli.DEMO_COLLECTION)
    assert stats["eco_problems"] == len(cli.DEMO_PROBLEMS)

    cli.seed()  # idempotent
    assert client.get("/api/stats").json() == stats


def test_create_admin_and_login(client):
    cli.create_admin("Boss@Example.com", "password123", "Адмін", "Головний")

    response = client.post("/api/auth/login", json={"email": "boss@example.com", "password": "password123"})
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "admin"


def test_promote_existing_user(client, user):
    cli.promote(user.email)

    with SessionLocal() as db:
        assert db.scalar(select(User.role).where(User.email == user.email)) == UserRole.ADMIN
