from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    auth, users, exams, proctoring, analytics, notifications,
    realtime_proctoring, file_upload
)

api_router = APIRouter()

# Authentication and User Management
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Exam Management
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])

# Proctoring Services
api_router.include_router(proctoring.router, prefix="/proctoring", tags=["proctoring"])
api_router.include_router(realtime_proctoring.router, prefix="/realtime", tags=["real-time proctoring"])

# File Management
api_router.include_router(file_upload.router, prefix="/files", tags=["file upload"])

# Analytics and Reporting
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
