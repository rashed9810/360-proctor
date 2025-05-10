@echo off
echo Initializing 360° Proctor System Database

echo Activating virtual environment...
call backend\venv\Scripts\activate

echo Running database initialization script...
cd backend
python -m app.db.init_db

echo Database initialization complete!
pause
