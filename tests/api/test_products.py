def _create_artisan_profile(client, headers: dict[str, str]) -> str:
    artisan_response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Daksh Handcrafts",
            "bio": "Handmade craft collective.",
            "location": "Jaipur",
            "craft_type": "Textile",
        },
        headers=headers,
    )
    assert artisan_response.status_code == 201
    return artisan_response.json()["id"]


def test_create_product_and_get_product(client, artisan_headers) -> None:
    _create_artisan_profile(client, artisan_headers)

    create_response = client.post(
        "/api/v1/products",
        data={
            "title": "Handwoven Basket",
            "description": "A durable handwoven basket.",
            "price": "59.99",
            "category": "Home Decor",
        },
        files=[
            ("images", ("basket.jpg", b"fake-image-bytes", "image/jpeg")),
        ],
        headers=artisan_headers,
    )
    assert create_response.status_code == 201
    product = create_response.json()
    assert product["title"] == "Handwoven Basket"
    assert product["category"] == "Home Decor"
    assert len(product["images"]) == 1
    assert product["images"][0]["image_url"].startswith("https://storage.test.local")

    list_response = client.get("/api/v1/products")
    assert list_response.status_code == 200
    products = list_response.json()
    assert len(products) == 1
    assert products[0]["id"] == product["id"]

    get_response = client.get(f"/api/v1/products/{product['id']}")
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["id"] == product["id"]
