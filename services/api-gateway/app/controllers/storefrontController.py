from sqlalchemy.orm import Session

from app.controllers.artisanController import _artisan_response
from app.controllers.productController import _product_response
from app.controllers.reelController import _reel_response
from app.schemas.storefrontSchema import StorefrontResponse
from app.services.storefrontService import StorefrontService


def get_storefront_controller(
    db: Session,
    artisan_id: str,
    product_limit: int,
    reel_limit: int,
) -> StorefrontResponse:
    artisan, products, reels = StorefrontService.get_storefront(
        db=db,
        artisan_id=artisan_id,
        product_limit=product_limit,
        reel_limit=reel_limit,
    )
    return StorefrontResponse(
        artisan=_artisan_response(artisan),
        products=[_product_response(product) for product in products],
        reels=[_reel_response(reel) for reel in reels],
    )
