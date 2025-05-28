"""
Real-time Proctoring WebSocket Endpoints for 360° Proctor
Handles live proctoring sessions with AI-powered violation detection
"""

import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.websocket_manager import WebSocketManager
from app.services.ai_detection_service import ai_detection_service
from app.services.violation_detection_service import violation_detection_service
from app.services.trust_score_service import trust_score_service
from app.db.models.user import User

router = APIRouter()
websocket_manager = WebSocketManager()
logger = logging.getLogger(__name__)

@router.websocket("/proctoring/{session_id}")
async def proctoring_websocket(
    websocket: WebSocket,
    session_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time proctoring"""
    await websocket_manager.connect(websocket)
    
    try:
        logger.info(f"Started proctoring session {session_id}")
        
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "frame_data":
                await handle_frame_data(websocket, session_id, message, db)
            elif message_type == "browser_event":
                await handle_browser_event(websocket, session_id, message, db)
            elif message_type == "audio_data":
                await handle_audio_data(websocket, session_id, message, db)
            elif message_type == "heartbeat":
                await handle_heartbeat(websocket, session_id, message)
            elif message_type == "session_status":
                await handle_session_status(websocket, session_id, message, db)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in proctoring session {session_id}: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))

async def handle_frame_data(
    websocket: WebSocket, 
    session_id: int, 
    message: Dict[str, Any],
    db: Session
):
    """Handle video frame data for AI analysis"""
    try:
        frame_data = message.get("frame")
        user_id = message.get("user_id")
        
        if not frame_data:
            return
        
        # Process frame with AI detection
        ai_results = ai_detection_service.process_frame(frame_data)
        
        # Check for violations
        violations = await violation_detection_service.process_frame_data(
            session_id, user_id, ai_results
        )
        
        # Calculate current trust score
        all_violations = violation_detection_service.get_session_violations(session_id)
        trust_score_result = trust_score_service.calculate_trust_score(
            session_id=session_id,
            violations=all_violations,
            exam_duration_minutes=message.get("exam_duration", 60),
            current_time_minutes=message.get("current_time", 0)
        )
        
        # Send response back to client
        response = {
            "type": "frame_analysis",
            "session_id": session_id,
            "ai_results": ai_results,
            "violations": [
                {
                    "type": v.violation_type.value,
                    "severity": v.severity.value,
                    "description": v.description,
                    "confidence": v.confidence,
                    "timestamp": v.timestamp.isoformat()
                } for v in violations
            ],
            "trust_score": {
                "current_score": trust_score_result.current_score,
                "category": trust_score_result.category.value,
                "trend": trust_score_result.trend,
                "violations_count": trust_score_result.violations_count
            },
            "timestamp": ai_results.get("timestamp")
        }
        
        await websocket.send_text(json.dumps(response))
        
        # Broadcast to monitoring proctors if violations detected
        if violations:
            await broadcast_to_proctors(session_id, response)
            
    except Exception as e:
        logger.error(f"Error handling frame data: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Frame processing error: {str(e)}"
        }))

async def handle_browser_event(
    websocket: WebSocket,
    session_id: int,
    message: Dict[str, Any],
    db: Session
):
    """Handle browser events (tab switch, window blur, etc.)"""
    try:
        event_data = message.get("event")
        user_id = message.get("user_id")
        
        if not event_data:
            return
        
        # Process browser event for violations
        violations = await violation_detection_service.process_browser_event(
            session_id, user_id, event_data
        )
        
        # Send response
        response = {
            "type": "browser_event_processed",
            "session_id": session_id,
            "event_type": event_data.get("type"),
            "violations": [
                {
                    "type": v.violation_type.value,
                    "severity": v.severity.value,
                    "description": v.description,
                    "timestamp": v.timestamp.isoformat()
                } for v in violations
            ]
        }
        
        await websocket.send_text(json.dumps(response))
        
        # Broadcast to proctors if violations detected
        if violations:
            await broadcast_to_proctors(session_id, response)
            
    except Exception as e:
        logger.error(f"Error handling browser event: {e}")

async def handle_audio_data(
    websocket: WebSocket,
    session_id: int,
    message: Dict[str, Any],
    db: Session
):
    """Handle audio data for speech detection"""
    try:
        audio_data = message.get("audio")
        user_id = message.get("user_id")
        
        if not audio_data:
            return
        
        # Analyze audio for speech
        audio_results = ai_detection_service.analyze_audio_data(audio_data.encode())
        
        # Check for audio violations
        violations = await violation_detection_service.process_frame_data(
            session_id, user_id, {"audio_data": audio_results}
        )
        
        # Send response
        response = {
            "type": "audio_analysis",
            "session_id": session_id,
            "audio_results": audio_results,
            "violations": [
                {
                    "type": v.violation_type.value,
                    "severity": v.severity.value,
                    "description": v.description,
                    "timestamp": v.timestamp.isoformat()
                } for v in violations
            ]
        }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        logger.error(f"Error handling audio data: {e}")

async def handle_heartbeat(websocket: WebSocket, session_id: int, message: Dict[str, Any]):
    """Handle heartbeat messages to keep connection alive"""
    try:
        response = {
            "type": "heartbeat_ack",
            "session_id": session_id,
            "timestamp": message.get("timestamp"),
            "server_time": str(datetime.utcnow())
        }
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        logger.error(f"Error handling heartbeat: {e}")

async def handle_session_status(
    websocket: WebSocket,
    session_id: int,
    message: Dict[str, Any],
    db: Session
):
    """Handle session status updates"""
    try:
        status = message.get("status")
        user_id = message.get("user_id")
        
        # Get current session statistics
        violations = violation_detection_service.get_session_violations(session_id)
        violation_summary = violation_detection_service.get_violation_summary(session_id)
        
        # Calculate final trust score if session is ending
        if status == "completed":
            trust_score_result = trust_score_service.calculate_trust_score(
                session_id=session_id,
                violations=violations,
                exam_duration_minutes=message.get("exam_duration", 60),
                current_time_minutes=message.get("exam_duration", 60)
            )
        else:
            trust_score_result = trust_score_service.calculate_trust_score(
                session_id=session_id,
                violations=violations,
                exam_duration_minutes=message.get("exam_duration", 60),
                current_time_minutes=message.get("current_time", 0)
            )
        
        response = {
            "type": "session_status_update",
            "session_id": session_id,
            "status": status,
            "violation_summary": violation_summary,
            "trust_score": {
                "current_score": trust_score_result.current_score,
                "category": trust_score_result.category.value,
                "trend": trust_score_result.trend,
                "recommendations": trust_score_result.recommendations
            },
            "analytics": trust_score_service.get_score_analytics(session_id)
        }
        
        await websocket.send_text(json.dumps(response))
        
        # Broadcast session completion to proctors
        if status == "completed":
            await broadcast_to_proctors(session_id, response)
            
    except Exception as e:
        logger.error(f"Error handling session status: {e}")

async def broadcast_to_proctors(session_id: int, message: Dict[str, Any]):
    """Broadcast message to all proctors monitoring this session"""
    try:
        # Add session info to message
        message["broadcast_type"] = "session_update"
        message["monitored_session_id"] = session_id
        
        # In a real implementation, you'd maintain a list of proctor connections
        # For now, we'll just log the broadcast
        logger.info(f"Broadcasting to proctors for session {session_id}: {message['type']}")
        
        # TODO: Implement actual broadcasting to connected proctors
        # await websocket_manager.broadcast_to_proctors(session_id, json.dumps(message))
        
    except Exception as e:
        logger.error(f"Error broadcasting to proctors: {e}")

@router.websocket("/proctor/monitor/{session_id}")
async def proctor_monitoring_websocket(
    websocket: WebSocket,
    session_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for proctors to monitor exam sessions"""
    await websocket_manager.connect(websocket)
    
    try:
        logger.info(f"Proctor started monitoring session {session_id}")
        
        # Send initial session data
        violations = violation_detection_service.get_session_violations(session_id)
        violation_summary = violation_detection_service.get_violation_summary(session_id)
        
        initial_data = {
            "type": "monitoring_started",
            "session_id": session_id,
            "violation_summary": violation_summary,
            "total_violations": len(violations),
            "recent_violations": [
                {
                    "type": v.violation_type.value,
                    "severity": v.severity.value,
                    "description": v.description,
                    "timestamp": v.timestamp.isoformat()
                } for v in violations[-10:]  # Last 10 violations
            ]
        }
        
        await websocket.send_text(json.dumps(initial_data))
        
        # Keep connection alive and handle proctor commands
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle proctor commands (flag session, add notes, etc.)
            await handle_proctor_command(websocket, session_id, message, db)
            
    except WebSocketDisconnect:
        logger.info(f"Proctor disconnected from monitoring session {session_id}")
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in proctor monitoring: {e}")

async def handle_proctor_command(
    websocket: WebSocket,
    session_id: int,
    message: Dict[str, Any],
    db: Session
):
    """Handle commands from proctors"""
    try:
        command = message.get("command")
        
        if command == "flag_session":
            # Flag session for review
            response = {
                "type": "session_flagged",
                "session_id": session_id,
                "flagged_by": message.get("proctor_id"),
                "reason": message.get("reason"),
                "timestamp": str(datetime.utcnow())
            }
            
        elif command == "add_note":
            # Add proctor note
            response = {
                "type": "note_added",
                "session_id": session_id,
                "note": message.get("note"),
                "added_by": message.get("proctor_id"),
                "timestamp": str(datetime.utcnow())
            }
            
        elif command == "request_screenshot":
            # Request screenshot from student
            response = {
                "type": "screenshot_requested",
                "session_id": session_id,
                "requested_by": message.get("proctor_id"),
                "timestamp": str(datetime.utcnow())
            }
            
        else:
            response = {
                "type": "unknown_command",
                "command": command
            }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        logger.error(f"Error handling proctor command: {e}")
