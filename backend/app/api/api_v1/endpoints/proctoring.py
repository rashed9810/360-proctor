from typing import Any, List, Optional, Dict
from datetime import datetime, timedelta
import random
import base64
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.core import security

# Mock proctoring database
class MockProctoringDB:
    def __init__(self):
        self.sessions = {}
        self.violations = {}
        self.next_session_id = 1
        self.next_violation_id = 1
        self.active_connections = {}

    def create_session(self, exam_id: int, user_id: int):
        session_id = self.next_session_id
        self.next_session_id += 1

        session = {
            "id": session_id,
            "exam_id": exam_id,
            "user_id": user_id,
            "start_time": datetime.utcnow().isoformat(),
            "end_time": None,
            "status": "active",
            "trust_score": 100.0,
            "violations_count": 0,
            "face_detection_enabled": True,
            "audio_detection_enabled": True,
            "tab_switch_count": 0,
            "suspicious_activities": []
        }

        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: int):
        return self.sessions.get(session_id)

    def update_session(self, session_id: int, update_data: dict):
        if session_id in self.sessions:
            self.sessions[session_id].update(update_data)
            return self.sessions[session_id]
        return None

    def add_violation(self, session_id: int, violation_type: str, severity: str, description: str):
        violation_id = self.next_violation_id
        self.next_violation_id += 1

        violation = {
            "id": violation_id,
            "session_id": session_id,
            "type": violation_type,
            "severity": severity,
            "description": description,
            "timestamp": datetime.utcnow().isoformat(),
            "resolved": False
        }

        if session_id not in self.violations:
            self.violations[session_id] = []
        self.violations[session_id].append(violation)

        # Update session violation count
        if session_id in self.sessions:
            self.sessions[session_id]["violations_count"] += 1
            # Reduce trust score based on severity
            reduction = {"low": 5, "medium": 15, "high": 30}.get(severity, 10)
            self.sessions[session_id]["trust_score"] = max(0, self.sessions[session_id]["trust_score"] - reduction)

        return violation

    def get_session_violations(self, session_id: int):
        return self.violations.get(session_id, [])

mock_proctoring_db = MockProctoringDB()

router = APIRouter()

@router.post("/start-session")
async def start_proctoring_session(
    exam_id: int,
    authorization: Optional[str] = None
) -> Any:
    """
    Start a new proctoring session
    """
    # Verify authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    user_id = int(token_data["user_id"])

    # Create proctoring session
    session = mock_proctoring_db.create_session(exam_id, user_id)

    return {
        "session_id": session["id"],
        "exam_id": exam_id,
        "user_id": user_id,
        "status": "started",
        "trust_score": session["trust_score"],
        "timestamp": session["start_time"]
    }


