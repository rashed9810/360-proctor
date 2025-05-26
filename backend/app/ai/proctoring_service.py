import base64
import cv2
import numpy as np
import os
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import asyncio
import logging

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models.exam import Alert, AlertType, AlertSeverity, ExamSession
from app.services import alert_service, exam_session_service
from app.schemas.alert import AlertCreate

logger = logging.getLogger(__name__)


class ProctorService:
    def __init__(self):
        # Initialize face detection model
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

        # Create directory for screenshots if it doesn't exist
        os.makedirs("static/screenshots", exist_ok=True)

    async def process_frame(self, data: Dict[str, Any], session_id: int, user_id: int) -> Dict[str, Any]:
        """
        Process a frame from the client
        """
        # Get the frame data
        frame_data = data.get("frame")
        audio_data = data.get("audio")
        tab_active = data.get("tab_active", True)

        # Get the exam session
        db = SessionLocal()
        try:
            session = exam_session_service.get(db, id=session_id)
            if not session or session.is_completed:
                return {"error": "Invalid or completed session"}

            # Process the frame if available
            alerts = []
            trust_score = 1.0

            if frame_data:
                # Convert base64 to image
                frame = self._base64_to_image(frame_data)

                # Run face detection
                face_result = self._detect_faces(frame, session)
                if face_result["alerts"]:
                    alerts.extend(face_result["alerts"])
                    trust_score -= sum(alert["trust_score_impact"] for alert in face_result["alerts"])

                # Run eye tracking if face is detected
                if face_result["faces"] and session.exam.enable_eye_tracking:
                    eye_result = self._track_eyes(frame, face_result["faces"])
                    if eye_result["alerts"]:
                        alerts.extend(eye_result["alerts"])
                        trust_score -= sum(alert["trust_score_impact"] for alert in eye_result["alerts"])

            # Check tab switching
            if not tab_active and session.exam.enable_tab_switch_detection:
                tab_alert = {
                    "alert_type": AlertType.TAB_SWITCH,
                    "severity": AlertSeverity.WARNING,
                    "description": "Tab switching detected",
                    "trust_score_impact": 0.05
                }
                alerts.append(tab_alert)
                trust_score -= tab_alert["trust_score_impact"]

            # Process audio if available
            if audio_data and session.exam.enable_audio_detection:
                # In a real implementation, you would analyze the audio here
                # For now, we'll just simulate detection
                if self._simulate_audio_detection():
                    audio_alert = {
                        "alert_type": AlertType.AUDIO_DETECTED,
                        "severity": AlertSeverity.WARNING,
                        "description": "Voice detected",
                        "trust_score_impact": 0.03
                    }
                    alerts.append(audio_alert)
                    trust_score -= audio_alert["trust_score_impact"]

            # Save alerts to database if any
            if alerts:
                screenshot_path = None
                if frame_data:
                    # Save screenshot for evidence
                    timestamp = int(time.time())
                    screenshot_path = f"static/screenshots/session_{session_id}_{timestamp}.jpg"
                    cv2.imwrite(screenshot_path, frame)

                for alert in alerts:
                    alert_obj = AlertCreate(
                        exam_session_id=session_id,
                        alert_type=alert["alert_type"],
                        severity=alert["severity"],
                        description=alert["description"],
                        screenshot_path=screenshot_path,
                        trust_score_impact=alert["trust_score_impact"]
                    )
                    alert_service.create(db, obj_in=alert_obj)

            # Ensure trust score is between 0 and 1
            trust_score = max(0, min(1, trust_score))

            return {
                "session_id": session_id,
                "trust_score": trust_score,
                "alerts": alerts,
                "timestamp": datetime.utcnow().isoformat()
            }

        finally:
            db.close()

    def _base64_to_image(self, base64_str: str) -> np.ndarray:
        """
        Convert base64 string to OpenCV image
        """
        # Remove data URL prefix if present
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]

        # Decode base64 string
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img

    def _detect_faces(self, frame: np.ndarray, session: ExamSession) -> Dict[str, Any]:
        """
        Detect faces in the frame
        """
        result = {
            "faces": [],
            "alerts": []
        }

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # Check if face is detected
        if len(faces) == 0 and session.exam.enable_face_detection:
            result["alerts"].append({
                "alert_type": AlertType.FACE_NOT_DETECTED,
                "severity": AlertSeverity.WARNING,
                "description": "No face detected",
                "trust_score_impact": 0.1
            })
        # Check if multiple faces are detected
        elif len(faces) > 1 and session.exam.enable_multiple_face_detection:
            result["alerts"].append({
                "alert_type": AlertType.MULTIPLE_FACES,
                "severity": AlertSeverity.CRITICAL,
                "description": f"{len(faces)} faces detected",
                "trust_score_impact": 0.2
            })

        result["faces"] = faces
        return result

    def _track_eyes(self, frame: np.ndarray, faces: List) -> Dict[str, Any]:
        """
        Track eyes and detect if looking away
        """
        result = {
            "looking_away": False,
            "alerts": []
        }

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # For each face, detect eyes
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]

            # Detect eyes
            eyes = self.eye_cascade.detectMultiScale(roi_gray)

            # If eyes are not detected, the person might be looking away
            if len(eyes) < 2:
                result["looking_away"] = True
                result["alerts"].append({
                    "alert_type": AlertType.LOOKING_AWAY,
                    "severity": AlertSeverity.WARNING,
                    "description": "Looking away from screen",
                    "trust_score_impact": 0.05
                })

        return result

    async def process_audio(self, audio_data: str, session_id: int, user_id: int) -> Dict[str, Any]:
        """
        Process audio data for speech detection and analysis
        """
        db = SessionLocal()
        try:
            session = exam_session_service.get(db, id=session_id)
            if not session or session.is_completed:
                return {"error": "Invalid or completed session"}

            # Mock audio analysis results
            result = {
                "session_id": session_id,
                "audio_detected": False,
                "speech_detected": False,
                "noise_level": 0.0,
                "confidence": 0.0,
                "alerts": [],
                "timestamp": datetime.utcnow().isoformat()
            }

            # Simulate audio analysis
            if self._simulate_audio_detection():
                result["audio_detected"] = True
                result["noise_level"] = np.random.uniform(0.3, 0.8)
                result["confidence"] = np.random.uniform(0.7, 0.95)

                # Check if speech is detected
                if np.random.random() < 0.6:  # 60% chance of speech when audio is detected
                    result["speech_detected"] = True
                    alert = {
                        "alert_type": AlertType.AUDIO_DETECTED,
                        "severity": AlertSeverity.WARNING,
                        "description": "Speech detected during exam",
                        "trust_score_impact": 0.08
                    }
                    result["alerts"].append(alert)

                    # Save alert to database
                    alert_obj = AlertCreate(
                        exam_session_id=session_id,
                        alert_type=alert["alert_type"],
                        severity=alert["severity"],
                        description=alert["description"],
                        trust_score_impact=alert["trust_score_impact"]
                    )
                    alert_service.create(db, obj_in=alert_obj)

            return result

        finally:
            db.close()

    def _simulate_audio_detection(self) -> bool:
        """
        Simulate audio detection (in a real app, this would analyze audio)
        """
        # Randomly detect audio 10% of the time for simulation
        return np.random.random() < 0.1
