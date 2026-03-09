import importlib
import pkgutil

from fastapi import APIRouter, FastAPI


def _discover_routers() -> list[APIRouter]:
    routers: list[APIRouter] = []
    package_name = __name__
    package = importlib.import_module(package_name)

    for module in pkgutil.iter_modules(package.__path__):
        if module.name.startswith("_"):
            continue
        module_path = f"{package_name}.{module.name}"
        loaded_module = importlib.import_module(module_path)
        router = getattr(loaded_module, "router", None)
        if isinstance(router, APIRouter):
            routers.append(router)

    return routers


def register_routes(app: FastAPI) -> None:
    for router in _discover_routers():
        app.include_router(router, prefix="/api/v1")
