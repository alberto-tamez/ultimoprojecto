from typing import Dict, Any, Tuple
from fastapi import Depends, HTTPException, status, Request
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

def get_token_from_request(request: Request) -> str:
    """Extract token from cookie or authorization header"""
    # First try to get from cookie
    token = request.cookies.get("session_token")
    
    # If not in cookie, try authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return token

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

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    """Validate WorkOS session and return the current user"""
    try:
        # Get token from request
        token = get_token_from_request(request)
        
        # Validate token
        payload = validate_workos_token(token)
        
        # Extract claims
        workos_user_id = payload.get("sub")
        session_id = payload.get("sid")
        
        if not workos_user_id or not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims"
            )
        
        # Check if session exists in database
        session = crud.get_app_session_by_workos_session_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session"
            )
        
        # Get user from database
        user = crud.get_user_by_workos_id(db, workos_user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Update session activity
        crud.update_session_activity(db, session.id)
        
        # Check if token needs refresh
        new_token, new_refresh = await refresh_token_if_needed(db, session_id, payload)
        if new_token:
            # In a real implementation, you would set the new token in a cookie here
            # This would require modifying the return type to include both user and response
            # For now, we'll just return the user
            pass
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )
