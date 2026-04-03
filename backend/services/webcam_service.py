"""
Webcam Detection Service
Handles real-time webcam deepfake detection via WebSocket.
Passes full frames to the model for proper face-in-context analysis.
"""

import logging
import numpy as np
from typing import Dict
from models.deepfake_model import DeepfakeModel
from utils.face_detector import face_detector

logger = logging.getLogger(__name__)


class WebcamService:
    """Service for real-time webcam deepfake detection."""

    def __init__(self):
        self.model = DeepfakeModel()
        self.frame_count = 0

    async def initialize(self):
        """Initialize the model."""
        await self.model.initialize()
        face_detector.initialize()

    async def detect(self, data: dict) -> Dict:
        """
        Process a single webcam frame for deepfake detection.
        
        The FULL frame is passed to the deepfake model so it can
        analyze face-in-context (face boundary vs background,
        color mismatch, noise inconsistency, etc).
        """
        frame = data.get("frame")

        if frame is None:
            return {
                "error": "No frame data",
                "prediction": "Unknown",
                "confidence": 0.0
            }

        self.frame_count += 1

        # Detect faces for bounding box overlay on the frontend
        faces = face_detector.detect_faces(frame)
        num_faces = len(faces)

        if num_faces > 0:
            # Pass the FULL frame to the model — it needs face-in-context
            # to compare face region vs surrounding area
            result = await self.model.predict_frame(frame)

            # For a REAL person on a live webcam:
            # - The face is genuine (no manipulation)
            # - Face boundary is natural
            # - Noise is consistent
            # - Colors match between face and surroundings
            # Result should be: Real with high confidence

            result["faces_detected"] = num_faces
            result["face_locations"] = faces
        else:
            # No face detected — can't do deepfake analysis
            result = {
                "prediction": "No Face",
                "confidence": 0.0,
                "deepfake_probability": 0.0,
                "real_probability": 1.0,
                "faces_detected": 0,
                "face_locations": [],
                "model": "forensic-face-analysis",
            }

        # Add metadata
        result["frame"] = self.frame_count
        result["detection_type"] = "webcam"

        return result

    def reset(self):
        """Reset frame counter."""
        self.frame_count = 0
