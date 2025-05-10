# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.exam import Exam, ExamSession, Alert
