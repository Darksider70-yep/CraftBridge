def _register_and_login(client, email: str, role: str) -> dict:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "StrongPass123",
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


def _create_artisan_profile(client, headers: dict[str, str]) -> str:
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


def _create_product(client, artisan_headers: dict[str, str]) -> dict:
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


def test_order_creation_and_fetch(client) -> None:
    artisan_auth = _register_and_login(client, "orders.artisan@example.com", "artisan")
    artisan_headers = {"Authorization": f"Bearer {artisan_auth['access_token']}"}
    _create_artisan_profile(client, artisan_headers)
    product = _create_product(client, artisan_headers)

    buyer_auth = _register_and_login(client, "orders.buyer@example.com", "buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer_auth['access_token']}"}
    buyer_user_id = buyer_auth["user"]["id"]

    create_order_response = client.post(
        "/api/v1/orders",
        json={"product_id": product["id"], "quantity": 2},
        headers=buyer_headers,
    )
    assert create_order_response.status_code == 201
    created_order = create_order_response.json()
    assert created_order["product_id"] == product["id"]
    assert created_order["quantity"] == 2
    assert created_order["status"] == "pending"

    fetch_order_response = client.get(
        f"/api/v1/orders/{created_order['id']}",
        headers=buyer_headers,
    )
    assert fetch_order_response.status_code == 200
    assert fetch_order_response.json()["id"] == created_order["id"]

    list_orders_response = client.get(
        f"/api/v1/users/{buyer_user_id}/orders",
        headers=buyer_headers,
    )
    assert list_orders_response.status_code == 200
    orders = list_orders_response.json()
    assert len(orders) == 1
    assert orders[0]["id"] == created_order["id"]

