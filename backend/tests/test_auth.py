REGISTER = {"first_name": "Олена", "last_name": "Коваленко", "email": "Olena@Example.com", "password": "password123"}


def test_register_returns_token_and_user(client):
    response = client.post("/api/auth/register", json=REGISTER)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"] == {
        "id": body["user"]["id"],
        "first_name": "Олена",
        "last_name": "Коваленко",
        "email": "olena@example.com",  # normalized
        "role": "user",
        "created_at": body["user"]["created_at"],
    }
    assert "password" not in response.text


def test_register_strips_whitespace(client):
    response = client.post("/api/auth/register", json={**REGISTER, "first_name": "  Олена  "})
    assert response.json()["user"]["first_name"] == "Олена"


def test_register_duplicate_email_is_case_insensitive(client):
    client.post("/api/auth/register", json=REGISTER)
    response = client.post("/api/auth/register", json={**REGISTER, "email": "OLENA@example.COM"})

    assert response.status_code == 409
    assert response.json()["detail"] == "Користувач з такою поштою вже існує"


def test_register_validation_messages_are_ukrainian(client):
    response = client.post(
        "/api/auth/register",
        json={"last_name": "Коваленко", "email": "not-an-email", "password": "short"},
    )

    assert response.status_code == 422
    errors = {err["loc"][-1]: err["msg"] for err in response.json()["detail"]}
    assert errors == {
        "first_name": "Обов'язкове поле",
        "email": "Некоректна адреса електронної пошти",
        "password": "Мінімальна довжина — 8 симв.",
    }


def test_register_rejects_blank_name(client):
    response = client.post("/api/auth/register", json={**REGISTER, "first_name": "   "})
    assert response.status_code == 422


def test_register_rejects_unknown_fields(client):
    response = client.post("/api/auth/register", json={**REGISTER, "role": "admin"})

    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Невідоме поле"


def test_login_success(client):
    client.post("/api/auth/register", json=REGISTER)
    response = client.post("/api/auth/login", json={"email": "olena@EXAMPLE.com", "password": "password123"})

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "olena@example.com"


def test_login_wrong_password_and_unknown_email_look_the_same(client):
    client.post("/api/auth/register", json=REGISTER)
    wrong_password = client.post("/api/auth/login", json={"email": "olena@example.com", "password": "nope-nope"})
    unknown_email = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "password123"})

    for response in (wrong_password, unknown_email):
        assert response.status_code == 401
        assert response.json()["detail"] == "Невірна пошта або пароль"


def test_me(client, user):
    response = client.get("/api/auth/me", headers=user.headers)

    assert response.status_code == 200
    assert response.json()["email"] == user.email


def test_me_requires_auth(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Потрібна авторизація"


def test_me_with_invalid_token(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Недійсний або прострочений токен"
