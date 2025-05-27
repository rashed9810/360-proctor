"""
Working FastAPI server for 360° Proctor - Backend
Minimal working version for authentication
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

# Create FastAPI application
app = FastAPI(title="360° Proctor API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Login endpoint
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    print(f"Login attempt for: {request.email}")

    # Determine role based on email for demo purposes
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

# Register endpoint
@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    print(f"Registration attempt for: {request.email}")

    # Default role is student for new registrations
    role = "student"
    user_id = 100  # Start from 100 for new registrations

    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": request.email,
            "full_name": request.name,
            "role": role,
            "department": "General",
            "phone": None,
            "bio": f"New {role} registered on 360° Proctor",
            "avatar": None,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        }
    }

# Current user endpoint
@app.get("/api/users/me")
async def get_current_user():
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

if __name__ == "__main__":
    print("🚀 Starting 360° Proctor Backend Server...")
    print("📚 Educational Exam Proctoring System")
    print("🌐 Server will be available at: http://localhost:8000")
    uvicorn.run(
        "working_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
