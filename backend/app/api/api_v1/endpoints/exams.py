from typing import Any, List, Optional
from datetime import datetime, timedelta
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.core import security

# Mock exam database
class MockExamDB:
    def __init__(self):
        self.exams = {}
        self.next_id = 1
        self.questions = {}
        self.exam_sessions = {}

        # Create some sample exams
        self._create_sample_data()

    def _create_sample_data(self):
        sample_exams = [
            {
                "title": "Mathematics Final Exam",
                "description": "Comprehensive mathematics exam covering algebra, geometry, and calculus",
                "duration_minutes": 120,
                "total_marks": 100,
                "passing_marks": 60,
                "status": "published",
                "subject": "Mathematics",
                "difficulty": "intermediate"
            },
            {
                "title": "Physics Midterm",
                "description": "Physics exam covering mechanics and thermodynamics",
                "duration_minutes": 90,
                "total_marks": 80,
                "passing_marks": 48,
                "status": "published",
                "subject": "Physics",
                "difficulty": "advanced"
            },
            {
                "title": "Computer Science Quiz",
                "description": "Programming fundamentals and data structures",
                "duration_minutes": 60,
                "total_marks": 50,
                "passing_marks": 30,
                "status": "draft",
                "subject": "Computer Science",
                "difficulty": "beginner"
            }
        ]

        for exam_data in sample_exams:
            self.create_exam(exam_data, creator_id=1)

    def create_exam(self, exam_data: dict, creator_id: int = 1):
        exam_id = self.next_id
        self.next_id += 1

        exam = {
            "id": exam_id,
            "title": exam_data["title"],
            "description": exam_data["description"],
            "duration_minutes": exam_data["duration_minutes"],
            "total_marks": exam_data["total_marks"],
            "passing_marks": exam_data["passing_marks"],
            "status": exam_data.get("status", "draft"),
            "subject": exam_data.get("subject", "General"),
            "difficulty": exam_data.get("difficulty", "intermediate"),
            "creator_id": creator_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "start_time": exam_data.get("start_time"),
            "end_time": exam_data.get("end_time"),
            "instructions": exam_data.get("instructions", "Please read all questions carefully before answering."),
            "enable_proctoring": exam_data.get("enable_proctoring", True),
            "enable_face_detection": exam_data.get("enable_face_detection", True),
            "enable_audio_detection": exam_data.get("enable_audio_detection", True),
            "enable_tab_switch_detection": exam_data.get("enable_tab_switch_detection", True),
            "max_tab_switches": exam_data.get("max_tab_switches", 3),
            "question_count": exam_data.get("question_count", 0)
        }

        self.exams[exam_id] = exam
        return exam

    def get_exam(self, exam_id: int):
        return self.exams.get(exam_id)

    def get_all_exams(self, skip: int = 0, limit: int = 100):
        exams = list(self.exams.values())
        return exams[skip:skip + limit]

    def get_exams_by_status(self, status: str, skip: int = 0, limit: int = 100):
        exams = [exam for exam in self.exams.values() if exam["status"] == status]
        return exams[skip:skip + limit]

    def get_exams_by_creator(self, creator_id: int, skip: int = 0, limit: int = 100):
        exams = [exam for exam in self.exams.values() if exam["creator_id"] == creator_id]
        return exams[skip:skip + limit]

    def update_exam(self, exam_id: int, update_data: dict):
        if exam_id in self.exams:
            self.exams[exam_id].update(update_data)
            self.exams[exam_id]["updated_at"] = datetime.utcnow().isoformat()
            return self.exams[exam_id]
        return None

    def delete_exam(self, exam_id: int):
        if exam_id in self.exams:
            del self.exams[exam_id]
            return True
        return False

mock_exam_db = MockExamDB()

router = APIRouter()


@router.post("/")
async def create_exam(
    title: str,
    description: str,
    duration_minutes: int,
    total_marks: int = 100,
    passing_marks: int = 60,
    subject: str = "General",
    difficulty: str = "intermediate",
    authorization: Optional[str] = None
) -> Any:
    """
    Create new exam (teachers and admins only)
    """
    # Verify authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    # Create exam
    exam_data = {
        "title": title,
        "description": description,
        "duration_minutes": duration_minutes,
        "total_marks": total_marks,
        "passing_marks": passing_marks,
        "subject": subject,
        "difficulty": difficulty,
        "status": "draft"
    }

    exam = mock_exam_db.create_exam(exam_data, creator_id=int(token_data["user_id"]))
    return exam


@router.get("/")
def read_exams(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    subject: Optional[str] = None
) -> Any:
    """
    Retrieve exams
    """
    if status:
        exams = mock_exam_db.get_exams_by_status(status, skip, limit)
    else:
        exams = mock_exam_db.get_all_exams(skip, limit)

    # Filter by subject if provided
    if subject:
        exams = [exam for exam in exams if exam["subject"].lower() == subject.lower()]

    return {
        "exams": exams,
        "total": len(exams),
        "skip": skip,
        "limit": limit
    }


@router.get("/{exam_id}")
def read_exam(exam_id: int) -> Any:
    """
    Get exam by ID
    """
    exam = mock_exam_db.get_exam(exam_id)
    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return exam


@router.put("/{exam_id}")
async def update_exam(
    exam_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    total_marks: Optional[int] = None,
    passing_marks: Optional[int] = None,
    status: Optional[str] = None,
    authorization: Optional[str] = None
) -> Any:
    """
    Update an exam
    """
    # Verify authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    # Get exam
    exam = mock_exam_db.get_exam(exam_id)
    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    # Prepare update data
    update_data = {}
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description
    if duration_minutes is not None:
        update_data["duration_minutes"] = duration_minutes
    if total_marks is not None:
        update_data["total_marks"] = total_marks
    if passing_marks is not None:
        update_data["passing_marks"] = passing_marks
    if status is not None:
        update_data["status"] = status

    # Update exam
    updated_exam = mock_exam_db.update_exam(exam_id, update_data)
    return updated_exam


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    authorization: Optional[str] = None
) -> Any:
    """
    Delete an exam
    """
    # Verify authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    # Check if exam exists
    exam = mock_exam_db.get_exam(exam_id)
    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    # Delete exam
    success = mock_exam_db.delete_exam(exam_id)
    if success:
        return {"message": "Exam deleted successfully"}
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete exam"
        )


@router.post("/{exam_id}/publish")
async def publish_exam(
    exam_id: int,
    authorization: Optional[str] = None
) -> Any:
    """
    Publish an exam
    """
    # Verify authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "")
    token_data = await security.verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    # Get exam
    exam = mock_exam_db.get_exam(exam_id)
    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    # Update status to published
    updated_exam = mock_exam_db.update_exam(exam_id, {"status": "published"})
    return updated_exam


@router.get("/{exam_id}/statistics")
def get_exam_statistics(exam_id: int) -> Any:
    """
    Get exam statistics
    """
    exam = mock_exam_db.get_exam(exam_id)
    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    # Mock statistics
    stats = {
        "exam_id": exam_id,
        "total_participants": random.randint(50, 200),
        "completed": random.randint(40, 180),
        "in_progress": random.randint(0, 20),
        "average_score": round(random.uniform(60, 85), 2),
        "pass_rate": round(random.uniform(70, 95), 2),
        "violations_detected": random.randint(0, 15),
        "trust_score": round(random.uniform(80, 98), 2)
    }

    return stats
