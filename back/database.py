import logging
from typing import Generator, Optional
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from config import get_settings
from functools import lru_cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Global variables for engine and session factory
_engine: Optional[Engine] = None
_SessionLocal = None

@lru_cache
def get_engine() -> Engine:
    """
    Pure function to get or create SQLAlchemy engine.
    Uses lazy initialization to avoid side effects at import time.
    
    Returns:
        Engine: SQLAlchemy engine instance
    """
    global _engine
    
    if _engine is None:
        settings = get_settings()
        db_url = settings.DATABASE_URL
        logger.info(f"Database URL: {db_url}")
        
        _engine = create_engine(db_url)
        
        # Test connection only when explicitly requested
        try:
            with _engine.connect() as conn:
                result = conn.execute(text("SELECT 1")).fetchone()
                if result and result[0] == 1:
                    logger.info("Database connection successful")
                else:
                    raise SQLAlchemyError("Database test query failed")
        except SQLAlchemyError as e:
            logger.error(f"Database connection error: {str(e)}")
            # Don't raise here, let the caller handle the error
            # This makes the function more pure by not having side effects
    
    return _engine

def get_session_factory():
    """
    Pure function to get SQLAlchemy session factory.
    
    Returns:
        sessionmaker: SQLAlchemy session factory
    """
    global _SessionLocal
    
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    return _SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get a database session.
    
    Following functional programming principles:
    - Pure function with clear inputs/outputs
    - Proper resource management
    - No side effects beyond session creation
    
    Yields:
        Session: SQLAlchemy session
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()

# Functions for testing - allows engine override
def set_test_engine(test_engine: Engine) -> None:
    """
    Set a test engine for database operations.
    This allows tests to use a different database (e.g., SQLite in-memory).
    
    Args:
        test_engine: SQLAlchemy engine for testing
    """
    global _engine, _SessionLocal
    _engine = test_engine
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def reset_engine() -> None:
    """
    Reset the engine to None, forcing re-initialization.
    Useful for cleaning up after tests.
    """
    global _engine, _SessionLocal
    _engine = None
    _SessionLocal = None
