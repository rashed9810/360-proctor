# 360° Proctor Backend

This is the backend for the 360° Proctor online exam proctoring system. It's built with FastAPI and PostgreSQL, providing a robust API for the frontend to interact with.

## Features

- **Authentication**: JWT-based authentication with user roles (admin, teacher, student)
- **Exam Management**: Create, read, update exams with various settings
- **Proctoring**: Real-time proctoring with WebSockets
- **Trust Score**: Calculate trust scores based on detected violations
- **Multilingual Support**: Support for English and Bangla

## Tech Stack

- **FastAPI**: High-performance web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **JWT**: For secure authentication
- **WebSockets**: For real-time communication
- **OpenCV**: For image processing
- **TensorFlow**: For AI-based proctoring (to be implemented)

## Project Structure

```
backend/
├── app/
│   ├── ai/                  # AI models and services
│   ├── api/                 # API endpoints
│   │   ├── api_v1/          # API version 1
│   │   │   ├── endpoints/   # API endpoints
│   │   │   └── api.py       # API router
│   │   └── deps.py          # Dependencies
│   ├── core/                # Core functionality
│   │   ├── config.py        # Configuration
│   │   └── security.py      # Security utilities
│   ├── db/                  # Database
│   │   ├── models/          # Database models
│   │   ├── base.py          # Base imports
│   │   ├── base_class.py    # Base class
│   │   ├── init_db.py       # Database initialization
│   │   └── session.py       # Database session
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── websockets/          # WebSocket functionality
│   └── main.py              # Main application
├── tests/                   # Tests
├── .env                     # Environment variables
└── requirements.txt         # Dependencies
```

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL**:
   - Create a database named `auto_proctoring`
   - Update `.env` file with your database credentials

3. **Run the application**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

4. **Initialize the database**:
   The database will be automatically initialized with default users when you run the application for the first time.

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Default Users

The following default users are created when the database is initialized:

- **Admin**:
  - Email: admin@example.com
  - Password: admin123

- **Teacher**:
  - Email: teacher@example.com
  - Password: teacher123

- **Student**:
  - Email: student@example.com
  - Password: student123

## WebSocket Communication

The backend provides a WebSocket endpoint for real-time proctoring:

```
ws://localhost:8000/api/v1/proctoring/ws/{session_id}?token={jwt_token}
```

The client should send frames and other data to this endpoint, and the server will respond with processing results.

## Implementation Status

### Completed
- ✅ Authentication system
- ✅ User management
- ✅ Exam management
- ✅ Basic proctoring infrastructure
- ✅ WebSocket support
- ✅ Trust score calculation

### In Progress
- 🔄 AI-based proctoring (without facial detection)
- 🔄 Real-time violation detection
- 🔄 Comprehensive testing

### To Do
- ❌ Facial detection integration (will be implemented later with GPU)
- ❌ Advanced analytics
- ❌ Performance optimization

## License

This project is licensed under the MIT License.
