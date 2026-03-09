from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.product import Product
from app.schemas.productSchema import (
    ProductCreateRequest,
    ProductImageResponse,
    ProductRelatedReelResponse,
    ProductResponse,
)
from app.services.productService import ProductService


def _product_response(product: Product, include_related_reels: bool = False) -> ProductResponse:
    related_reels = []
    if include_related_reels:
        related_reels = [
            ProductRelatedReelResponse(
                id=reel.id,
                video_url=reel.video_url,
                thumbnail_url=reel.thumbnail_url,
                caption=reel.caption,
                likes=reel.likes,
                views=reel.views,
            )
            for reel in product.reels
        ]

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        artisan_name=product.artisan.name if product.artisan else None,
        title=product.title,
        description=product.description,
        price=float(product.price),
        category=product.category,
        created_at=product.created_at,
        images=[
            ProductImageResponse(id=image.id, image_url=image.image_url) for image in product.images
        ],
        related_reels=related_reels,
    )


async def create_product_controller(
    db: Session,
    artisan: Artisan,
    payload: ProductCreateRequest,
    images: list[UploadFile] | None,
) -> ProductResponse:
    product = await ProductService.create_product(
        db=db, artisan=artisan, payload=payload, images=images
    )
    return _product_response(product, include_related_reels=False)


def list_products_controller(db: Session) -> list[ProductResponse]:
    products = ProductService.list_products(db=db)
    return [_product_response(product, include_related_reels=False) for product in products]


def get_product_controller(db: Session, product_id: str) -> ProductResponse:
    product = ProductService.get_product(db=db, product_id=product_id)
    return _product_response(product, include_related_reels=True)
