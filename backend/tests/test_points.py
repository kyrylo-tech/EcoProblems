import pytest

from tests.conftest import collection_payload, problem_payload


def public_ids(client, **params) -> list[int]:
    response = client.get("/api/points", params=params)
    assert response.status_code == 200, response.text
    return [p["id"] for p in response.json()["items"]]


# --- Create ---------------------------------------------------------------------------------------


def test_create_collection_point(client, user):
    response = client.post("/api/points", json=collection_payload(), headers=user.headers)

    assert response.status_code == 201
    point = response.json()
    assert point["status"] == "pending"
    assert point["is_hidden"] is False
    assert point["author"] == {"id": user.id, "first_name": "Ім'я1", "last_name": "Прізвище1"}
    assert point["accepted_waste"] == ["plastic", "glass"]  # catalog order
    assert point["schedule"]["mon"] == {"opens": "08:00", "closes": "20:00"}
    assert point["schedule"]["tue"] is None  # day off
    assert point["problem_kind"] is None
    assert point["photos"] == []
    assert point["cover_photo_url"] is None
    assert point["comments_count"] == 0


def test_create_eco_problem(client, user):
    response = client.post("/api/points", json=problem_payload(), headers=user.headers)

    assert response.status_code == 201
    point = response.json()
    assert point["type"] == "eco_problem"
    assert point["problem_kind"] == "illegal_dump"
    assert point["accepted_waste"] == []
    assert point["schedule"] is None


def test_collection_without_schedule_means_no_restrictions(client, user):
    response = client.post("/api/points", json=collection_payload(schedule=None), headers=user.headers)

    assert response.status_code == 201
    assert response.json()["schedule"] is None


def test_create_requires_auth(client):
    assert client.post("/api/points", json=collection_payload()).status_code == 401


def test_address_is_detected_when_missing(client, user, geocoder):
    payload = collection_payload()
    del payload["city"], payload["street"]

    point = client.post("/api/points", json=payload, headers=user.headers).json()

    assert geocoder.calls == [(50.4501, 30.5234)]
    assert point["city"] == "Київ"
    assert point["street"] == "вулиця Хрещатик, 1"


def test_explicit_address_is_kept(client, user, geocoder):
    point = client.post("/api/points", json=collection_payload(street=None), headers=user.headers).json()

    assert point["city"] == "Київ"  # sent explicitly
    assert point["street"] == "вулиця Хрещатик, 1"  # detected
    assert len(geocoder.calls) == 1


def test_geocoder_is_not_called_when_address_is_complete(client, user, geocoder):
    client.post("/api/points", json=collection_payload(), headers=user.headers)
    assert geocoder.calls == []


@pytest.mark.parametrize(
    ("payload", "message"),
    [
        (collection_payload(accepted_waste=[]), "Вкажіть, яку вторсировину приймає пункт (accepted_waste)"),
        (collection_payload(problem_kind="illegal_dump"), "Вид екопроблеми вказується лише для екопроблем"),
        (problem_payload(problem_kind=None), "Для екопроблеми вкажіть вид проблеми (problem_kind)"),
        (problem_payload(accepted_waste=["glass"]), "Види вторсировини вказуються лише для пунктів прийому"),
        (
            problem_payload(schedule={"mon": {"opens": "08:00", "closes": "20:00"}}),
            "Графік роботи вказується лише для пунктів прийому",
        ),
        (
            collection_payload(schedule={"mon": {"opens": "20:00", "closes": "08:00"}}),
            "Час закриття має бути пізніше за час відкриття",
        ),
        (
            collection_payload(schedule={"mon": None}),
            "Вкажіть хоча б один робочий день або передайте schedule: null (працює без обмежень)",
        ),
        (collection_payload(latitude=91), "Має бути не більше 90"),
        (collection_payload(title="ab"), "Мінімальна довжина — 3 симв."),
        (collection_payload(accepted_waste=["uranium"]), None),
    ],
)
def test_create_validation(client, user, payload, message):
    response = client.post("/api/points", json=payload, headers=user.headers)

    assert response.status_code == 422
    if message:
        assert message in [err["msg"] for err in response.json()["detail"]]


# --- Visibility & moderation ----------------------------------------------------------------------


