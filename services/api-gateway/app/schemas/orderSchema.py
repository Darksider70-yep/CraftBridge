from datetime import datetime
from pydantic import BaseModel, Field, validator

class OrderCreateRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=100)


class OrderUpdateRequest(BaseModel):
    status: str

    @validator("status")
    def status_must_be_valid(cls, v):
        if v not in ["pending", "confirmed", "shipped", "delivered"]:
            raise ValueError("Invalid status")
        return v


class OrderResponse(BaseModel):
    id: str
    buyer_id: str
    product_id: str
    quantity: int
    status: str
    created_at: datetime
