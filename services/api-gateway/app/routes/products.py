from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.controllers.productController import (
    create_product_controller,
    get_product_controller,
    list_products_controller,
)
from app.middleware.authMiddleware import require_artisan
from app.models.user import User
from app.schemas.productSchema import ProductCreateRequest, ProductResponse
from app.services.artisanService import ArtisanService
from core.config.database import get_db

router = APIRouter(tags=["products"])


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    title: Annotated[str, Form(min_length=2, max_length=200)],
    price: Annotated[float, Form(gt=0)],
    category: Annotated[str, Form(min_length=2, max_length=120)],
    description: Annotated[str | None, Form()] = None,
    images: Annotated[list[UploadFile] | None, File()] = None,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
) -> ProductResponse:
    artisan = ArtisanService.get_by_user_id(db=db, user_id=current_user.id)
    if artisan is None:
        # Force explicit artisan profile before product upload.
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create an artisan profile before uploading products.",
        )

    payload = ProductCreateRequest(
        title=title,
        description=description,
        price=price,
        category=category,
    )
    return await create_product_controller(
        db=db,
        artisan=artisan,
        payload=payload,
        images=images,
    )


@router.get("/products", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)) -> list[ProductResponse]:
    return list_products_controller(db=db)


@router.get("/products/{id}", response_model=ProductResponse)
def get_product(id: str, db: Session = Depends(get_db)) -> ProductResponse:
    return get_product_controller(db=db, product_id=id)
