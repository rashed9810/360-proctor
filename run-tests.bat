@echo off
echo Running 360° Proctor System Tests

echo Activating virtual environment...
call backend\venv\Scripts\activate

echo Running backend tests...
cd backend
pytest

echo Tests completed!
pause
