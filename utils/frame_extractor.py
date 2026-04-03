"""
Frame Extractor Utility
Extracts frames from video files using OpenCV.
"""

import logging
import cv2
import numpy as np
from pathlib import Path
from typing import List, Optional, Tuple

from backend.config import settings

logger = logging.getLogger(__name__)


class FrameExtractor:
    """Extract frames from video files for analysis."""
    
    def __init__(
        self,
        sample_rate: int = None,
        max_frames: int = None,
        target_size: Optional[Tuple[int, int]] = None
    ):
        self.sample_rate = sample_rate or settings.VIDEO_FRAME_SAMPLE_RATE
        self.max_frames = max_frames or settings.MAX_FRAMES_PER_VIDEO
        self.target_size = target_size
    
    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Extract frames from a video file.
        
        Args:
            video_path: Path to the video file.
        
        Returns:
            List of frames as numpy arrays (BGR format).
        """
        frames = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            logger.error(f"Cannot open video: {video_path}")
            return frames
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        logger.info(f"📹 Video: {total_frames} frames, {fps:.1f} FPS, {width}x{height}")
        
        # Calculate actual sample rate to stay within max_frames
        effective_rate = max(self.sample_rate, total_frames // self.max_frames) if total_frames > 0 else self.sample_rate
        
        frame_idx = 0
        while cap.isOpened() and len(frames) < self.max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % effective_rate == 0:
                if self.target_size:
                    frame = cv2.resize(frame, self.target_size)
                frames.append(frame)
            
            frame_idx += 1
        
        cap.release()
        logger.info(f"📷 Extracted {len(frames)} frames from {frame_idx} total")
        return frames
    
    def get_video_info(self, video_path: str) -> dict:
        """Get metadata about a video file."""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            return {"error": "Cannot open video"}
        
        info = {
            "total_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "fps": float(cap.get(cv2.CAP_PROP_FPS)),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "duration_seconds": 0.0
        }
        
        if info["fps"] > 0:
            info["duration_seconds"] = round(info["total_frames"] / info["fps"], 2)
        
        cap.release()
        return info
    
    @staticmethod
    def decode_frame_bytes(frame_bytes: bytes) -> Optional[np.ndarray]:
        """Decode a frame from bytes (e.g., from WebSocket)."""
        try:
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            logger.error(f"Frame decode error: {e}")
            return None


frame_extractor = FrameExtractor()
