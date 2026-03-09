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

        video_url = await storage_client.upload_file(file=video, folder="reels")
        reel = Reel(
            artisan_id=artisan.id,
            product_id=payload.product_id,
            caption=payload.caption,
            video_url=video_url,
        )
        db.add(reel)
        db.commit()
        db.refresh(reel)
        return reel

    @staticmethod
    def get_feed(db: Session, limit: int = 20) -> list[Reel]:
        return (
            db.query(Reel)
            .options(joinedload(Reel.artisan))
            .order_by(Reel.created_at.desc())
            .limit(limit)
            .all()
        )
