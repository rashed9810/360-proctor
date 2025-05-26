"""
360° Proctor - FastAPI Backend
Main application entry point with comprehensive API endpoints
"""

from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager
from typing import List, Optional
import json
from datetime import datetime

# Import routers
from app.routers import auth, users, exams, proctoring, analytics, notifications
from app.core.config import settings
from app.core.database import engine, Base
from app.core.security import verify_token
from app.core.websocket_manager import WebSocketManager
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitingMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# WebSocket manager instance
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting 360° Proctor API server...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Initialize WebSocket manager
    await websocket_manager.initialize()
    logger.info("WebSocket manager initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down 360° Proctor API server...")
    await websocket_manager.cleanup()

# Create FastAPI application
app = FastAPI(
    title="360° Proctor API",
    description="Comprehensive online exam proctoring system with AI-powered monitoring",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# API Info endpoint
@app.get("/api/info", tags=["Info"])
async def api_info():
    """API information endpoint"""
    return {
        "name": "360° Proctor API",
        "version": "1.0.0",
        "description": "Comprehensive online exam proctoring system",
        "features": [
            "JWT Authentication",
            "Real-time Proctoring",
            "AI-powered Violation Detection",
            "Advanced Analytics",
            "WebSocket Support",
            "Multi-language Support"
        ],
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users",
            "exams": "/api/exams",
            "proctoring": "/api/proctoring",
            "analytics": "/api/analytics",
            "notifications": "/api/notifications",
            "websocket": "/ws"
        }
    }

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(exams.router, prefix="/api/exams", tags=["Exams"])
app.include_router(proctoring.router, prefix="/api/proctoring", tags=["Proctoring"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

# WebSocket endpoints
@app.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_type: str,
    client_id: str,
    token: Optional[str] = None
):
    """
    WebSocket endpoint for real-time communication
    
    Args:
        client_type: Type of client (admin, student, proctor)
        client_id: Unique client identifier
        token: JWT authentication token
    """
    try:
        # Verify authentication
        if token:
            user = await verify_token(token)
            if not user:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        
        # Accept connection
        await websocket_manager.connect(websocket, client_type, client_id)
        logger.info(f"WebSocket connected: {client_type}:{client_id}")
        
        # Send welcome message
        await websocket_manager.send_personal_message(
            client_id,
            {
                "type": "connection_established",
                "message": "Connected to 360° Proctor",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                await handle_websocket_message(client_id, client_type, message)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket_manager.send_personal_message(
                    client_id,
                    {
                        "type": "error",
                        "message": "Invalid JSON format",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
            except Exception as e:
                logger.error(f"WebSocket error for {client_id}: {str(e)}")
                await websocket_manager.send_personal_message(
                    client_id,
                    {
                        "type": "error",
                        "message": "Internal server error",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        await websocket_manager.disconnect(client_id)
        logger.info(f"WebSocket disconnected: {client_type}:{client_id}")

async def handle_websocket_message(client_id: str, client_type: str, message: dict):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "ping":
        # Respond to ping with pong
        await websocket_manager.send_personal_message(
            client_id,
            {
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    elif message_type == "violation_report":
        # Handle violation reports from proctoring
        await handle_violation_report(client_id, message.get("data", {}))
    
    elif message_type == "analytics_request":
        # Handle analytics data requests
        await handle_analytics_request(client_id, message.get("data", {}))
    
    elif message_type == "notification_read":
        # Handle notification read status
        await handle_notification_read(client_id, message.get("data", {}))
    
    else:
        logger.warning(f"Unknown message type: {message_type} from {client_id}")

async def handle_violation_report(client_id: str, data: dict):
    """Handle violation reports from proctoring clients"""
    try:
        # Process violation data
        violation = {
            "id": f"violation_{datetime.utcnow().timestamp()}",
            "student_id": data.get("student_id"),
            "exam_id": data.get("exam_id"),
            "type": data.get("type"),
            "severity": data.get("severity", "medium"),
            "confidence": data.get("confidence", 0.8),
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": data.get("metadata", {})
        }
        
        # Broadcast to admin clients
        await websocket_manager.broadcast_to_type(
            "admin",
            {
                "type": "violation_alert",
                "data": violation
            }
        )
        
        # Send to specific proctor if assigned
        proctor_id = data.get("proctor_id")
        if proctor_id:
            await websocket_manager.send_personal_message(
                proctor_id,
                {
                    "type": "violation_alert",
                    "data": violation
                }
            )
        
        logger.info(f"Violation reported: {violation['type']} for student {violation['student_id']}")
        
    except Exception as e:
        logger.error(f"Error handling violation report: {str(e)}")

async def handle_analytics_request(client_id: str, data: dict):
    """Handle analytics data requests"""
    try:
        # Mock analytics data - in production, this would query the database
        analytics_data = {
            "overview": {
                "total_exams": 150,
                "active_users": 45,
                "violations": 12,
                "trust_score": 87.5
            },
            "recent_violations": [
                {
                    "id": "v1",
                    "type": "face_not_detected",
                    "student_id": "student_123",
                    "timestamp": datetime.utcnow().isoformat(),
                    "severity": "high"
                }
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await websocket_manager.send_personal_message(
            client_id,
            {
                "type": "analytics_data",
                "data": analytics_data
            }
        )
        
    except Exception as e:
        logger.error(f"Error handling analytics request: {str(e)}")

async def handle_notification_read(client_id: str, data: dict):
    """Handle notification read status updates"""
    try:
        notification_id = data.get("notification_id")
        if notification_id:
            # Update notification status in database
            # This is a placeholder - implement actual database update
            logger.info(f"Notification {notification_id} marked as read by {client_id}")
            
    except Exception as e:
        logger.error(f"Error handling notification read: {str(e)}")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
