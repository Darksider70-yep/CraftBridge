from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers.artisanController import (
    create_artisan_controller,
    get_artisan_controller,
    list_artisans_controller,
)
from app.controllers.storefrontController import get_storefront_controller
from app.middleware.authMiddleware import get_current_user
from app.models.user import User
from app.schemas.artisanSchema import ArtisanCreateRequest, ArtisanResponse
from app.schemas.storefrontSchema import StorefrontResponse
from core.config.database import get_db

router = APIRouter(tags=["artisans"])


@router.post(
    "/artisans/create",
    response_model=ArtisanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_artisan(
    payload: ArtisanCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ArtisanResponse:
    return create_artisan_controller(db=db, current_user=current_user, payload=payload)


@router.get("/artisans/{id}", response_model=ArtisanResponse)
def get_artisan(id: str, db: Session = Depends(get_db)) -> ArtisanResponse:
    return get_artisan_controller(db=db, artisan_id=id)


@router.get("/artisans", response_model=list[ArtisanResponse])
def list_artisans(db: Session = Depends(get_db)) -> list[ArtisanResponse]:
    return list_artisans_controller(db=db)


@router.get("/artisan/{id}/storefront", response_model=StorefrontResponse)
def artisan_storefront(
    id: str,
    product_limit: int = Query(default=20, ge=1, le=100),
    reel_limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> StorefrontResponse:
    return get_storefront_controller(
        db=db,
        artisan_id=id,
        product_limit=product_limit,
        reel_limit=reel_limit,
    )
