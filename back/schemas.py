from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_admin: bool = False
    is_active: bool = True
    workos_user_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserInDB(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Session Schemas ---
class SessionInfo(BaseModel):
    id: int
    user_id: int
    workos_session_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- Log Schemas ---
class LogBase(BaseModel):
    type: str
    input_data: dict
    output_result: dict

class LogCreate(LogBase):
    user_id: int

class Log(LogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionResponse(BaseModel):
    recommended_crop: str
    confidence: float

class PredictionLog(BaseModel):
    """
    Schema for prediction history entries.
    Pure data representation following functional programming principles.
    """
    id: int  # Unique identifier for the log entry
    user_id: int  # ID of the user who made the prediction
    created_at: datetime  # When the prediction was made
    result: str  # Result of the prediction
    file_name: Optional[str] = None  # Name of the file that was submitted

    class Config:
        from_attributes = True