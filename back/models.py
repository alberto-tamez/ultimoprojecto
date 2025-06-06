from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base  # Use the Base from the database module

class RoleEnum(enum.Enum): # Define the roles for users
    admin = "admin"
    user = "user"

class LogTypeEnum(enum.Enum): # Define the types of logs
    crop = "crop"
    mnist = "mnist"

class User(Base): # Define the User model
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

class Log(Base): # Define the Log model
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(LogTypeEnum), nullable=False)
    input_data = Column(JSON, nullable=False)
    output_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    input_source = Column(String, nullable=False)
    file_name = Column(String)
    crop_result = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")

class AppSession(Base):
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
    """Model for prediction logs table in the database"""
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    result = Column(String, nullable=False)
    file_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to User model
    user = relationship("User", back_populates="prediction_logs")