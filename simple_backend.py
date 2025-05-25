#!/usr/bin/env python3
"""
Simple Mock Backend for 360° Proctor System
This provides basic API endpoints for testing the frontend
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import json
import asyncio

# Create FastAPI app
app = FastAPI(
    title="360° Proctor Mock API",
    description="Mock backend for testing the 360° Proctor frontend",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    id: int
    email: str
    full_name: str
    role: str = "student"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Exam(BaseModel):
    id: int
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    duration: int
    status: str = "scheduled"

# Mock data
mock_users = [
    {"id": 1, "email": "admin@360proctor.com", "full_name": "Admin User", "role": "admin"},
    {"id": 2, "email": "teacher@360proctor.com", "full_name": "Teacher User", "role": "teacher"},
    {"id": 3, "email": "student@360proctor.com", "full_name": "Student User", "role": "student"},
]

mock_exams = [
    {
        "id": 1,
        "title": "Mathematics Final Exam",
        "description": "Final examination for Mathematics course",
        "start_time": datetime.now() + timedelta(days=1),
        "end_time": datetime.now() + timedelta(days=1, hours=2),
        "duration": 120,
        "status": "scheduled"
    },
    {
        "id": 2,
        "title": "Physics Midterm",
        "description": "Midterm examination for Physics course",
        "start_time": datetime.now() + timedelta(days=3),
        "end_time": datetime.now() + timedelta(days=3, hours=1.5),
        "duration": 90,
        "status": "scheduled"
    }
]

# Routes
@app.get("/")
async def root():
    return {
        "message": "360° Proctor Mock API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    # Simple mock authentication
    user = None
    for mock_user in mock_users:
        if mock_user["email"] == login_data.email:
            user = mock_user
            break

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenResponse(
        access_token="mock_token_123456789",
        user=User(**user)
    )

@app.post("/api/v1/auth/register")
async def register(user_data: dict):
    return {"message": "User registered successfully", "user_id": len(mock_users) + 1}

@app.post("/api/v1/auth/social-login", response_model=TokenResponse)
async def social_login(social_data: dict):
    """
    Handle social login (Google/Facebook)
    """
    provider = social_data.get("provider")
    user_info = social_data.get("user_info", {})

    # Mock social login - in real implementation, verify the token with the provider
    if provider not in ["google", "facebook"]:
        raise HTTPException(status_code=400, detail="Unsupported social provider")

    # Check if user exists or create new user
    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for social login")

    # Find existing user or create new one
    existing_user = None
    for user in mock_users:
        if user["email"] == email:
            existing_user = user
            break

    if existing_user:
        # Return existing user
        user_data = existing_user
    else:
        # Create new user from social data
        user_data = {
            "id": len(mock_users) + 1,
            "email": email,
            "full_name": user_info.get("name", "Social User"),
            "role": "student",
            "is_active": True,
            "preferred_language": "en",
            "social_provider": provider,
            "avatar_url": user_info.get("picture")
        }
        mock_users.append(user_data)

    return TokenResponse(
        access_token=f"social_token_{provider}_{user_data['id']}",
        user=User(**user_data)
    )

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user():
    return User(**mock_users[0])  # Return admin user by default

# Exam endpoints
@app.get("/api/v1/exams", response_model=List[Exam])
async def get_exams():
    return [Exam(**exam) for exam in mock_exams]

@app.get("/api/v1/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: int):
    for exam in mock_exams:
        if exam["id"] == exam_id:
            return Exam(**exam)
    raise HTTPException(status_code=404, detail="Exam not found")

@app.post("/api/v1/exams")
async def create_exam(exam_data: dict):
    new_exam = {
        "id": len(mock_exams) + 1,
        **exam_data,
        "status": "scheduled"
    }
    mock_exams.append(new_exam)
    return {"message": "Exam created successfully", "exam_id": new_exam["id"]}

# User endpoints
@app.get("/api/v1/users", response_model=List[User])
async def get_users():
    return [User(**user) for user in mock_users]

# Analytics endpoints
@app.get("/api/v1/analytics/overview")
async def get_analytics_overview():
    return {
        "total_students": 150,
        "active_exams": 5,
        "total_violations": 23,
        "average_trust_score": 85.5,
        "trends": {
            "students": 12,
            "exams": 2,
            "violations": -5,
            "trustScore": 3.2
        }
    }

@app.get("/api/v1/analytics/advanced")
async def get_advanced_analytics():
    return {
        "overview": {
            "total_students": 150,
            "active_exams": 5,
            "total_violations": 23,
            "average_trust_score": 85.5,
            "trends": {
                "students": 12,
                "exams": 2,
                "violations": -5,
                "trustScore": 3.2
            }
        },
        "violation_trends": [
            {"date": "2024-01-01", "count": 5},
            {"date": "2024-01-02", "count": 8},
            {"date": "2024-01-03", "count": 3}
        ],
        "trust_score_distribution": [
            {"range": "90-100", "count": 45},
            {"range": "80-89", "count": 67},
            {"range": "70-79", "count": 28},
            {"range": "60-69", "count": 10}
        ]
    }

# Proctoring endpoints
@app.post("/api/v1/proctoring/sessions/{exam_id}/start")
async def start_proctoring_session(exam_id: int):
    return {"message": "Proctoring session started", "session_id": f"session_{exam_id}"}

@app.post("/api/v1/proctoring/sessions/{exam_id}/stop")
async def stop_proctoring_session(exam_id: int):
    return {"message": "Proctoring session stopped"}

@app.get("/api/v1/proctoring/monitoring/{exam_id}")
async def get_monitoring_data(exam_id: int):
    return {
        "exam_id": exam_id,
        "active_students": 25,
        "violations": 3,
        "average_trust_score": 87.5
    }

# WebSocket endpoint for notifications
@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connection",
            "message": "Connected to notifications",
            "timestamp": datetime.now().isoformat()
        })

        # Send periodic mock notifications
        while True:
            await asyncio.sleep(10)  # Send notification every 10 seconds
            await websocket.send_json({
                "type": "notification",
                "data": {
                    "id": f"notif_{datetime.now().timestamp()}",
                    "title": "Mock Notification",
                    "message": "This is a test notification from the mock backend",
                    "type": "info",
                    "timestamp": datetime.now().isoformat()
                }
            })
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    print("🚀 Starting 360° Proctor Mock Backend...")
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔄 CORS enabled for frontend")
    print("-" * 50)

    uvicorn.run(
        "simple_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
