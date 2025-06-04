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

class UserCreate(UserBase):
    password: Optional[str] = None  # Puede ser None para Google Auth

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
