from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.db.models.user import UserRole


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[UserRole] = UserRole.STUDENT
    preferred_language: Optional[str] = "en"

    # Enhanced profile fields
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None

    # Account settings
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    exam_alerts: Optional[bool] = True
    system_alerts: Optional[bool] = True
    weekly_reports: Optional[bool] = False


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Additional properties to return via API
class User(UserInDBBase):
    pass


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
    two_factor_enabled: bool = False
    login_attempts: int = 0
    locked_until: Optional[datetime] = None


# Password reset schema
class PasswordReset(BaseModel):
    new_password: str = Field(..., min_length=8, description="New password")


# User statistics schema
class UserStatistics(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    students: int
    teachers: int
    admins: int
    recent_registrations: int


# Activity log schema
class ActivityLogBase(BaseModel):
    activity_type: str
    description: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None


class ActivityLog(ActivityLogBase):
    id: int
    user_id: int
    created_at: datetime
    target_user_id: Optional[int] = None
    metadata: Optional[dict] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None

    class Config:
        from_attributes = True
