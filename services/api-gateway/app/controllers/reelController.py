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
        caption=reel.caption,
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
