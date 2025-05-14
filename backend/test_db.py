from app.db.session import SessionLocal
from app.db.models.user import User

def test_db_connection():
    try:
        db = SessionLocal()
        # Try to query the database
        users = db.query(User).all()
        print(f"Database connection successful. Found {len(users)} users.")
        db.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()
