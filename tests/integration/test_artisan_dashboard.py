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


def _create_artisan_profile(client, headers: dict[str, str]) -> None:
    response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Dashboard Studio",
            "bio": "Profile for dashboard analytics.",
            "location": "Jaipur",
            "craft_type": "Woodcraft",
        },
        headers=headers,
    )
    assert response.status_code == 201


def _create_product(
    client,
    headers: dict[str, str],
    title: str,
    price: str,
) -> dict:
    response = client.post(
        "/api/v1/products",
        data={
            "title": title,
            "description": f"{title} description.",
            "price": price,
            "category": "Handmade",
        },
        files=[("images", (f"{title}.jpg", b"image-data", "image/jpeg"))],
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()


def _create_order(
    client,
    headers: dict[str, str],
    product_id: str,
    quantity: int,
) -> dict:
    response = client.post(
        "/api/v1/orders",
        json={"product_id": product_id, "quantity": quantity},
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()


def test_artisan_dashboard_endpoint_returns_summary(client) -> None:
    artisan_auth = _register_and_login(client, "dashboard.artisan@example.com", "artisan")
    artisan_headers = {"Authorization": f"Bearer {artisan_auth['access_token']}"}
    _create_artisan_profile(client, artisan_headers)

    product_a = _create_product(client, artisan_headers, "Wooden Bowl", "30.00")
    product_b = _create_product(client, artisan_headers, "Mini Stool", "15.00")

    buyer_auth = _register_and_login(client, "dashboard.buyer@example.com", "buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer_auth['access_token']}"}

    _create_order(client, buyer_headers, product_a["id"], 2)
    _create_order(client, buyer_headers, product_a["id"], 1)
    _create_order(client, buyer_headers, product_b["id"], 4)

    response = client.get("/api/v1/artisan/dashboard?recent_limit=2", headers=artisan_headers)
    assert response.status_code == 200
    payload = response.json()

    assert payload["artisan_name"] == "Dashboard Studio"
    assert payload["total_products"] == 2
    assert payload["total_orders"] == 3
    assert abs(payload["total_sales"] - 150.0) < 0.001
    assert len(payload["recent_orders"]) == 2
    assert "product_title" in payload["recent_orders"][0]
    assert "total_amount" in payload["recent_orders"][0]


def test_artisan_sales_endpoint_returns_top_product_and_revenue(client) -> None:
    artisan_auth = _register_and_login(client, "sales.artisan@example.com", "artisan")
    artisan_headers = {"Authorization": f"Bearer {artisan_auth['access_token']}"}
    _create_artisan_profile(client, artisan_headers)

    product_a = _create_product(client, artisan_headers, "Clay Lamp", "25.00")
    product_b = _create_product(client, artisan_headers, "Bamboo Tray", "18.00")

    buyer_auth = _register_and_login(client, "sales.buyer@example.com", "buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer_auth['access_token']}"}

    _create_order(client, buyer_headers, product_a["id"], 1)
    _create_order(client, buyer_headers, product_b["id"], 3)
    _create_order(client, buyer_headers, product_b["id"], 2)

    response = client.get("/api/v1/artisan/sales?recent_limit=3", headers=artisan_headers)
    assert response.status_code == 200
    payload = response.json()

    assert payload["orders_count"] == 3
    assert abs(payload["total_revenue"] - 115.0) < 0.001
    assert payload["top_selling_product"]["product_id"] == product_b["id"]
    assert payload["top_selling_product"]["units_sold"] == 5
    assert abs(payload["top_selling_product"]["revenue"] - 90.0) < 0.001
    assert len(payload["recent_orders"]) == 3
