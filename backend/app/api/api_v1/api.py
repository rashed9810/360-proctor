from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, exams, proctoring

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(proctoring.router, prefix="/proctoring", tags=["proctoring"])
