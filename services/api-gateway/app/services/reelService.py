from datetime import UTC, datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.models.artisan import Artisan
from app.models.product import Product
from app.models.reel import Reel
from app.schemas.reelSchema import ReelUploadRequest
from app.services.file_upload import storage_client


class ReelService:
    @staticmethod
    async def upload_reel(
        db: Session,
        artisan: Artisan,
        payload: ReelUploadRequest,
        video: UploadFile,
    ) -> Reel:
        if payload.product_id:
            product = (
                db.query(Product)
                .filter(Product.id == payload.product_id, Product.artisan_id == artisan.id)
                .first()
            )
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found for this artisan.",
                )

        video_upload_result = await storage_client.upload_video(file=video)
        reel = Reel(
            artisan_id=artisan.id,
            product_id=payload.product_id,
            caption=payload.caption,
            video_url=video_upload_result["video_url"],
            thumbnail_url=video_upload_result["thumbnail_url"],
        )
        db.add(reel)
        db.commit()
        db.refresh(reel)
        return reel

    @staticmethod
    def get_feed(db: Session, limit: int = 20) -> list[Reel]:
        reels = (
            db.query(Reel)
            .options(joinedload(Reel.artisan))
            .order_by(Reel.created_at.desc())
            .all()
        )

        ranked = sorted(
            reels,
            key=lambda reel: ReelService._score_reel(reel),
            reverse=True,
        )
        return ranked[:limit]

    @staticmethod
    def increment_likes(db: Session, reel_id: str) -> Reel:
        reel = db.get(Reel, reel_id)
        if not reel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reel not found.")
        reel.likes += 1
        db.commit()
        db.refresh(reel)
        return reel

    @staticmethod
    def increment_views(db: Session, reel_id: str) -> Reel:
        reel = db.get(Reel, reel_id)
        if not reel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reel not found.")
        reel.views += 1
        db.commit()
        db.refresh(reel)
        return reel

    @staticmethod
    def _score_reel(reel: Reel) -> float:
        freshness_factor = ReelService._freshness_factor(reel.created_at)
        return (reel.likes * 3) + (reel.views * 1) + freshness_factor

    @staticmethod
    def _freshness_factor(created_at: datetime) -> float:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        now = datetime.now(tz=UTC)
        age_hours = max((now - created_at).total_seconds() / 3600, 0)
        return max(0.0, 72.0 - age_hours)
