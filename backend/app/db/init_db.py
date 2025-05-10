import logging
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.db.models.user import User, UserRole
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have users
    user = db.query(User).first()
    if user:
        logger.info("Database already initialized, skipping")
        return
    
    # Create admin user
    admin_user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        is_active=True,
        role=UserRole.ADMIN,
        preferred_language="en"
    )
    db.add(admin_user)
    
    # Create teacher user
    teacher_user = User(
        email="teacher@example.com",
        hashed_password=get_password_hash("teacher123"),
        full_name="Teacher User",
        is_active=True,
        role=UserRole.TEACHER,
        preferred_language="en"
    )
    db.add(teacher_user)
    
    # Create student user
    student_user = User(
        email="student@example.com",
        hashed_password=get_password_hash("student123"),
        full_name="Student User",
        is_active=True,
        role=UserRole.STUDENT,
        preferred_language="en"
    )
    db.add(student_user)
    
    db.commit()
    logger.info("Database initialized with default users")


if __name__ == "__main__":
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    init_db(db)
    db.close()
