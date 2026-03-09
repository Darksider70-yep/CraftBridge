from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from fastapi import HTTPException, status
from jwt import InvalidTokenError

from core.config.settings import get_settings

settings = get_settings()


class JWTHandler:
    def __init__(self, secret: str, algorithm: str, expiry_minutes: int) -> None:
        self._secret = secret
        self._algorithm = algorithm
        self._expiry_minutes = expiry_minutes

    def generate_token(self, subject: str, additional_claims: dict[str, Any] | None = None) -> str:
        expires_at = datetime.now(tz=UTC) + timedelta(minutes=self._expiry_minutes)
        payload: dict[str, Any] = {"sub": subject, "exp": expires_at}
        if additional_claims:
            payload.update(additional_claims)
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def verify_token(self, token: str) -> dict[str, Any]:
        try:
            return jwt.decode(token, self._secret, algorithms=[self._algorithm])
        except InvalidTokenError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            ) from exc


jwt_handler = JWTHandler(
    secret=settings.jwt_secret,
    algorithm=settings.jwt_algorithm,
    expiry_minutes=settings.jwt_expire_minutes,
)
