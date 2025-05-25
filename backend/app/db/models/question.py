from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, JSON
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone

from app.db.base_class import Base


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"
    CODING = "coding"
    FILL_IN_BLANK = "fill_in_blank"


class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Question(Base):
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exam.id"))
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    difficulty_level = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    
    # Question configuration
    points = Column(Float, default=1.0)
    time_limit_seconds = Column(Integer, nullable=True)  # Optional time limit per question
    order_index = Column(Integer, default=0)  # Order in the exam
    
    # Multiple choice specific
    options = Column(JSON, nullable=True)  # List of options for multiple choice
    correct_answers = Column(JSON, nullable=True)  # Correct answer(s)
    
    # Essay/Short answer specific
    max_length = Column(Integer, nullable=True)  # Maximum character length
    keywords = Column(JSON, nullable=True)  # Keywords for auto-grading
    
    # Coding question specific
    programming_language = Column(String, nullable=True)
    starter_code = Column(Text, nullable=True)
    test_cases = Column(JSON, nullable=True)  # Test cases for auto-grading
    
    # Question metadata
    explanation = Column(Text, nullable=True)  # Explanation for the correct answer
    tags = Column(JSON, nullable=True)  # Tags for categorization
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")


class Answer(Base):
    id = Column(Integer, primary_key=True, index=True)
    exam_session_id = Column(Integer, ForeignKey("examsession.id"))
    question_id = Column(Integer, ForeignKey("question.id"))
    
    # Answer data
    answer_text = Column(Text, nullable=True)  # Text answer
    selected_options = Column(JSON, nullable=True)  # Selected options for multiple choice
    answer_data = Column(JSON, nullable=True)  # Additional answer data (e.g., code, files)
    
    # Grading
    is_correct = Column(Boolean, nullable=True)
    points_earned = Column(Float, default=0.0)
    auto_graded = Column(Boolean, default=False)
    manual_grade = Column(Float, nullable=True)
    grader_feedback = Column(Text, nullable=True)
    graded_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Timing
    time_spent_seconds = Column(Integer, nullable=True)
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    exam_session = relationship("ExamSession", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    graded_by = relationship("User", foreign_keys=[graded_by_id])


class QuestionBank(Base):
    """Question bank for reusable questions across multiple exams"""
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=True)
    created_by_id = Column(Integer, ForeignKey("user.id"))
    
    # Configuration
    is_public = Column(Boolean, default=False)  # Can be used by other teachers
    tags = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    questions = relationship("QuestionBankItem", back_populates="question_bank")


class QuestionBankItem(Base):
    """Link table between question bank and questions"""
    id = Column(Integer, primary_key=True, index=True)
    question_bank_id = Column(Integer, ForeignKey("questionbank.id"))
    question_id = Column(Integer, ForeignKey("question.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    question_bank = relationship("QuestionBank", back_populates="questions")
    question = relationship("Question")
