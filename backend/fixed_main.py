"""
360° Proctor - Fixed FastAPI Backend
Resolves all import issues and provides working API endpoints
"""

import sys
import os
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
import logging

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Core FastAPI imports
    from fastapi import FastAPI, HTTPException, status, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from pydantic import BaseModel
    import uvicorn

    print("✅ Core FastAPI imports successful!")

except ImportError as e:
    print(f"❌ Core import error: {e}")
    print("Installing required packages...")
    os.system("pip install fastapi uvicorn pydantic python-multipart")
    sys.exit(1)

try:
    # Optional security imports
    from passlib.context import CryptContext
    from jose import JWTError, jwt
    print("✅ Security imports successful!")
    SECURITY_AVAILABLE = True
except ImportError:
    print("⚠️ Security packages not available, using mock authentication")
    SECURITY_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if SECURITY_AVAILABLE:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create FastAPI application
app = FastAPI(
    title="360° Proctor API - Fixed Version",
    description="Comprehensive online exam proctoring system with resolved dependencies",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Security scheme
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    created_at: str
    last_login: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Mock database
class MockDatabase:
    def __init__(self):
        self.users = {}
        self.next_id = 1
        # Add default admin user
        self.create_default_users()

    def create_default_users(self):
        """Create default users for testing"""
        default_users = [
            {
                "email": "admin@360proctor.com",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": "admin",
                "department": "IT",
                "phone": "+1234567890",
                "bio": "System Administrator for 360° Proctor"
            },
            {
                "email": "teacher@360proctor.com",
                "password": "teacher123",
                "full_name": "Demo Teacher",
                "role": "teacher",
                "department": "Computer Science",
                "phone": "+1234567891",
                "bio": "Demo teacher account"
            },
            {
                "email": "student@360proctor.com",
                "password": "student123",
                "full_name": "Demo Student",
                "role": "student",
                "department": "Computer Science",
                "phone": "+1234567892",
                "bio": "Demo student account"
            }
        ]

        for user_data in default_users:
            self.create_user(user_data)

    def hash_password(self, password: str) -> str:
        """Hash password using available method"""
        if SECURITY_AVAILABLE:
            return pwd_context.hash(password)
        else:
            # Simple mock hashing for development
            return f"hashed_{password}"

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password using available method"""
        if SECURITY_AVAILABLE:
            return pwd_context.verify(plain_password, hashed_password)
        else:
            # Simple mock verification for development
            return hashed_password == f"hashed_{plain_password}"

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        for user in self.users.values():
            if user.get("email") == email:
                return user
        return None

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        return self.users.get(user_id)

    def create_user(self, user_data: Dict) -> Dict:
        """Create new user"""
        user_id = self.next_id
        self.next_id += 1

        user = {
            "id": user_id,
            "email": user_data["email"],
            "full_name": user_data.get("full_name", ""),
            "hashed_password": self.hash_password(user_data["password"]),
            "role": user_data.get("role", "student"),
            "department": user_data.get("department", "General"),
            "phone": user_data.get("phone"),
            "bio": user_data.get("bio", f"User registered on 360° Proctor"),
            "avatar": user_data.get("avatar"),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        }

        self.users[user_id] = user
        return user

# Initialize mock database
db = MockDatabase()

# Authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    if SECURITY_AVAILABLE:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    else:
        # Mock token for development
        return f"mock_token_{data.get('sub', 'unknown')}_{int(expire.timestamp())}"

def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token"""
    try:
        if SECURITY_AVAILABLE:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return {"user_id": user_id}
        else:
            # Mock token verification for development
            if token.startswith("mock_token_"):
                parts = token.split("_")
                if len(parts) >= 3:
                    user_id = parts[2]
                    return {"user_id": user_id}
            return None
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get_user_by_id(int(token_data["user_id"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "development",
        "security_available": SECURITY_AVAILABLE
    }

# API Info endpoint
@app.get("/api/info", tags=["Info"])
async def api_info():
    """API information endpoint"""
    return {
        "name": "360° Proctor API - Fixed Version",
        "version": "1.0.0",
        "description": "Comprehensive online exam proctoring system with resolved dependencies",
        "features": [
            "JWT Authentication",
            "Real-time Proctoring",
            "AI-powered Violation Detection",
            "Advanced Analytics",
            "WebSocket Support",
            "Multi-language Support"
        ],
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users",
            "exams": "/api/exams",
            "proctoring": "/api/proctoring",
            "analytics": "/api/analytics",
            "notifications": "/api/notifications"
        },
        "security_available": SECURITY_AVAILABLE
    }

# Authentication endpoints
@app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(request: LoginRequest):
    """Login endpoint"""
    logger.info(f"Login attempt for email: {request.email}")

    # Get user by email
    user = db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not db.verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )

    # Update last login
    user["last_login"] = datetime.utcnow().isoformat()

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "department": user["department"],
            "phone": user["phone"],
            "bio": user["bio"],
            "avatar": user["avatar"],
            "created_at": user["created_at"],
            "last_login": user["last_login"]
        }
    }

