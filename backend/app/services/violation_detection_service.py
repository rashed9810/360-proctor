"""
Real-time Violation Detection Service for 360° Proctor
Handles detection and scoring of various exam violations
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

from app.db.models.exam import AlertType, AlertSeverity
from app.services.alert_service import alert_service
from app.core.websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)

class ViolationType(Enum):
    """Types of violations that can be detected"""
    FACE_NOT_DETECTED = "face_not_detected"
    MULTIPLE_FACES = "multiple_faces"
    LOOKING_AWAY = "looking_away"
    TAB_SWITCH = "tab_switch"
    WINDOW_BLUR = "window_blur"
    AUDIO_DETECTED = "audio_detected"
    PHONE_DETECTED = "phone_detected"
    SUSPICIOUS_MOVEMENT = "suspicious_movement"
    COPY_PASTE = "copy_paste"
    RIGHT_CLICK = "right_click"
    FULLSCREEN_EXIT = "fullscreen_exit"
    BOOK_DETECTED = "book_detected"
    LAPTOP_DETECTED = "laptop_detected"
    UNAUTHORIZED_OBJECT = "unauthorized_object"

@dataclass
class ViolationEvent:
    """Represents a violation event"""
    violation_type: ViolationType
    severity: AlertSeverity
    confidence: float
    timestamp: datetime
    session_id: int
    user_id: int
    description: str
    metadata: Dict[str, Any] = None
    trust_score_impact: float = 0.0

class ViolationDetectionService:
    """Service for detecting and processing exam violations"""

    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.violation_thresholds = self._load_violation_thresholds()
        self.session_violations = {}  # Track violations per session

    def _load_violation_thresholds(self) -> Dict[ViolationType, Dict[str, Any]]:
        """Load violation detection thresholds and configurations"""
        return {
            ViolationType.FACE_NOT_DETECTED: {
                "max_duration": 10,  # seconds
                "trust_score_impact": 0.15,
                "severity": AlertSeverity.HIGH
            },
            ViolationType.MULTIPLE_FACES: {
                "max_count": 1,
                "trust_score_impact": 0.25,
                "severity": AlertSeverity.CRITICAL
            },
            ViolationType.LOOKING_AWAY: {
                "max_duration": 5,  # seconds
                "trust_score_impact": 0.10,
                "severity": AlertSeverity.MEDIUM
            },
            ViolationType.TAB_SWITCH: {
                "max_count": 3,
                "trust_score_impact": 0.20,
                "severity": AlertSeverity.HIGH
            },
            ViolationType.WINDOW_BLUR: {
                "max_count": 5,
                "trust_score_impact": 0.15,
                "severity": AlertSeverity.MEDIUM
            },
            ViolationType.AUDIO_DETECTED: {
                "max_duration": 3,  # seconds
                "trust_score_impact": 0.12,
                "severity": AlertSeverity.MEDIUM
            },
            ViolationType.PHONE_DETECTED: {
                "max_count": 1,
                "trust_score_impact": 0.30,
                "severity": AlertSeverity.CRITICAL
            },
            ViolationType.SUSPICIOUS_MOVEMENT: {
                "max_count": 10,
                "trust_score_impact": 0.08,
                "severity": AlertSeverity.LOW
            },
            ViolationType.COPY_PASTE: {
                "max_count": 2,
                "trust_score_impact": 0.25,
                "severity": AlertSeverity.HIGH
            },
            ViolationType.RIGHT_CLICK: {
                "max_count": 5,
                "trust_score_impact": 0.05,
                "severity": AlertSeverity.LOW
            },
            ViolationType.FULLSCREEN_EXIT: {
                "max_count": 2,
                "trust_score_impact": 0.20,
                "severity": AlertSeverity.HIGH
            },
            ViolationType.BOOK_DETECTED: {
                "max_count": 1,
                "trust_score_impact": 0.15,
                "severity": AlertSeverity.MEDIUM
            },
            ViolationType.LAPTOP_DETECTED: {
                "max_count": 1,
                "trust_score_impact": 0.20,
                "severity": AlertSeverity.HIGH
            },
            ViolationType.UNAUTHORIZED_OBJECT: {
                "max_count": 1,
                "trust_score_impact": 0.10,
                "severity": AlertSeverity.MEDIUM
            }
        }

    async def process_frame_data(self, session_id: int, user_id: int, frame_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Process frame data and detect violations"""
        violations = []

        try:
            # Face detection violations
            if "face_detection" in frame_data:
                face_violations = await self._detect_face_violations(
                    session_id, user_id, frame_data["face_detection"]
                )
                violations.extend(face_violations)

            # Eye tracking violations
            if "eye_tracking" in frame_data:
                eye_violations = await self._detect_eye_violations(
                    session_id, user_id, frame_data["eye_tracking"]
                )
                violations.extend(eye_violations)

            # Audio violations
            if "audio_data" in frame_data:
                audio_violations = await self._detect_audio_violations(
                    session_id, user_id, frame_data["audio_data"]
                )
                violations.extend(audio_violations)
                
            # Phone detection violations
            if "phone_detection" in frame_data:
                phone_violations = await self._detect_phone_violations(
                    session_id, user_id, frame_data["phone_detection"]
                )
                violations.extend(phone_violations)
                
            # Advanced object detection violations
            if "object_detection" in frame_data:
                object_violations = await self._detect_object_violations(
                    session_id, user_id, frame_data["object_detection"]
                )
                violations.extend(object_violations)

            # Process detected violations
            for violation in violations:
                await self._process_violation(violation)

        except Exception as e:
            logger.error(f"Error processing frame data: {e}")

        return violations

    async def process_browser_event(self, session_id: int, user_id: int, event_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Process browser events and detect violations"""
        violations = []

        try:
            event_type = event_data.get("type")

            if event_type == "tab_switch":
                violation = ViolationEvent(
                    violation_type=ViolationType.TAB_SWITCH,
                    severity=self.violation_thresholds[ViolationType.TAB_SWITCH]["severity"],
                    confidence=1.0,
                    timestamp=datetime.utcnow(),
                    session_id=session_id,
                    user_id=user_id,
                    description="Student switched browser tab",
                    metadata=event_data,
                    trust_score_impact=self.violation_thresholds[ViolationType.TAB_SWITCH]["trust_score_impact"]
                )
                violations.append(violation)

            elif event_type == "window_blur":
                violation = ViolationEvent(
                    violation_type=ViolationType.WINDOW_BLUR,
                    severity=self.violation_thresholds[ViolationType.WINDOW_BLUR]["severity"],
                    confidence=1.0,
                    timestamp=datetime.utcnow(),
                    session_id=session_id,
                    user_id=user_id,
                    description="Browser window lost focus",
                    metadata=event_data,
                    trust_score_impact=self.violation_thresholds[ViolationType.WINDOW_BLUR]["trust_score_impact"]
                )
                violations.append(violation)

            elif event_type == "copy_paste":
                violation = ViolationEvent(
                    violation_type=ViolationType.COPY_PASTE,
                    severity=self.violation_thresholds[ViolationType.COPY_PASTE]["severity"],
                    confidence=1.0,
                    timestamp=datetime.utcnow(),
                    session_id=session_id,
                    user_id=user_id,
                    description="Copy/paste operation detected",
                    metadata=event_data,
                    trust_score_impact=self.violation_thresholds[ViolationType.COPY_PASTE]["trust_score_impact"]
                )
                violations.append(violation)

            elif event_type == "right_click":
                violation = ViolationEvent(
                    violation_type=ViolationType.RIGHT_CLICK,
                    severity=self.violation_thresholds[ViolationType.RIGHT_CLICK]["severity"],
                    confidence=1.0,
                    timestamp=datetime.utcnow(),
                    session_id=session_id,
                    user_id=user_id,
                    description="Right-click context menu accessed",
                    metadata=event_data,
                    trust_score_impact=self.violation_thresholds[ViolationType.RIGHT_CLICK]["trust_score_impact"]
                )
                violations.append(violation)

            elif event_type == "fullscreen_exit":
                violation = ViolationEvent(
                    violation_type=ViolationType.FULLSCREEN_EXIT,
                    severity=self.violation_thresholds[ViolationType.FULLSCREEN_EXIT]["severity"],
                    confidence=1.0,
                    timestamp=datetime.utcnow(),
                    session_id=session_id,
                    user_id=user_id,
                    description="Student exited fullscreen mode",
                    metadata=event_data,
                    trust_score_impact=self.violation_thresholds[ViolationType.FULLSCREEN_EXIT]["trust_score_impact"]
                )
                violations.append(violation)

            # Process detected violations
            for violation in violations:
                await self._process_violation(violation)

        except Exception as e:
            logger.error(f"Error processing browser event: {e}")

        return violations

    async def _detect_face_violations(self, session_id: int, user_id: int, face_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Detect face-related violations"""
        violations = []

        faces_detected = face_data.get("faces_detected", 0)
        confidence = face_data.get("confidence", 0.0)
        detection_method = face_data.get("detection_method", "basic")

        # No face detected
        if faces_detected == 0:
            violation = ViolationEvent(
                violation_type=ViolationType.FACE_NOT_DETECTED,
                severity=self.violation_thresholds[ViolationType.FACE_NOT_DETECTED]["severity"],
                confidence=confidence,
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description="No face detected in frame",
                metadata={**face_data, "detection_method": detection_method},
                trust_score_impact=self.violation_thresholds[ViolationType.FACE_NOT_DETECTED]["trust_score_impact"]
            )
            violations.append(violation)

        # Multiple faces detected
        elif faces_detected > 1:
            # Increase confidence if using advanced detection
            if detection_method == "advanced":
                confidence = max(confidence, 0.95)  # Higher confidence with advanced detection
                
            violation = ViolationEvent(
                violation_type=ViolationType.MULTIPLE_FACES,
                severity=self.violation_thresholds[ViolationType.MULTIPLE_FACES]["severity"],
                confidence=confidence,
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description=f"Multiple faces detected: {faces_detected}",
                metadata={**face_data, "detection_method": detection_method},
                trust_score_impact=self.violation_thresholds[ViolationType.MULTIPLE_FACES]["trust_score_impact"]
            )
            violations.append(violation)

        return violations

    async def _detect_eye_violations(self, session_id: int, user_id: int, eye_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Detect eye tracking violations"""
        violations = []

        looking_away = eye_data.get("looking_away", False)
        confidence = eye_data.get("confidence", 0.0)

        if looking_away:
            violation = ViolationEvent(
                violation_type=ViolationType.LOOKING_AWAY,
                severity=self.violation_thresholds[ViolationType.LOOKING_AWAY]["severity"],
                confidence=confidence,
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description="Student looking away from screen",
                metadata=eye_data,
                trust_score_impact=self.violation_thresholds[ViolationType.LOOKING_AWAY]["trust_score_impact"]
            )
            violations.append(violation)

        return violations

    async def _detect_audio_violations(self, session_id: int, user_id: int, audio_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Detect audio-related violations"""
        violations = []

        audio_detected = audio_data.get("audio_detected", False)
        confidence = audio_data.get("confidence", 0.0)

        if audio_detected:
            violation = ViolationEvent(
                violation_type=ViolationType.AUDIO_DETECTED,
                severity=self.violation_thresholds[ViolationType.AUDIO_DETECTED]["severity"],
                confidence=confidence,
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description="Audio/speech detected during exam",
                metadata=audio_data,
                trust_score_impact=self.violation_thresholds[ViolationType.AUDIO_DETECTED]["trust_score_impact"]
            )
            violations.append(violation)

        return violations
        
    async def _detect_phone_violations(self, session_id: int, user_id: int, phone_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Detect phone-related violations"""
        violations = []

        phone_detected = phone_data.get("phone_detected", False)
        confidence = phone_data.get("confidence", 0.0)
        detection_method = phone_data.get("detection_method", "basic")

        if phone_detected:
            # Increase confidence if using advanced detection
            if detection_method == "advanced":
                confidence = max(confidence, 0.9)  # Higher confidence with advanced detection
                
            violation = ViolationEvent(
                violation_type=ViolationType.PHONE_DETECTED,
                severity=self.violation_thresholds[ViolationType.PHONE_DETECTED]["severity"],
                confidence=confidence,
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description="Phone detected during exam",
                metadata={**phone_data, "detection_method": detection_method},
                trust_score_impact=self.violation_thresholds[ViolationType.PHONE_DETECTED]["trust_score_impact"]
            )
            violations.append(violation)

        return violations
        
    async def _detect_object_violations(self, session_id: int, user_id: int, object_data: Dict[str, Any]) -> List[ViolationEvent]:
        """Detect violations from advanced object detection"""
        violations = []
        
        # Get object counts
        book_count = object_data.get("book_count", 0)
        laptop_count = object_data.get("laptop_count", 0)
        
        # Get all detected objects
        objects = object_data.get("objects", [])
        
        # Check for books
        if book_count > 0:
            violation = ViolationEvent(
                violation_type=ViolationType.BOOK_DETECTED,
                severity=self.violation_thresholds[ViolationType.BOOK_DETECTED]["severity"],
                confidence=0.85,  # Default confidence for book detection
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description=f"Book detected during exam: {book_count} found",
                metadata={"book_count": book_count, "detection_method": "advanced"},
                trust_score_impact=self.violation_thresholds[ViolationType.BOOK_DETECTED]["trust_score_impact"]
            )
            violations.append(violation)
            
        # Check for laptops
        if laptop_count > 0:
            violation = ViolationEvent(
                violation_type=ViolationType.LAPTOP_DETECTED,
                severity=self.violation_thresholds[ViolationType.LAPTOP_DETECTED]["severity"],
                confidence=0.9,  # Default confidence for laptop detection
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description=f"Laptop detected during exam: {laptop_count} found",
                metadata={"laptop_count": laptop_count, "detection_method": "advanced"},
                trust_score_impact=self.violation_thresholds[ViolationType.LAPTOP_DETECTED]["trust_score_impact"]
            )
            violations.append(violation)
            
        # Check for other unauthorized objects
        unauthorized_objects = []
        for obj in objects:
            label = obj.get("label")
            # Skip already handled objects and common/expected objects
            if label in ["person", "cell phone", "book", "laptop"] or not label:
                continue
                
            # Add to unauthorized objects list
            unauthorized_objects.append({
                "label": label,
                "confidence": obj.get("confidence", 0.0)
            })
        
        # Create violation for unauthorized objects
        if unauthorized_objects:
            violation = ViolationEvent(
                violation_type=ViolationType.UNAUTHORIZED_OBJECT,
                severity=self.violation_thresholds[ViolationType.UNAUTHORIZED_OBJECT]["severity"],
                confidence=0.8,  # Default confidence for unauthorized objects
                timestamp=datetime.utcnow(),
                session_id=session_id,
                user_id=user_id,
                description=f"Unauthorized objects detected: {', '.join([obj['label'] for obj in unauthorized_objects])}",
                metadata={"unauthorized_objects": unauthorized_objects, "detection_method": "advanced"},
                trust_score_impact=self.violation_thresholds[ViolationType.UNAUTHORIZED_OBJECT]["trust_score_impact"]
            )
            violations.append(violation)
            
        return violations

    async def _process_violation(self, violation: ViolationEvent):
        """Process a detected violation"""
        try:
            # Track violation in session
            if violation.session_id not in self.session_violations:
                self.session_violations[violation.session_id] = []

            self.session_violations[violation.session_id].append(violation)

            # Create alert in database
            await alert_service.create_alert(
                exam_session_id=violation.session_id,
                alert_type=AlertType.VIOLATION,
                severity=violation.severity,
                description=violation.description,
                trust_score_impact=violation.trust_score_impact,
                alert_metadata=violation.metadata
            )

            # Send real-time notification
            await self._send_real_time_notification(violation)

            logger.info(f"Processed violation: {violation.violation_type.value} for session {violation.session_id}")

        except Exception as e:
            logger.error(f"Error processing violation: {e}")

    async def _send_real_time_notification(self, violation: ViolationEvent):
        """Send real-time notification about violation"""
        try:
            notification_data = {
                "type": "violation_detected",
                "violation_type": violation.violation_type.value,
                "severity": violation.severity.value,
                "description": violation.description,
                "timestamp": violation.timestamp.isoformat(),
                "session_id": violation.session_id,
                "user_id": violation.user_id,
                "confidence": violation.confidence,
                "trust_score_impact": violation.trust_score_impact
            }

            # Send to proctors monitoring this session
            await self.websocket_manager.send_to_proctors(
                violation.session_id,
                json.dumps(notification_data)
            )

            # Send to admin dashboard
            await self.websocket_manager.send_to_admins(
                json.dumps(notification_data)
            )

        except Exception as e:
            logger.error(f"Error sending real-time notification: {e}")

    def get_session_violations(self, session_id: int) -> List[ViolationEvent]:
        """Get all violations for a session"""
        return self.session_violations.get(session_id, [])

    def get_violation_summary(self, session_id: int) -> Dict[str, Any]:
        """Get violation summary for a session"""
        violations = self.get_session_violations(session_id)

        summary = {
            "total_violations": len(violations),
            "by_type": {},
            "by_severity": {},
            "total_trust_score_impact": 0.0
        }

        for violation in violations:
            # Count by type
            violation_type = violation.violation_type.value
            summary["by_type"][violation_type] = summary["by_type"].get(violation_type, 0) + 1

            # Count by severity
            severity = violation.severity.value
            summary["by_severity"][severity] = summary["by_severity"].get(severity, 0) + 1

            # Sum trust score impact
            summary["total_trust_score_impact"] += violation.trust_score_impact

        return summary

# Global instance
violation_detection_service = ViolationDetectionService()
