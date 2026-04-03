"""
Application Configuration
Centralized configuration for the deepfake detection system.
"""

import os
from pathlib import Path


class Settings:
    """Application settings loaded from environment variables with defaults."""
    
    # App
    APP_NAME: str = "DeepGuard AI - Fake News & Deepfake Detection"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://*.onrender.com",
    ]
    
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "deepguard_db")
    
    # File Upload
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/webp", "image/bmp"]
    ALLOWED_VIDEO_TYPES: list = ["video/mp4", "video/avi", "video/mov", "video/webm", "video/x-msvideo"]
    
    # Models
    MODEL_DIR: Path = BASE_DIR / "model_weights"
    FAKE_NEWS_MODEL_NAME: str = "distilbert-base-uncased"
    IMAGE_MODEL_NAME: str = "efficientnet"
    VIDEO_MODEL_NAME: str = "deepfake_cnn"
    
    # Processing
    VIDEO_FRAME_SAMPLE_RATE: int = 10  # Extract every Nth frame
    MAX_FRAMES_PER_VIDEO: int = 100
    WEBCAM_FRAME_INTERVAL_MS: int = 500
    FACE_DETECTION_CONFIDENCE: float = 0.5
    
    # Confidence thresholds
    FAKE_THRESHOLD: float = 0.5
    HIGH_CONFIDENCE_THRESHOLD: float = 0.8
    
    def __init__(self):
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.MODEL_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
