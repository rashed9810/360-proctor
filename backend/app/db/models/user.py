from sqlalchemy import Boolean, Column, String, Integer, Enum
import enum

from app.db.base_class import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    preferred_language = Column(String, default="en")  # 'en' for English, 'bn' for Bangla
