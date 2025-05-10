from typing import Optional
from datetime import datetime

from pydantic import BaseModel


# Shared properties
class ExamSessionBase(BaseModel):
    exam_id: int
    is_completed: Optional[bool] = False
    final_trust_score: Optional[float] = None


# Properties to receive via API on creation
class ExamSessionCreate(ExamSessionBase):
    pass


# Properties shared by models stored in DB
class ExamSessionInDBBase(ExamSessionBase):
    id: int
    student_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Additional properties to return via API
class ExamSession(ExamSessionInDBBase):
    pass
