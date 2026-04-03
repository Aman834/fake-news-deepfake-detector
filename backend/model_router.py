"""
Model Router
Routes detection requests to the appropriate AI model service.
"""

import logging
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class DetectionType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    WEBCAM = "webcam"


class ModelRouter:
    """Routes incoming detection requests to the appropriate model service."""
    
    def __init__(self):
        self._services = {}
        self._initialized = False
    
    async def initialize(self):
        """Lazy-load and initialize all model services."""
        if self._initialized:
            return
        
        from backend.services.text_detection_service import TextDetectionService
        from backend.services.image_detection_service import ImageDetectionService
        from backend.services.video_detection_service import VideoDetectionService
        from backend.services.webcam_service import WebcamService
        
        self._services = {
            DetectionType.TEXT: TextDetectionService(),
            DetectionType.IMAGE: ImageDetectionService(),
            DetectionType.VIDEO: VideoDetectionService(),
            DetectionType.WEBCAM: WebcamService(),
        }
        
        # Initialize each service
        for dtype, service in self._services.items():
            try:
                await service.initialize()
                logger.info(f"✅ {dtype.value} detection service initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize {dtype.value} service: {e}")
        
        self._initialized = True
        logger.info("🚀 Model Router fully initialized")
    
    async def route(self, detection_type: DetectionType, data: Any) -> dict:
        """Route a detection request to the appropriate service."""
        if not self._initialized:
            await self.initialize()
        
        service = self._services.get(detection_type)
        if not service:
            raise ValueError(f"Unknown detection type: {detection_type}")
        
        logger.info(f"🔄 Routing {detection_type.value} detection request")
        result = await service.detect(data)
        return result
    
    def get_service(self, detection_type: DetectionType):
        """Get a specific service instance."""
        return self._services.get(detection_type)


# Singleton router
model_router = ModelRouter()
