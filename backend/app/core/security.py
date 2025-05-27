from datetime import datetime, timedelta
from typing import Any, Union, Optional
import secrets
import string

try:
    from jose import jwt, JWTError
except ImportError:
    # Mock JWT for development
    class MockJWT:
        @staticmethod
        def encode(payload, key, algorithm):
            return f"mock_token_{payload.get('sub', 'user')}"

        @staticmethod
        def decode(token, key, algorithms):
            if token.startswith("mock_token_"):
                return {"sub": token.replace("mock_token_", "")}
            raise JWTError("Invalid token")

    jwt = MockJWT()

    class JWTError(Exception):
        pass

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    # Mock password context for development
    import hashlib
    class MockCryptContext:
        def hash(self, password):
            return hashlib.sha256(password.encode()).hexdigest()

        def verify(self, password, hashed):
            return self.hash(password) == hashed

    pwd_context = MockCryptContext()

from app.core.config import settings


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return {"user_id": str(user_id)}
    except JWTError:
        return None


def generate_password_reset_token() -> str:
    """Generate a secure password reset token"""
    return secrets.token_urlsafe(32)


def generate_verification_token() -> str:
    """Generate a secure email verification token"""
    return secrets.token_urlsafe(32)


def create_refresh_token(subject: Union[str, Any]) -> str:
    """Create a refresh token"""
    expire = datetime.utcnow() + timedelta(days=7)  # Refresh tokens last 7 days
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_refresh_token(token: str) -> Optional[str]:
    """Verify refresh token and return user ID"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        user_id = payload.get("sub")
        return str(user_id) if user_id else None
    except JWTError:
        return None


def generate_secure_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password