@router.post("/end-session/{session_id}", response_model=schemas.ExamSession)
def end_exam_session(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    End an exam session
    """
    session = exam_session_service.get(db, id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if current_user.role == UserRole.STUDENT and session.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    session = exam_session_service.end_session(db, session_id=session_id)
    return session


@router.get("/sessions/{exam_id}", response_model=List[schemas.ExamSession])
def get_exam_sessions(
    *,
    db: Session = Depends(deps.get_db),
    exam_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all sessions for an exam
    """
    if current_user.role == UserRole.STUDENT:
        # Students can only see their own sessions
        sessions = exam_session_service.get_by_exam_and_student(
            db, exam_id=exam_id, student_id=current_user.id
        )
    else:
        # Teachers and admins can see all sessions
        sessions = exam_session_service.get_by_exam(db, exam_id=exam_id)

    return sessions


@router.get("/alerts/{session_id}", response_model=List[schemas.Alert])
def get_session_alerts(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all alerts for a session
    """
    session = exam_session_service.get(db, id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if current_user.role == UserRole.STUDENT and session.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    alerts = alert_service.get_by_session(db, session_id=session_id)
    return alerts


@router.post("/violation-report", response_model=dict)
def report_violation(
    *,
    db: Session = Depends(deps.get_db),
    violation_data: dict,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Report a proctoring violation
    """
    # Create violation record
    violation = {
        "id": f"violation_{violation_data.get('timestamp', '')}",
        "session_id": violation_data.get("session_id"),
        "student_id": violation_data.get("student_id"),
        "type": violation_data.get("type"),
        "severity": violation_data.get("severity", "medium"),
        "confidence": violation_data.get("confidence", 0.8),
        "metadata": violation_data.get("metadata", {}),
        "reported_by": current_user.id,
        "timestamp": violation_data.get("timestamp")
    }

    # Store in database (implement actual storage)
    # violation_service.create(db, violation)

    return {"status": "success", "violation_id": violation["id"]}


@router.get("/trust-score/{student_id}/{exam_id}", response_model=dict)
def get_trust_score(
    *,
    db: Session = Depends(deps.get_db),
    student_id: int,
    exam_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get trust score for a student in an exam
    """
    if current_user.role == UserRole.STUDENT and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Calculate trust score based on violations and behavior
    # This is a mock implementation
    trust_score = {
        "student_id": student_id,
        "exam_id": exam_id,
        "current_score": 85.5,
        "initial_score": 100.0,
        "deductions": [
            {"type": "face_not_detected", "points": 10, "timestamp": "2024-01-15T10:30:00Z"},
            {"type": "tab_switching", "points": 4.5, "timestamp": "2024-01-15T10:45:00Z"}
        ],
        "risk_level": "medium",
        "last_updated": "2024-01-15T11:00:00Z"
    }

    return trust_score


@router.get("/session-analytics/{session_id}", response_model=dict)
def get_session_analytics(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get detailed analytics for a proctoring session
    """
    session = exam_session_service.get(db, id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if current_user.role == UserRole.STUDENT and session.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Mock analytics data
    analytics = {
        "session_id": session_id,
        "duration": 3600,  # seconds
        "violations": {
            "total": 8,
            "by_type": {
                "face_not_detected": 3,
                "multiple_faces": 1,
                "tab_switching": 2,
                "suspicious_audio": 2
            },
            "by_severity": {
                "high": 4,
                "medium": 3,
                "low": 1
            }
        },
        "trust_score": {
            "initial": 100.0,
            "final": 72.5,
            "deduction": 27.5
        },
        "ai_analysis": {
            "face_detection_accuracy": 0.94,
            "audio_analysis_confidence": 0.87,
            "behavior_pattern_score": 0.76,
            "overall_confidence": 0.86
        },
        "timeline": [
            {
                "timestamp": "2024-01-15T10:00:00Z",
                "event": "session_started",
                "trust_score": 100.0
            },
            {
                "timestamp": "2024-01-15T10:15:00Z",
                "event": "violation_detected",
                "type": "face_not_detected",
                "trust_score": 90.0
            }
        ]
    }

    return analytics


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: str,
):
    """
    Enhanced WebSocket endpoint for real-time proctoring
    """
    # Authenticate user
    user = await deps.get_current_user_ws(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Accept connection
    client_id = f"user_{user.id}_session_{session_id}"
    client_type = "student" if user.role == UserRole.STUDENT else "admin"
    await connection_manager.connect(websocket, client_type, client_id)

    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connection_established",
            "session_id": session_id,
            "user_id": user.id,
            "timestamp": "2024-01-15T10:00:00Z"
        })

        while True:
            # Receive data from client
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "frame_data":
                # Process video frame with AI models
                result = await proctor_service.process_frame(
                    data.get("frame"), session_id, user.id
                )
                await websocket.send_json({
                    "type": "frame_analysis",
                    "result": result
                })

            elif message_type == "audio_data":
                # Process audio data
                result = await proctor_service.process_audio(
                    data.get("audio"), session_id, user.id
                )
                await websocket.send_json({
                    "type": "audio_analysis",
                    "result": result
                })

            elif message_type == "violation_report":
                # Handle violation report
                violation = data.get("violation")
                # Process and store violation
                await websocket.send_json({
                    "type": "violation_acknowledged",
                    "violation_id": violation.get("id")
                })

            elif message_type == "ping":
                # Respond to ping
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": "2024-01-15T10:00:00Z"
                })

    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
