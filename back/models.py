from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=True)  # Ahora puede ser nulo para Google
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.user)
    created_at = Column(DateTime, default=datetime.utcnow)
    google_id = Column(String, nullable=True)  # Nuevo campo opcional

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