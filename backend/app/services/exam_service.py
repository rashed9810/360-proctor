from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.db.models.exam import Exam, ExamStatus
from app.schemas.exam import ExamCreate, ExamUpdate


def get(db: Session, id: int) -> Optional[Exam]:
    return db.query(Exam).filter(Exam.id == id).first()


def get_multi(db: Session, *, skip: int = 0, limit: int = 100) -> List[Exam]:
    return db.query(Exam).offset(skip).limit(limit).all()


def get_multi_by_creator(
    db: Session, *, creator_id: int, skip: int = 0, limit: int = 100
) -> List[Exam]:
    return (
        db.query(Exam)
        .filter(Exam.creator_id == creator_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_multi_by_status(
    db: Session, *, statuses: List[ExamStatus], skip: int = 0, limit: int = 100
) -> List[Exam]:
    return (
        db.query(Exam)
        .filter(Exam.status.in_(statuses))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create(db: Session, *, obj_in: ExamCreate, creator_id: int) -> Exam:
    db_obj = Exam(
        title=obj_in.title,
        description=obj_in.description,
        start_time=obj_in.start_time,
        end_time=obj_in.end_time,
        duration_minutes=obj_in.duration_minutes,
        status=obj_in.status or ExamStatus.DRAFT,
        enable_face_detection=obj_in.enable_face_detection,
        enable_multiple_face_detection=obj_in.enable_multiple_face_detection,
        enable_eye_tracking=obj_in.enable_eye_tracking,
        enable_audio_detection=obj_in.enable_audio_detection,
        enable_tab_switch_detection=obj_in.enable_tab_switch_detection,
        enable_phone_detection=obj_in.enable_phone_detection,
        warning_threshold=obj_in.warning_threshold,
        critical_threshold=obj_in.critical_threshold,
        creator_id=creator_id,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session, *, db_obj: Exam, obj_in: Union[ExamUpdate, Dict[str, Any]]
) -> Exam:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in update_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
