from fastapi.testclient import TestClient


def _create_artisan_profile(client: TestClient, headers: dict[str, str]) -> str:
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


def test_update_product(client: TestClient, artisan_headers: dict[str, str]) -> None:
    _create_artisan_profile(client, artisan_headers)
    create_response = client.post(
        "/api/v1/products",
        data={
            "title": "Handwoven Basket",
            "description": "A durable handwoven basket.",
            "price": "59.99",
            "category": "Home Decor",
        },
        headers=artisan_headers,
    )
    assert create_response.status_code == 201
    product_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/v1/products/{product_id}",
        json={"price": 69.99, "description": "An updated description."},
        headers=artisan_headers,
    )
    assert update_response.status_code == 200
    updated_product = update_response.json()
    assert updated_product["price"] == 69.99
    assert updated_product["description"] == "An updated description."


def test_delete_product(client: TestClient, artisan_headers: dict[str, str]) -> None:
    _create_artisan_profile(client, artisan_headers)
    create_response = client.post(
        "/api/v1/products",
        data={
            "title": "Handwoven Basket",
            "description": "A durable handwoven basket.",
            "price": "59.99",
            "category": "Home Decor",
        },
        headers=artisan_headers,
    )
    assert create_response.status_code == 201
    product_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/api/v1/products/{product_id}",
        headers=artisan_headers,
    )
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/products/{product_id}")
    assert get_response.status_code == 404
