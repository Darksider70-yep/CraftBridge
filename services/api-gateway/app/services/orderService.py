from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.orderSchema import OrderCreateRequest


class OrderService:
    @staticmethod
    def create_order(db: Session, buyer: User, payload: OrderCreateRequest) -> Order:
        product = db.get(Product, payload.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        order = Order(
            buyer_id=buyer.id,
            product_id=product.id,
            quantity=payload.quantity,
            status="pending",
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_order_by_id(db: Session, order_id: str) -> Order:
        order = db.get(Order, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )
        return order

    @staticmethod
    def get_user_orders(db: Session, user_id: str) -> list[Order]:
        return (
            db.query(Order)
            .filter(Order.buyer_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )
