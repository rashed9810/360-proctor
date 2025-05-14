from typing import Any, Dict, Optional, Union, List
from datetime import datetime

from sqlalchemy.orm import Session

from app.db.models.exam import ExamSession
from app.schemas.exam_session import ExamSessionCreate


def get(db: Session, id: int) -> Optional[ExamSession]:
    return db.query(ExamSession).filter(ExamSession.id == id).first()


def get_by_exam(db: Session, *, exam_id: int) -> List[ExamSession]:
    return db.query(ExamSession).filter(ExamSession.exam_id == exam_id).all()


def get_by_exam_and_student(
    db: Session, *, exam_id: int, student_id: int
) -> List[ExamSession]:
    return (
        db.query(ExamSession)
        .filter(ExamSession.exam_id == exam_id, ExamSession.student_id == student_id)
        .all()
    )


def get_active_session(
    db: Session, *, exam_id: int, student_id: int
) -> Optional[ExamSession]:
    return (
        db.query(ExamSession)
        .filter(
            ExamSession.exam_id == exam_id,
            ExamSession.student_id == student_id,
            ExamSession.is_completed == False,
        )
        .first()
    )


def create(db: Session, *, obj_in: ExamSessionCreate, student_id: int) -> ExamSession:
    db_obj = ExamSession(
        exam_id=obj_in.exam_id,
        student_id=student_id,
        is_completed=False,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def end_session(db: Session, *, session_id: int) -> ExamSession:
    session = get(db, id=session_id)
    if session and not session.is_completed:
        session.is_completed = True
        session.end_time = datetime.utcnow()

        # Calculate final trust score based on alerts
        # This is a simplified version, in a real app you would have a more complex algorithm
        alerts = session.alerts if hasattr(session, "alerts") else []
        if alerts:
            total_impact = sum(alert.trust_score_impact for alert in alerts)
            session.final_trust_score = max(0, 1.0 - total_impact)
        else:
            session.final_trust_score = 1.0

        db.add(session)
        db.commit()
        db.refresh(session)

    return session


def update_trust_score(db: Session, *, session_id: int, trust_score: float) -> ExamSession:
    """
    Update the trust score for an exam session

    Args:
        db: Database session
        session_id: ID of the exam session
        trust_score: New trust score value (between 0 and 1)

    Returns:
        Updated ExamSession object
    """
    session = get(db, id=session_id)
    if session:
        # Ensure trust score is between 0 and 1
        session.final_trust_score = max(0, min(1, trust_score))
        db.add(session)
        db.commit()
        db.refresh(session)

    return session
