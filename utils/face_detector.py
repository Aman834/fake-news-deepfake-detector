"""
Face Detector Utility
Detects and extracts faces from images/frames using OpenCV DNN.
"""

import logging
import cv2
import numpy as np
from typing import List, Optional, Tuple

from backend.config import settings

logger = logging.getLogger(__name__)


class FaceDetector:
    """Face detection using OpenCV's Haar cascades and DNN."""
    
    def __init__(self, min_confidence: float = None):
        self.min_confidence = min_confidence or settings.FACE_DETECTION_CONFIDENCE
        self.face_cascade = None
        self._initialized = False
    
    def initialize(self):
        """Initialize face detection models."""
        if self._initialized:
            return
        
        try:
            # Use Haar cascade (always available with OpenCV)
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            
            if self.face_cascade.empty():
                logger.warning("⚠️ Haar cascade failed to load")
            else:
                logger.info("✅ Face detector initialized (Haar cascade)")
            
            self._initialized = True
        except Exception as e:
            logger.error(f"Face detector init error: {e}")
            self._initialized = True
    
    def detect_faces(self, image: np.ndarray) -> List[dict]:
        """
        Detect faces in an image.
        
        Args:
            image: BGR numpy array
        
        Returns:
            List of face detections with bounding boxes.
        """
        if not self._initialized:
            self.initialize()
        
        faces = []
        
        if self.face_cascade is not None and not self.face_cascade.empty():
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            detections = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            for (x, y, w, h) in detections:
                confidence = 0.85  # Haar doesn't provide confidence natively
                faces.append({
                    "bbox": [int(x), int(y), int(w), int(h)],
                    "confidence": confidence,
                    "center": [int(x + w // 2), int(y + h // 2)]
                })
        
        return faces
    
    def extract_faces(
        self,
        image: np.ndarray,
        padding: float = 0.2,
        target_size: Tuple[int, int] = (224, 224)
    ) -> List[np.ndarray]:
        """
        Detect and extract face regions from an image.
        
        Args:
            image: BGR numpy array
            padding: Padding ratio around detected face
            target_size: Output size for extracted faces
        
        Returns:
            List of extracted face images.
        """
        detections = self.detect_faces(image)
        face_images = []
        
        h, w = image.shape[:2]
        
        for det in detections:
            x, y, fw, fh = det["bbox"]
            
            # Add padding
            pad_w = int(fw * padding)
            pad_h = int(fh * padding)
            
            x1 = max(0, x - pad_w)
            y1 = max(0, y - pad_h)
            x2 = min(w, x + fw + pad_w)
            y2 = min(h, y + fh + pad_h)
            
            face = image[y1:y2, x1:x2]
            
            if face.size > 0:
                face_resized = cv2.resize(face, target_size)
                face_images.append(face_resized)
        
        # If no faces detected, use the whole image
        if not face_images:
            face_images.append(cv2.resize(image, target_size))
        
        return face_images
    
    def draw_detections(
        self,
        image: np.ndarray,
        detections: List[dict],
        label: str = "",
        color: Tuple[int, int, int] = (0, 255, 0)
    ) -> np.ndarray:
        """Draw bounding boxes on image."""
        img = image.copy()
        
        for det in detections:
            x, y, w, h = det["bbox"]
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
            
            if label:
                text = f"{label} {det['confidence']:.2f}"
                cv2.putText(img, text, (x, y - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        return img


face_detector = FaceDetector()
