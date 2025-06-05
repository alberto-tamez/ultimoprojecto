from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from database import Base  # Use the Base from the database module

class LogTypeEnum(enum.Enum): # Define the types of logs
    crop = "crop"
    mnist = "mnist"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    workos_user_id = Column(String(255), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    logs = relationship("Log", back_populates="user")

class Log(Base): # Define the Log model
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(LogTypeEnum), nullable=False)
    input_data = Column(JSON, nullable=False)
    output_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    result = Column(String, nullable=False)
    file_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())