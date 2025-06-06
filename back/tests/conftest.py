import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import FastAPI

# Add parent directory to path so we can import modules
sys.path.append(str(Path(__file__).parent.parent))

# Now we can import our app modules
from database import Base, get_db
from auth import get_current_user
import models
# We'll import these when needed in the test_app fixture

# Use a separate database file for testing, e.g., test.db for SQLite
# For PostgreSQL, use a different database URL
TEST_DATABASE_URL = "postgresql://username:password@localhost:5432/fastapi_test_db"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture to set up and tear down the database for the entire test session
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Creates all tables before tests run, and drops them after.
    This is a session-scoped fixture that runs automatically.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Fixture to provide a clean database session for each test function
@pytest.fixture(scope="function")
def db_session() -> Session:
    """
    Provides a transactional database session for each test function.
    Rolls back any changes after the test completes.
    """
    connection = engine.connect()
    transaction = connection.begin()
    db = TestingSessionLocal(bind=connection)

    yield db

    db.close()
    transaction.rollback()
    connection.close()

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
def test_app(db_session, mock_current_user):
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
    app.dependency_overrides[get_db] = lambda: db_session
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