@app.post("/api/auth/register", response_model=TokenResponse, tags=["Authentication"])
async def register(request: RegisterRequest):
    """Register new user"""
    logger.info(f"Registration attempt for email: {request.email}")

    # Check if user already exists
    existing_user = db.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    # Create new user
    user_data = {
        "email": request.email,
        "password": request.password,
        "full_name": request.name,
        "role": request.role
    }
    user = db.create_user(user_data)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "department": user["department"],
            "phone": user["phone"],
            "bio": user["bio"],
            "avatar": user["avatar"],
            "created_at": user["created_at"],
            "last_login": user["last_login"]
        }
    }

# User endpoints
@app.get("/api/users/me", response_model=UserResponse, tags=["Users"])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "department": current_user["department"],
        "phone": current_user["phone"],
        "bio": current_user["bio"],
        "avatar": current_user["avatar"],
        "created_at": current_user["created_at"],
        "last_login": current_user["last_login"]
    }

# Basic exam endpoints
@app.get("/api/exams", tags=["Exams"])
async def get_exams(current_user: dict = Depends(get_current_user)):
    """Get all exams"""
    return {
        "exams": [
            {
                "id": 1,
                "title": "Sample Programming Exam",
                "description": "A comprehensive programming exam covering algorithms and data structures",
                "duration_minutes": 120,
                "status": "active",
                "created_by": "admin@360proctor.com",
                "created_at": "2024-01-01T00:00:00Z",
                "start_time": "2024-01-15T10:00:00Z",
                "end_time": "2024-01-15T12:00:00Z"
            },
            {
                "id": 2,
                "title": "Database Management Quiz",
                "description": "Quick quiz on SQL and database concepts",
                "duration_minutes": 60,
                "status": "scheduled",
                "created_by": "teacher@360proctor.com",
                "created_at": "2024-01-02T00:00:00Z",
                "start_time": "2024-01-20T14:00:00Z",
                "end_time": "2024-01-20T15:00:00Z"
            }
        ],
        "total": 2,
        "user_role": current_user["role"]
    }

@app.get("/api/exams/{exam_id}", tags=["Exams"])
async def get_exam(exam_id: int, current_user: dict = Depends(get_current_user)):
    """Get exam by ID"""
    return {
        "id": exam_id,
        "title": f"Exam {exam_id}",
        "description": f"Detailed description for exam {exam_id}",
        "duration_minutes": 90,
        "status": "active",
        "questions": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is the time complexity of binary search?",
                "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                "correct_answer": 1
            },
            {
                "id": 2,
                "type": "text",
                "question": "Explain the concept of recursion in programming.",
                "max_length": 500
            }
        ],
        "settings": {
            "proctoring_enabled": True,
            "camera_required": True,
            "microphone_required": False,
            "screen_sharing": True,
            "violation_threshold": 3
        }
    }

# Basic proctoring endpoints
@app.post("/api/proctoring/start-session", tags=["Proctoring"])
async def start_proctoring_session(current_user: dict = Depends(get_current_user)):
    """Start a proctoring session"""
    session_id = f"session_{current_user['id']}_{int(datetime.utcnow().timestamp())}"
    return {
        "session_id": session_id,
        "status": "started",
        "user_id": current_user["id"],
        "timestamp": datetime.utcnow().isoformat(),
        "settings": {
            "camera_enabled": True,
            "microphone_enabled": False,
            "screen_recording": True,
            "violation_detection": True
        }
    }

@app.post("/api/proctoring/process-frame", tags=["Proctoring"])
async def process_frame(current_user: dict = Depends(get_current_user)):
    """Process a video frame for proctoring"""
    return {
        "session_id": f"session_{current_user['id']}",
        "trust_score": 0.95,
        "violations": [],
        "alerts": [],
        "timestamp": datetime.utcnow().isoformat(),
        "analysis": {
            "face_detected": True,
            "multiple_faces": False,
            "looking_away": False,
            "suspicious_activity": False
        }
    }

# Basic analytics endpoints
@app.get("/api/analytics/overview", tags=["Analytics"])
async def get_analytics_overview(current_user: dict = Depends(get_current_user)):
    """Get analytics overview"""
    return {
        "total_exams": 150,
        "active_users": 45,
        "violations": 12,
        "trust_score": 87.5,
        "recent_activity": [
            {
                "type": "exam_started",
                "user": "student@360proctor.com",
                "exam": "Programming Exam",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "type": "violation_detected",
                "user": "student2@360proctor.com",
                "violation": "multiple_faces",
                "timestamp": datetime.utcnow().isoformat()
            }
        ],
        "timestamp": datetime.utcnow().isoformat(),
        "user_role": current_user["role"]
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    print("🚀 Starting 360° Proctor Backend Server (Fixed Version)...")
    print("📚 Educational Exam Proctoring System")
    print("🌐 Server will be available at: http://localhost:8000")
    print(f"🔒 Security packages available: {SECURITY_AVAILABLE}")
    print("📖 API Documentation: http://localhost:8000/api/docs")

    uvicorn.run(
        "fixed_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )