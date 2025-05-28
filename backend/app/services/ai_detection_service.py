"""
AI Detection Service for 360° Proctor
Handles AI-powered detection of violations using computer vision
"""

import cv2
import numpy as np
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
import base64
import io
from PIL import Image

logger = logging.getLogger(__name__)

class AIDetectionService:
    """Service for AI-powered violation detection"""
    
    def __init__(self):
        self.face_cascade = None
        self.eye_cascade = None
        self.initialize_detectors()
    
    def initialize_detectors(self):
        """Initialize OpenCV detectors"""
        try:
            # Load Haar cascades for face and eye detection
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            logger.info("AI detectors initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing AI detectors: {e}")
    
    def process_frame(self, frame_data: str) -> Dict[str, Any]:
        """Process a video frame for violations"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(frame_data.split(',')[1])
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "face_detection": self.detect_faces(frame),
                "eye_tracking": self.detect_eyes(frame),
                "motion_analysis": self.analyze_motion(frame),
                "frame_quality": self.assess_frame_quality(frame)
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def detect_faces(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect faces in the frame"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30)
            )
            
            face_data = {
                "faces_detected": len(faces),
                "confidence": 0.9 if len(faces) > 0 else 0.1,
                "face_positions": [],
                "face_sizes": []
            }
            
            for (x, y, w, h) in faces:
                face_data["face_positions"].append({"x": int(x), "y": int(y)})
                face_data["face_sizes"].append({"width": int(w), "height": int(h)})
            
            # Analyze face positioning
            if len(faces) == 1:
                face_data["face_centered"] = self.is_face_centered(faces[0], frame.shape)
                face_data["face_size_appropriate"] = self.is_face_size_appropriate(faces[0], frame.shape)
            
            return face_data
            
        except Exception as e:
            logger.error(f"Error in face detection: {e}")
            return {"faces_detected": 0, "confidence": 0.0, "error": str(e)}
    
    def detect_eyes(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect eyes and analyze gaze direction"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            eyes = self.eye_cascade.detectMultiScale(gray, 1.1, 5)
            
            eye_data = {
                "eyes_detected": len(eyes),
                "confidence": 0.8 if len(eyes) >= 2 else 0.3,
                "looking_away": False,
                "eye_positions": []
            }
            
            for (x, y, w, h) in eyes:
                eye_data["eye_positions"].append({
                    "x": int(x), "y": int(y), 
                    "width": int(w), "height": int(h)
                })
            
            # Simple gaze analysis based on eye positions
            if len(eyes) >= 2:
                eye_data["looking_away"] = self.analyze_gaze_direction(eyes, frame.shape)
            
            return eye_data
            
        except Exception as e:
            logger.error(f"Error in eye detection: {e}")
            return {"eyes_detected": 0, "confidence": 0.0, "looking_away": True, "error": str(e)}
    
    def analyze_motion(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze motion in the frame"""
        try:
            # Simple motion analysis using frame differences
            # In a real implementation, this would compare with previous frames
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate frame statistics for motion detection
            mean_intensity = np.mean(gray)
            std_intensity = np.std(gray)
            
            motion_data = {
                "motion_detected": False,
                "motion_intensity": float(std_intensity),
                "frame_stability": "stable" if std_intensity < 50 else "unstable",
                "confidence": 0.7
            }
            
            # Simple motion threshold
            if std_intensity > 60:
                motion_data["motion_detected"] = True
                motion_data["motion_type"] = "high_movement"
            
            return motion_data
            
        except Exception as e:
            logger.error(f"Error in motion analysis: {e}")
            return {"motion_detected": False, "confidence": 0.0, "error": str(e)}
    
    def assess_frame_quality(self, frame: np.ndarray) -> Dict[str, Any]:
        """Assess the quality of the frame"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate various quality metrics
            brightness = np.mean(gray)
            contrast = np.std(gray)
            
            # Simple blur detection using Laplacian variance
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            quality_data = {
                "brightness": float(brightness),
                "contrast": float(contrast),
                "blur_score": float(blur_score),
                "is_blurry": blur_score < 100,
                "is_too_dark": brightness < 50,
                "is_too_bright": brightness > 200,
                "overall_quality": "good"
            }
            
            # Determine overall quality
            if quality_data["is_blurry"] or quality_data["is_too_dark"] or quality_data["is_too_bright"]:
                quality_data["overall_quality"] = "poor"
            elif brightness < 80 or contrast < 30:
                quality_data["overall_quality"] = "fair"
            
            return quality_data
            
        except Exception as e:
            logger.error(f"Error in quality assessment: {e}")
            return {"overall_quality": "unknown", "error": str(e)}
    
    def is_face_centered(self, face: Tuple[int, int, int, int], frame_shape: Tuple[int, int, int]) -> bool:
        """Check if face is centered in the frame"""
        x, y, w, h = face
        frame_height, frame_width = frame_shape[:2]
        
        face_center_x = x + w // 2
        face_center_y = y + h // 2
        
        frame_center_x = frame_width // 2
        frame_center_y = frame_height // 2
        
        # Allow 25% deviation from center
        x_threshold = frame_width * 0.25
        y_threshold = frame_height * 0.25
        
        return (abs(face_center_x - frame_center_x) < x_threshold and 
                abs(face_center_y - frame_center_y) < y_threshold)
    
    def is_face_size_appropriate(self, face: Tuple[int, int, int, int], frame_shape: Tuple[int, int, int]) -> bool:
        """Check if face size is appropriate"""
        x, y, w, h = face
        frame_height, frame_width = frame_shape[:2]
        
        face_area = w * h
        frame_area = frame_width * frame_height
        
        face_ratio = face_area / frame_area
        
        # Face should be between 5% and 40% of frame
        return 0.05 <= face_ratio <= 0.40
    
    def analyze_gaze_direction(self, eyes: np.ndarray, frame_shape: Tuple[int, int, int]) -> bool:
        """Analyze if person is looking away"""
        if len(eyes) < 2:
            return True
        
        # Simple gaze analysis based on eye positions
        frame_height, frame_width = frame_shape[:2]
        frame_center_x = frame_width // 2
        
        # Calculate average eye position
        avg_eye_x = np.mean([eye[0] + eye[2]//2 for eye in eyes])
        
        # If eyes are significantly off-center, person might be looking away
        deviation = abs(avg_eye_x - frame_center_x) / frame_width
        
        return deviation > 0.3  # 30% deviation threshold
    
    def detect_phone_usage(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect potential phone usage (simplified)"""
        try:
            # This is a simplified implementation
            # In practice, you'd use more sophisticated object detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Look for rectangular objects that might be phones
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            phone_candidates = 0
            for contour in contours:
                area = cv2.contourArea(contour)
                if 1000 < area < 10000:  # Phone-like size
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = w / h
                    if 0.4 < aspect_ratio < 0.8:  # Phone-like aspect ratio
                        phone_candidates += 1
            
            return {
                "phone_detected": phone_candidates > 0,
                "confidence": 0.6 if phone_candidates > 0 else 0.9,
                "candidates_found": phone_candidates
            }
            
        except Exception as e:
            logger.error(f"Error in phone detection: {e}")
            return {"phone_detected": False, "confidence": 0.0, "error": str(e)}
    
    def analyze_audio_data(self, audio_data: bytes) -> Dict[str, Any]:
        """Analyze audio for speech detection"""
        try:
            # This is a placeholder for audio analysis
            # In practice, you'd use speech recognition libraries
            
            # Simple volume-based detection
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            volume = np.sqrt(np.mean(audio_array**2))
            
            return {
                "audio_detected": volume > 1000,  # Threshold for speech
                "volume_level": float(volume),
                "confidence": 0.7,
                "speech_detected": volume > 2000
            }
            
        except Exception as e:
            logger.error(f"Error in audio analysis: {e}")
            return {"audio_detected": False, "confidence": 0.0, "error": str(e)}

# Global instance
ai_detection_service = AIDetectionService()
