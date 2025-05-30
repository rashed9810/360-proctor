"""Analytics Service

Provides analytics functionality for the auto-proctoring system, including:
- Violation trends analysis
- Real-time analytics
- Comparative analytics
- Export functionality
- Predictive insights
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import json
import csv
import io
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, extract

from app.db.models.user import User, UserRole
from app.db.models.exam import Exam, ExamSession, Alert, AlertType, AlertSeverity
from app.db.models.notification import ActivityLog


def get_violation_trends(db: Session, days: int = 30, group_by: str = "day") -> List[Dict[str, Any]]:
    """
    Get violation trends over time
    
    Args:
        db: Database session
        days: Number of days to analyze
        group_by: Grouping interval (hour, day, week, month)
        
    Returns:
        List of violation trends with date and count
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Define the date trunc expression based on group_by parameter
    if group_by == "hour":
        date_trunc = func.date_format(Alert.created_at, "%Y-%m-%d %H:00:00")
    elif group_by == "day":
        date_trunc = func.date_format(Alert.created_at, "%Y-%m-%d")
    elif group_by == "week":
        date_trunc = func.date_format(Alert.created_at, "%Y-%u")
    elif group_by == "month":
        date_trunc = func.date_format(Alert.created_at, "%Y-%m")
    else:
        date_trunc = func.date_format(Alert.created_at, "%Y-%m-%d")
    
    # Query violation counts grouped by the specified interval
    trends = db.query(
        date_trunc.label('date'),
        func.count(Alert.id).label('count')
    ).filter(
        Alert.created_at >= start_date,
        Alert.created_at <= end_date
    ).group_by('date').order_by('date').all()
    
    return [
        {"date": str(trend.date), "count": trend.count}
        for trend in trends
    ]


def get_real_time_metrics(db: Session) -> Dict[str, Any]:
    """
    Get real-time metrics for active sessions
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with real-time metrics
    """
    # Get active sessions (started but not completed)
    active_sessions = db.query(ExamSession).filter(
        ExamSession.is_completed == False,
        ExamSession.start_time.isnot(None)
    ).count()
    
    # Get recent violations (last hour)
    recent_time = datetime.utcnow() - timedelta(hours=1)
    recent_violations = db.query(Alert).filter(
        Alert.created_at >= recent_time
    ).count()
    
    # Get average trust score of active sessions
    avg_trust_score = db.query(func.avg(ExamSession.current_trust_score)).filter(
        ExamSession.is_completed == False,
        ExamSession.start_time.isnot(None)
    ).scalar() or 0.0
    
    # Get violation types distribution in the last hour
    violation_types = db.query(
        Alert.alert_type,
        func.count(Alert.id).label('count')
    ).filter(
        Alert.created_at >= recent_time
    ).group_by(Alert.alert_type).all()
    
    violation_distribution = {
        str(v_type.alert_type): v_type.count 
        for v_type in violation_types
    }
    
    return {
        "active_sessions": active_sessions,
        "recent_violations": recent_violations,
        "average_trust_score": float(avg_trust_score),
        "violation_distribution": violation_distribution,
        "timestamp": datetime.utcnow().isoformat()
    }


