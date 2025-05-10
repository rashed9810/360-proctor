from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.db.models.user import User, UserRole
from app.db.models.exam import ExamSession, Alert
from app.services import exam_session_service, alert_service
from app.websockets.connection_manager import ConnectionManager
from app.ai.proctoring_service import ProctorService

router = APIRouter()
connection_manager = ConnectionManager()
proctor_service = ProctorService()


@router.post("/start-session", response_model=schemas.ExamSession)
def start_exam_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: schemas.ExamSessionCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Start a new exam session
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can start exam sessions",
        )
    
    # Check if there's already an active session for this exam and student
    active_session = exam_session_service.get_active_session(
        db, exam_id=session_in.exam_id, student_id=current_user.id
    )
    if active_session:
        return active_session
    
    # Create new session
    session = exam_session_service.create(
        db, obj_in=session_in, student_id=current_user.id
    )
    return session


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


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: str,
):
    """
    WebSocket endpoint for real-time proctoring
    """
    # Authenticate user
    user = await deps.get_current_user_ws(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Accept connection
    await connection_manager.connect(websocket, session_id, user.id)
    
    try:
        while True:
            # Receive data from client (video frames, audio, etc.)
            data = await websocket.receive_json()
            
            # Process data with AI models
            result = await proctor_service.process_frame(data, session_id, user.id)
            
            # Send results back to client
            await websocket.send_json(result)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, session_id, user.id)
