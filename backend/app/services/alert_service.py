"""
Alert Service for 360° Proctor
Handles creation and management of alerts
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.db.models.exam import Alert, AlertType, AlertSeverity
from app.schemas.alert import AlertCreate
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


class AlertService:
    """Service for managing alerts"""

    def __init__(self):
        pass

    async def create_alert(
        self,
        exam_session_id: int,
        alert_type: AlertType,
        severity: AlertSeverity,
        description: str,
        trust_score_impact: float = 0.0,
        alert_metadata: Optional[Dict[str, Any]] = None,
        screenshot_path: Optional[str] = None,
        confidence_score: Optional[float] = None
    ) -> Alert:
        """Create a new alert"""
        try:
            db = SessionLocal()

            alert = Alert(
                exam_session_id=exam_session_id,
                alert_type=alert_type,
                severity=severity,
                description=description,
                trust_score_impact=trust_score_impact,
                alert_metadata=alert_metadata,
                screenshot_path=screenshot_path,
                confidence_score=confidence_score,
                timestamp=datetime.now(timezone.utc)
            )

            db.add(alert)
            db.commit()
            db.refresh(alert)

            logger.info(f"Created alert {alert.id} for session {exam_session_id}")

            return alert

        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            if db:
                db.rollback()
            raise
        finally:
            if db:
                db.close()


def get(db: Session, id: int) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == id).first()


def get_by_session(db: Session, *, session_id: int) -> List[Alert]:
    return db.query(Alert).filter(Alert.exam_session_id == session_id).all()


def create(db: Session, *, obj_in: AlertCreate) -> Alert:
    db_obj = Alert(
        exam_session_id=obj_in.exam_session_id,
        alert_type=obj_in.alert_type,
        severity=obj_in.severity,
        description=obj_in.description,
        screenshot_path=obj_in.screenshot_path,
        trust_score_impact=obj_in.trust_score_impact,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Global instance
alert_service = AlertService()
