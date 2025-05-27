import os
from typing import List, Union, Dict, Any, Optional

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "360° Proctor"

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "*"]

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "auto_proctoring")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Build database URI"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # AI Models
    FACE_DETECTION_MODEL_PATH: str = os.getenv("FACE_DETECTION_MODEL_PATH", "app/ai/models/face_detection")
    EYE_TRACKING_MODEL_PATH: str = os.getenv("EYE_TRACKING_MODEL_PATH", "app/ai/models/eye_tracking")

    # Languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "bn"]
    DEFAULT_LANGUAGE: str = "en"

settings = Settings()
