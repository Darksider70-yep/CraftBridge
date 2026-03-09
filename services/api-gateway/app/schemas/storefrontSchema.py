from pydantic import BaseModel

from app.schemas.artisanSchema import ArtisanResponse
from app.schemas.productSchema import ProductResponse
from app.schemas.reelSchema import ReelResponse


class StorefrontResponse(BaseModel):
    artisan: ArtisanResponse
    products: list[ProductResponse]
    reels: list[ReelResponse]
