from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
import schemas
import crud
import models
import auth
from ..database import get_db

router = APIRouter()

# Pure function to check if email exists
def check_email_exists(db: Session, email: str) -> bool:
    """Check if a user with the given email already exists"""
    return crud.get_user_by_email(db, email) is not None

# Pure function to get user profile data
def get_user_profile(user: models.User) -> dict:
    """Extract user profile data from user model"""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "created_at": user.created_at
    }

@router.get("/users/me/", response_model=schemas.UserInDB)
async def read_users_me(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get current user profile"""
    # Log this activity
    crud.create_activity_log(db, current_user.id, "Viewed profile")
    
    # Return user profile using pure function
    return current_user

@router.get("/users/me/sessions/", response_model=list[schemas.SessionInfo])
async def read_user_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all active sessions for the current user"""
    # Return all sessions for this user
    sessions = db.query(models.AppSession).filter(
        models.AppSession.user_id == current_user.id
    ).all()
    
    return sessions