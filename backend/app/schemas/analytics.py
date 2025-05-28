from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.exam import AlertType, AlertSeverity


# Analytics Overview
class AnalyticsOverview(BaseModel):
    total_exams: int
    total_students: int
    total_sessions: int
    total_violations: int
    recent_exams: int
    recent_sessions: int
    recent_violations: int
    average_trust_score: float
    active_users: int
    analysis_period_days: int


# Violation Trends
class ViolationTrend(BaseModel):
    date: str
    period: str  # hour, day, week, month
    face_not_detected: int = 0
    multiple_faces: int = 0
    looking_away: int = 0
    audio_detected: int = 0
    tab_switch: int = 0
    phone_detected: int = 0
    other: int = 0
    total: int = 0


# Violation Type Statistics
class ViolationTypeStats(BaseModel):
    violation_type: AlertType
    count: int
    percentage: float = 0.0
    average_confidence: float = 0.0
    severity_breakdown: dict = {}


# Trust Score Distribution
class TrustScoreDistribution(BaseModel):
    range_label: str  # e.g., "90-100%"
    min_score: float
    max_score: float
    count: int
    percentage: float = 0.0


# Exam Performance Analytics
class ExamPerformance(BaseModel):
    exam_id: int
    exam_title: str
    total_sessions: int
    completed_sessions: int
    completion_rate: float
    average_score: float
    average_trust_score: float
    total_violations: int
    pass_rate: float = 0.0
    average_duration_minutes: Optional[int] = None


# Hourly Activity
class HourlyActivity(BaseModel):
    hour: int  # 0-23
    exam_sessions: int
    violations: int
    active_users: int = 0


# Student Performance Analytics
class StudentPerformance(BaseModel):
    student_id: int
    student_name: str
    student_email: str
    total_sessions: int
    completed_sessions: int
    average_score: float
    average_trust_score: float
    total_violations: int
    improvement_trend: str = "stable"  # improving, declining, stable
    risk_level: str = "low"  # low, medium, high


# Department Analytics
class DepartmentAnalytics(BaseModel):
    department: str
    total_students: int
    total_exams: int
    average_score: float
    average_trust_score: float
    violation_rate: float
    completion_rate: float


# Time-based Analytics
class TimeBasedAnalytics(BaseModel):
    period: str  # daily, weekly, monthly
    date: str
    exams_created: int
    exams_completed: int
    students_active: int
    violations_detected: int
    average_trust_score: float


# Violation Details
class ViolationDetail(BaseModel):
    id: int
    exam_session_id: int
    student_name: str
    exam_title: str
    violation_type: AlertType
    severity: AlertSeverity
    timestamp: datetime
    confidence_score: Optional[float] = None
    description: str
    is_resolved: bool = False


# System Performance Metrics
class SystemPerformance(BaseModel):
    total_api_calls: int
    average_response_time_ms: float
    error_rate: float
    active_connections: int
    database_queries: int
    cache_hit_rate: float
    storage_used_gb: float


# Proctoring Effectiveness
class ProctoringEffectiveness(BaseModel):
    total_monitoring_hours: float
    violations_detected: int
    false_positive_rate: float
    detection_accuracy: float
    average_response_time_seconds: float
    manual_reviews_required: int


# Comparative Analytics
class ComparativeAnalytics(BaseModel):
    current_period: dict
    previous_period: dict
    growth_metrics: dict
    trends: dict


# Export Data Schema
class ExportRequest(BaseModel):
    format: str = Field(..., pattern="^(csv|json|xlsx|pdf)$")
    data_type: str = Field(..., pattern="^(overview|violations|performance|students|exams)$")
    date_range: dict
    filters: Optional[dict] = None
    include_charts: bool = False


# Real-time Analytics
class RealTimeMetrics(BaseModel):
    active_exams: int
    students_online: int
    violations_last_hour: int
    system_load: float
    alerts_pending: int
    trust_score_average: float
    timestamp: datetime


# Predictive Analytics
class PredictiveInsights(BaseModel):
    risk_students: List[dict]
    violation_predictions: List[dict]
    performance_forecasts: List[dict]
    recommendations: List[str]
    confidence_level: float


# Advanced Filters
class AnalyticsFilters(BaseModel):
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    exam_ids: Optional[List[int]] = None
    student_ids: Optional[List[int]] = None
    departments: Optional[List[str]] = None
    violation_types: Optional[List[AlertType]] = None
    trust_score_min: Optional[float] = None
    trust_score_max: Optional[float] = None
    include_flagged_only: bool = False


# Dashboard Widget Data
class DashboardWidget(BaseModel):
    widget_type: str
    title: str
    data: dict
    last_updated: datetime
    refresh_interval_seconds: int = 300


# Analytics Report
class AnalyticsReport(BaseModel):
    report_id: str
    title: str
    description: str
    generated_at: datetime
    generated_by: str
    filters_applied: dict
    summary: dict
    sections: List[dict]
    charts: List[dict]
    recommendations: List[str]


# Benchmark Comparison
class BenchmarkComparison(BaseModel):
    metric_name: str
    current_value: float
    benchmark_value: float
    industry_average: float
    percentile_rank: float
    trend: str  # improving, declining, stable
    recommendation: str


# Alert Threshold Configuration
class AlertThreshold(BaseModel):
    metric_name: str
    warning_threshold: float
    critical_threshold: float
    enabled: bool = True
    notification_emails: List[str] = []


# Custom Analytics Query
class CustomAnalyticsQuery(BaseModel):
    query_name: str
    description: str
    sql_query: str
    parameters: Optional[dict] = None
    visualization_type: str = "table"
    refresh_schedule: Optional[str] = None
