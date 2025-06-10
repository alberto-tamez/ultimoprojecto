from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base  # Use the Base from the database module

class RoleEnum(enum.Enum):
    """User roles in the system."""
    admin = "admin"
    user = "user"

class LogTypeEnum(enum.Enum):
    """Types of logs that can be recorded in the system."""
    crop = "crop"
    mnist = "mnist"

class User(Base):
    """User model representing an application user.
    
    Attributes:
        id: Primary key
        workos_user_id: External ID from WorkOS
        email: User's email address (unique)
        full_name: User's full name
        is_admin: Whether the user has admin privileges
        is_active: Whether the user account is active
        created_at: Timestamp of user creation
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    workos_user_id = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    logs = relationship("Log", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    app_sessions = relationship("AppSession", back_populates="user")
    prediction_logs = relationship("PredictionLog", back_populates="user")

class Log(Base):
    """Log model for storing system and user activity logs.
    
    Attributes:
        id: Primary key
        user_id: Reference to the user who generated the log
        type: Type of log entry (from LogTypeEnum)
        input_data: JSON data containing input parameters
        output_result: JSON data containing operation results
        created_at: Timestamp of log creation
    """
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(LogTypeEnum), nullable=False)
    input_data = Column(JSON, nullable=False)
    output_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")

class Prediction(Base):
    """Model for storing prediction results from the AI service.
    
    Attributes:
        id: Primary key
        user_id: Reference to the user who made the prediction
        input_source: Source of the input data (e.g., 'file', 'manual')
        input_data: JSON data containing input parameters
        prediction_result: JSON data containing prediction results
        created_at: Timestamp of prediction
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    input_source = Column(String, nullable=False)
    input_data = Column(JSON, nullable=False)
    prediction_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class ActivityLog(Base):
    """Model for storing user activity logs.
    
    Attributes:
        id: Primary key
        user_id: Reference to the user who performed the action
        action: Description of the action performed
        timestamp: Timestamp of the action
    """
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")

class AppSession(Base):
    """Model for tracking user application sessions.
    
    Attributes:
        id: Primary key
        user_id: Reference to the user
        workos_user_id: External user ID from WorkOS
        workos_session_id: Unique session ID from WorkOS
        encrypted_refresh_token: Encrypted refresh token
        ip_address: IP address of the session
        user_agent: User agent string of the client
        issued_at: When the session was issued
        refresh_token_expires_at: When the refresh token expires
        created_at: When the session was created
        updated_at: When the session was last updated
    """
    __tablename__ = "app_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    workos_user_id = Column(String, nullable=False)
    workos_session_id = Column(String, unique=True, nullable=False)
    encrypted_refresh_token = Column(Text, nullable=False)
    ip_address = Column(String)
    user_agent = Column(Text)
    issued_at = Column(DateTime, default=datetime.utcnow)
    refresh_token_expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="app_sessions")

class PredictionLog(Base):
    """Model for storing prediction history and results.
    
    Attributes:
        id: Primary key
        user_id: Reference to the user who made the prediction
        result: String containing the prediction result
        file_name: Name of the file used for prediction (if any)
        created_at: Timestamp of when the prediction was made
    """
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    result = Column(String, nullable=False)
    file_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="prediction_logs")