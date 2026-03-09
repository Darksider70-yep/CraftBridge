def _create_artisan_profile(client, headers: dict[str, str]) -> str:
    response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Phase3 Studio",
            "bio": "Handmade craft stories.",
            "location": "Jaipur",
            "craft_type": "Textiles",
        },
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()["id"]


def _create_product(client, headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/v1/products",
        data={
            "title": "Phase3 Product",
            "description": "Integration test product.",
            "price": "45.50",
            "category": "Home Decor",
        },
        files=[("images", ("phase3.jpg", b"fake-image-bytes", "image/jpeg"))],
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()


def test_product_upload_flow(client, artisan_headers) -> None:
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    assert product["title"] == "Phase3 Product"
    assert product["artisan_name"] == "Phase3 Studio"
    assert len(product["images"]) == 1
    assert "/products/" in product["images"][0]["image_url"]


def test_storefront_retrieval_flow(client, artisan_headers) -> None:
    artisan_id = _create_artisan_profile(client, artisan_headers)
    _create_product(client, artisan_headers)

    storefront_response = client.get(f"/api/v1/artisan/{artisan_id}/storefront")
    assert storefront_response.status_code == 200

    storefront = storefront_response.json()
    assert storefront["artisan"]["id"] == artisan_id
    assert len(storefront["products"]) == 1
    assert storefront["products"][0]["title"] == "Phase3 Product"


def test_reel_feed_retrieval_flow(client, artisan_headers) -> None:
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    upload_reel = client.post(
        "/api/v1/reels/upload",
        data={"caption": "Phase3 reel", "product_id": product["id"]},
        files={"video": ("phase3.mp4", b"fake-video-bytes", "video/mp4")},
        headers=artisan_headers,
    )
    assert upload_reel.status_code == 201

    feed_response = client.get("/api/v1/reels/feed")
    assert feed_response.status_code == 200

    feed = feed_response.json()
    assert len(feed) == 1
    assert feed[0]["caption"] == "Phase3 reel"
    assert feed[0]["artisan_name"] == "Phase3 Studio"
    assert feed[0]["product_id"] == product["id"]