def test_pending_point_is_visible_only_to_author_and_admin(client, create_point, user, other_user, admin):
    point = create_point()
    url = f"/api/points/{point['id']}"

    assert public_ids(client) == []
    assert client.get(url).status_code == 404
    assert client.get(url, headers=other_user.headers).status_code == 404
    assert client.get(url, headers=user.headers).status_code == 200
    assert client.get(url, headers=admin.headers).status_code == 200


def test_approved_point_is_public(client, create_point, approve):
    point = create_point()
    approved = approve(point["id"])

    assert approved["status"] == "approved"
    assert approved["moderated_at"] is not None
    assert public_ids(client) == [point["id"]]
    assert client.get(f"/api/points/{point['id']}").json()["status"] == "approved"


def test_admin_points_are_approved_immediately(client, create_point, admin):
    point = create_point(by=admin)

    assert point["status"] == "approved"
    assert public_ids(client) == [point["id"]]


def test_hidden_point_is_not_public(client, public_point, admin, user):
    client.post(f"/api/admin/points/{public_point['id']}/hide", headers=admin.headers)

    assert public_ids(client) == []
    assert client.get(f"/api/points/{public_point['id']}").status_code == 404
    author_view = client.get(f"/api/points/{public_point['id']}", headers=user.headers).json()
    assert author_view["is_hidden"] is True


def test_rejected_point_shows_reason_to_author(client, create_point, admin, user):
    point = create_point()
    client.post(f"/api/admin/points/{point['id']}/reject", json={"reason": "Немає фото"}, headers=admin.headers)

    author_view = client.get(f"/api/points/{point['id']}", headers=user.headers).json()
    assert author_view["status"] == "rejected"
    assert author_view["rejection_reason"] == "Немає фото"
    assert public_ids(client) == []


def test_my_points(client, create_point, approve, user, other_user):
    first = create_point()
    second = create_point(problem_payload())
    approve(first["id"])
    create_point(by=other_user)

    response = client.get("/api/points/mine", headers=user.headers).json()
    assert response["total"] == 2
    assert {p["id"]: p["status"] for p in response["items"]} == {first["id"]: "approved", second["id"]: "pending"}

    pending = client.get("/api/points/mine", params={"status": "pending"}, headers=user.headers).json()
    assert [p["id"] for p in pending["items"]] == [second["id"]]


def test_my_points_requires_auth(client):
    assert client.get("/api/points/mine").status_code == 401


