"""
Video Detection Service
Handles deepfake video detection requests.
"""

import logging
import os
import cv2
import numpy as np
from typing import Dict
from models.deepfake_model import DeepfakeModel
from utils.frame_extractor import frame_extractor
from utils.face_detector import face_detector
from backend.database import db

logger = logging.getLogger(__name__)


class VideoDetectionService:
    """Service for processing deepfake video detection."""
    
    def __init__(self):
        self.model = DeepfakeModel()
    
    async def initialize(self):
        """Initialize the video model."""
        await self.model.initialize()
        face_detector.initialize()
    
    async def detect(self, data: dict) -> Dict:
        """
        Detect deepfake video.
        
        Args:
            data: Dict with 'video_path' (str) key.
        
        Returns:
            Detection result with frame-level analysis.
        """
        video_path = data.get("video_path")
        
        if not video_path or not os.path.exists(video_path):
            return {
                "error": "No valid video file provided",
                "prediction": "Unknown",
                "confidence": 0.0
            }
        
        logger.info(f"🎬 Analyzing video: {video_path}")
        
        # Get video info
        video_info = frame_extractor.get_video_info(video_path)
        
        # Extract frames
        frames = frame_extractor.extract_frames(video_path)
        
        if not frames:
            return {
                "error": "No frames could be extracted",
                "prediction": "Unknown",
                "confidence": 0.0
            }
        
        # Extract faces from frames (use face region if available)
        processed_frames = []
        for frame in frames:
            face_images = face_detector.extract_faces(frame, target_size=(224, 224))
            processed_frames.append(face_images[0] if face_images else frame)
        
        # Run deepfake detection on processed frames
        result = await self.model.predict_video(processed_frames)
        
        # Add video metadata
        result["detection_type"] = "video"
        result["video_info"] = video_info
        
        # Save to database
        detection_id = await db.save_result({
            "detection_type": "video",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "total_frames": result.get("total_frames_analyzed", 0),
            "fake_frame_count": result.get("fake_frame_count", 0),
            "model_used": result.get("model", "unknown"),
            "video_info": video_info,
        })
        
        if detection_id:
            result["detection_id"] = detection_id
        
        return result
