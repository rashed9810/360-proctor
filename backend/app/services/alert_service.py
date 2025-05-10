from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.db.models.exam import Alert, AlertType, AlertSeverity
from app.schemas.alert import AlertCreate


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
