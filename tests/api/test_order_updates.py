from fastapi.testclient import TestClient


def _register_and_login(client: TestClient, email: str, role: str) -> dict:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "StrongPass123",
            "first_name": "Test",
            "last_name": "User",
            "role": role,
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    return login_response.json()


def _create_artisan_profile(client: TestClient, headers: dict[str, str]) -> str:
    artisan_response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Orders Craft Studio",
            "bio": "Order flow testing profile.",
            "location": "Jaipur",
            "craft_type": "Textiles",
        },
        headers=headers,
    )
    assert artisan_response.status_code == 201
    return artisan_response.json()["id"]


def _create_product(client: TestClient, artisan_headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/v1/products",
        data={
            "title": "Order Test Product",
            "description": "Product for order testing.",
            "price": "18.50",
            "category": "Decor",
        },
        files=[("images", ("product.jpg", b"fake-image-bytes", "image/jpeg"))],
        headers=artisan_headers,
    )
    assert response.status_code == 201
    return response.json()


def test_update_order_status(client: TestClient) -> None:
    admin_auth = _register_and_login(client, "orders.admin@example.com", "admin")
    admin_headers = {"Authorization": f"Bearer {admin_auth['access_token']}"}

    artisan_auth = _register_and_login(
        client, "orders.artisan.update@example.com", "artisan"
    )
    artisan_headers = {"Authorization": f"Bearer {artisan_auth['access_token']}"}
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    buyer_auth = _register_and_login(client, "orders.buyer.update@example.com", "buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer_auth['access_token']}"}

    create_order_response = client.post(
        "/api/v1/orders",
        json={"product_id": product["id"], "quantity": 1},
        headers=buyer_headers,
    )
    assert create_order_response.status_code == 201
    order_id = create_order_response.json()["id"]

    update_response = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "shipped"},
        headers=admin_headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "shipped"


def test_unauthorized_update_order_status(client: TestClient) -> None:
    artisan_auth = _register_and_login(
        client, "orders.artisan.unauth@example.com", "artisan"
    )
    artisan_headers = {"Authorization": f"Bearer {artisan_auth['access_token']}"}
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    buyer_auth = _register_and_login(client, "orders.buyer.unauth@example.com", "buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer_auth['access_token']}"}

    create_order_response = client.post(
        "/api/v1/orders",
        json={"product_id": product["id"], "quantity": 1},
        headers=buyer_headers,
    )
    assert create_order_response.status_code == 201
    order_id = create_order_response.json()["id"]

    update_response = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "shipped"},
        headers=buyer_headers,
    )
    assert update_response.status_code == 403
