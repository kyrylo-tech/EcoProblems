def add_comment(client, point_id, headers, text="Здала пластик, все ок"):
    return client.post(f"/api/points/{point_id}/comments", json={"text": text}, headers=headers)


def test_comment_is_published_immediately(client, public_point, other_user):
    response = add_comment(client, public_point["id"], other_user.headers)

    assert response.status_code == 201
    comment = response.json()
    assert comment["text"] == "Здала пластик, все ок"
    assert comment["author"]["id"] == other_user.id
    assert comment["is_hidden"] is False

    listing = client.get(f"/api/points/{public_point['id']}/comments").json()
    assert listing["total"] == 1
    assert listing["items"][0]["id"] == comment["id"]
    assert client.get(f"/api/points/{public_point['id']}").json()["comments_count"] == 1


def test_comments_are_newest_first(client, public_point, user):
    first = add_comment(client, public_point["id"], user.headers, "перший").json()
    second = add_comment(client, public_point["id"], user.headers, "другий").json()

    items = client.get(f"/api/points/{public_point['id']}/comments").json()["items"]
    assert [c["id"] for c in items] == [second["id"], first["id"]]


def test_comment_requires_auth(client, public_point):
    response = client.post(f"/api/points/{public_point['id']}/comments", json={"text": "привіт"})
    assert response.status_code == 401


def test_cannot_comment_unpublished_point(client, create_point, user, other_user):
    point = create_point()

    by_author = add_comment(client, point["id"], user.headers)
    assert by_author.status_code == 400
    assert by_author.json()["detail"] == "Коментувати можна лише опубліковані точки"

    assert add_comment(client, point["id"], other_user.headers).status_code == 404


def test_empty_comment_is_rejected(client, public_point, user):
    response = add_comment(client, public_point["id"], user.headers, "   ")

    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Мінімальна довжина — 1 симв."


def test_author_can_delete_comment(client, public_point, other_user):
    comment = add_comment(client, public_point["id"], other_user.headers).json()

    assert client.delete(f"/api/comments/{comment['id']}", headers=other_user.headers).status_code == 204
    assert client.get(f"/api/points/{public_point['id']}/comments").json()["total"] == 0


def test_other_user_cannot_delete_comment(client, public_point, user, other_user):
    comment = add_comment(client, public_point["id"], other_user.headers).json()

    response = client.delete(f"/api/comments/{comment['id']}", headers=user.headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Видалити коментар може лише його автор або адміністратор"


def test_admin_can_delete_any_comment(client, public_point, other_user, admin):
    comment = add_comment(client, public_point["id"], other_user.headers).json()
    assert client.delete(f"/api/comments/{comment['id']}", headers=admin.headers).status_code == 204


def test_delete_unknown_comment(client, user):
    response = client.delete("/api/comments/999", headers=user.headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Коментар не знайдено"


def test_hidden_comment_is_visible_only_to_admin(client, public_point, other_user, admin):
    comment = add_comment(client, public_point["id"], other_user.headers).json()

    hidden = client.post(f"/api/admin/comments/{comment['id']}/hide", headers=admin.headers)
    assert hidden.json()["is_hidden"] is True

    url = f"/api/points/{public_point['id']}/comments"
    assert client.get(url).json()["total"] == 0
    assert client.get(url, headers=other_user.headers).json()["total"] == 0
    admin_view = client.get(url, headers=admin.headers).json()
    assert admin_view["items"][0]["is_hidden"] is True
    assert client.get(f"/api/points/{public_point['id']}").json()["comments_count"] == 0

    client.post(f"/api/admin/comments/{comment['id']}/unhide", headers=admin.headers)
    assert client.get(url).json()["total"] == 1


def test_comments_of_unpublished_point_are_not_listed(client, public_point, admin):
    client.post(f"/api/admin/points/{public_point['id']}/hide", headers=admin.headers)
    assert client.get(f"/api/points/{public_point['id']}/comments").status_code == 404
