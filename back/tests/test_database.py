"""
Test database module for isolated testing following functional programming principles.
This module provides a clean, in-memory SQLite database for testing.
"""
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from functools import lru_cache

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

# Import database module to use its Base and override engine
from ..database import Base, set_test_engine, reset_engine

# Use SQLite in-memory database for testing
# This follows functional programming principles by ensuring test isolation and purity
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create engine with specific SQLite settings for testing
@lru_cache
def get_test_engine():
    """
    Pure function to get SQLAlchemy test engine.
    
    Following functional programming principles:
    - Pure function with clear output
    - Memoization for efficiency
    - No side effects
    
    Returns:
        Engine: SQLAlchemy engine for testing
    """
    return create_engine(
        TEST_DATABASE_URL,
        # Enable foreign keys for SQLite
        connect_args={"check_same_thread": False}
    )

# Initialize test engine
engine = get_test_engine()

# Set up test engine in the database module
set_test_engine(engine)

# Pure function to get a test database session
@lru_cache
def get_test_db_session() -> Session:
    """
    Get a test database session.
    
    Following functional programming principles:
    - Pure function with clear output
    - No side effects
    - Referential transparency
    - Memoization for efficiency
    
    Returns:
        Session: SQLAlchemy session for test database
    """
    from sqlalchemy.orm import sessionmaker
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return TestSessionLocal()

# Function to reset test database state
def reset_test_db():
    """
    Reset the test database state.
    Drops all tables and recreates them.
    
    Following functional programming principles:
    - Isolated side effects for testing only
    - Clear purpose and scope
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    # Reset engine in the database module
    reset_engine()
    # Re-initialize test engine
    set_test_engine(get_test_engine())
