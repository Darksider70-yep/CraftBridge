from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.user import User
from app.schemas.artisanSchema import ArtisanCreateRequest


class ArtisanService:
    @staticmethod
    def create_profile(db: Session, user: User, payload: ArtisanCreateRequest) -> Artisan:
        existing_profile = db.query(Artisan).filter(Artisan.user_id == user.id).first()
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Artisan profile already exists for this user.",
            )

        if user.role not in {"artisan", "admin"}:
            user.role = "artisan"

        artisan = Artisan(
            user_id=user.id,
            name=payload.name,
            bio=payload.bio,
            location=payload.location,
            craft_type=payload.craft_type,
            profile_image=payload.profile_image,
        )
        db.add(artisan)
        db.commit()
        db.refresh(artisan)
        return artisan

    @staticmethod
    def get_by_id(db: Session, artisan_id: str) -> Artisan:
        artisan = db.query(Artisan).filter(Artisan.id == artisan_id).first()
        if not artisan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artisan not found.")
        return artisan

    @staticmethod
    def list_profiles(db: Session) -> list[Artisan]:
        return db.query(Artisan).order_by(Artisan.name.asc()).all()

    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> Artisan | None:
        return db.query(Artisan).filter(Artisan.user_id == user_id).first()
