from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import register_routes
from core.config.database import init_db
from core.config.settings import get_settings
from core.logging.logger import configure_logging

settings = get_settings()
configure_logging()
Path(settings.storage_root).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="CraftBridge API Gateway",
    version="0.2.0",
    description="Core platform foundation for CraftBridge Phase 2.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)
app.mount("/storage", StaticFiles(directory=settings.storage_root), name="storage")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "CraftBridge API Gateway is running"}
