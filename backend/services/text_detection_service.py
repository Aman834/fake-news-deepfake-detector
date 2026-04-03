"""
Text Detection Service
Handles fake news detection requests.
"""

import logging
from typing import Dict
from models.fake_news_model import FakeNewsModel
from backend.database import db

logger = logging.getLogger(__name__)


class TextDetectionService:
    """Service for processing text/article fake news detection."""
    
    def __init__(self):
        self.model = FakeNewsModel()
    
    async def initialize(self):
        """Initialize the NLP model."""
        await self.model.initialize()
    
    async def detect(self, data: dict) -> Dict:
        """
        Detect fake news in text.
        
        Args:
            data: Dict with 'text' key containing the article text.
        
        Returns:
            Detection result with prediction, confidence, and analysis.
        """
        text = data.get("text", "")
        
        if not text or len(text.strip()) < 10:
            return {
                "error": "Text too short for analysis",
                "prediction": "Unknown",
                "confidence": 0.0
            }
        
        logger.info(f"📝 Analyzing text ({len(text)} characters)")
        
        # Run model prediction
        result = await self.model.predict(text)
        
        # Add metadata
        result["detection_type"] = "text"
        result["input_preview"] = text[:200] + "..." if len(text) > 200 else text
        
        # Save to database
        detection_id = await db.save_result({
            "detection_type": "text",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "input_length": len(text),
            "model_used": result.get("model", "unknown"),
            "full_result": result
        })
        
        if detection_id:
            result["detection_id"] = detection_id
        
        return result
