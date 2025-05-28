"""
Real-time Violation Detection Integration Service
Integrates violation detection with frontend components and WebSocket updates
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from fastapi import WebSocket

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.violation_detection_service import ViolationDetectionService
from app.services.trust_score_service import TrustScoreService
from app.services.alert_service import AlertService
from app.db.models.exam_session import ExamSession
from app.db.models.alert import Alert
from app.schemas.alert import AlertCreate

logger = logging.getLogger(__name__)

class RealTimeViolationService:
    """Service for real-time violation detection and processing"""
    
    def __init__(self):
        self.violation_detector = ViolationDetectionService()
        self.trust_score_service = TrustScoreService()
        self.alert_service = AlertService()
        self.active_sessions: Dict[str, Dict] = {}
        self.websocket_connections: Dict[str, WebSocket] = {}
    
    async def start_session(self, session_id: str, user_id: int, exam_id: int, websocket: WebSocket) -> bool:
        """Start a new proctoring session"""
        try:
            # Store session information
            self.active_sessions[session_id] = {
                "user_id": user_id,
                "exam_id": exam_id,
                "start_time": datetime.now(timezone.utc),
                "violations": [],
                "trust_score": 1.0,
                "status": "active"
            }
            
            # Store WebSocket connection
            self.websocket_connections[session_id] = websocket
            
            # Initialize trust score
            db = SessionLocal()
            try:
                await self.trust_score_service.initialize_session_score(db, session_id, user_id)
            finally:
                db.close()
            
            logger.info(f"Started proctoring session {session_id} for user {user_id}")
            
            # Send initial status to frontend
            await self.send_session_update(session_id, {
                "type": "session_started",
                "session_id": session_id,
                "status": "active",
                "trust_score": 1.0,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Error starting session {session_id}: {e}")
            return False
    
    async def process_frame_data(self, session_id: str, frame_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming frame data and detect violations"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session_info = self.active_sessions[session_id]
            
            # Detect violations in the frame
            violations = await self.violation_detector.detect_violations(frame_data)
            
            # Process each violation
            for violation in violations:
                await self._handle_violation(session_id, violation)
            
            # Update trust score
            db = SessionLocal()
            try:
                new_trust_score = await self.trust_score_service.update_trust_score(
                    db, session_id, violations
                )
                session_info["trust_score"] = new_trust_score
            finally:
                db.close()
            
            # Prepare response
            response = {
                "session_id": session_id,
                "trust_score": session_info["trust_score"],
                "violations": [v.dict() for v in violations],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "processed"
            }
            
            # Send real-time update to frontend
            await self.send_session_update(session_id, {
                "type": "frame_processed",
                **response
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing frame for session {session_id}: {e}")
            return {
                "session_id": session_id,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "error"
            }
    
    async def _handle_violation(self, session_id: str, violation: Dict[str, Any]) -> None:
        """Handle a detected violation"""
        try:
            session_info = self.active_sessions[session_id]
            
            # Add violation to session
            session_info["violations"].append(violation)
            
            # Create alert in database
            db = SessionLocal()
            try:
                alert_data = AlertCreate(
                    session_id=session_id,
                    violation_type=violation.get("type", "unknown"),
                    severity=violation.get("severity", "medium"),
                    description=violation.get("description", "Violation detected"),
                    confidence=violation.get("confidence", 0.5),
                    metadata=violation.get("metadata", {})
                )
                
                alert = await self.alert_service.create_alert(db, alert_data)
                
                # Send real-time violation alert
                await self.send_violation_alert(session_id, {
                    "type": "violation_detected",
                    "alert_id": alert.id,
                    "violation_type": violation.get("type"),
                    "severity": violation.get("severity"),
                    "description": violation.get("description"),
                    "confidence": violation.get("confidence"),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error handling violation for session {session_id}: {e}")
    
    async def send_session_update(self, session_id: str, data: Dict[str, Any]) -> None:
        """Send session update via WebSocket"""
        try:
            if session_id in self.websocket_connections:
                websocket = self.websocket_connections[session_id]
                await websocket.send_text(json.dumps(data))
        except Exception as e:
            logger.error(f"Error sending session update for {session_id}: {e}")
    
    async def send_violation_alert(self, session_id: str, alert_data: Dict[str, Any]) -> None:
        """Send violation alert via WebSocket"""
        try:
            if session_id in self.websocket_connections:
                websocket = self.websocket_connections[session_id]
                await websocket.send_text(json.dumps({
                    "type": "violation_alert",
                    **alert_data
                }))
        except Exception as e:
            logger.error(f"Error sending violation alert for {session_id}: {e}")
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End a proctoring session"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session_info = self.active_sessions[session_id]
            session_info["status"] = "completed"
            session_info["end_time"] = datetime.now(timezone.utc)
            
            # Calculate final trust score
            db = SessionLocal()
            try:
                final_score = await self.trust_score_service.finalize_session_score(
                    db, session_id
                )
            finally:
                db.close()
            
            # Generate session summary
            summary = {
                "session_id": session_id,
                "duration": (session_info["end_time"] - session_info["start_time"]).total_seconds(),
                "total_violations": len(session_info["violations"]),
                "final_trust_score": final_score,
                "status": "completed",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Send session end notification
            await self.send_session_update(session_id, {
                "type": "session_ended",
                **summary
            })
            
            # Clean up
            if session_id in self.websocket_connections:
                del self.websocket_connections[session_id]
            
            del self.active_sessions[session_id]
            
            logger.info(f"Ended proctoring session {session_id}")
            return summary
            
        except Exception as e:
            logger.error(f"Error ending session {session_id}: {e}")
            return {
                "session_id": session_id,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "error"
            }
    
    async def get_session_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current session status"""
        if session_id in self.active_sessions:
            session_info = self.active_sessions[session_id].copy()
            session_info["start_time"] = session_info["start_time"].isoformat()
            if "end_time" in session_info:
                session_info["end_time"] = session_info["end_time"].isoformat()
            return session_info
        return None
    
    async def get_active_sessions(self) -> List[Dict[str, Any]]:
        """Get all active sessions"""
        active = []
        for session_id, info in self.active_sessions.items():
            if info["status"] == "active":
                session_copy = info.copy()
                session_copy["session_id"] = session_id
                session_copy["start_time"] = session_copy["start_time"].isoformat()
                active.append(session_copy)
        return active

# Global instance
realtime_violation_service = RealTimeViolationService()
