from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models, schemas
from config import get_settings
from database import get_db

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_user(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    # This will be updated to use WorkOS session validation
    # For now, it's kept as a placeholder that will be implemented in the next step
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="WorkOS authentication not yet implemented"
    )
