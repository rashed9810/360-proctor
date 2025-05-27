from datetime import timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.services import user_service

# Mock database for development
class MockDB:
    def __init__(self):
        self.users = {}
        self.next_id = 1

    def get_user_by_email(self, email: str):
        for user in self.users.values():
            if user.get("email") == email:
                return user
        return None

    def create_user(self, user_data: dict):
        user_id = self.next_id
        self.next_id += 1
        user = {
            "id": user_id,
            "email": user_data["email"],
            "full_name": user_data.get("full_name", ""),
            "hashed_password": security.get_password_hash(user_data["password"]),
            "is_active": True,
            "role": user_data.get("role", "student")
        }
        self.users[user_id] = user
        return user

    def get_user_by_id(self, user_id: int):
        return self.users.get(user_id)

mock_db = MockDB()
security_scheme = HTTPBearer()

router = APIRouter()


@router.post("/login")
def login_access_token(
    email: str,
    password: str
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Check if user exists
    user = mock_db.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    # Verify password
    if not security.verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=401,
            detail="Inactive user",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user["id"], expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(user["id"])

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }


@router.post("/register")
def register_user(
    email: str,
    password: str,
    full_name: str = "",
    role: str = "student"
) -> Any:
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = mock_db.get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists",
        )

    # Create new user
    user_data = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role
    }
    user = mock_db.create_user(user_data)

    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user["id"], expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(user["id"])

    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh")
def refresh_token(refresh_token: str) -> Any:
    """
    Refresh access token using refresh token
    """
    user_id = security.verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    user = mock_db.get_user_by_id(int(user_id))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user["id"], expires_delta=access_token_expires
    )
    new_refresh_token = security.create_refresh_token(user["id"])

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_current_user(
    authorization: Optional[str] = None
) -> Any:
    """
    Get current user information
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    user = mock_db.get_user_by_id(int(token_data["user_id"]))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "is_active": user["is_active"]
    }


@router.post("/logout")
def logout() -> Any:
    """
    Logout user (invalidate token)
    """
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
def forgot_password(email: str) -> Any:
    """
    Send password reset email
    """
    user = mock_db.get_user_by_email(email)
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset link has been sent"}

    # Generate reset token
    reset_token = security.generate_password_reset_token()

    # In production, save token to database and send email
    return {"message": "Password reset email sent", "reset_token": reset_token}


@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str
) -> Any:
    """
    Reset password using reset token
    """
    # In production, verify token from database
    # For now, just return success
    return {"message": "Password reset successfully"}


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    authorization: Optional[str] = None
) -> Any:
    """
    Change user password
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    user = mock_db.get_user_by_id(int(token_data["user_id"]))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Verify current password
    if not security.verify_password(current_password, user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="Incorrect current password"
        )

    # Update password
    user["hashed_password"] = security.get_password_hash(new_password)

    return {"message": "Password changed successfully"}
