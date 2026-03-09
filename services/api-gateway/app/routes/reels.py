from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.controllers.reelController import (
    like_reel_controller,
    reel_feed_controller,
    upload_reel_controller,
    view_reel_controller,
)
from app.middleware.authMiddleware import require_artisan
from app.models.user import User
from app.schemas.reelSchema import ReelResponse, ReelUploadRequest
from app.services.artisanService import ArtisanService
from core.config.database import get_db

router = APIRouter(tags=["reels"])


@router.post("/reels/upload", response_model=ReelResponse, status_code=status.HTTP_201_CREATED)
async def upload_reel(
    video: Annotated[UploadFile, File()],
    product_id: Annotated[str | None, Form()] = None,
    caption: Annotated[str | None, Form()] = None,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
) -> ReelResponse:
    artisan = ArtisanService.get_by_user_id(db=db, user_id=current_user.id)
    if artisan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create an artisan profile before uploading reels.",
        )

    payload = ReelUploadRequest(product_id=product_id, caption=caption)
    return await upload_reel_controller(db=db, artisan=artisan, payload=payload, video=video)


@router.get("/reels/feed", response_model=list[ReelResponse])
def reel_feed(limit: int = 20, db: Session = Depends(get_db)) -> list[ReelResponse]:
    return reel_feed_controller(db=db, limit=limit)


@router.post("/reels/{id}/like", response_model=ReelResponse)
def like_reel(id: str, db: Session = Depends(get_db)) -> ReelResponse:
    return like_reel_controller(db=db, reel_id=id)


@router.post("/reels/{id}/view", response_model=ReelResponse)
def view_reel(id: str, db: Session = Depends(get_db)) -> ReelResponse:
    return view_reel_controller(db=db, reel_id=id)
