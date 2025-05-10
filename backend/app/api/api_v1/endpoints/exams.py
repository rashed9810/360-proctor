from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.db.models.user import User, UserRole
from app.db.models.exam import Exam, ExamStatus
from app.services import exam_service

router = APIRouter()


@router.post("/", response_model=schemas.Exam)
def create_exam(
    *,
    db: Session = Depends(deps.get_db),
    exam_in: schemas.ExamCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new exam (teachers and admins only)
    """
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    exam = exam_service.create(db, obj_in=exam_in, creator_id=current_user.id)
    return exam


@router.get("/", response_model=List[schemas.Exam])
def read_exams(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve exams
    """
    if current_user.role == UserRole.STUDENT:
        # Students can only see published and active exams
        exams = exam_service.get_multi_by_status(
            db, 
            statuses=[ExamStatus.PUBLISHED, ExamStatus.ACTIVE],
            skip=skip, 
            limit=limit
        )
    elif current_user.role == UserRole.TEACHER:
        # Teachers can see their own exams
        exams = exam_service.get_multi_by_creator(
            db, creator_id=current_user.id, skip=skip, limit=limit
        )
    else:  # Admin
        exams = exam_service.get_multi(db, skip=skip, limit=limit)
    return exams


@router.get("/{exam_id}", response_model=schemas.Exam)
def read_exam(
    *,
    db: Session = Depends(deps.get_db),
    exam_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get exam by ID
    """
    exam = exam_service.get(db, id=exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )
    
    # Check permissions
    if current_user.role == UserRole.STUDENT:
        if exam.status not in [ExamStatus.PUBLISHED, ExamStatus.ACTIVE]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
    elif current_user.role == UserRole.TEACHER:
        if exam.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
    
    return exam


@router.put("/{exam_id}", response_model=schemas.Exam)
def update_exam(
    *,
    db: Session = Depends(deps.get_db),
    exam_id: int,
    exam_in: schemas.ExamUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update an exam
    """
    exam = exam_service.get(db, id=exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )
    
    # Check permissions
    if current_user.role == UserRole.TEACHER and exam.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    elif current_user.role == UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    exam = exam_service.update(db, db_obj=exam, obj_in=exam_in)
    return exam
