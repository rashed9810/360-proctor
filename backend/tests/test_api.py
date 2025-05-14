import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings
from app.db.init_db import init_db

# Create test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

def test_read_main(test_db):
    response = client.get("/api/v1/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to 360° Proctor API"}

def test_login(test_db):
    # Test login with admin user
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    
    # Test login with invalid credentials
    login_data = {
        "username": "admin@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401

def test_register(test_db):
    # Test user registration
    user_data = {
        "email": "newuser@example.com",
        "password": "newpassword",
        "full_name": "New User",
        "role": "student",
        "preferred_language": "en"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["email"] == user_data["email"]
    assert response.json()["full_name"] == user_data["full_name"]
    
    # Test registration with existing email
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400

def test_read_users_me(test_db):
    # Login to get token
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    # Test get current user
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "admin@example.com"
    assert response.json()["role"] == "admin"

def test_create_exam(test_db):
    # Login as teacher
    login_data = {
        "username": "teacher@example.com",
        "password": "teacher123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create exam
    from datetime import datetime, timedelta
    
    start_time = datetime.utcnow() + timedelta(days=1)
    end_time = start_time + timedelta(hours=2)
    
    exam_data = {
        "title": "Test Exam",
        "description": "This is a test exam",
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_minutes": 120,
        "status": "draft",
        "enable_face_detection": True,
        "enable_multiple_face_detection": True,
        "enable_eye_tracking": True,
        "enable_audio_detection": True,
        "enable_tab_switch_detection": True,
        "enable_phone_detection": True,
        "warning_threshold": 0.7,
        "critical_threshold": 0.5
    }
    
    response = client.post("/api/v1/exams/", json=exam_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == exam_data["title"]
    assert response.json()["description"] == exam_data["description"]
    
    # Get the created exam
    exam_id = response.json()["id"]
    response = client.get(f"/api/v1/exams/{exam_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == exam_id

def test_start_exam_session(test_db):
    # Login as student
    login_data = {
        "username": "student@example.com",
        "password": "student123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get available exams
    response = client.get("/api/v1/exams/", headers=headers)
    assert response.status_code == 200
    
    # If there are exams, start a session for the first one
    if response.json():
        exam_id = response.json()[0]["id"]
        session_data = {
            "exam_id": exam_id
        }
        response = client.post("/api/v1/proctoring/start-session", json=session_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["exam_id"] == exam_id
        assert response.json()["is_completed"] == False

if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
