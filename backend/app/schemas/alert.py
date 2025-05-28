from typing import Optional
from datetime import datetime

from pydantic import BaseModel

from app.db.models.exam import AlertType, AlertSeverity


# Shared properties
class AlertBase(BaseModel):
    exam_session_id: int
    alert_type: AlertType
    severity: AlertSeverity
    description: str
    screenshot_path: Optional[str] = None
    trust_score_impact: Optional[float] = 0.0


# Properties to receive via API on creation
class AlertCreate(AlertBase):
    pass


# Properties shared by models stored in DB
class AlertInDBBase(AlertBase):
    id: int
    timestamp: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Additional properties to return via API
class Alert(AlertInDBBase):
    pass
