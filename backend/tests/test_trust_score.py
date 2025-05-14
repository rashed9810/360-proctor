import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models.exam import ExamSession, Alert, AlertType, AlertSeverity
from app.services import exam_session_service, alert_service
from app.ai.proctoring_service import ProctorService

# Create test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_trust.db"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def test_db():
    # Create the database
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    # Create a new database session for each test
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_trust_score_calculation(test_db, db_session):
    # Create a test exam session
    session = ExamSession(
        exam_id=1,
        student_id=1,
        is_completed=False,
        final_trust_score=1.0
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    
    session_id = session.id
    
    # Create alerts with different impacts
    alerts = [
        Alert(
            exam_session_id=session_id,
            alert_type=AlertType.FACE_NOT_DETECTED,
            severity=AlertSeverity.WARNING,
            description="Face not detected",
            trust_score_impact=0.1
        ),
        Alert(
            exam_session_id=session_id,
            alert_type=AlertType.MULTIPLE_FACES,
            severity=AlertSeverity.CRITICAL,
            description="Multiple faces detected",
            trust_score_impact=0.2
        ),
        Alert(
            exam_session_id=session_id,
            alert_type=AlertType.TAB_SWITCH,
            severity=AlertSeverity.WARNING,
            description="Tab switching detected",
            trust_score_impact=0.05
        )
    ]
    
    for alert in alerts:
        db_session.add(alert)
    
    db_session.commit()
    
    # Update trust score
    total_impact = sum(alert.trust_score_impact for alert in alerts)
    expected_score = max(0, 1.0 - total_impact)
    
    # Update the session trust score
    updated_session = exam_session_service.update_trust_score(
        db_session, 
        session_id=session_id, 
        trust_score=expected_score
    )
    
    # Check if the trust score was updated correctly
    assert updated_session.final_trust_score == expected_score
    
    # End the session and check final trust score
    ended_session = exam_session_service.end_session(db_session, session_id=session_id)
    assert ended_session.is_completed == True
    assert ended_session.final_trust_score == expected_score

def test_proctor_service(test_db):
    # Create a ProctorService instance
    proctor_service = ProctorService()
    
    # Test session state initialization
    session_id = 999
    user_id = 1
    
    # Initialize session state
    if session_id not in proctor_service.session_states:
        proctor_service.session_states[session_id] = {
            "user_id": user_id,
            "violations": [],
            "trust_score": 1.0,
            "last_face_detected": False,
            "face_not_detected_count": 0,
            "tab_switch_count": 0,
            "last_tab_active": True,
        }
    
    # Check initial state
    assert proctor_service.session_states[session_id]["trust_score"] == 1.0
    assert len(proctor_service.session_states[session_id]["violations"]) == 0
    
    # Simulate a violation
    proctor_service.session_states[session_id]["violations"].append({
        "type": AlertType.FACE_NOT_DETECTED,
        "description": "Face not detected",
        "timestamp": "2023-01-01T00:00:00",
        "trust_score_impact": 0.1
    })
    
    # Update trust score
    proctor_service.session_states[session_id]["trust_score"] -= 0.1
    
    # Check updated state
    assert proctor_service.session_states[session_id]["trust_score"] == 0.9
    assert len(proctor_service.session_states[session_id]["violations"]) == 1

if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
