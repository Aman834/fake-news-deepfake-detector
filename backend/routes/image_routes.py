"""
Image Detection Routes
POST /detect/image - Analyze images for manipulation/deepfakes.
"""

import logging
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional

from backend.model_router import model_router, DetectionType
from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/detect", tags=["Image Detection"])


@router.post("/image")
async def detect_image_manipulation(file: UploadFile = File(...)):
    """
    Analyze an image for manipulation or deepfake content.
    
    - Accepts JPEG, PNG, WebP, BMP images
    - Detects face swaps, GAN-generated content, digital editing
    - Returns prediction with confidence score
    - Provides per-face analysis when faces are detected
    """
    try:
        # Validate file type
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image type: {file.content_type}. "
                       f"Allowed: {settings.ALLOWED_IMAGE_TYPES}"
            )
        
        # Read image
        contents = await file.read()
        
        if len(contents) > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Decode image
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
        
        # Run detection
        result = await model_router.route(
            DetectionType.IMAGE,
            {"image": image}
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
