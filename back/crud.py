from sqlalchemy.orm import Session
from datetime import datetime
import models

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_workos_id(db: Session, workos_user_id: str):
    return db.query(models.User).filter(models.User.workos_user_id == workos_user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_or_update_user(db: Session, workos_profile: dict):
    """
    Create or update a user based on WorkOS profile.
    Returns the user object.
    """
    # Get or create user
    db_user = get_user_by_email(db, workos_profile.email)
    if not db_user:
        db_user = models.User(
            email=workos_profile.email,
            full_name=f"{workos_profile.first_name} {workos_profile.last_name}",
            is_admin=False,
            is_active=True
        )
        db.add(db_user)
    else:
        # Update existing user if necessary
        if db_user.full_name != f"{workos_profile.first_name} {workos_profile.last_name}":
            db_user.full_name = f"{workos_profile.first_name} {workos_profile.last_name}"

    # Update workos_user_id if it's different
    if not db_user.workos_user_id or db_user.workos_user_id != workos_profile.id:
        db_user.workos_user_id = workos_profile.id

    db.commit()
    db.refresh(db_user)
    return db_user

def create_app_session(db: Session, user_id: int, workos_session: dict):
    """
    Create a new app session for a user.
    Returns the session object.
    """
    db_session = models.AppSession(
        user_id=user_id,
        workos_user_id=workos_session.user_id,
        workos_session_id=workos_session.id,
        encrypted_refresh_token=workos_session.refresh_token,
        ip_address=workos_session.ip_address,
        user_agent=workos_session.user_agent,
        refresh_token_expires_at=workos_session.refresh_token_expires_at
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def create_activity_log(db: Session, user_id: int, action: str):
    """
    Create a new activity log entry for a user action.
    """
    activity_log = models.ActivityLog(
        user_id=user_id,
        action=action
    )
    db.add(activity_log)
    db.commit()
    db.refresh(activity_log)
    return activity_log

def get_app_session_by_workos_session_id(db: Session, workos_session_id: str):
    return db.query(models.AppSession).filter(
        models.AppSession.workos_session_id == workos_session_id
    ).first()

def invalidate_session(db: Session, workos_session_id: str):
    """
    Invalidate a session by its WorkOS session ID.
    """
    session = get_app_session_by_workos_session_id(db, workos_session_id)
    if session:
        db.delete(session)
        db.commit()
        return True
    return False

def update_session_activity(db: Session, session_id: int):
    """
    Update the activity timestamp for a session.
    """
    session = db.query(models.AppSession).filter(models.AppSession.id == session_id).first()
    if session:
        session.updated_at = datetime.utcnow()
        db.commit()
        return True
    return False

def update_session_refresh_token(db: Session, session_id: int, refresh_token: str):
    """
    Update the refresh token for a session.
    """
    session = db.query(models.AppSession).filter(models.AppSession.id == session_id).first()
    if session:
        session.encrypted_refresh_token = refresh_token
        db.commit()
        return True
    return False

def create_prediction_log(db: Session, user_id: int, result: str, file_name: str = None):
    """
    Create a new prediction log entry.
    
    Following functional programming principles:
    - Pure function with clear inputs and outputs
    - Creates new data rather than mutating existing data
    - Returns the created entity without side effects beyond database persistence
    
    Args:
        db: Database session
        user_id: ID of the user who made the prediction
        result: Result of the prediction
        file_name: Optional name of the file that was analyzed
        
    Returns:
        The newly created PredictionLog object
    """
    # Create a new immutable object
    prediction_log = models.PredictionLog(
        user_id=user_id,
        result=result,
        file_name=file_name
    )
    
    # Persist to database
    db.add(prediction_log)
    db.commit()
    db.refresh(prediction_log)
    
    # Return the new entity
    return prediction_log
