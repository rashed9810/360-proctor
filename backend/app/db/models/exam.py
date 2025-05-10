from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

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
    
    # Proctoring settings
    enable_face_detection = Column(Boolean, default=True)
    enable_multiple_face_detection = Column(Boolean, default=True)
    enable_eye_tracking = Column(Boolean, default=True)
    enable_audio_detection = Column(Boolean, default=True)
    enable_tab_switch_detection = Column(Boolean, default=True)
    enable_phone_detection = Column(Boolean, default=True)
    
    # Trust score thresholds
    warning_threshold = Column(Float, default=0.7)  # Trust score below this triggers a warning
    critical_threshold = Column(Float, default=0.5)  # Trust score below this triggers a critical alert
    
    # Relationships
    creator_id = Column(Integer, ForeignKey("user.id"))
    creator = relationship("User", foreign_keys=[creator_id])
    
    # Exam sessions will be linked via a relationship from ExamSession model


class ExamSession(Base):
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exam.id"))
    student_id = Column(Integer, ForeignKey("user.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    final_trust_score = Column(Float, nullable=True)
    
    # Relationships
    exam = relationship("Exam")
    student = relationship("User")
    
    # Alerts will be linked via a relationship from Alert model


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
    exam_session_id = Column(Integer, ForeignKey("examsession.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    alert_type = Column(Enum(AlertType))
    severity = Column(Enum(AlertSeverity))
    description = Column(Text)
    screenshot_path = Column(String, nullable=True)
    trust_score_impact = Column(Float, default=0.0)
    
    # Relationships
    exam_session = relationship("ExamSession")
