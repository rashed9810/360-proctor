import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings


@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    yield engine


@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=connection
    )
    db = TestingSessionLocal()
    
    # Override the get_db dependency
    app.dependency_overrides[get_db] = lambda: db
    
    yield db
    
    db.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db):
    with TestClient(app) as c:
        yield c
