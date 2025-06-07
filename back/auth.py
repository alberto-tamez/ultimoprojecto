from typing import Dict, Any, Tuple
from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
import models
import crud
from config import get_settings
from database import get_db
import requests
from jose import jwt
import json
from functools import lru_cache
import workos
from datetime import timedelta, datetime

settings = get_settings()

# WorkOS JWKS URL for token validation
WORKOS_JWKS_URL = "https://api.workos.com/.well-known/jwks.json"

@lru_cache(maxsize=1)
def get_workos_jwks() -> Dict[str, Any]:
    """Fetch and cache WorkOS JWKS (JSON Web Key Set)"""
    response = requests.get(WORKOS_JWKS_URL)
    response.raise_for_status()
    return response.json()

def get_jwk_by_kid(token: str) -> Dict[str, Any]:
    """Extract the key ID from token header and find the matching JWK"""
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    if not kid:
        raise ValueError("No 'kid' in token header")
        
    jwks = get_workos_jwks()
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            return jwk
            
    raise ValueError(f"No JWK found for kid: {kid}")

def validate_workos_token(token: str) -> Dict[str, Any]:
    """Validate a WorkOS JWT token using JWKS"""
    try:
        jwk = get_jwk_by_kid(token)
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.WORKOS_CLIENT_ID
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid WorkOS token: {str(e)}")

# Dependency to get the internal session ID from the cookie

def get_session_id_from_cookie(request: Request) -> str:
    session_id = request.cookies.get("session_token")  # Unified cookie name
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated: No session cookie.")
    return session_id

async def refresh_token_if_needed(db: Session, session_id: str, payload: Dict[str, Any]) -> Tuple[str, str]:
    """Check if token needs refresh and refresh if needed"""
    # Get expiration time
    exp = payload.get("exp")
    if not exp:
        return None, None
    
    # Check if token is about to expire (less than 5 minutes)
    from datetime import datetime
    expiration = datetime.fromtimestamp(exp)
    now = datetime.utcnow()
    time_left = expiration - now
    
    # If more than 5 minutes left, no need to refresh
    if time_left.total_seconds() > 300:
        return None, None
        
    # Get refresh token from database
    session = crud.get_app_session_by_workos_session_id(db, session_id)
    if not session or not session.refresh_token:
        return None, None
        
    try:
        # Refresh token
        token_response = workos.user_management.refresh_authentication(
            refresh_token=session.refresh_token,
            client_id=settings.WORKOS_CLIENT_ID
        )
        
        # Update session with new refresh token
        crud.update_session_refresh_token(
            db, 
            session.id, 
            token_response["refresh_token"]
        )
        
        return token_response["access_token"], token_response["refresh_token"]
    except Exception:
        return None, None

# REPLACEMENT for get_current_user
async def get_current_active_user(
    session_id: str = Depends(get_session_id_from_cookie),
    db: Session = Depends(get_db)
) -> models.User:
    session = crud.get_session_by_id(db, session_id)
    if not session or not session.is_active:
        raise HTTPException(status_code=401, detail="Invalid or inactive session.")

    # Check if the access token is expired or close to expiring
    if session.expires_at < datetime.utcnow() + timedelta(minutes=1):
        try:
            # Token needs refresh.
            new_tokens = await refresh_workos_token(session.refresh_token)
            # Update the session in the database with the new tokens
            crud.update_session_tokens(db, session.id, new_tokens)
        except Exception as e:
            # Refresh failed, invalidate the session and force re-login
            crud.invalidate_session(db, session_id=session.id)
            raise HTTPException(status_code=401, detail=f"Session expired, refresh failed: {str(e)}")

    # At this point, the session is valid and the access token is fresh.
    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive.")
    return user

# Helper: refresh WorkOS token using refresh_token
async def refresh_workos_token(refresh_token: str) -> dict:
    try:
        token_response = workos.user_management.refresh_authentication(
            refresh_token=refresh_token,
            client_id=settings.WORKOS_CLIENT_ID
        )
        return token_response
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token refresh failed: {str(e)}")

# --- Backward compatibility export ---
async def get_current_user(request: Request, response: Response, db: Session = Depends(get_db)) -> models.User:
    """
    Dependency function to get the current user.
    It validates the session token from the cookie against WorkOS.
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Get the access token from the cookie
    token = request.cookies.get("workos_access_token")  # Use the name you set in your callback
    if token is None:
        raise credentials_exception

    try:
        # 2. Validate the token using WorkOS JWKS
        payload = validate_workos_token(token)
        
        # Extract the WorkOS user ID from the token
        workos_user_id = payload.get("sub")  # 'sub' claim holds the user ID
        if workos_user_id is None:
            raise credentials_exception
        
        # 3. Get user from your local database
        user = crud.get_user_by_workos_id(db, workos_user_id=workos_user_id)
        if user is None:
            raise credentials_exception
        
        # 4. Check if token needs refresh
        new_access_token, new_refresh_token = await refresh_token_if_needed(db, payload.get("sid"), payload)
        
        # Check if token needs refresh and set cookie if new token is obtained
        new_access_token, _ = await refresh_token_if_needed(db, payload.get("sid"), payload)
        
        if new_access_token:
            response.set_cookie(
                key="workos_access_token",
                value=new_access_token,
                httponly=True,
                secure=settings.ENVIRONMENT == "production",
                samesite="lax",
                path="/",
                # Consider setting max_age based on the new token's actual expiry
            )
            
        return user
    except Exception as e:
        # This would catch invalid tokens, signatures, expiry etc.
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
