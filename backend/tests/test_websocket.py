import asyncio
import json
import pytest
import websockets
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings
from app.db.init_db import init_db

# Create test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ws.db"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(scope="module")
def test_db():
    # Create the database
    Base.metadata.create_all(bind=engine)
    
    # Initialize with test data
    db = TestingSessionLocal()
    init_db(db)
    db.close()
    
    yield
    
    # Clean up
    Base.metadata.drop_all(bind=engine)

async def test_websocket_connection(test_db):
    # Login as student
    login_data = {
        "username": "student@example.com",
        "password": "student123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    # Start an exam session
    # Get available exams
    response = client.get("/api/v1/exams/", headers={"Authorization": f"Bearer {token}"})
    
    if not response.json():
        # Create an exam if none exists
        # Login as teacher
        login_data_teacher = {
            "username": "teacher@example.com",
            "password": "teacher123"
        }
        response_teacher = client.post("/api/v1/auth/login", data=login_data_teacher)
        token_teacher = response_teacher.json()["access_token"]
        headers_teacher = {"Authorization": f"Bearer {token_teacher}"}
        
        # Create exam
        from datetime import datetime, timedelta
        
        start_time = datetime.utcnow() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        exam_data = {
            "title": "Test Exam for WebSocket",
            "description": "This is a test exam for WebSocket testing",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_minutes": 120,
            "status": "published",
            "enable_face_detection": True,
            "enable_multiple_face_detection": True,
            "enable_eye_tracking": True,
            "enable_audio_detection": True,
            "enable_tab_switch_detection": True,
            "enable_phone_detection": True,
            "warning_threshold": 0.7,
            "critical_threshold": 0.5
        }
        
        response = client.post("/api/v1/exams/", json=exam_data, headers=headers_teacher)
        exam_id = response.json()["id"]
    else:
        exam_id = response.json()[0]["id"]
    
    # Start a session
    session_data = {
        "exam_id": exam_id
    }
    response = client.post(
        "/api/v1/proctoring/start-session", 
        json=session_data, 
        headers={"Authorization": f"Bearer {token}"}
    )
    session_id = response.json()["id"]
    
    # Connect to WebSocket
    uri = f"ws://localhost:8000/api/v1/proctoring/ws/{session_id}?token={token}"
    
    async with websockets.connect(uri) as websocket:
        # Send a test frame
        test_data = {
            "frame": "base64_encoded_frame_data",
            "tabActive": True,
            "audioLevel": 0.1
        }
        await websocket.send(json.dumps(test_data))
        
        # Receive response
        response = await websocket.recv()
        response_data = json.loads(response)
        
        # Check response
        assert "trust_score" in response_data
        assert "session_id" in response_data
        assert response_data["session_id"] == session_id

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_websocket_connection())
