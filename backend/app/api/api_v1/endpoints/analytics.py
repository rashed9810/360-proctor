from typing import Any, List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app import schemas
from app.api import deps
from app.db.models.user import User, UserRole
from app.db.models.exam import Exam, ExamSession, Alert, AlertType, AlertSeverity
from app.db.models.notification import ActivityLog
from app.services import analytics_service

router = APIRouter()


@router.get("/overview", response_model=schemas.AnalyticsOverview)
def get_analytics_overview(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get analytics overview (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Total counts
    total_exams = db.query(Exam).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_sessions = db.query(ExamSession).count()
    total_violations = db.query(Alert).count()
    
    # Recent activity (within specified days)
    recent_exams = db.query(Exam).filter(
        Exam.created_at >= start_date
    ).count()
    
    recent_sessions = db.query(ExamSession).filter(
        ExamSession.created_at >= start_date
    ).count()
    
    recent_violations = db.query(Alert).filter(
        Alert.created_at >= start_date
    ).count()
    
    # Average trust score
    avg_trust_score = db.query(func.avg(ExamSession.final_trust_score)).filter(
        ExamSession.final_trust_score.isnot(None),
        ExamSession.created_at >= start_date
    ).scalar() or 0.0
    
    # Active users (logged in within last 7 days)
    active_users = db.query(User).filter(
        User.last_login >= datetime.utcnow() - timedelta(days=7)
    ).count()
    
    return schemas.AnalyticsOverview(
        total_exams=total_exams,
        total_students=total_students,
        total_sessions=total_sessions,
        total_violations=total_violations,
        recent_exams=recent_exams,
        recent_sessions=recent_sessions,
        recent_violations=recent_violations,
        average_trust_score=float(avg_trust_score),
        active_users=active_users,
        analysis_period_days=days
    )


@router.get("/violations/trends", response_model=List[schemas.ViolationTrend])
def get_violation_trends(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    group_by: str = Query("day", regex="^(hour|day|week|month)$"),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get violation trends over time (admin only)
    """
    return analytics_service.get_violation_trends(db, days=days, group_by=group_by)


@router.get("/violations/types", response_model=List[schemas.ViolationTypeStats])
def get_violation_type_statistics(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get violation statistics by type (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    violation_stats = db.query(
        Alert.alert_type,
        func.count(Alert.id).label('count'),
        func.avg(Alert.confidence_score).label('avg_confidence')
    ).filter(
        Alert.created_at >= start_date
    ).group_by(Alert.alert_type).all()
    
    return [
        schemas.ViolationTypeStats(
            violation_type=stat.alert_type,
            count=stat.count,
            average_confidence=float(stat.avg_confidence or 0.0)
        )
        for stat in violation_stats
    ]


@router.get("/trust-scores/distribution", response_model=List[schemas.TrustScoreDistribution])
def get_trust_score_distribution(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get trust score distribution (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Define score ranges
    ranges = [
        (0.9, 1.0, "90-100%"),
        (0.8, 0.9, "80-89%"),
        (0.7, 0.8, "70-79%"),
        (0.6, 0.7, "60-69%"),
        (0.0, 0.6, "0-59%")
    ]
    
    distribution = []
    for min_score, max_score, label in ranges:
        count = db.query(ExamSession).filter(
            ExamSession.final_trust_score >= min_score,
            ExamSession.final_trust_score < max_score,
            ExamSession.created_at >= start_date,
            ExamSession.final_trust_score.isnot(None)
        ).count()
        
        distribution.append(schemas.TrustScoreDistribution(
            range_label=label,
            min_score=min_score,
            max_score=max_score,
            count=count
        ))
    
    return distribution


@router.get("/exams/performance", response_model=List[schemas.ExamPerformance])
def get_exam_performance_analytics(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    exam_id: Optional[int] = Query(None, description="Filter by specific exam"),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get exam performance analytics (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    query = db.query(
        Exam.id,
        Exam.title,
        func.count(ExamSession.id).label('total_sessions'),
        func.count(ExamSession.id).filter(ExamSession.is_completed == True).label('completed_sessions'),
        func.avg(ExamSession.score).label('average_score'),
        func.avg(ExamSession.final_trust_score).label('average_trust_score'),
        func.count(Alert.id).label('total_violations')
    ).outerjoin(ExamSession).outerjoin(Alert).filter(
        Exam.created_at >= start_date
    )
    
    if exam_id:
        query = query.filter(Exam.id == exam_id)
    
    results = query.group_by(Exam.id, Exam.title).all()
    
    return [
        schemas.ExamPerformance(
            exam_id=result.id,
            exam_title=result.title,
            total_sessions=result.total_sessions,
            completed_sessions=result.completed_sessions,
            completion_rate=result.completed_sessions / result.total_sessions if result.total_sessions > 0 else 0,
            average_score=float(result.average_score or 0.0),
            average_trust_score=float(result.average_trust_score or 0.0),
            total_violations=result.total_violations
        )
        for result in results
    ]


@router.get("/activity/hourly", response_model=List[schemas.HourlyActivity])
def get_hourly_activity(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get hourly activity patterns (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get activity by hour
    hourly_data = []
    for hour in range(24):
        exam_count = db.query(ExamSession).filter(
            func.extract('hour', ExamSession.start_time) == hour,
            ExamSession.start_time >= start_date
        ).count()
        
        violation_count = db.query(Alert).filter(
            func.extract('hour', Alert.timestamp) == hour,
            Alert.timestamp >= start_date
        ).count()
        
        hourly_data.append(schemas.HourlyActivity(
            hour=hour,
            exam_sessions=exam_count,
            violations=violation_count
        ))
    
    return hourly_data


@router.get("/students/performance", response_model=List[schemas.StudentPerformance])
def get_student_performance_analytics(
    *,
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(50, ge=1, le=500),
    order_by: str = Query("trust_score", regex="^(trust_score|score|violations)$"),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Get student performance analytics (admin only)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    query = db.query(
        User.id,
        User.full_name,
        User.email,
        func.count(ExamSession.id).label('total_sessions'),
        func.avg(ExamSession.score).label('average_score'),
        func.avg(ExamSession.final_trust_score).label('average_trust_score'),
        func.count(Alert.id).label('total_violations')
    ).join(ExamSession).outerjoin(Alert).filter(
        User.role == UserRole.STUDENT,
        ExamSession.created_at >= start_date
    ).group_by(User.id, User.full_name, User.email)
    
    # Order by specified field
    if order_by == "trust_score":
        query = query.order_by(func.avg(ExamSession.final_trust_score).desc())
    elif order_by == "score":
        query = query.order_by(func.avg(ExamSession.score).desc())
    elif order_by == "violations":
        query = query.order_by(func.count(Alert.id).asc())
    
    results = query.limit(limit).all()
    
    return [
        schemas.StudentPerformance(
            student_id=result.id,
            student_name=result.full_name,
            student_email=result.email,
            total_sessions=result.total_sessions,
            average_score=float(result.average_score or 0.0),
            average_trust_score=float(result.average_trust_score or 0.0),
            total_violations=result.total_violations
        )
        for result in results
    ]


@router.get("/export")
def export_analytics_data(
    *,
    db: Session = Depends(deps.get_db),
    format: str = Query("csv", regex="^(csv|json|xlsx)$"),
    data_type: str = Query("overview", regex="^(overview|violations|performance|students)$"),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Export analytics data in various formats (admin only)
    """
    return analytics_service.export_analytics_data(
        db=db,
        format=format,
        data_type=data_type,
        days=days
    )
