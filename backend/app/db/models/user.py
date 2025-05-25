from sqlalchemy import Boolean, Column, String, Integer, Enum, DateTime, Text
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone

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

    # Enhanced profile fields
    avatar_url = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    # Account settings
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    exam_alerts = Column(Boolean, default=True)
    system_alerts = Column(Boolean, default=True)
    weekly_reports = Column(Boolean, default=False)

    # Security settings
    two_factor_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    created_exams = relationship("Exam", foreign_keys="Exam.creator_id", back_populates="creator")
    exam_sessions = relationship("ExamSession", foreign_keys="ExamSession.student_id", back_populates="student")
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
