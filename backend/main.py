"""
DeepGuard AI - Main FastAPI Application
Real-Time Fake News & Deepfake Detection System
"""

import logging
import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import db
from backend.model_router import model_router
from backend.routes import text_routes, image_routes, video_routes, webcam_routes
from websocket.websocket_handler import websocket_endpoint

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    # Startup
    logger.info("🚀 Starting DeepGuard AI...")
    
    # Connect database
    await db.connect()
    
    # Initialize models
    logger.info("🧠 Loading AI models...")
    await model_router.initialize()
    
    logger.info("✅ DeepGuard AI is ready!")
    
    yield
    
    # Shutdown
    logger.info("🔌 Shutting down...")
    await db.disconnect()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI system for detecting fake news, deepfake videos, "
                "manipulated images, and real-time webcam deepfakes with explainable AI outputs.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(text_routes.router, prefix="/api")
app.include_router(image_routes.router, prefix="/api")
app.include_router(video_routes.router, prefix="/api")
app.include_router(webcam_routes.router, prefix="/api")


# WebSocket endpoint
@app.websocket("/ws/webcam")
async def ws_webcam(websocket: WebSocket):
    """Real-time webcam deepfake detection via WebSocket."""
    await websocket_endpoint(websocket)


# Health check
@app.get("/api/health")
async def health_check():
    """System health check."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "models_loaded": model_router._initialized,
        "database_connected": db.client is not None
    }


# Results endpoint
@app.get("/api/results/{result_id}")
async def get_result(result_id: str):
    """Retrieve a detection result by ID."""
    result = await db.get_result(result_id)
    if result:
        return result
    return {"error": "Result not found", "id": result_id}


# Detection history
@app.get("/api/history")
async def get_history(limit: int = 50):
    """Get recent detection history."""
    history = await db.get_detection_history(limit=limit)
    return {"history": history, "count": len(history)}


# Confidence aggregation endpoint
@app.post("/api/aggregate")
async def aggregate_scores(scores: dict):
    """Aggregate multiple detection scores."""
    from backend.confidence_service import confidence_aggregator
    result = confidence_aggregator.aggregate(scores)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
