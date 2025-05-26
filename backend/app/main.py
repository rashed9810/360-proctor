from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging
import json
from datetime import datetime
from typing import Dict, List

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.websockets.connection_manager import ConnectionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# WebSocket connection manager
connection_manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting 360° Proctor API server...")
    yield
    # Shutdown
    logger.info("Shutting down 360° Proctor API server...")

app = FastAPI(
    title="360° Proctor API",
    description="Comprehensive online exam proctoring system with AI-powered monitoring",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket endpoint for real-time communication
@app.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_type: str, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await connection_manager.connect(websocket, client_type, client_id)
    logger.info(f"WebSocket connected: {client_type}:{client_id}")

    try:
        # Send welcome message
        await connection_manager.send_personal_message(
            client_id,
            {
                "type": "connection_established",
                "message": "Connected to 360° Proctor",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                await handle_websocket_message(client_id, client_type, message)

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await connection_manager.send_personal_message(
                    client_id,
                    {
                        "type": "error",
                        "message": "Invalid JSON format"
                    }
                )
            except Exception as e:
                logger.error(f"WebSocket error for {client_id}: {str(e)}")

    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        connection_manager.disconnect(client_id)
        logger.info(f"WebSocket disconnected: {client_type}:{client_id}")

async def handle_websocket_message(client_id: str, client_type: str, message: dict):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")

    if message_type == "ping":
        await connection_manager.send_personal_message(
            client_id,
            {"type": "pong", "timestamp": datetime.utcnow().isoformat()}
        )
    elif message_type == "violation_report":
        await handle_violation_report(client_id, message.get("data", {}))
    elif message_type == "analytics_request":
        await handle_analytics_request(client_id, message.get("data", {}))

async def handle_violation_report(client_id: str, data: dict):
    """Handle violation reports from proctoring clients"""
    violation = {
        "id": f"violation_{datetime.utcnow().timestamp()}",
        "student_id": data.get("student_id"),
        "exam_id": data.get("exam_id"),
        "type": data.get("type"),
        "severity": data.get("severity", "medium"),
        "timestamp": datetime.utcnow().isoformat()
    }

    # Broadcast to admin clients
    await connection_manager.broadcast_to_type("admin", {
        "type": "violation_alert",
        "data": violation
    })

async def handle_analytics_request(client_id: str, data: dict):
    """Handle analytics data requests"""
    # Mock analytics data
    analytics_data = {
        "overview": {
            "total_exams": 150,
            "active_users": 45,
            "violations": 12,
            "trust_score": 87.5
        },
        "timestamp": datetime.utcnow().isoformat()
    }

    await connection_manager.send_personal_message(client_id, {
        "type": "analytics_data",
        "data": analytics_data
    })

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": str(exc)}
    )

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
