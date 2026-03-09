from datetime import datetime

from pydantic import BaseModel, Field


class ProductCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(gt=0)
    category: str = Field(min_length=2, max_length=120)


class ProductUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    price: float | None = Field(None, gt=0)
    category: str | None = Field(None, min_length=2, max_length=120)


class ProductImageResponse(BaseModel):
    id: str
    image_url: str


class ProductRelatedReelResponse(BaseModel):
    id: str
    video_url: str
    thumbnail_url: str | None = None
    caption: str | None
    likes: int = 0
    views: int = 0


class ProductResponse(BaseModel):
    id: str
    artisan_id: str
    artisan_name: str | None = None
    title: str
    description: str | None
    price: float
    category: str
    created_at: datetime
    images: list[ProductImageResponse]
    related_reels: list[ProductRelatedReelResponse] = Field(default_factory=list)
