import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import FastAPI

# Add parent directory to path so we can import modules
from auth import get_current_user
import models

# Import database module for dependency override and DB engine
from ..database import get_db, Base, engine, SessionLocal

# Fixture to set up and tear down the database for the entire test session
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Creates all tables before tests run, and drops them after.
    This is a session-scoped fixture that runs automatically.
    Uses the real PostgreSQL connection as configured in database.py.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Fixture for database session
@pytest.fixture(scope="function")
def db() -> Session:
    """
    Creates a fresh database session for each test function.
    Ensures isolation between tests.
    Uses the real SessionLocal from database.py.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# Fixture to provide a mock user, which can be customized in tests
@pytest.fixture(scope="function")
def mock_current_user():
    """

    Provides a default mock user. Can be patched to return different
    user types (e.g., admin vs. non-admin).
    """
    return models.User(
        id=1,
        workos_user_id="user_01E4ZCR3C56J083X43JQXF3JK5",
        email="test.user@example.com",
        full_name="Test User",
        is_admin=False,
        is_active=True
    )

# Fixture to initialize the FastAPI app with dependency overrides
@pytest.fixture(scope="function")
def test_app(db, mock_current_user):
    """
    Creates a TestClient instance with get_db and get_current_user
    dependencies overridden for isolated testing.
    
    Following functional programming principles:
    - Pure function with clear inputs and outputs
    - No side effects beyond test setup
    - Immutable configuration
    """
    # Import route modules here to avoid circular imports
    from routes import logs
    from routes import auth
    
    # Create a fresh app instance for each test
    app = FastAPI()
    app.include_router(logs.router)
    app.include_router(auth.router)

    # Override dependencies with test fixtures
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    
    yield app
    
    # Clean up after test (functional cleanup)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(test_app):
    """
    Provides a TestClient for making requests to the app.
    """
    with TestClient(test_app) as c:
        yield c