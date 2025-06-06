from sqlalchemy.orm import Session
import models
import schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        google_id=user.google_id,
        hashed_password=None  # Explicitly set to None as we're not using passwords
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
