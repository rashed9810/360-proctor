import os
from typing import List, Union, Dict, Any
from pydantic import BaseSettings, PostgresDsn, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Auto Proctoring System"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "auto_proctoring")
    SQLALCHEMY_DATABASE_URI: Union[PostgresDsn, str] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Union[str, None], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )
    
    # AI Models
    FACE_DETECTION_MODEL_PATH: str = os.getenv("FACE_DETECTION_MODEL_PATH", "app/ai/models/face_detection")
    EYE_TRACKING_MODEL_PATH: str = os.getenv("EYE_TRACKING_MODEL_PATH", "app/ai/models/eye_tracking")
    
    # Languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "bn"]
    DEFAULT_LANGUAGE: str = "en"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
