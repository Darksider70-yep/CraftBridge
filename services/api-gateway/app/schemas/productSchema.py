from datetime import datetime

from pydantic import BaseModel, Field


class ProductCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(gt=0)
    category: str = Field(min_length=2, max_length=120)


class ProductImageResponse(BaseModel):
    id: str
    image_url: str


class ProductResponse(BaseModel):
    id: str
    artisan_id: str
    title: str
    description: str | None
    price: float
    category: str
    created_at: datetime
    images: list[ProductImageResponse]
