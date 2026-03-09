from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.authSchema import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services.authService import AuthService


def _build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        created_at=user.created_at,
    )


def register_controller(db: Session, payload: RegisterRequest) -> UserResponse:
    user = AuthService.register(db=db, payload=payload)
    return _build_user_response(user)


def login_controller(db: Session, payload: LoginRequest) -> AuthResponse:
    return AuthService.login(db=db, payload=payload)


def me_controller(current_user: User) -> UserResponse:
    return _build_user_response(current_user)
