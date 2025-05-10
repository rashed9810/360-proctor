from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models.user import User, UserRole
from app.core.security import get_password_hash


def test_login(client: TestClient, db: Session):
    # Create a test user
    test_user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        is_active=True,
        role=UserRole.STUDENT
    )
    db.add(test_user)
    db.commit()
    
    # Test login with correct credentials
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    
    # Test login with incorrect password
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    
    # Test login with non-existent user
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@example.com", "password": "testpassword"}
    )
    assert response.status_code == 401


def test_register(client: TestClient, db: Session):
    # Test successful registration
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "full_name": "New User",
            "role": "student"
        }
    )
    assert response.status_code == 200
    
    # Verify user was created in the database
    user = db.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert user.full_name == "New User"
    assert user.role == UserRole.STUDENT
    
    # Test registration with existing email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "anotherpassword",
            "full_name": "Another User",
            "role": "student"
        }
    )
    assert response.status_code == 400
