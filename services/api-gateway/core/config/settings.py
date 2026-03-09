import os
from dataclasses import dataclass
from functools import lru_cache


def _parse_origins(origins_value: str) -> list[str]:
    origins = [origin.strip() for origin in origins_value.split(",")]
    return [origin for origin in origins if origin]


@dataclass(frozen=True)
class Settings:
    database_url: str
    jwt_secret: str
    jwt_algorithm: str
    jwt_expire_minutes: int
    storage_bucket: str
    storage_base_url: str
    storage_root: str
    db_pool_size: int
    db_max_overflow: int
    db_pool_timeout: int
    cors_origins: list[str]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///./craftbridge.db"),
        jwt_secret=os.getenv("JWT_SECRET", "change-this-secret"),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        jwt_expire_minutes=int(os.getenv("JWT_EXPIRE_MINUTES", "120")),
        storage_bucket=os.getenv("STORAGE_BUCKET", "craftbridge-local"),
        storage_base_url=os.getenv("STORAGE_BASE_URL", "https://storage.local"),
        storage_root=os.getenv("STORAGE_ROOT", "/storage"),
        db_pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
        db_max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
        db_pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "30")),
        cors_origins=_parse_origins(os.getenv("CORS_ORIGINS", "*")),
    )
