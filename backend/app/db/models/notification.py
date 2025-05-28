from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone

from app.db.base_class import Base


class NotificationType(str, enum.Enum):
    EXAM_CREATED = "exam_created"
    EXAM_STARTED = "exam_started"
    EXAM_COMPLETED = "exam_completed"
    VIOLATION_DETECTED = "violation_detected"
    TRUST_SCORE_LOW = "trust_score_low"
    EXAM_REMINDER = "exam_reminder"
    SYSTEM_ALERT = "system_alert"
    GRADE_PUBLISHED = "grade_published"
    EXAM_INVITATION = "exam_invitation"
    ACCOUNT_SECURITY = "account_security"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)

    # Notification state
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    # Related entities
    exam_id = Column(Integer, ForeignKey("exam.id"), nullable=True)
    exam_session_id = Column(Integer, ForeignKey("examsession.id"), nullable=True)
    alert_id = Column(Integer, ForeignKey("alert.id"), nullable=True)

    # Additional data
    extra_data = Column(JSON, nullable=True)  # Additional context data
    action_url = Column(String, nullable=True)  # URL for action button
    action_text = Column(String, nullable=True)  # Text for action button

    # Delivery settings
    email_sent = Column(Boolean, default=False)
    push_sent = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)  # Optional expiration

    # Relationships
    user = relationship("User", back_populates="notifications")
    exam = relationship("Exam")
    exam_session = relationship("ExamSession")
    alert = relationship("Alert")


class ActivityLogType(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    EXAM_CREATED = "exam_created"
    EXAM_UPDATED = "exam_updated"
    EXAM_DELETED = "exam_deleted"
    EXAM_STARTED = "exam_started"
    EXAM_COMPLETED = "exam_completed"
    QUESTION_ANSWERED = "question_answered"
    VIOLATION_DETECTED = "violation_detected"
    PROFILE_UPDATED = "profile_updated"
    PASSWORD_CHANGED = "password_changed"
    SETTINGS_CHANGED = "settings_changed"
    FILE_UPLOADED = "file_uploaded"
    REPORT_GENERATED = "report_generated"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    PERMISSION_CHANGED = "permission_changed"


class ActivityLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    activity_type = Column(Enum(ActivityLogType), nullable=False)
    description = Column(Text, nullable=False)

    # Context information
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    session_id = Column(String, nullable=True)

    # Related entities
    exam_id = Column(Integer, ForeignKey("exam.id"), nullable=True)
    exam_session_id = Column(Integer, ForeignKey("examsession.id"), nullable=True)
    target_user_id = Column(Integer, ForeignKey("user.id"), nullable=True)  # For admin actions on other users

    # Additional data
    extra_data = Column(JSON, nullable=True)  # Additional context data
    old_values = Column(JSON, nullable=True)  # Previous values for updates
    new_values = Column(JSON, nullable=True)  # New values for updates

    # Success/failure
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="activity_logs")
    exam = relationship("Exam")
    exam_session = relationship("ExamSession")
    target_user = relationship("User", foreign_keys=[target_user_id])


class SystemSettings(Base):
    """System-wide configuration settings"""
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # e.g., 'proctoring', 'security', 'ui'

    # Metadata
    is_public = Column(Boolean, default=False)  # Can be read by non-admin users
    requires_restart = Column(Boolean, default=False)  # Requires system restart to take effect

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    updated_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # Relationships
    updated_by = relationship("User", foreign_keys=[updated_by_id])


class FileUpload(Base):
    """Track file uploads for exams, questions, etc."""
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)

    # Upload context
    uploaded_by_id = Column(Integer, ForeignKey("user.id"))
    exam_id = Column(Integer, ForeignKey("exam.id"), nullable=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=True)

    # File metadata
    is_public = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    virus_scanned = Column(Boolean, default=False)
    virus_scan_result = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)  # Optional expiration

    # Relationships
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])
    exam = relationship("Exam")
    question = relationship("Question")
