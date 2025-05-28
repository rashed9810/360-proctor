from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel

from app.db.models.exam import ExamStatus


# Shared properties
class ExamBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[ExamStatus] = None

    # Proctoring settings
    enable_face_detection: Optional[bool] = True
    enable_multiple_face_detection: Optional[bool] = True
    enable_eye_tracking: Optional[bool] = True
    enable_audio_detection: Optional[bool] = True
    enable_tab_switch_detection: Optional[bool] = True
    enable_phone_detection: Optional[bool] = True

    # Trust score thresholds
    warning_threshold: Optional[float] = 0.7
    critical_threshold: Optional[float] = 0.5


# Properties to receive via API on creation
class ExamCreate(ExamBase):
    title: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int


# Properties to receive via API on update
class ExamUpdate(ExamBase):
    pass


# Properties shared by models stored in DB
class ExamInDBBase(ExamBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Additional properties to return via API
class Exam(ExamInDBBase):
    pass