def get_comparative_analytics(db: Session, exam_id: Optional[int] = None, 
                             student_id: Optional[int] = None, 
                             days: int = 30) -> Dict[str, Any]:
    """
    Get comparative analytics between different exams or students
    
    Args:
        db: Database session
        exam_id: Optional exam ID to filter
        student_id: Optional student ID to filter
        days: Number of days to analyze
        
    Returns:
        Dictionary with comparative analytics
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Base query for exam sessions
    base_query = db.query(ExamSession).filter(
        ExamSession.created_at >= start_date,
        ExamSession.final_trust_score.isnot(None)
    )
    
    # Apply filters if provided
    if exam_id:
        base_query = base_query.filter(ExamSession.exam_id == exam_id)
    if student_id:
        base_query = base_query.filter(ExamSession.student_id == student_id)
    
    # Get comparative data
    if exam_id and not student_id:
        # Compare students for a specific exam
        comparative_data = db.query(
            User.id,
            User.full_name,
            func.avg(ExamSession.final_trust_score).label('avg_trust_score'),
            func.count(Alert.id).label('violation_count')
        ).join(ExamSession, ExamSession.student_id == User.id)\
        .outerjoin(Alert, Alert.exam_session_id == ExamSession.id)\
        .filter(
            ExamSession.exam_id == exam_id,
            ExamSession.created_at >= start_date
        ).group_by(User.id, User.full_name).all()
        
        return {
            "type": "students_comparison",
            "exam_id": exam_id,
            "data": [
                {
                    "student_id": item.id,
                    "student_name": item.full_name,
                    "average_trust_score": float(item.avg_trust_score or 0.0),
                    "violation_count": item.violation_count
                }
                for item in comparative_data
            ]
        }
    
    elif student_id and not exam_id:
        # Compare exams for a specific student
        comparative_data = db.query(
            Exam.id,
            Exam.title,
            func.avg(ExamSession.final_trust_score).label('avg_trust_score'),
            func.count(Alert.id).label('violation_count')
        ).join(ExamSession, ExamSession.exam_id == Exam.id)\
        .outerjoin(Alert, Alert.exam_session_id == ExamSession.id)\
        .filter(
            ExamSession.student_id == student_id,
            ExamSession.created_at >= start_date
        ).group_by(Exam.id, Exam.title).all()
        
        return {
            "type": "exams_comparison",
            "student_id": student_id,
            "data": [
                {
                    "exam_id": item.id,
                    "exam_title": item.title,
                    "average_trust_score": float(item.avg_trust_score or 0.0),
                    "violation_count": item.violation_count
                }
                for item in comparative_data
            ]
        }
    
    else:
        # General comparison between exams
        comparative_data = db.query(
            Exam.id,
            Exam.title,
            func.avg(ExamSession.final_trust_score).label('avg_trust_score'),
            func.count(Alert.id).label('violation_count'),
            func.count(ExamSession.id).label('session_count')
        ).join(ExamSession, ExamSession.exam_id == Exam.id)\
        .outerjoin(Alert, Alert.exam_session_id == ExamSession.id)\
        .filter(ExamSession.created_at >= start_date)\
        .group_by(Exam.id, Exam.title).all()
        
        return {
            "type": "general_comparison",
            "data": [
                {
                    "exam_id": item.id,
                    "exam_title": item.title,
                    "average_trust_score": float(item.avg_trust_score or 0.0),
                    "violation_count": item.violation_count,
                    "session_count": item.session_count
                }
                for item in comparative_data
            ]
        }


def get_department_analytics(db: Session, days: int = 30) -> Dict[str, Any]:
    """
    Get analytics grouped by department
    
    Args:
        db: Database session
        days: Number of days to analyze
        
    Returns:
        Dictionary with department analytics
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Assuming there's a department field in User model or it can be derived
    # This is a placeholder implementation
    department_data = db.query(
        User.department,
        func.count(User.id).label('student_count'),
        func.count(ExamSession.id).label('session_count'),
        func.avg(ExamSession.final_trust_score).label('avg_trust_score'),
        func.count(Alert.id).label('violation_count')
    ).join(ExamSession, ExamSession.student_id == User.id)\
    .outerjoin(Alert, Alert.exam_session_id == ExamSession.id)\
    .filter(
        User.role == UserRole.STUDENT,
        ExamSession.created_at >= start_date
    ).group_by(User.department).all()
    
    return {
        "departments": [
            {
                "name": item.department,
                "student_count": item.student_count,
                "session_count": item.session_count,
                "average_trust_score": float(item.avg_trust_score or 0.0),
                "violation_count": item.violation_count
            }
            for item in department_data
        ]
    }


def get_predictive_insights(db: Session) -> Dict[str, Any]:
    """
    Get predictive insights based on historical data
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with predictive insights
    """
    # This would typically involve more complex machine learning models
    # For now, we'll implement a simple prediction based on historical trends
    
    # Get violation trends for the last 30 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    daily_violations = db.query(
        func.date_format(Alert.created_at, "%Y-%m-%d").label('date'),
        func.count(Alert.id).label('count')
    ).filter(
        Alert.created_at >= start_date
    ).group_by('date').order_by('date').all()
    
    # Simple linear prediction for next 7 days
    # In a real implementation, this would use more sophisticated models
    if len(daily_violations) > 0:
        # Calculate average daily increase/decrease
        if len(daily_violations) > 1:
            first_day = daily_violations[0].count
            last_day = daily_violations[-1].count
            days_between = len(daily_violations) - 1
            daily_change = (last_day - first_day) / days_between if days_between > 0 else 0
        else:
            daily_change = 0
            last_day = daily_violations[0].count
        
        # Project for next 7 days
        predictions = []
        for i in range(1, 8):
            next_date = end_date + timedelta(days=i)
            predicted_count = max(0, last_day + (daily_change * i))  # Ensure non-negative
            predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_violations": round(predicted_count, 1)
            })
    else:
        predictions = [
            {
                "date": (end_date + timedelta(days=i)).strftime("%Y-%m-%d"),
                "predicted_violations": 0
            }
            for i in range(1, 8)
        ]
    
    return {
        "predictions": predictions,
        "confidence": 0.7,  # Placeholder confidence score
        "factors": [
            "Historical violation patterns",
            "Day of week trends",
            "Exam schedule"
        ]
    }


