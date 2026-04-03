"""
Image Detection Service
Handles image manipulation detection requests.
"""

import logging
import cv2
import numpy as np
from typing import Dict
from models.image_model import ImageModel
from utils.face_detector import face_detector
from backend.database import db

logger = logging.getLogger(__name__)


class ImageDetectionService:
    """Service for processing image manipulation detection."""
    
    def __init__(self):
        self.model = ImageModel()
    
    async def initialize(self):
        """Initialize the image model."""
        await self.model.initialize()
        face_detector.initialize()
    
    async def detect(self, data: dict) -> Dict:
        """
        Detect image manipulation.
        
        Args:
            data: Dict with 'image' (numpy array) or 'image_path' (str).
        
        Returns:
            Detection result with prediction and confidence.
        """
        image = data.get("image")
        image_path = data.get("image_path")
        
        if image is None and image_path:
            image = cv2.imread(image_path)
        
        if image is None:
            return {
                "error": "No valid image provided",
                "prediction": "Unknown",
                "confidence": 0.0
            }
        
        logger.info(f"🖼️ Analyzing image ({image.shape[1]}x{image.shape[0]})")
        
        # Detect faces in image
        faces = face_detector.detect_faces(image)
        
        # Run model prediction
        result = await self.model.predict(image)
        
        # Add face detection info
        result["faces_detected"] = len(faces)
        result["face_locations"] = faces
        result["detection_type"] = "image"
        
        # If faces found, also analyze each face region
        if faces:
            face_results = []
            face_images = face_detector.extract_faces(image)
            for i, face_img in enumerate(face_images[:5]):  # Max 5 faces
                face_result = await self.model.predict(face_img)
                face_results.append({
                    "face_index": i,
                    "prediction": face_result["prediction"],
                    "confidence": face_result["confidence"]
                })
            result["face_analysis"] = face_results
        
        # Save to database
        detection_id = await db.save_result({
            "detection_type": "image",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "faces_detected": len(faces),
            "model_used": result.get("model", "unknown"),
            "image_dimensions": result.get("image_dimensions", {}),
        })
        
        if detection_id:
            result["detection_id"] = detection_id
        
        return result
