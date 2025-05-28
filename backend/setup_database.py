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

def main():
    """Main setup function"""
    print("🚀 360° Proctor Database Setup")
    print("=" * 40)
    
    # Check PostgreSQL installation
    if not check_postgresql_installed():
        install_postgresql_windows()
        sys.exit(1)
    
    # Create database
    if not create_database():
        logger.error("Failed to create database")
        sys.exit(1)
    
    # Test connection
    if not test_database_connection():
        logger.error("Database connection test failed")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        logger.error("Migration failed")
        sys.exit(1)
    
    # Initialize with default data
    if not initialize_database():
        logger.error("Database initialization failed")
        sys.exit(1)
    
    print("\n✅ Database setup completed successfully!")
    print(f"Database: {settings.POSTGRES_DB}")
    print(f"Host: {settings.POSTGRES_SERVER}")
    print(f"User: {settings.POSTGRES_USER}")

if __name__ == "__main__":
    main()
