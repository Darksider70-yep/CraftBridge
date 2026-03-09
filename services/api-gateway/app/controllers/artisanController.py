from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.user import User
from app.schemas.artisanSchema import ArtisanCreateRequest, ArtisanResponse
from app.services.artisanService import ArtisanService


def _artisan_response(artisan: Artisan) -> ArtisanResponse:
    return ArtisanResponse(
        id=artisan.id,
        user_id=artisan.user_id,
        name=artisan.name,
        bio=artisan.bio,
        location=artisan.location,
        craft_type=artisan.craft_type,
        profile_image=artisan.profile_image,
        verified=artisan.verified,
    )


def create_artisan_controller(
    db: Session, current_user: User, payload: ArtisanCreateRequest
) -> ArtisanResponse:
    artisan = ArtisanService.create_profile(db=db, user=current_user, payload=payload)
    return _artisan_response(artisan)


def get_artisan_controller(db: Session, artisan_id: str) -> ArtisanResponse:
    artisan = ArtisanService.get_by_id(db=db, artisan_id=artisan_id)
    return _artisan_response(artisan)


def list_artisans_controller(db: Session) -> list[ArtisanResponse]:
    artisans = ArtisanService.list_profiles(db=db)
    return [_artisan_response(artisan) for artisan in artisans]
