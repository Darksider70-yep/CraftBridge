from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.user import User
from app.schemas.orderSchema import OrderCreateRequest, OrderResponse
from app.services.orderService import OrderService


def _order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        buyer_id=order.buyer_id,
        product_id=order.product_id,
        quantity=order.quantity,
        status=order.status,
        created_at=order.created_at,
    )


def create_order_controller(
    db: Session,
    current_user: User,
    payload: OrderCreateRequest,
) -> OrderResponse:
    order = OrderService.create_order(db=db, buyer=current_user, payload=payload)
    return _order_response(order)


def get_order_controller(db: Session, order_id: str) -> OrderResponse:
    order = OrderService.get_order_by_id(db=db, order_id=order_id)
    return _order_response(order)


def list_user_orders_controller(db: Session, user_id: str) -> list[OrderResponse]:
    orders = OrderService.get_user_orders(db=db, user_id=user_id)
    return [_order_response(order) for order in orders]

