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

import uuid
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
import models

def create_or_update_session(db: Session, user_id: int, auth_response: dict):
    """
    Pure function: Create a new session with internal UUID, storing WorkOS tokens and expiration. Returns the new session object.
    """
    access_token = auth_response["access_token"]
    try:
        token_payload = jwt.get_unverified_claims(access_token)
        expires_at = datetime.fromtimestamp(token_payload.get("exp", 0))
    except Exception:
        expires_at = datetime.utcnow() + timedelta(minutes=15)
    session = models.AppSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        workos_session_id=auth_response["session_id"],
        access_token=access_token,
        refresh_token=auth_response["refresh_token"],
        expires_at=expires_at,
        is_active=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

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

def get_session_by_id(db: Session, session_id: str):
    """
    Pure function: Fetch session by internal UUID session ID. Returns the session object or None.
    """
    return db.query(models.AppSession).filter(models.AppSession.id == session_id).first()

def invalidate_session(db: Session, workos_session_id: str = None, session_id: str = None):
    """
    Pure function: Invalidate a session by WorkOS session ID or internal session ID. Returns True if deleted.
    """
    session = None
    if session_id:
        session = get_session_by_id(db, session_id)
    elif workos_session_id:
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

def update_session_tokens(db: Session, session_id: str, new_tokens: dict):
    """
    Pure function: Update access_token, refresh_token, and expires_at for a session by internal session ID. Returns the updated session.
    """
    session = get_session_by_id(db, session_id)
    if session:
        session.access_token = new_tokens["access_token"]
        session.refresh_token = new_tokens["refresh_token"]
        try:
            token_payload = jwt.get_unverified_claims(new_tokens["access_token"])
            session.expires_at = datetime.fromtimestamp(token_payload.get("exp", 0))
        except Exception:
            session.expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        db.refresh(session)
        return session
    return None

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
