"""
Webcam Detection Routes
WebSocket endpoint for real-time webcam deepfake detection.
"""

import logging
from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/detect", tags=["Webcam Detection"])


@router.get("/webcam/status")
async def webcam_status():
    """Check if webcam detection service is available."""
    return {
        "status": "available",
        "websocket_url": "/ws/webcam",
        "instructions": "Connect via WebSocket and send base64-encoded frames"
    }
