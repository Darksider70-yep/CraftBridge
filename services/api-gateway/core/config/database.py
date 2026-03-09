from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.models.base import Base
from core.config.settings import get_settings

settings = get_settings()

engine_kwargs: dict[str, object] = {
    "pool_pre_ping": True,
}
connect_args: dict[str, object] = {}

if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs.update(
        {
            "pool_size": settings.db_pool_size,
            "max_overflow": settings.db_max_overflow,
            "pool_timeout": settings.db_pool_timeout,
        }
    )

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def init_db() -> None:
    # Import model modules so SQLAlchemy registers all tables before create_all.
    from app.models import artisan, order, product, product_image, reel, user  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _apply_runtime_migrations()


def _apply_runtime_migrations() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())
    if "reels" not in table_names:
        return

    existing_columns = {column["name"] for column in inspector.get_columns("reels")}
    statements: list[str] = []

    if "thumbnail_url" not in existing_columns:
        statements.append("ALTER TABLE reels ADD COLUMN thumbnail_url VARCHAR(500)")
    if "likes" not in existing_columns:
        statements.append("ALTER TABLE reels ADD COLUMN likes INTEGER NOT NULL DEFAULT 0")
    if "views" not in existing_columns:
        statements.append("ALTER TABLE reels ADD COLUMN views INTEGER NOT NULL DEFAULT 0")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
