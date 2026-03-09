def test_register_login_and_me_flow(client) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "buyer@example.com",
            "password": "StrongPass123",
            "role": "buyer",
        },
    )
    assert register_response.status_code == 201
    registered_user = register_response.json()
    assert registered_user["email"] == "buyer@example.com"
    assert registered_user["role"] == "buyer"

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@example.com", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_payload = me_response.json()
    assert me_payload["email"] == "buyer@example.com"
    assert me_payload["role"] == "buyer"