def test_unknown_point(client):
    response = client.get("/api/points/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Точку не знайдено"


# --- Filters --------------------------------------------------------------------------------------


@pytest.fixture
def map_points(create_point, approve) -> dict[str, int]:
    payloads = {
        "kyiv_plastic": collection_payload(title="Чисте місто", accepted_waste=["plastic"]),
        "kyiv_glass": collection_payload(
            title="Скляний пункт", latitude=50.40, longitude=30.60, accepted_waste=["glass", "metal"]
        ),
        "lviv_batteries": collection_payload(
            title="Батарейки тут", city="Львів", street="пл. Ринок, 1", latitude=49.84, longitude=24.03,
            accepted_waste=["batteries"],
        ),
        "lviv_dump": problem_payload(),
        "odesa_water": problem_payload(
            title="Плівка на воді", city="Одеса", latitude=46.48, longitude=30.73, problem_kind="water_pollution"
        ),
    }
    ids = {}
    for key, payload in payloads.items():
        ids[key] = create_point(payload)["id"]
        approve(ids[key])
    return ids


def test_filter_by_type(client, map_points):
    assert set(public_ids(client, type="eco_problem")) == {map_points["lviv_dump"], map_points["odesa_water"]}


def test_filter_by_waste_any_of(client, map_points):
    assert set(public_ids(client, waste=["metal", "batteries"])) == {
        map_points["kyiv_glass"],
        map_points["lviv_batteries"],
    }


def test_filter_by_problem_kind(client, map_points):
    assert public_ids(client, problem_kind="water_pollution") == [map_points["odesa_water"]]


def test_search_is_case_insensitive_for_cyrillic(client, map_points):
    assert set(public_ids(client, q="ЛЬВІВ")) == {map_points["lviv_batteries"], map_points["lviv_dump"]}
    assert public_ids(client, q="скляний") == [map_points["kyiv_glass"]]
    assert public_ids(client, q="ринок") == [map_points["lviv_batteries"]]


def test_filter_by_city(client, map_points):
    assert set(public_ids(client, city="одеса")) == {map_points["odesa_water"]}


def test_filter_by_bbox(client, map_points):
    ids = public_ids(client, min_lat=50.0, max_lat=51.0, min_lng=30.0, max_lng=31.0)
    assert set(ids) == {map_points["kyiv_plastic"], map_points["kyiv_glass"]}


def test_partial_bbox_is_rejected(client):
    response = client.get("/api/points", params={"min_lat": 50})
    assert response.status_code == 422


def test_sort_by_distance(client, map_points):
    response = client.get("/api/points", params={"near_lat": 49.85, "near_lng": 24.02}).json()

    ids = [p["id"] for p in response["items"]]
    assert set(ids[:2]) == {map_points["lviv_batteries"], map_points["lviv_dump"]}
    assert ids[-1] == map_points["odesa_water"]
    distances = [p["distance_km"] for p in response["items"]]
    assert distances == sorted(distances)
    assert distances[0] < 2


def test_pagination(client, map_points):
    page = client.get("/api/points", params={"limit": 2, "offset": 1}).json()

    assert page["total"] == 5
    assert page["limit"] == 2
    assert page["offset"] == 1
    assert len(page["items"]) == 2


# --- Update ---------------------------------------------------------------------------------------


def test_author_edit_sends_point_back_to_moderation(client, public_point, user):
    response = client.patch(f"/api/points/{public_point['id']}", json={"title": "Нова назва"}, headers=user.headers)

    assert response.status_code == 200
    assert response.json()["title"] == "Нова назва"
    assert response.json()["status"] == "pending"
    assert public_ids(client) == []


def test_admin_edit_keeps_point_approved(client, public_point, admin):
    response = client.patch(f"/api/points/{public_point['id']}", json={"title": "Нова назва"}, headers=admin.headers)

    assert response.json()["status"] == "approved"


def test_edit_after_rejection_clears_reason(client, create_point, admin, user):
    point = create_point()
    client.post(f"/api/admin/points/{point['id']}/reject", json={"reason": "Немає фото"}, headers=admin.headers)

    updated = client.patch(f"/api/points/{point['id']}", json={"description": "Додав опис"}, headers=user.headers)

    assert updated.json()["status"] == "pending"
    assert updated.json()["rejection_reason"] is None


def test_other_user_cannot_edit(client, public_point, other_user):
    response = client.patch(f"/api/points/{public_point['id']}", json={"title": "Хак"}, headers=other_user.headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Редагувати точку може лише її автор або адміністратор"


def test_moving_point_redetects_address(client, create_point, user, geocoder):
    point = create_point()

    updated = client.patch(
        f"/api/points/{point['id']}", json={"latitude": 50.0, "longitude": 30.0}, headers=user.headers
    ).json()

    assert geocoder.calls == [(50.0, 30.0)]
    assert updated["street"] == "вулиця Хрещатик, 1"


def test_changing_type_clears_irrelevant_fields(client, create_point, user):
    point = create_point()

    updated = client.patch(
        f"/api/points/{point['id']}", json={"type": "eco_problem", "problem_kind": "waste_burning"}, headers=user.headers
    )

    assert updated.status_code == 200, updated.text
    assert updated.json()["accepted_waste"] == []
    assert updated.json()["schedule"] is None


def test_update_validates_merged_state(client, create_point, user):
    point = create_point()
    response = client.patch(f"/api/points/{point['id']}", json={"accepted_waste": []}, headers=user.headers)

    assert response.status_code == 422


def test_update_schedule_to_unrestricted(client, create_point, user):
    point = create_point()
    response = client.patch(f"/api/points/{point['id']}", json={"schedule": None}, headers=user.headers)

    assert response.json()["schedule"] is None


# --- Delete ---------------------------------------------------------------------------------------


def test_author_can_delete(client, create_point, user):
    point = create_point()

    assert client.delete(f"/api/points/{point['id']}", headers=user.headers).status_code == 204
    assert client.get(f"/api/points/{point['id']}", headers=user.headers).status_code == 404


def test_other_user_cannot_delete(client, public_point, other_user):
    assert client.delete(f"/api/points/{public_point['id']}", headers=other_user.headers).status_code == 403


def test_admin_can_delete(client, create_point, admin):
    point = create_point()
    assert client.delete(f"/api/points/{point['id']}", headers=admin.headers).status_code == 204
