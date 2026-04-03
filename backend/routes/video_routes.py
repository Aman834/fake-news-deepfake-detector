"""
Video Detection Routes
POST /detect/video - Analyze videos for deepfakes.
"""

import logging
import os
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, File

from backend.model_router import model_router, DetectionType
from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/detect", tags=["Video Detection"])


@router.post("/video")
async def detect_deepfake_video(file: UploadFile = File(...)):
    """
    Analyze a video for deepfake content.
    
    - Accepts MP4, AVI, MOV, WebM videos (up to 100MB)
    - Extracts key frames and analyzes each for manipulation
    - Returns frame-level and video-level predictions
    - Provides confidence scoring with temporal aggregation
    """
    try:
        # Validate file type
        content_type = file.content_type or ""
        if content_type not in settings.ALLOWED_VIDEO_TYPES and not file.filename.endswith(
            ('.mp4', '.avi', '.mov', '.webm')
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported video type: {content_type}. "
                       f"Allowed: {settings.ALLOWED_VIDEO_TYPES}"
            )
        
        # Save video to temp file
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1] or ".mp4"
        video_path = str(settings.UPLOAD_DIR / f"{file_id}{ext}")
        
        # Stream file to disk
        async with aiofiles.open(video_path, "wb") as f:
            content = await file.read()
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 100MB)")
            await f.write(content)
        
        logger.info(f"📁 Video saved: {video_path}")
        
        # Run detection
        result = await model_router.route(
            DetectionType.VIDEO,
            {"video_path": video_path}
        )
        
        # Cleanup uploaded file
        try:
            os.remove(video_path)
        except Exception:
            pass
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Video detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
