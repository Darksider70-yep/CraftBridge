from datetime import datetime

from pydantic import BaseModel, Field


class DashboardOrderItem(BaseModel):
    order_id: str
    product_id: str
    product_title: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    created_at: datetime


class DashboardResponse(BaseModel):
    artisan_id: str
    artisan_name: str
    total_products: int
    total_orders: int
    total_sales: float
    recent_orders: list[DashboardOrderItem] = Field(default_factory=list)


class TopSellingProduct(BaseModel):
    product_id: str
    title: str
    units_sold: int
    revenue: float


class SalesResponse(BaseModel):
    artisan_id: str
    artisan_name: str
    total_revenue: float
    orders_count: int
    top_selling_product: TopSellingProduct | None = None
    recent_orders: list[DashboardOrderItem] = Field(default_factory=list)
