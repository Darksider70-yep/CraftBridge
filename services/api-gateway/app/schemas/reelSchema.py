from datetime import datetime

from pydantic import BaseModel, Field


class ReelUploadRequest(BaseModel):
    product_id: str | None = None
    caption: str | None = Field(default=None, max_length=500)


class ReelResponse(BaseModel):
    id: str
    artisan_id: str
    artisan_name: str | None = None
    product_id: str | None
    video_url: str
    thumbnail_url: str | None = None
    caption: str | None
    likes: int = 0
    views: int = 0
    created_at: datetime
