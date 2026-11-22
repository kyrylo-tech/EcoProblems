import pytest

from tests.conftest import problem_payload

ADMIN_GET_ENDPOINTS = ["/api/admin/points", "/api/admin/comments", "/api/admin/users"]


@pytest.mark.parametrize("url", ADMIN_GET_ENDPOINTS)
def test_admin_endpoints_require_admin(client, user, url):
    assert client.get(url).status_code == 401

    response = client.get(url, headers=user.headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Потрібні права адміністратора"


def test_moderation_queue_is_oldest_first(client, create_point, admin, user):
    first = create_point()
    second = create_point(problem_payload())

    queue = client.get("/api/admin/points", params={"status": "pending"}, headers=admin.headers).json()

    assert [p["id"] for p in queue["items"]] == [first["id"], second["id"]]
    assert queue["items"][0]["author"]["email"] == user.email  # admins see author contacts


def test_admin_point_filters(client, create_point, approve, admin):
    pending = create_point()
    hidden = create_point(problem_payload())
    approve(hidden["id"])
    client.post(f"/api/admin/points/{hidden['id']}/hide", headers=admin.headers)

    def ids(**params):
        return [p["id"] for p in client.get("/api/admin/points", params=params, headers=admin.headers).json()["items"]]

    assert ids(is_hidden=True) == [hidden["id"]]
    assert ids(type="collection") == [pending["id"]]
    assert ids(q="звалище") == [hidden["id"]]


def test_reject_requires_reason(client, create_point, admin):
    point = create_point()

    response = client.post(f"/api/admin/points/{point['id']}/reject", json={}, headers=admin.headers)
    assert response.status_code == 422

    response = client.post(
        f"/api/admin/points/{point['id']}/reject", json={"reason": "Дублікат"}, headers=admin.headers
    )
    assert response.json()["status"] == "rejected"
    assert response.json()["rejection_reason"] == "Дублікат"


def test_approve_after_reject_clears_reason(client, create_point, admin):
    point = create_point()
    client.post(f"/api/admin/points/{point['id']}/reject", json={"reason": "Дублікат"}, headers=admin.headers)

    approved = client.post(f"/api/admin/points/{point['id']}/approve", headers=admin.headers).json()

    assert approved["status"] == "approved"
    assert approved["rejection_reason"] is None


def test_hide_and_unhide_point(client, public_point, admin):
    point_id = public_point["id"]

    assert client.post(f"/api/admin/points/{point_id}/hide", headers=admin.headers).json()["is_hidden"] is True
    assert client.get("/api/points").json()["total"] == 0

    assert client.post(f"/api/admin/points/{point_id}/unhide", headers=admin.headers).json()["is_hidden"] is False
    assert client.get("/api/points").json()["total"] == 1


def test_moderating_unknown_point(client, admin):
    assert client.post("/api/admin/points/999/approve", headers=admin.headers).status_code == 404


def test_admin_comments_filter(client, public_point, user, admin):
    visible = client.post(f"/api/points/{public_point['id']}/comments", json={"text": "ок"}, headers=user.headers).json()
    hidden = client.post(f"/api/points/{public_point['id']}/comments", json={"text": "спам"}, headers=user.headers).json()
    client.post(f"/api/admin/comments/{hidden['id']}/hide", headers=admin.headers)

    def ids(**params):
        return [c["id"] for c in client.get("/api/admin/comments", params=params, headers=admin.headers).json()["items"]]

    assert ids(is_hidden=True) == [hidden["id"]]
    assert ids(is_hidden=False) == [visible["id"]]


def test_users_list_and_search(client, user, admin):
    everyone = client.get("/api/admin/users", headers=admin.headers).json()
    assert everyone["total"] == 2

    found = client.get("/api/admin/users", params={"q": "ПРІЗВИЩЕ1"}, headers=admin.headers).json()
    assert [u["id"] for u in found["items"]] == [user.id]

    admins = client.get("/api/admin/users", params={"role": "admin"}, headers=admin.headers).json()
    assert [u["id"] for u in admins["items"]] == [admin.id]


def test_promote_user_to_admin(client, user, admin):
    response = client.patch(f"/api/admin/users/{user.id}", json={"role": "admin"}, headers=admin.headers)

    assert response.status_code == 200
    assert response.json()["role"] == "admin"
    assert client.get("/api/admin/users", headers=user.headers).status_code == 200


def test_admin_cannot_change_own_role(client, admin):
    response = client.patch(f"/api/admin/users/{admin.id}", json={"role": "user"}, headers=admin.headers)

    assert response.status_code == 400
    assert response.json()["detail"] == "Не можна змінити власну роль"


def test_change_role_of_unknown_user(client, admin):
    response = client.patch("/api/admin/users/999", json={"role": "admin"}, headers=admin.headers)
    assert response.status_code == 404
