import os
import shutil
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TESTS_DIR.parents[1]
SERVICE_DIR = PROJECT_ROOT / "services" / "api-gateway"
TEST_DB_FILE = TESTS_DIR / "test_integration_gateway.db"
TEST_STORAGE_DIR = TESTS_DIR / "test_storage"

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE.as_posix()}"
os.environ["JWT_SECRET"] = "integration-jwt-secret-32-char-safe"
os.environ["STORAGE_BUCKET"] = "integration-bucket"
os.environ["STORAGE_BASE_URL"] = "https://storage.integration.local"
os.environ["STORAGE_ROOT"] = str(TEST_STORAGE_DIR.resolve())

if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

import main  # noqa: E402
from app.models.base import Base  # noqa: E402
from core.config.database import engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> None:
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()
    if TEST_STORAGE_DIR.exists():
        shutil.rmtree(TEST_STORAGE_DIR)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()
    if TEST_STORAGE_DIR.exists():
        shutil.rmtree(TEST_STORAGE_DIR)


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
def artisan_headers(client: TestClient) -> dict[str, str]:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "phase3.artisan@example.com",
            "password": "StrongPass123",
            "role": "artisan",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "phase3.artisan@example.com", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

