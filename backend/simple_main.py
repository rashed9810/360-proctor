"""
Simple FastAPI server for 360° Proctor - Backend
Basic working version without complex dependencies
"""

import sys
import os
from datetime import datetime, timezone

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Import FastAPI components
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
    import uvicorn
    import logging

    print("✅ All imports successful!")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages:")
    print("pip install fastapi uvicorn pydantic python-multipart")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="360° Proctor API",
    description="Comprehensive online exam proctoring system with AI-powered monitoring",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": "development"
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
            "notifications": "/api/notifications"
        }
    }

# Pydantic models for request/response
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# Basic auth endpoints
@app.post("/api/auth/login", tags=["Authentication"])
async def login(request: LoginRequest):
    """Login endpoint - accepts any email/password for demo"""
    # For demo purposes, accept any credentials
    logger.info(f"Login attempt received for email: {request.email}")

    # Mock user data based on email
    user_data = {
        "id": 1,
        "email": request.email,
        "full_name": "Demo User",
        "role": "admin" if "admin" in request.email else "student"
    }

    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer",
        "user": user_data
    }

@app.post("/api/auth/register", tags=["Authentication"])
async def register(request: RegisterRequest):
    """Register endpoint"""
    logger.info(f"Registration attempt received for email: {request.email}")

    return {
        "message": "User registered successfully",
        "user": {
            "id": 2,
            "email": request.email,
            "full_name": request.name,
            "role": "student"
        }
    }

# User endpoints
@app.get("/api/users/me", tags=["Users"])
async def get_current_user():
    """Get current user information"""
    return {
        "id": 1,
        "email": "demo@example.com",
        "full_name": "Demo User",
        "role": "admin",
        "department": "Computer Science",
        "phone": "+1234567890",
        "bio": "Demo user for testing purposes",
        "avatar": None,
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": datetime.now(timezone.utc).isoformat()
    }

# Basic exam endpoints
@app.get("/api/exams", tags=["Exams"])
async def get_exams():
    """Get all exams"""
    return {
        "exams": [
            {
                "id": 1,
                "title": "Sample Exam",
                "description": "A sample exam for testing",
                "duration_minutes": 60,
                "status": "active"
            }
        ]
    }

@app.get("/api/exams/{exam_id}", tags=["Exams"])
async def get_exam(exam_id: int):
    """Get exam by ID"""
    return {
        "id": exam_id,
        "title": f"Exam {exam_id}",
        "description": f"Description for exam {exam_id}",
        "duration_minutes": 60,
        "status": "active"
    }

# Basic proctoring endpoints
@app.post("/api/proctoring/start-session", tags=["Proctoring"])
async def start_proctoring_session():
    """Start a proctoring session"""
    return {
        "session_id": "session_12345",
        "status": "started",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/proctoring/process-frame", tags=["Proctoring"])
async def process_frame():
    """Process a video frame for proctoring"""
    return {
        "session_id": "session_12345",
        "trust_score": 0.95,
        "alerts": [],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Basic analytics endpoints
@app.get("/api/analytics/overview", tags=["Analytics"])
async def get_analytics_overview():
    """Get analytics overview"""
    return {
        "total_exams": 150,
        "active_users": 45,
        "violations": 12,
        "trust_score": 87.5,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

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
            "timestamp": datetime.now(timezone.utc).isoformat()
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
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

if __name__ == "__main__":
    print("Starting 360° Proctor Backend Server...")
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
