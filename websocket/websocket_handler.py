"""
WebSocket Handler
Manages real-time webcam streaming for deepfake detection.
"""

import logging
import json
import base64
import asyncio
import numpy as np
import cv2
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

from backend.model_router import model_router, DetectionType

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections for real-time detection."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"🔌 WebSocket connected. Active: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"🔌 WebSocket disconnected. Active: {len(self.active_connections)}")
    
    async def send_result(self, websocket: WebSocket, data: dict):
        """Send detection result to a client."""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.error(f"WS send error: {e}")
    
    async def broadcast(self, data: dict):
        """Broadcast to all connected clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)


ws_manager = WebSocketManager()


async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time webcam deepfake detection.
    
    Protocol:
    1. Client connects via WebSocket
    2. Client sends frames as base64-encoded JPEG/PNG
    3. Server processes each frame through the deepfake model
    4. Server sends back JSON prediction for each frame
    """
    await ws_manager.connect(websocket)
    
    try:
        # Initialize model router if needed
        if not model_router._initialized:
            await model_router.initialize()
        
        frame_count = 0
        
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                frame_data = message.get("frame", "")
                
                # Decode base64 frame
                if "," in frame_data:
                    frame_data = frame_data.split(",")[1]  # Remove data URL prefix
                
                frame_bytes = base64.b64decode(frame_data)
                
                # Convert to numpy array
                nparr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    await ws_manager.send_result(websocket, {
                        "error": "Could not decode frame",
                        "frame": frame_count
                    })
                    continue
                
                frame_count += 1
                
                # Run detection
                result = await model_router.route(
                    DetectionType.WEBCAM,
                    {"frame": frame}
                )
                
                result["frame"] = frame_count
                
                # Send result back
                await ws_manager.send_result(websocket, result)
                
            except json.JSONDecodeError:
                await ws_manager.send_result(websocket, {
                    "error": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Frame processing error: {e}")
                await ws_manager.send_result(websocket, {
                    "error": str(e),
                    "frame": frame_count
                })
    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info("Client disconnected from webcam stream")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
