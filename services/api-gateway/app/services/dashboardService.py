from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.models.order import Order
from app.models.product import Product


@dataclass
class DashboardOrderRow:
    order_id: str
    product_id: str
    product_title: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    created_at: datetime


@dataclass
class DashboardSummary:
    total_products: int
    total_orders: int
    total_sales: float
    recent_orders: list[DashboardOrderRow]


@dataclass
class TopSellingProductSummary:
    product_id: str
    title: str
    units_sold: int
    revenue: float


@dataclass
class SalesSummary:
    total_revenue: float
    orders_count: int
    top_selling_product: TopSellingProductSummary | None
    recent_orders: list[DashboardOrderRow]


class DashboardService:
    @staticmethod
    def get_dashboard(
        db: Session,
        artisan: Artisan,
        recent_limit: int = 5,
    ) -> DashboardSummary:
        total_products = (
            db.query(func.count(Product.id))
            .filter(Product.artisan_id == artisan.id)
            .scalar()
            or 0
        )

        total_orders, total_sales = (
            db.query(
                func.count(Order.id),
                func.coalesce(func.sum(Product.price * Order.quantity), 0),
            )
            .join(Product, Order.product_id == Product.id)
            .filter(Product.artisan_id == artisan.id)
            .one()
        )

        return DashboardSummary(
            total_products=int(total_products),
            total_orders=int(total_orders or 0),
            total_sales=_to_float(total_sales),
            recent_orders=DashboardService._recent_orders(
                db=db,
                artisan_id=artisan.id,
                limit=recent_limit,
            ),
        )

    @staticmethod
    def get_sales_summary(
        db: Session,
        artisan: Artisan,
        recent_limit: int = 10,
    ) -> SalesSummary:
        orders_count, total_revenue = (
            db.query(
                func.count(Order.id),
                func.coalesce(func.sum(Product.price * Order.quantity), 0),
            )
            .join(Product, Order.product_id == Product.id)
            .filter(Product.artisan_id == artisan.id)
            .one()
        )

        units_sold = func.coalesce(func.sum(Order.quantity), 0)
        revenue = func.coalesce(func.sum(Product.price * Order.quantity), 0)
        top_product_row = (
            db.query(
                Product.id.label("product_id"),
                Product.title.label("title"),
                units_sold.label("units_sold"),
                revenue.label("revenue"),
            )
            .join(Order, Order.product_id == Product.id)
            .filter(Product.artisan_id == artisan.id)
            .group_by(Product.id, Product.title)
            .order_by(units_sold.desc(), revenue.desc(), Product.title.asc())
            .first()
        )

        top_product = None
        if top_product_row is not None:
            top_product = TopSellingProductSummary(
                product_id=top_product_row.product_id,
                title=top_product_row.title,
                units_sold=int(top_product_row.units_sold or 0),
                revenue=_to_float(top_product_row.revenue),
            )

        return SalesSummary(
            total_revenue=_to_float(total_revenue),
            orders_count=int(orders_count or 0),
            top_selling_product=top_product,
            recent_orders=DashboardService._recent_orders(
                db=db,
                artisan_id=artisan.id,
                limit=recent_limit,
            ),
        )

    @staticmethod
    def _recent_orders(db: Session, artisan_id: str, limit: int) -> list[DashboardOrderRow]:
        rows = (
            db.query(Order, Product)
            .join(Product, Order.product_id == Product.id)
            .filter(Product.artisan_id == artisan_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
            .all()
        )

        return [
            DashboardOrderRow(
                order_id=order.id,
                product_id=product.id,
                product_title=product.title,
                quantity=order.quantity,
                unit_price=_to_float(product.price),
                total_amount=_to_float(product.price) * order.quantity,
                status=order.status,
                created_at=order.created_at,
            )
            for order, product in rows
        ]


def _to_float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return float(value)
