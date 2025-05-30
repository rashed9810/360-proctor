"""
Advanced Object Detection Service for 360° Proctor
Implements YOLO-based object detection for improved accuracy
"""

import cv2
import numpy as np
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
import base64
import io
from PIL import Image
import os
import urllib.request

logger = logging.getLogger(__name__)

class AdvancedObjectDetectionService:
    """Service for advanced object detection using YOLO"""
    
    def __init__(self):
        self.model = None
        self.classes = None
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize YOLO model for object detection"""
        try:
            # Define model paths
            model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ai", "models")
            os.makedirs(model_dir, exist_ok=True)
            
            # Model files
            config_path = os.path.join(model_dir, "yolov3.cfg")
            weights_path = os.path.join(model_dir, "yolov3.weights")
            classes_path = os.path.join(model_dir, "coco.names")
            
            # Download model files if they don't exist
            if not os.path.exists(config_path):
                urllib.request.urlretrieve("https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg", config_path)
            
            if not os.path.exists(weights_path):
                urllib.request.urlretrieve("https://pjreddie.com/media/files/yolov3.weights", weights_path)
            
            if not os.path.exists(classes_path):
                urllib.request.urlretrieve("https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names", classes_path)
            
            # Load YOLO model
            self.model = cv2.dnn.readNetFromDarknet(config_path, weights_path)
            
            # Use GPU if available
            try:
                self.model.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
                self.model.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
                logger.info("Using CUDA for YOLO inference")
            except:
                logger.info("CUDA not available, using CPU for YOLO inference")
            
            # Load class names
            with open(classes_path, 'r') as f:
                self.classes = [line.strip() for line in f.readlines()]
            
            logger.info("Advanced object detection model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing advanced object detection model: {e}")
            # Fallback to a mock model if initialization fails
            self.model = None
            self.classes = ["person", "cell phone", "book", "laptop"]
    
    def detect_objects(self, frame: np.ndarray, confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """Detect objects in the frame using YOLO"""
        try:
            if self.model is None:
                return self._mock_detection_results()
            
            height, width = frame.shape[:2]
            
            # Create a blob from the image
            blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
            
            # Set the input to the model
            self.model.setInput(blob)
            
            # Get output layer names
            layer_names = self.model.getLayerNames()
            output_layers = [layer_names[i - 1] for i in self.model.getUnconnectedOutLayers()]
            
            # Forward pass through the network
            outputs = self.model.forward(output_layers)
            
            # Process the outputs
            boxes = []
            confidences = []
            class_ids = []
            
            for output in outputs:
                for detection in output:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]
                    
                    if confidence > confidence_threshold:
                        # Scale the bounding box coordinates back to the original image size
                        box = detection[0:4] * np.array([width, height, width, height])
                        (center_x, center_y, box_width, box_height) = box.astype("int")
                        
                        # Calculate the top-left corner of the bounding box
                        x = int(center_x - (box_width / 2))
                        y = int(center_y - (box_height / 2))
                        
                        boxes.append([x, y, int(box_width), int(box_height)])
                        confidences.append(float(confidence))
                        class_ids.append(class_id)
            
            # Apply non-maximum suppression to remove overlapping bounding boxes
            indices = cv2.dnn.NMSBoxes(boxes, confidences, confidence_threshold, 0.4)
            
            # Prepare results
            detected_objects = []
            person_count = 0
            phone_count = 0
            book_count = 0
            laptop_count = 0
            
            if len(indices) > 0:
                for i in indices.flatten():
                    x, y, w, h = boxes[i]
                    label = str(self.classes[class_ids[i]])
                    confidence = confidences[i]
                    
                    detected_objects.append({
                        "label": label,
                        "confidence": confidence,
                        "box": {"x": x, "y": y, "width": w, "height": h}
                    })
                    
                    # Count specific objects
                    if label == "person":
                        person_count += 1
                    elif label == "cell phone":
                        phone_count += 1
                    elif label == "book":
                        book_count += 1
                    elif label == "laptop":
                        laptop_count += 1
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "objects_detected": detected_objects,
                "person_count": person_count,
                "phone_count": phone_count,
                "book_count": book_count,
                "laptop_count": laptop_count,
                "confidence": max(confidences) if confidences else 0.0
            }
            
        except Exception as e:
            logger.error(f"Error in object detection: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def process_frame(self, frame_data: str) -> Dict[str, Any]:
        """Process a video frame for object detection"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(frame_data.split(',')[1])
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Detect objects
            detection_results = self.detect_objects(frame)
            
            return detection_results
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def detect_multiple_persons(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect if multiple persons are present in the frame"""
        try:
            detection_results = self.detect_objects(frame)
            person_count = detection_results.get("person_count", 0)
            
            return {
                "multiple_persons_detected": person_count > 1,
                "person_count": person_count,
                "confidence": detection_results.get("confidence", 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error in multiple person detection: {e}")
            return {"multiple_persons_detected": False, "person_count": 0, "confidence": 0.0, "error": str(e)}
    
    def detect_phone(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect if a phone is present in the frame"""
        try:
            detection_results = self.detect_objects(frame)
            phone_count = detection_results.get("phone_count", 0)
            
            return {
                "phone_detected": phone_count > 0,
                "phone_count": phone_count,
                "confidence": detection_results.get("confidence", 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error in phone detection: {e}")
            return {"phone_detected": False, "phone_count": 0, "confidence": 0.0, "error": str(e)}
    
    def _mock_detection_results(self) -> Dict[str, Any]:
        """Generate mock detection results when model is not available"""
        # Simulate random detections for testing
        person_count = np.random.randint(0, 3)  # 0, 1, or 2 persons
        phone_count = np.random.randint(0, 2)  # 0 or 1 phone
        
        detected_objects = []
        confidences = []
        
        # Add mock person detections
        for i in range(person_count):
            confidence = np.random.uniform(0.7, 0.95)
            confidences.append(confidence)
            detected_objects.append({
                "label": "person",
                "confidence": confidence,
                "box": {"x": 100*i, "y": 100, "width": 200, "height": 300}
            })
        
        # Add mock phone detection
        if phone_count > 0:
            confidence = np.random.uniform(0.6, 0.9)
            confidences.append(confidence)
            detected_objects.append({
                "label": "cell phone",
                "confidence": confidence,
                "box": {"x": 300, "y": 200, "width": 50, "height": 100}
            })
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "objects_detected": detected_objects,
            "person_count": person_count,
            "phone_count": phone_count,
            "book_count": 0,
            "laptop_count": 0,
            "confidence": max(confidences) if confidences else 0.0
        }

# Global instance
advanced_object_detection_service = AdvancedObjectDetectionService()