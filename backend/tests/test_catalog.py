from app.enums import EcoProblemKind, PointStatus, PointType, UserRole, WasteKind, Weekday
from tests.conftest import collection_payload, problem_payload


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok", "db": "ok"}


def test_catalog_covers_every_enum_value(client):
    catalog = client.get("/api/catalog").json()

    def values(key):
        return [item["value"] for item in catalog[key]]

    assert values("user_roles") == list(UserRole)
    assert values("point_types") == list(PointType)
    assert values("point_statuses") == list(PointStatus)
    assert values("weekdays") == list(Weekday)
    assert values("eco_problem_kinds") == list(EcoProblemKind)
    assert values("waste_kinds") == list(WasteKind)
    assert catalog["preparation_tips"]


def test_catalog_is_in_ukrainian(client):
    catalog = client.get("/api/catalog").json()

    plastic = catalog["waste_kinds"][0]
    assert plastic["label"] == "Пластик"
    assert plastic["accepted"] and plastic["not_accepted"]
    assert plastic["color"].startswith("#")
    assert catalog["point_types"][1] == {"value": "collection", "label": "Пункт прийому"}
    assert catalog["weekdays"][0] == {"value": "mon", "label": "Понеділок", "short_label": "Пн"}


def test_stats_count_only_public_points(client, create_point, approve, admin):
    for payload in (
        collection_payload(city="Київ"),
        collection_payload(city="КИЇВ"),  # same city, different case
        collection_payload(city="Львів"),
        problem_payload(city="Одеса"),
    ):
        approve(create_point(payload)["id"])
    create_point(collection_payload(city="Харків"))  # pending
    hidden = create_point(collection_payload(city="Дніпро"))
    approve(hidden["id"])
    client.post(f"/api/admin/points/{hidden['id']}/hide", headers=admin.headers)

    assert client.get("/api/stats").json() == {
        "collection_points": 3,
        "eco_problems": 1,
        "cities": 3,
        "waste_kinds": len(WasteKind),
    }


def test_reverse_geocode(client, geocoder):
    response = client.get("/api/geo/reverse", params={"lat": 50.45, "lng": 30.52})

    assert response.json() == {"city": "Київ", "street": "вулиця Хрещатик, 1"}
    assert geocoder.calls == [(50.45, 30.52)]


def test_reverse_geocode_validates_coordinates(client):
    response = client.get("/api/geo/reverse", params={"lat": 100, "lng": 30})

    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Має бути не більше 90"


def test_unknown_route_is_ukrainian(client):
    response = client.get("/api/nope")

    assert response.status_code == 404
    assert response.json()["detail"] == "Не знайдено"
