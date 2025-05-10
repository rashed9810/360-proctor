@echo off
echo Starting 360° Proctor System Development Environment

echo Creating Python virtual environment...
python -m venv backend\venv

echo Installing backend dependencies...
call backend\venv\Scripts\activate
cd backend
pip install -r requirements.txt
cd ..

echo Starting backend server...
start cmd /k "cd backend && ..\backend\venv\Scripts\python -m uvicorn app.main:app --reload"

echo Starting frontend development server...
start cmd /k "cd frontend && npm run dev"

echo Development environment started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
