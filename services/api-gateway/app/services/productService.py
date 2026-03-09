from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.models.artisan import Artisan
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.productSchema import ProductCreateRequest
from app.services.file_upload import storage_client


class ProductService:
    @staticmethod
    async def create_product(
        db: Session,
        artisan: Artisan,
        payload: ProductCreateRequest,
        images: list[UploadFile] | None = None,
    ) -> Product:
        product = Product(
            artisan_id=artisan.id,
            title=payload.title,
            description=payload.description,
            price=payload.price,
            category=payload.category,
        )
        db.add(product)
        db.flush()

        if images:
            for image in images:
                image_url = await storage_client.upload_file(file=image, folder="products")
                db.add(ProductImage(product_id=product.id, image_url=image_url))

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def list_products(db: Session) -> list[Product]:
        return (
            db.query(Product)
            .options(joinedload(Product.images), joinedload(Product.artisan))
            .order_by(Product.created_at.desc())
            .all()
        )

    @staticmethod
    def get_product(db: Session, product_id: str) -> Product:
        product = (
            db.query(Product)
            .options(joinedload(Product.images), joinedload(Product.artisan))
            .filter(Product.id == product_id)
            .first()
        )
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
        return product
