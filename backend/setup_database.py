#!/usr/bin/env python3
"""
Database Setup Script for 360° Proctor
This script helps set up PostgreSQL database and run migrations
"""

import os
import sys
import subprocess
import psycopg2
from psycopg2 import sql
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_postgresql_installed():
    """Check if PostgreSQL is installed"""
    try:
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"PostgreSQL found: {result.stdout.strip()}")
            return True
        else:
            logger.error("PostgreSQL not found")
            return False
    except FileNotFoundError:
        logger.error("PostgreSQL not installed")
        return False

def install_postgresql_windows():
    """Instructions for installing PostgreSQL on Windows"""
    print("""
    🔧 PostgreSQL Installation Required

    Please install PostgreSQL manually:

    1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
    2. Run the installer and follow the setup wizard
    3. Remember your postgres user password
    4. Default port is 5432 (recommended)
    5. After installation, add PostgreSQL bin directory to PATH

    Alternative using Chocolatey:
    choco install postgresql

    Alternative using Scoop:
    scoop install postgresql
    """)

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (not to specific database)
        conn = psycopg2.connect(
            host=settings.POSTGRES_SERVER,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            port=getattr(settings, 'POSTGRES_PORT', 5432)
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
            (settings.POSTGRES_DB,)
        )

        if cursor.fetchone():
            logger.info(f"Database '{settings.POSTGRES_DB}' already exists")
        else:
            # Create database
            cursor.execute(
                sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier(settings.POSTGRES_DB)
                )
            )
            logger.info(f"Database '{settings.POSTGRES_DB}' created successfully")

        cursor.close()
        conn.close()
        return True

    except psycopg2.Error as e:
        logger.error(f"Error creating database: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def run_migrations():
    """Run Alembic migrations"""
    try:
        # Initialize Alembic if not already done
        if not os.path.exists('alembic'):
            logger.info("Initializing Alembic...")
            subprocess.run(['alembic', 'init', 'alembic'], check=True)

        # Run migrations
        logger.info("Running database migrations...")
        subprocess.run(['alembic', 'upgrade', 'head'], check=True)
        logger.info("Migrations completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Migration failed: {e}")
        return False

def create_extensions():
    """Create necessary PostgreSQL extensions"""
    try:
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        with engine.connect() as connection:
            # Create UUID extension for generating UUIDs
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))
            # Create extension for full-text search
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS \"pg_trgm\""))
            connection.commit()
        logger.info("PostgreSQL extensions created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating extensions: {e}")
        return False

def create_indexes():
    """Create performance indexes"""
    try:
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        with engine.connect() as connection:
            # Create indexes for better performance
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
                "CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by)",
                "CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON exam_sessions(exam_id)",
                "CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON alerts(session_id)",
                "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)"
            ]

            for index_sql in indexes:
                try:
                    connection.execute(text(index_sql))
                except Exception as idx_error:
                    logger.warning(f"Index creation warning: {idx_error}")

            connection.commit()
        logger.info("Performance indexes created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False

def initialize_database():
    """Initialize database with default data"""
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
        logger.info("Database initialized with default data")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def verify_setup():
    """Verify the database setup"""
    try:
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        with engine.connect() as connection:
            # Check if tables exist
            result = connection.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result]

            expected_tables = ['users', 'exams', 'exam_sessions', 'alerts', 'notifications']
            existing_tables = [table for table in expected_tables if table in tables]

            logger.info(f"Found {len(tables)} tables, {len(existing_tables)} expected tables present")

            # Check if we can query data
            if 'users' in tables:
                result = connection.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.scalar()
                logger.info(f"Database verification successful - {user_count} users found")

        return True
    except Exception as e:
        logger.error(f"Database verification failed: {e}")
        return False

def main():
    """Enhanced main setup function"""
    print("🚀 360° Proctor Enhanced Database Setup")
    print("=" * 50)

    # Check PostgreSQL installation
    print("📋 Step 1: Checking PostgreSQL installation...")
    if not check_postgresql_installed():
        install_postgresql_windows()
        sys.exit(1)

    # Create database
    print("\n📊 Step 2: Creating database...")
    if not create_database():
        logger.error("Failed to create database")
        sys.exit(1)

    # Test connection
    print("\n🔗 Step 3: Testing database connection...")
    if not test_database_connection():
        logger.error("Database connection test failed")
        sys.exit(1)

    # Create extensions
    print("\n🔧 Step 4: Creating PostgreSQL extensions...")
    if not create_extensions():
        logger.warning("Extension creation failed, continuing...")

    # Run migrations
    print("\n📋 Step 5: Running database migrations...")
    if not run_migrations():
        logger.error("Migration failed")
        sys.exit(1)

    # Create indexes
    print("\n⚡ Step 6: Creating performance indexes...")
    if not create_indexes():
        logger.warning("Index creation failed, continuing...")

    # Initialize with default data
    print("\n📝 Step 7: Initializing with default data...")
    if not initialize_database():
        logger.error("Database initialization failed")
        sys.exit(1)

    # Verify setup
    print("\n✅ Step 8: Verifying database setup...")
    if not verify_setup():
        logger.warning("Setup verification had issues, but continuing...")

    print("\n" + "=" * 50)
    print("🎉 Enhanced Database Setup Completed Successfully!")
    print("=" * 50)
    print(f"📊 Database: {settings.POSTGRES_DB}")
    print(f"🔗 Host: {settings.POSTGRES_SERVER}:{getattr(settings, 'POSTGRES_PORT', 5432)}")
    print(f"👤 User: {settings.POSTGRES_USER}")
    print("✅ Ready to start the application!")
    print("🚀 Run: python -m uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
