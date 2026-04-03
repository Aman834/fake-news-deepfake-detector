"""
Database Module
MongoDB connection and operations using motor (async driver).
"""

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from bson import ObjectId

from backend.config import settings

logger = logging.getLogger(__name__)


class Database:
    """Async MongoDB database manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect(cls):
        """Establish MongoDB connection."""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            # Verify connection
            await cls.client.admin.command("ping")
            logger.info("✅ Connected to MongoDB successfully")
            # Create indexes
            await cls._create_indexes()
        except Exception as e:
            logger.warning(f"⚠️ MongoDB connection failed: {e}. Running without database.")
            cls.client = None
            cls.db = None
    
    @classmethod
    async def disconnect(cls):
        """Close MongoDB connection."""
        if cls.client:
            cls.client.close()
            logger.info("🔌 Disconnected from MongoDB")
    
    @classmethod
    async def _create_indexes(cls):
        """Create database indexes for performance."""
        if cls.db is None:
            return
        try:
            await cls.db.detections.create_index("created_at")
            await cls.db.detections.create_index("detection_type")
            await cls.db.results.create_index("detection_id")
            await cls.db.history.create_index([("user_id", 1), ("created_at", -1)])
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")
    
    @classmethod
    async def save_detection(cls, detection_data: dict) -> Optional[str]:
        """Save a detection record."""
        if cls.db is None:
            return None
        try:
            detection_data["created_at"] = datetime.now(timezone.utc)
            result = await cls.db.detections.insert_one(detection_data)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving detection: {e}")
            return None
    
    @classmethod
    async def save_result(cls, result_data: dict) -> Optional[str]:
        """Save a result record."""
        if cls.db is None:
            return None
        try:
            result_data["created_at"] = datetime.now(timezone.utc)
            result = await cls.db.results.insert_one(result_data)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving result: {e}")
            return None
    
    @classmethod
    async def get_result(cls, result_id: str) -> Optional[dict]:
        """Get a result by ID."""
        if cls.db is None:
            return None
        try:
            result = await cls.db.results.find_one({"_id": ObjectId(result_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except Exception as e:
            logger.error(f"Error fetching result: {e}")
            return None
    
    @classmethod
    async def get_detection_history(cls, limit: int = 50) -> list:
        """Get recent detection history."""
        if cls.db is None:
            return []
        try:
            cursor = cls.db.detections.find().sort("created_at", -1).limit(limit)
            results = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                results.append(doc)
            return results
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return []


db = Database()
