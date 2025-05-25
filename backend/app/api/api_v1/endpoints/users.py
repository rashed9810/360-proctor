from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app import schemas
from app.api import deps
from app.db.models.user import User, UserRole
from app.db.models.notification import ActivityLog, ActivityLogType
from app.services import user_service
from app.core.security import get_password_hash, verify_password

router = APIRouter()


@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user
    """
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user
    """
    user = user_service.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Retrieve users (admin only)
    """
    users = user_service.get_multi(db, skip=skip, limit=limit)
    return users


@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Create new user (admin only)
    """
    user = user_service.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    user = user_service.create(db, obj_in=user_in)

    # Log activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.USER_CREATED,
        description=f"Created user: {user.email}",
        target_user_id=user.id,
        metadata={"created_user_email": user.email, "created_user_role": user.role}
    )
    db.add(activity_log)
    db.commit()

    return user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user == current_user:
        return user
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return user


@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Update a user (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    old_values = {
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active
    }

    user = user_service.update(db, db_obj=user, obj_in=user_in)

    # Log activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.USER_UPDATED,
        description=f"Updated user: {user.email}",
        target_user_id=user.id,
        old_values=old_values,
        new_values=user_in.model_dump(exclude_unset=True)
    )
    db.add(activity_log)
    db.commit()

    return user


@router.delete("/{user_id}")
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Delete a user (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )

    # Log activity before deletion
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.USER_DELETED,
        description=f"Deleted user: {user.email}",
        target_user_id=user.id,
        metadata={"deleted_user_email": user.email, "deleted_user_role": user.role}
    )
    db.add(activity_log)

    user_service.remove(db, id=user_id)
    db.commit()

    return {"message": "User deleted successfully"}


@router.get("/search/", response_model=List[schemas.User])
def search_users(
    *,
    db: Session = Depends(deps.get_db),
    q: str = Query(..., min_length=2, description="Search query"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0, description="Skip records"),
    limit: int = Query(100, ge=1, le=1000, description="Limit records"),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Search users by name or email (admin only)
    """
    users = user_service.search_users(
        db=db,
        query=q,
        role=role,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    return users


@router.get("/statistics/", response_model=schemas.UserStatistics)
def get_user_statistics(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get user statistics (admin only)
    """
    stats = user_service.get_user_statistics(db)
    return stats


@router.post("/{user_id}/activate")
def activate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Activate a user account (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active",
        )

    user.is_active = True
    db.commit()

    # Log activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.USER_UPDATED,
        description=f"Activated user: {user.email}",
        target_user_id=user.id,
        metadata={"action": "activate"}
    )
    db.add(activity_log)
    db.commit()

    return {"message": "User activated successfully"}


@router.post("/{user_id}/deactivate")
def deactivate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Deactivate a user account (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already inactive",
        )

    user.is_active = False
    db.commit()

    # Log activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.USER_UPDATED,
        description=f"Deactivated user: {user.email}",
        target_user_id=user.id,
        metadata={"action": "deactivate"}
    )
    db.add(activity_log)
    db.commit()

    return {"message": "User deactivated successfully"}


@router.post("/{user_id}/reset-password")
def reset_user_password(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    password_reset: schemas.PasswordReset,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Reset user password (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.hashed_password = get_password_hash(password_reset.new_password)
    user.login_attempts = 0  # Reset login attempts
    user.locked_until = None  # Unlock account if locked
    db.commit()

    # Log activity
    activity_log = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityLogType.PASSWORD_CHANGED,
        description=f"Reset password for user: {user.email}",
        target_user_id=user.id,
        metadata={"action": "admin_reset"}
    )
    db.add(activity_log)
    db.commit()

    return {"message": "Password reset successfully"}


@router.get("/{user_id}/activity-logs", response_model=List[schemas.ActivityLog])
def get_user_activity_logs(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get user activity logs (admin only)
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    logs = db.query(ActivityLog).filter(
        or_(ActivityLog.user_id == user_id, ActivityLog.target_user_id == user_id)
    ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()

    return logs
