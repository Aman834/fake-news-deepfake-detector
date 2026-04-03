"""
Text Detection Routes
POST /detect/text - Analyze text/articles for fake news.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from backend.model_router import model_router, DetectionType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/detect", tags=["Text Detection"])


class TextDetectionRequest(BaseModel):
    """Request body for text detection."""
    text: str = Field(..., min_length=10, description="Article/text to analyze")
    title: Optional[str] = Field(None, description="Article title (optional)")


class TextDetectionResponse(BaseModel):
    """Response body for text detection."""
    prediction: str
    confidence: float
    fake_probability: Optional[float] = None
    real_probability: Optional[float] = None
    highlighted_sentences: Optional[list] = None
    attention_weights: Optional[list] = None
    model: Optional[str] = None
    text_length: Optional[int] = None
    sentence_count: Optional[int] = None
    detection_type: Optional[str] = None
    detection_id: Optional[str] = None
    input_preview: Optional[str] = None
    error: Optional[str] = None


@router.post("/text", response_model=TextDetectionResponse)
async def detect_fake_news(request: TextDetectionRequest):
    """
    Analyze text for fake news using NLP model.
    
    - Accepts news articles, social media posts, or any text
    - Returns prediction (Fake/Real), confidence score
    - Highlights suspicious sentences
    - Provides attention-based explainability
    """
    try:
        full_text = request.text
        if request.title:
            full_text = f"{request.title}. {full_text}"
        
        result = await model_router.route(
            DetectionType.TEXT,
            {"text": full_text}
        )
        
        return TextDetectionResponse(**result)
    
    except Exception as e:
        logger.error(f"Text detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
