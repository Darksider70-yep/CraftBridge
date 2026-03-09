def _create_artisan_profile(client, headers: dict[str, str]) -> str:
    response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Reel Ranking Studio",
            "bio": "Ranking test profile.",
            "location": "Jaipur",
            "craft_type": "Pottery",
        },
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()["id"]


def _create_product(client, headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/v1/products",
        data={
            "title": "Reel Ranking Product",
            "description": "Product for reel ranking.",
            "price": "29.00",
            "category": "Decor",
        },
        files=[("images", ("product.jpg", b"image-data", "image/jpeg"))],
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()


def test_reel_like_and_feed_ranking(client, artisan_headers) -> None:
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    first_reel_response = client.post(
        "/api/v1/reels/upload",
        data={"caption": "First reel", "product_id": product["id"]},
        files={"video": ("first.mp4", b"video-bytes-1", "video/mp4")},
        headers=artisan_headers,
    )
    assert first_reel_response.status_code == 201
    first_reel = first_reel_response.json()

    second_reel_response = client.post(
        "/api/v1/reels/upload",
        data={"caption": "Second reel", "product_id": product["id"]},
        files={"video": ("second.mp4", b"video-bytes-2", "video/mp4")},
        headers=artisan_headers,
    )
    assert second_reel_response.status_code == 201
    second_reel = second_reel_response.json()

    like_response = client.post(f"/api/v1/reels/{second_reel['id']}/like")
    assert like_response.status_code == 200
    assert like_response.json()["likes"] == 1

    view_response = client.post(f"/api/v1/reels/{second_reel['id']}/view")
    assert view_response.status_code == 200
    assert view_response.json()["views"] == 1

    feed_response = client.get("/api/v1/reels/feed")
    assert feed_response.status_code == 200
    feed = feed_response.json()

    assert len(feed) == 2
    assert feed[0]["id"] == second_reel["id"]
    assert feed[0]["likes"] == 1
    assert feed[0]["views"] == 1
    assert feed[1]["id"] == first_reel["id"]

