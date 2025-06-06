import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

try:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
    logger.info(f"Database URL: {SQLALCHEMY_DATABASE_URL}")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Test connection
    with engine.connect() as conn:
        conn.execute("SELECT 1")
    logger.info("Database connection successful")
except SQLAlchemyError as e:
    logger.error(f"Database connection error: {str(e)}")
    raise

Base = declarative_base()

def get_db():
    db = SessionLocal() 
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()
