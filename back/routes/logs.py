from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
import models
import schemas
import crud
import auth
from database import get_db

router = APIRouter()

@router.get("/logs/", response_model=list[schemas.Log])
async def read_logs(
    request: Request,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get logs with authentication"""
    # Only return logs for the current user unless they're an admin
    if current_user.is_admin:
        return db.query(models.Log).offset(skip).limit(limit).all()
    return db.query(models.Log).filter(models.Log.user_id == current_user.id).offset(skip).limit(limit).all()

@router.post("/logs/", response_model=schemas.Log)
async def create_log(
    log: schemas.LogCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new log with the current user ID"""
    # Create log with the current user's ID
    log_data = log.dict()
    log_data["user_id"] = current_user.id
    
    db_log = models.Log(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Log the activity
    crud.create_activity_log(db, current_user.id, f"Created log of type {log.type}")
    
    return db_log