def export_analytics_data(db: Session, format: str = "csv", 
                         data_type: str = "overview", days: int = 30) -> Any:
    """
    Export analytics data in various formats
    
    Args:
        db: Database session
        format: Export format (csv, json, xlsx)
        data_type: Type of data to export
        days: Number of days to analyze
        
    Returns:
        Exported data in the specified format
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get data based on type
    if data_type == "overview":
        # General overview statistics
        data = {
            "total_exams": db.query(Exam).count(),
            "total_students": db.query(User).filter(User.role == UserRole.STUDENT).count(),
            "total_sessions": db.query(ExamSession).count(),
            "total_violations": db.query(Alert).count(),
            "recent_exams": db.query(Exam).filter(Exam.created_at >= start_date).count(),
            "recent_sessions": db.query(ExamSession).filter(ExamSession.created_at >= start_date).count(),
            "recent_violations": db.query(Alert).filter(Alert.created_at >= start_date).count(),
            "average_trust_score": float(db.query(func.avg(ExamSession.final_trust_score))
                                     .filter(ExamSession.final_trust_score.isnot(None)).scalar() or 0.0)
        }
        df = pd.DataFrame([data])
    
    elif data_type == "violations":
        # Violation data
        violations = db.query(
            Alert.id,
            Alert.exam_session_id,
            Alert.alert_type,
            Alert.severity,
            Alert.description,
            Alert.trust_score_impact,
            Alert.confidence_score,
            Alert.created_at
        ).filter(Alert.created_at >= start_date).all()
        
        data = [
            {
                "id": v.id,
                "session_id": v.exam_session_id,
                "type": str(v.alert_type),
                "severity": str(v.severity),
                "description": v.description,
                "trust_score_impact": v.trust_score_impact,
                "confidence": v.confidence_score,
                "timestamp": v.created_at.isoformat()
            }
            for v in violations
        ]
        df = pd.DataFrame(data)
    
    elif data_type == "performance":
        # Exam performance data
        performance = db.query(
            Exam.id,
            Exam.title,
            func.count(ExamSession.id).label('total_sessions'),
            func.avg(ExamSession.score).label('average_score'),
            func.avg(ExamSession.final_trust_score).label('average_trust_score'),
            func.count(Alert.id).label('total_violations')
        ).outerjoin(ExamSession).outerjoin(Alert).filter(
            Exam.created_at >= start_date
        ).group_by(Exam.id, Exam.title).all()
        
        data = [
            {
                "exam_id": p.id,
                "exam_title": p.title,
                "total_sessions": p.total_sessions,
                "average_score": float(p.average_score or 0.0),
                "average_trust_score": float(p.average_trust_score or 0.0),
                "total_violations": p.total_violations
            }
            for p in performance
        ]
        df = pd.DataFrame(data)
    
    elif data_type == "students":
        # Student performance data
        students = db.query(
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
        ).group_by(User.id, User.full_name, User.email).all()
        
        data = [
            {
                "student_id": s.id,
                "student_name": s.full_name,
                "student_email": s.email,
                "total_sessions": s.total_sessions,
                "average_score": float(s.average_score or 0.0),
                "average_trust_score": float(s.average_trust_score or 0.0),
                "total_violations": s.total_violations
            }
            for s in students
        ]
        df = pd.DataFrame(data)
    
    else:
        # Default to overview
        data = {"error": "Invalid data type specified"}
        df = pd.DataFrame([data])
    
    # Export in the specified format
    if format == "json":
        return df.to_json(orient="records")
    elif format == "xlsx":
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        return output.getvalue()
    else:  # Default to CSV
        output = io.StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()