from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers.authController import (
    login_controller,
    me_controller,
    register_controller,
)
from app.middleware.authMiddleware import get_current_user
from app.models.user import User
from app.schemas.authSchema import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from core.config.database import get_db

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    return register_controller(db=db, payload=payload)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return login_controller(db=db, payload=payload)


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return me_controller(current_user=current_user)
