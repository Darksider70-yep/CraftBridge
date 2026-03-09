import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TESTS_DIR.parents[1]
SERVICE_DIR = PROJECT_ROOT / "services" / "api-gateway"
TEST_DB_FILE = TESTS_DIR / "test_api_gateway.db"

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE.as_posix()}"
os.environ["JWT_SECRET"] = "test-jwt-secret-with-safe-length-32"
os.environ["STORAGE_BUCKET"] = "test-bucket"
os.environ["STORAGE_BASE_URL"] = "https://storage.test.local"

if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

import main  # noqa: E402
from app.models.base import Base  # noqa: E402
from core.config.database import engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> None:
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()


@pytest.fixture(autouse=True)
def clean_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client() -> TestClient:
    with TestClient(main.app) as test_client:
        yield test_client


@pytest.fixture
def artisan_access_token(client: TestClient) -> str:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "artisan@example.com",
            "password": "StrongPass123",
            "role": "artisan",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "artisan@example.com", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
def artisan_headers(artisan_access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {artisan_access_token}"}
