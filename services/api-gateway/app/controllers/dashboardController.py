from sqlalchemy.orm import Session

from app.models.artisan import Artisan
from app.schemas.dashboardSchema import (
    DashboardOrderItem,
    DashboardResponse,
    SalesResponse,
    TopSellingProduct,
)
from app.services.dashboardService import (
    DashboardOrderRow,
    DashboardService,
    TopSellingProductSummary,
)


def _dashboard_order_item(order: DashboardOrderRow) -> DashboardOrderItem:
    return DashboardOrderItem(
        order_id=order.order_id,
        product_id=order.product_id,
        product_title=order.product_title,
        quantity=order.quantity,
        unit_price=order.unit_price,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
    )


def _top_selling_product(
    product: TopSellingProductSummary | None,
) -> TopSellingProduct | None:
    if product is None:
        return None
    return TopSellingProduct(
        product_id=product.product_id,
        title=product.title,
        units_sold=product.units_sold,
        revenue=product.revenue,
    )


def artisan_dashboard_controller(
    db: Session,
    artisan: Artisan,
    recent_limit: int = 5,
) -> DashboardResponse:
    dashboard = DashboardService.get_dashboard(
        db=db,
        artisan=artisan,
        recent_limit=recent_limit,
    )
    return DashboardResponse(
        artisan_id=artisan.id,
        artisan_name=artisan.name,
        total_products=dashboard.total_products,
        total_orders=dashboard.total_orders,
        total_sales=dashboard.total_sales,
        recent_orders=[_dashboard_order_item(order) for order in dashboard.recent_orders],
    )


def artisan_sales_controller(
    db: Session,
    artisan: Artisan,
    recent_limit: int = 10,
) -> SalesResponse:
    sales = DashboardService.get_sales_summary(
        db=db,
        artisan=artisan,
        recent_limit=recent_limit,
    )
    return SalesResponse(
        artisan_id=artisan.id,
        artisan_name=artisan.name,
        total_revenue=sales.total_revenue,
        orders_count=sales.orders_count,
        top_selling_product=_top_selling_product(sales.top_selling_product),
        recent_orders=[_dashboard_order_item(order) for order in sales.recent_orders],
    )
