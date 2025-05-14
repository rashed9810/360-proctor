import uvicorn
from app.db.session import SessionLocal
from app.db.init_db import init_db

if __name__ == "__main__":
    # Initialize the database
    db = SessionLocal()
    init_db(db)
    db.close()
    
    # Run the application
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
