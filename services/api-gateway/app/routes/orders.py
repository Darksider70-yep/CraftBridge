from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers.orderController import (
    create_order_controller,
    get_order_controller,
    list_user_orders_controller,
)
from app.middleware.authMiddleware import get_current_user
from app.models.user import User
from app.schemas.orderSchema import OrderCreateRequest, OrderResponse
from app.services.orderService import OrderService
from core.config.database import get_db

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    return create_order_controller(db=db, current_user=current_user, payload=payload)


@router.get("/orders/{id}", response_model=OrderResponse)
def get_order(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    order = OrderService.get_order_by_id(db=db, order_id=id)
    if current_user.role != "admin" and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this order.",
        )
    return get_order_controller(db=db, order_id=id)


@router.get("/users/{id}/orders", response_model=list[OrderResponse])
def get_user_orders(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrderResponse]:
    if current_user.role != "admin" and current_user.id != id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access these orders.",
        )
    return list_user_orders_controller(db=db, user_id=id)
