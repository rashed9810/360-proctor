from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.notification import NotificationType, NotificationPriority


# Base Notification Schema
class NotificationBase(BaseModel):
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    expires_at: Optional[datetime] = None


# Create Notification Schema
class NotificationCreate(NotificationBase):
    user_id: int
    exam_id: Optional[int] = None
    exam_session_id: Optional[int] = None
    alert_id: Optional[int] = None
    metadata: Optional[dict] = None


# Notification Response Schema
class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool = False
    is_dismissed: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime
    
    # Related entities
    exam_id: Optional[int] = None
    exam_session_id: Optional[int] = None
    alert_id: Optional[int] = None
    metadata: Optional[dict] = None
    
    # Delivery status
    email_sent: bool = False
    push_sent: bool = False
    sms_sent: bool = False
    
    class Config:
        from_attributes = True


# Broadcast Notification Schema
class NotificationBroadcast(BaseModel):
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    
    # Target audience
    target_roles: Optional[List[str]] = None  # admin, teacher, student
    target_departments: Optional[List[str]] = None
    target_user_ids: Optional[List[int]] = None
    exclude_user_ids: Optional[List[int]] = None
    
    # Delivery options
    send_email: bool = False
    send_push: bool = True
    send_sms: bool = False
    
    # Scheduling
    send_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Additional data
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    metadata: Optional[dict] = None


# Notification Template Schema
class NotificationTemplate(BaseModel):
    id: str
    name: str
    description: str
    title_template: str
    message_template: str
    notification_type: NotificationType
    priority: NotificationPriority
    variables: List[str] = []
    
    class Config:
        from_attributes = True


# Unread Count Schema
class UnreadCount(BaseModel):
    count: int


# Notification Statistics Schema
class NotificationStatistics(BaseModel):
    total_sent: int
    total_read: int
    total_dismissed: int
    read_rate: float
    dismiss_rate: float
    
    # By type
    by_type: dict = {}
    
    # By priority
    by_priority: dict = {}
    
    # Delivery statistics
    email_delivery_rate: float = 0.0
    push_delivery_rate: float = 0.0
    sms_delivery_rate: float = 0.0
    
    # Time-based stats
    average_read_time_minutes: float = 0.0
    peak_hours: List[int] = []


# Notification Preferences Schema
class NotificationPreferences(BaseModel):
    user_id: int
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    
    # Type-specific preferences
    exam_alerts: bool = True
    violation_alerts: bool = True
    system_alerts: bool = True
    grade_notifications: bool = True
    reminder_notifications: bool = True
    
    # Frequency settings
    digest_frequency: str = "daily"  # immediate, hourly, daily, weekly
    quiet_hours_start: Optional[int] = None  # 0-23
    quiet_hours_end: Optional[int] = None  # 0-23
    
    class Config:
        from_attributes = True


# Real-time Notification Schema
class RealTimeNotification(BaseModel):
    type: str = "notification"
    data: Notification
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Notification Queue Item Schema
class NotificationQueueItem(BaseModel):
    id: str
    notification_data: NotificationCreate
    delivery_method: str  # email, push, sms, websocket
    scheduled_at: datetime
    attempts: int = 0
    max_attempts: int = 3
    status: str = "pending"  # pending, sent, failed, cancelled
    error_message: Optional[str] = None


# Notification Delivery Status Schema
class NotificationDeliveryStatus(BaseModel):
    notification_id: int
    delivery_method: str
    status: str  # sent, delivered, failed, bounced
    delivered_at: Optional[datetime] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    provider_response: Optional[dict] = None


# Notification Campaign Schema
class NotificationCampaign(BaseModel):
    id: int
    name: str
    description: str
    template_id: str
    target_criteria: dict
    scheduled_at: datetime
    status: str = "draft"  # draft, scheduled, running, completed, cancelled
    
    # Statistics
    total_recipients: int = 0
    sent_count: int = 0
    delivered_count: int = 0
    read_count: int = 0
    click_count: int = 0
    
    created_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True


# Notification Analytics Schema
class NotificationAnalytics(BaseModel):
    period: str  # daily, weekly, monthly
    date: str
    total_sent: int
    total_delivered: int
    total_read: int
    total_clicked: int
    
    # Rates
    delivery_rate: float
    open_rate: float
    click_rate: float
    
    # By channel
    email_stats: dict = {}
    push_stats: dict = {}
    sms_stats: dict = {}
    
    # Top performing notifications
    top_notifications: List[dict] = []


# Notification Settings Schema
class NotificationSettings(BaseModel):
    # Global settings
    enabled: bool = True
    rate_limit_per_minute: int = 100
    batch_size: int = 50
    retry_attempts: int = 3
    retry_delay_seconds: int = 300
    
    # Email settings
    email_enabled: bool = True
    email_provider: str = "smtp"
    email_from_address: str
    email_from_name: str
    
    # Push notification settings
    push_enabled: bool = True
    push_provider: str = "firebase"
    
    # SMS settings
    sms_enabled: bool = False
    sms_provider: str = "twilio"
    
    # WebSocket settings
    websocket_enabled: bool = True
    websocket_heartbeat_interval: int = 30
    
    class Config:
        from_attributes = True


# Notification Webhook Schema
class NotificationWebhook(BaseModel):
    id: int
    name: str
    url: str
    events: List[str] = []  # notification.sent, notification.delivered, etc.
    secret: str
    enabled: bool = True
    
    # Statistics
    total_calls: int = 0
    success_calls: int = 0
    last_called_at: Optional[datetime] = None
    
    created_at: datetime
    
    class Config:
        from_attributes = True
