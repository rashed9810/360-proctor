from typing import Optional

from pydantic import BaseModel, EmailStr

from app.db.models.user import UserRole


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[UserRole] = UserRole.STUDENT
    preferred_language: Optional[str] = "en"


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

    class Config:
        orm_mode = True


# Additional properties to return via API
class User(UserInDBBase):
    pass


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
