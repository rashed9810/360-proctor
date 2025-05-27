from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, JSON
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone

from app.db.base_class import Base


class ExamStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Exam(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(Enum(ExamStatus), default=ExamStatus.DRAFT)

    # Exam configuration
    max_attempts = Column(Integer, default=1)
    passing_score = Column(Float, default=60.0)
    randomize_questions = Column(Boolean, default=False)
    show_results_immediately = Column(Boolean, default=False)
    allow_review = Column(Boolean, default=True)

    # Proctoring settings
    enable_face_detection = Column(Boolean, default=True)
    enable_multiple_face_detection = Column(Boolean, default=True)
    enable_eye_tracking = Column(Boolean, default=True)
    enable_audio_detection = Column(Boolean, default=True)
    enable_tab_switch_detection = Column(Boolean, default=True)
    enable_phone_detection = Column(Boolean, default=True)
    enable_screen_recording = Column(Boolean, default=True)

    # Trust score thresholds
    warning_threshold = Column(Float, default=0.7)  # Trust score below this triggers a warning
    critical_threshold = Column(Float, default=0.5)  # Trust score below this triggers a critical alert

    # Additional settings
    instructions = Column(Text, nullable=True)
    exam_password = Column(String, nullable=True)  # Optional password protection
    ip_restrictions = Column(JSON, nullable=True)  # List of allowed IP addresses
    browser_lockdown = Column(Boolean, default=False)  # Prevent browser navigation

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator_id = Column(Integer, ForeignKey("user.id"))
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_exams")
    exam_sessions = relationship("ExamSession", back_populates="exam")
    questions = relationship("Question", back_populates="exam")


class ExamSession(Base):
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exam.id"))
    student_id = Column(Integer, ForeignKey("user.id"))
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    final_trust_score = Column(Float, nullable=True)

    # Session details
    attempt_number = Column(Integer, default=1)
    score = Column(Float, nullable=True)
    total_questions = Column(Integer, nullable=True)
    answered_questions = Column(Integer, default=0)
    time_spent_minutes = Column(Integer, nullable=True)

    # Proctoring data
    violations_count = Column(Integer, default=0)
    face_detection_data = Column(JSON, nullable=True)
    audio_analysis_data = Column(JSON, nullable=True)
    screen_activity_data = Column(JSON, nullable=True)

    # Session status
    is_flagged = Column(Boolean, default=False)
    review_required = Column(Boolean, default=False)
    reviewed_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    review_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    exam = relationship("Exam", back_populates="exam_sessions")
    student = relationship("User", foreign_keys=[student_id], back_populates="exam_sessions")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    alerts = relationship("Alert", back_populates="exam_session")
    answers = relationship("Answer", back_populates="exam_session")


class AlertType(str, enum.Enum):
    FACE_NOT_DETECTED = "face_not_detected"
    MULTIPLE_FACES = "multiple_faces"
    LOOKING_AWAY = "looking_away"
    AUDIO_DETECTED = "audio_detected"
    TAB_SWITCH = "tab_switch"
    PHONE_DETECTED = "phone_detected"
    OTHER = "other"


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Alert(Base):
    id = Column(Integer, primary_key=True, index=True)
    exam_session_id = Column(Integer, ForeignKey("exam_session.id"))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    alert_type = Column(Enum(AlertType))
    severity = Column(Enum(AlertSeverity))
    description = Column(Text)
    screenshot_path = Column(String, nullable=True)
    trust_score_impact = Column(Float, default=0.0)

    # Additional alert data
    confidence_score = Column(Float, nullable=True)  # AI confidence in the detection
    metadata = Column(JSON, nullable=True)  # Additional context data
    is_resolved = Column(Boolean, default=False)
    resolved_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    exam_session = relationship("ExamSession", back_populates="alerts")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id])
