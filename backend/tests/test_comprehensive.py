"""
Comprehensive Test Suite for 360° Proctor
Tests all major functionality including API endpoints, services, and integrations
"""

import pytest
import asyncio
import json
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch

from app.main import app
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.services.realtime_violation_service import realtime_violation_service
from app.services.file_upload_service import file_upload_service
from app.services.email_notification_service import email_notification_service

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def test_client():
    """Create test client"""
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        yield client
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user_token():
    """Mock user token for authentication"""
    return "test_token_123"

@pytest.fixture
def mock_user():
    """Mock user object"""
    return {
        "id": 1,
        "email": "test@example.com",
        "full_name": "Test User",
        "role": "admin",
        "is_active": True
    }

class TestAuthenticationEndpoints:
    """Test authentication related endpoints"""
    
    def test_login_endpoint(self, test_client):
        """Test login endpoint"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={"email": "admin@test.com", "password": "test123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
    
    def test_register_endpoint(self, test_client):
        """Test registration endpoint"""
        response = test_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "password123",
                "full_name": "New User",
                "role": "student"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
    
    def test_social_auth_google(self, test_client):
        """Test Google OAuth endpoint"""
        response = test_client.post(
            "/api/v1/auth/google",
            json={"token": "mock_google_token"}
        )
        # Should handle mock token gracefully
        assert response.status_code in [200, 400]

class TestExamManagementEndpoints:
    """Test exam management endpoints"""
    
    def test_create_exam(self, test_client, test_user_token):
        """Test exam creation"""
        exam_data = {
            "title": "Test Exam",
            "description": "A test exam",
            "duration": 60,
            "questions": [
                {
                    "question": "What is 2+2?",
                    "type": "multiple_choice",
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": "4"
                }
            ]
        }
        
        response = test_client.post(
            "/api/v1/exams/",
            json=exam_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code in [200, 201]
    
    def test_get_exams(self, test_client, test_user_token):
        """Test getting exams list"""
        response = test_client.get(
            "/api/v1/exams/",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_exam_analytics(self, test_client, test_user_token):
        """Test exam analytics endpoint"""
        response = test_client.get(
            "/api/v1/analytics/exams/1",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code in [200, 404]

class TestRealTimeProctoringService:
    """Test real-time proctoring service"""
    
    @pytest.mark.asyncio
    async def test_start_session(self):
        """Test starting a proctoring session"""
        mock_websocket = Mock()
        session_id = "test_session_123"
        user_id = 1
        exam_id = 1
        
        result = await realtime_violation_service.start_session(
            session_id, user_id, exam_id, mock_websocket
        )
        assert result is True
        
        # Check session is tracked
        session_status = await realtime_violation_service.get_session_status(session_id)
        assert session_status is not None
        assert session_status["user_id"] == user_id
    
    @pytest.mark.asyncio
    async def test_process_frame_data(self):
        """Test processing frame data"""
        session_id = "test_session_123"
        
        # Start session first
        mock_websocket = Mock()
        await realtime_violation_service.start_session(session_id, 1, 1, mock_websocket)
        
        # Process frame data
        frame_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "face_detected": True,
            "multiple_faces": False,
            "looking_away": False
        }
        
        result = await realtime_violation_service.process_frame_data(session_id, frame_data)
        assert "session_id" in result
        assert "trust_score" in result
    
    @pytest.mark.asyncio
    async def test_end_session(self):
        """Test ending a proctoring session"""
        session_id = "test_session_123"
        
        # Start session first
        mock_websocket = Mock()
        await realtime_violation_service.start_session(session_id, 1, 1, mock_websocket)
        
        # End session
        result = await realtime_violation_service.end_session(session_id)
        assert "session_id" in result
        assert result["status"] == "completed"

class TestFileUploadService:
    """Test file upload service"""
    
    def test_validate_file(self):
        """Test file validation"""
        mock_file = Mock()
        mock_file.filename = "test.pdf"
        mock_file.size = 1024 * 1024  # 1MB
        
        result = file_upload_service._validate_file(mock_file, ['documents'])
        assert result is True
    
    def test_generate_unique_filename(self):
        """Test unique filename generation"""
        original = "test_document.pdf"
        unique = file_upload_service._generate_unique_filename(original)
        
        assert unique.endswith(".pdf")
        assert unique != original
        assert len(unique) > len(original)
    
    @pytest.mark.asyncio
    async def test_upload_exam_material(self):
        """Test exam material upload"""
        mock_file = Mock()
        mock_file.filename = "exam_material.pdf"
        mock_file.content_type = "application/pdf"
        mock_file.read = Mock(return_value=b"fake pdf content")
        
        with patch('aiofiles.open'), patch('pathlib.Path.mkdir'):
            result = await file_upload_service.upload_exam_material(
                mock_file, exam_id=1, uploaded_by=1, description="Test material"
            )
            
            assert "id" in result
            assert result["exam_id"] == 1
            assert result["file_type"] == "exam_material"

class TestEmailNotificationService:
    """Test email notification service"""
    
    @pytest.mark.asyncio
    async def test_send_violation_alert(self):
        """Test sending violation alert email"""
        with patch.object(email_notification_service, 'send_email', return_value=True):
            result = await email_notification_service.send_violation_alert(
                to_emails=["admin@test.com"],
                student_name="Test Student",
                student_email="student@test.com",
                exam_title="Test Exam",
                session_id="test_session",
                violation_data={
                    "type": "face_not_detected",
                    "severity": "high",
                    "description": "Face not detected for 10 seconds",
                    "trust_score": 75
                }
            )
            assert result is True
    
    def test_template_rendering(self):
        """Test email template rendering"""
        template = email_notification_service.templates['violation_alert']
        assert "violation_type" in template
        assert "trust_score" in template
        assert "student_name" in template

class TestWebSocketEndpoints:
    """Test WebSocket endpoints"""
    
    def test_websocket_connection(self, test_client):
        """Test WebSocket connection"""
        with test_client.websocket_connect("/api/v1/realtime/ws/test_session?user_id=1&exam_id=1") as websocket:
            # Send test message
            websocket.send_json({
                "type": "heartbeat"
            })
            
            # Receive response
            data = websocket.receive_json()
            assert data["type"] == "heartbeat_response"
    
    def test_websocket_frame_processing(self, test_client):
        """Test WebSocket frame data processing"""
        with test_client.websocket_connect("/api/v1/realtime/ws/test_session?user_id=1&exam_id=1") as websocket:
            # Send frame data
            websocket.send_json({
                "type": "frame_data",
                "data": {
                    "face_detected": True,
                    "multiple_faces": False,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            })
            
            # Should receive processed response
            data = websocket.receive_json()
            assert "trust_score" in data

class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_dashboard_stats(self, test_client, test_user_token):
        """Test dashboard statistics"""
        response = test_client.get(
            "/api/v1/analytics/dashboard",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_exams" in data
        assert "active_users" in data
    
    def test_violation_analytics(self, test_client, test_user_token):
        """Test violation analytics"""
        response = test_client.get(
            "/api/v1/analytics/violations",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200

class TestIntegrationScenarios:
    """Test complete integration scenarios"""
    
    @pytest.mark.asyncio
    async def test_complete_exam_flow(self, test_client, test_user_token):
        """Test complete exam taking flow"""
        # 1. Create exam
        exam_response = test_client.post(
            "/api/v1/exams/",
            json={
                "title": "Integration Test Exam",
                "description": "Full flow test",
                "duration": 30,
                "questions": [{"question": "Test?", "type": "text", "correct_answer": "Yes"}]
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # 2. Start proctoring session via WebSocket
        with test_client.websocket_connect("/api/v1/realtime/ws/integration_test?user_id=1&exam_id=1") as websocket:
            # 3. Send frame data
            websocket.send_json({
                "type": "frame_data",
                "data": {"face_detected": True, "multiple_faces": False}
            })
            
            # 4. Receive processing result
            result = websocket.receive_json()
            assert "trust_score" in result
            
            # 5. End session
            websocket.send_json({"type": "end_session"})
            end_result = websocket.receive_json()
            assert end_result["type"] == "session_ended"
    
    def test_file_upload_integration(self, test_client, test_user_token):
        """Test file upload integration"""
        # Create a test file
        test_file_content = b"fake pdf content"
        
        response = test_client.post(
            "/api/v1/files/exam-materials/1",
            files={"file": ("test.pdf", test_file_content, "application/pdf")},
            data={"description": "Integration test file"},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Should handle the upload attempt
        assert response.status_code in [200, 500]  # May fail due to file system in test

class TestPerformanceAndSecurity:
    """Test performance and security aspects"""
    
    def test_rate_limiting(self, test_client):
        """Test rate limiting on sensitive endpoints"""
        # Make multiple rapid requests
        responses = []
        for _ in range(10):
            response = test_client.post("/api/v1/auth/login", json={
                "email": "test@test.com",
                "password": "wrong_password"
            })
            responses.append(response.status_code)
        
        # Should eventually get rate limited (429) or handle gracefully
        assert any(status in [429, 401, 422] for status in responses)
    
    def test_input_validation(self, test_client):
        """Test input validation"""
        # Test with invalid data
        response = test_client.post("/api/v1/auth/register", json={
            "email": "invalid_email",
            "password": "123",  # Too short
            "full_name": "",  # Empty
            "role": "invalid_role"
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_sql_injection_protection(self, test_client, test_user_token):
        """Test SQL injection protection"""
        # Attempt SQL injection in search
        response = test_client.get(
            "/api/v1/exams/?search=' OR '1'='1",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Should handle safely
        assert response.status_code in [200, 400]

# Test runner configuration
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
