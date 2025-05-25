from typing import Any, List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app import schemas
from app.api import deps
from app.db.models.user import User
from app.db.models.notification import Notification, NotificationType, NotificationPriority
from app.services import notification_service

router = APIRouter()


@router.get("/", response_model=List[schemas.Notification])
def get_notifications(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False, description="Show only unread notifications"),
    notification_type: Optional[NotificationType] = Query(None, description="Filter by type"),
    priority: Optional[NotificationPriority] = Query(None, description="Filter by priority"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user notifications
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)

    if priority:
        query = query.filter(Notification.priority == priority)

    notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
    return notifications


@router.get("/unread-count", response_model=schemas.UnreadCount)
def get_unread_count(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get count of unread notifications
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
        Notification.is_dismissed == False
    ).count()

    return schemas.UnreadCount(count=count)


@router.post("/{notification_id}/read")
def mark_notification_as_read(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark notification as read
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        db.commit()

    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
def mark_all_notifications_as_read(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark all notifications as read
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.now(timezone.utc)
    })
    db.commit()

    return {"message": "All notifications marked as read"}


@router.post("/{notification_id}/dismiss")
def dismiss_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Dismiss notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_dismissed = True
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Notification dismissed"}


@router.delete("/{notification_id}")
def delete_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted"}


@router.post("/send", response_model=schemas.Notification)
def send_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_data: schemas.NotificationCreate,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Send notification to user(s) (admin only)
    """
    notifications = notification_service.create_notification(db, notification_data)
    return notifications[0] if notifications else None


@router.post("/broadcast", response_model=List[schemas.Notification])
def broadcast_notification(
    *,
    db: Session = Depends(deps.get_db),
    broadcast_data: schemas.NotificationBroadcast,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Broadcast notification to multiple users (admin only)
    """
    notifications = notification_service.broadcast_notification(db, broadcast_data)
    return notifications


@router.get("/templates", response_model=List[schemas.NotificationTemplate])
def get_notification_templates(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get notification templates (admin only)
    """
    return notification_service.get_notification_templates()


@router.get("/statistics", response_model=schemas.NotificationStatistics)
def get_notification_statistics(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get notification statistics (admin only)
    """
    return notification_service.get_notification_statistics(db, days=days)


# WebSocket endpoint for real-time notifications
@router.websocket("/ws")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(deps.get_db),
):
    """
    WebSocket endpoint for real-time notifications
    """
    # Verify token and get user
    try:
        user = deps.get_current_user_from_token(db, token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await notification_service.handle_websocket_connection(websocket, user, db)
