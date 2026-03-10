from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.reel import Reel
from app.schemas.reelSchema import ReelResponse, ReelUploadRequest
from app.services.reelService import ReelService


def _reel_response(reel: Reel) -> ReelResponse:
    return ReelResponse(
        id=reel.id,
        artisan_id=reel.artisan_id,
        artisan_name=reel.artisan.name if reel.artisan else None,
        product_id=reel.product_id,
        video_url=reel.video_url,
        thumbnail_url=reel.thumbnail_url,
        caption=reel.caption,
        likes=reel.likes,
        views=reel.views,
        created_at=reel.created_at,
    )


async def upload_reel_controller(
    db: Session,
    artisan: Artisan,
    payload: ReelUploadRequest,
    video: UploadFile,
) -> ReelResponse:
    reel = await ReelService.upload_reel(db=db, artisan=artisan, payload=payload, video=video)
    return _reel_response(reel)


def reel_feed_controller(db: Session, limit: int) -> list[ReelResponse]:
    reels = ReelService.get_feed(db=db, limit=limit)
    return [_reel_response(reel) for reel in reels]


def like_reel_controller(db: Session, reel_id: str) -> ReelResponse:
    reel = ReelService.increment_likes(db=db, reel_id=reel_id)
    return _reel_response(reel)


def view_reel_controller(db: Session, reel_id: str) -> ReelResponse:
    reel = ReelService.increment_views(db=db, reel_id=reel_id)
    return _reel_response(reel)


def delete_reel_controller(db: Session, reel_id: str, current_user_id: str) -> None:
    reel = db.get(Reel, reel_id)
    if not reel:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reel not found.",
        )
    
    # Check if user owns the reel
    if reel.artisan.user_id != current_user_id:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this reel.",
        )
    
    ReelService.delete_reel(db=db, reel_id=reel_id)
