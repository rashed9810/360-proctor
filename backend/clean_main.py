"""
Clean FastAPI server for 360° Proctor - Backend
Minimal working version with proper imports
"""

import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Import FastAPI components
    from fastapi import FastAPI, HTTPException, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel, EmailStr
    import uvicorn
    
    print("✅ All imports successful!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages:")
    print("pip install fastapi uvicorn pydantic python-multipart email-validator")
    sys.exit(1)

# Create FastAPI application
app = FastAPI(
    title="360° Proctor API",
    description="Educational exam proctoring system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "360° Proctor Backend"
    }

# Authentication endpoints
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login endpoint with educational role assignment"""
    print(f"Login attempt for: {request.email}")
    
    # Determine role based on email
    if "admin" in request.email.lower():
        role = "admin"
        full_name = "Admin User"
        user_id = 1
    elif "teacher" in request.email.lower():
        role = "teacher"
        full_name = "Teacher User"
        user_id = 2
    else:
        role = "student"
        full_name = "Student User"
        user_id = 3
    
    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": request.email,
            "full_name": full_name,
            "role": role,
            "department": "Computer Science",
            "phone": "+1234567890",
            "bio": f"Demo {role} for 360° Proctor testing",
            "avatar": None,
            "created_at": "2024-01-01T00:00:00Z",
            "last_login": datetime.utcnow().isoformat()
        }
    }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """Register endpoint"""
    print(f"Registration attempt for: {request.email}")
    
    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer",
        "user": {
            "id": 100,
            "email": request.email,
            "full_name": request.name,
            "role": "student",
            "department": "General",
            "phone": None,
            "bio": "New student registered on 360° Proctor",
            "avatar": None,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        }
    }

# User endpoints
@app.get("/api/users/me")
async def get_current_user():
    """Get current user information"""
    return {
        "id": 1,
        "email": "admin@360proctor.com",
        "full_name": "Admin User",
        "role": "admin",
        "department": "Computer Science",
        "phone": "+1234567890",
        "bio": "System Administrator for 360° Proctor",
        "avatar": None,
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": datetime.utcnow().isoformat()
    }

# Basic exam endpoints
@app.get("/api/exams")
async def get_exams():
    """Get all exams"""
    return {
        "exams": [
            {
                "id": 1,
                "title": "Mathematics Final Exam",
                "description": "Comprehensive mathematics exam",
                "duration_minutes": 120,
                "status": "active",
                "subject": "Mathematics",
                "total_marks": 100,
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "title": "Physics Midterm",
                "description": "Physics midterm examination",
                "duration_minutes": 90,
                "status": "draft",
                "subject": "Physics",
                "total_marks": 80,
                "created_at": datetime.utcnow().isoformat()
            }
        ],
        "total": 2
    }

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    print("🚀 Starting 360° Proctor Backend Server...")
    print("📚 Educational Exam Proctoring System")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "clean_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
