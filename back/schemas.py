from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    google_id: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    workos_user_id: Optional[str] = None
    is_admin: Optional[bool] = False
    is_active: Optional[bool] = True
    
class UserInDB(UserBase):
    id: int
    created_at: datetime

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
    """
    id: int  # Unique identifier for the log entry
    user_id: int  # ID of the user who made the prediction
    timestamp: datetime  # When the prediction was made
    result: str  # Result of the prediction
    filename: str  # Name of the file that was submitted

    class Config:
        from_attributes = True

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    workos_user_id: Optional[str]
    email: str
    full_name: Optional[str]
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True