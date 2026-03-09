from datetime import datetime

from pydantic import BaseModel, Field


class OrderCreateRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=100)


class OrderResponse(BaseModel):
    id: str
    buyer_id: str
    product_id: str
    quantity: int
    status: str
    created_at: datetime

