from sqlalchemy.orm import Session, joinedload

from app.models.artisan import Artisan
from app.models.product import Product
from app.models.reel import Reel
from app.services.artisanService import ArtisanService


class StorefrontService:
    @staticmethod
    def get_storefront(
        db: Session,
        artisan_id: str,
        product_limit: int = 20,
        reel_limit: int = 20,
    ) -> tuple[Artisan, list[Product], list[Reel]]:
        artisan = ArtisanService.get_by_id(db=db, artisan_id=artisan_id)
        products = (
            db.query(Product)
            .options(joinedload(Product.images))
            .filter(Product.artisan_id == artisan_id)
            .order_by(Product.created_at.desc())
            .limit(product_limit)
            .all()
        )
        reels = (
            db.query(Reel)
            .filter(Reel.artisan_id == artisan_id)
            .order_by(Reel.created_at.desc())
            .limit(reel_limit)
            .all()
        )
        return artisan, products, reels
