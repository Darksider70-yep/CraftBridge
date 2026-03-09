from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers.dashboardController import (
    artisan_dashboard_controller,
    artisan_sales_controller,
)
from app.middleware.authMiddleware import require_artisan
from app.models.user import User
from app.schemas.dashboardSchema import DashboardResponse, SalesResponse
from app.services.artisanService import ArtisanService
from core.config.database import get_db

router = APIRouter(tags=["artisan-dashboard"])


@router.get("/artisan/dashboard", response_model=DashboardResponse)
def artisan_dashboard(
    recent_limit: int = Query(default=5, ge=1, le=25),
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    artisan = ArtisanService.get_by_user_id(db=db, user_id=current_user.id)
    if artisan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan profile not found.",
        )

    return artisan_dashboard_controller(
        db=db,
        artisan=artisan,
        recent_limit=recent_limit,
    )


@router.get("/artisan/sales", response_model=SalesResponse)
def artisan_sales(
    recent_limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
) -> SalesResponse:
    artisan = ArtisanService.get_by_user_id(db=db, user_id=current_user.id)
    if artisan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan profile not found.",
        )

    return artisan_sales_controller(
        db=db,
        artisan=artisan,
        recent_limit=recent_limit,
    )
