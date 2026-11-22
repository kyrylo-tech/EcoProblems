from app.config import settings
from tests.conftest import JPEG, PNG


def upload(client, point_id, headers, *files):
    return client.post(
        f"/api/points/{point_id}/photos",
        files=[("files", (name, data, "application/octet-stream")) for name, data in files],
        headers=headers,
    )


def test_upload_photos(client, create_point, user):
    point = create_point()

    response = upload(client, point["id"], user.headers, ("a.png", PNG), ("b.jpg", JPEG))

    assert response.status_code == 201, response.text
    photos = response.json()
    assert len(photos) == 2
    assert photos[0]["url"].startswith(f"/api/media/points/{point['id']}/")
    assert photos[0]["url"].endswith(".png")
    assert photos[1]["url"].endswith(".jpg")

    served = client.get(photos[0]["url"])
    assert served.status_code == 200
    assert served.content == PNG

    detail = client.get(f"/api/points/{point['id']}", headers=user.headers).json()
    assert [p["id"] for p in detail["photos"]] == [p["id"] for p in photos]
    assert detail["cover_photo_url"] == photos[0]["url"]


def test_non_image_is_rejected(client, create_point, user):
    point = create_point()
    response = upload(client, point["id"], user.headers, ("virus.exe", b"MZ\x90\x00 not an image"))

    assert response.status_code == 415
    assert response.json()["detail"] == "Файл «virus.exe» не є зображенням JPEG, PNG або WebP"
    assert not any(settings.media_dir.rglob("*.*"))


def test_failed_batch_does_not_leave_files(client, create_point, user):
    point = create_point()
    response = upload(client, point["id"], user.headers, ("ok.png", PNG), ("bad.txt", b"hello"))

    assert response.status_code == 415
    assert not any(settings.media_dir.rglob("*.*"))
    assert client.get(f"/api/points/{point['id']}", headers=user.headers).json()["photos"] == []


def test_too_large_file(client, create_point, user, monkeypatch):
    monkeypatch.setattr(settings, "max_photo_size_mb", 0)
    point = create_point()

    response = upload(client, point["id"], user.headers, ("big.png", PNG))

    assert response.status_code == 413


def test_photo_limit(client, create_point, user, monkeypatch):
    monkeypatch.setattr(settings, "max_photos_per_point", 2)
    point = create_point()
    upload(client, point["id"], user.headers, ("1.png", PNG), ("2.png", PNG))

    response = upload(client, point["id"], user.headers, ("3.png", PNG))

    assert response.status_code == 400
    assert response.json()["detail"] == "До точки можна додати не більше 2 фото"


def test_only_author_or_admin_can_upload(client, public_point, other_user, admin):
    assert upload(client, public_point["id"], other_user.headers, ("a.png", PNG)).status_code == 403
    assert upload(client, public_point["id"], admin.headers, ("a.png", PNG)).status_code == 201


def test_author_upload_sends_approved_point_to_moderation(client, public_point, user):
    upload(client, public_point["id"], user.headers, ("a.png", PNG))

    detail = client.get(f"/api/points/{public_point['id']}", headers=user.headers).json()
    assert detail["status"] == "pending"


def test_admin_upload_keeps_point_approved(client, public_point, admin):
    upload(client, public_point["id"], admin.headers, ("a.png", PNG))

    assert client.get(f"/api/points/{public_point['id']}").json()["status"] == "approved"


def test_delete_photo_removes_file(client, create_point, user):
    point = create_point()
    photo = upload(client, point["id"], user.headers, ("a.png", PNG)).json()[0]

    response = client.delete(f"/api/points/{point['id']}/photos/{photo['id']}", headers=user.headers)

    assert response.status_code == 204
    assert client.get(photo["url"]).status_code == 404
    assert client.get(f"/api/points/{point['id']}", headers=user.headers).json()["photos"] == []


def test_delete_unknown_photo(client, create_point, user):
    point = create_point()
    response = client.delete(f"/api/points/{point['id']}/photos/999", headers=user.headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Фото не знайдено"


def test_deleting_point_removes_its_photos(client, create_point, user):
    point = create_point()
    upload(client, point["id"], user.headers, ("a.png", PNG), ("b.png", PNG))

    client.delete(f"/api/points/{point['id']}", headers=user.headers)

    assert not any(settings.media_dir.rglob("*.*"))
