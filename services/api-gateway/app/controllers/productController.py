from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.product import Product
from app.schemas.productSchema import ProductCreateRequest, ProductImageResponse, ProductResponse
from app.services.productService import ProductService


def _product_response(product: Product) -> ProductResponse:
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
    return _product_response(product)


def list_products_controller(db: Session) -> list[ProductResponse]:
    products = ProductService.list_products(db=db)
    return [_product_response(product) for product in products]


def get_product_controller(db: Session, product_id: str) -> ProductResponse:
    product = ProductService.get_product(db=db, product_id=product_id)
    return _product_response(product)
