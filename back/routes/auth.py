from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from jose import jwt
from typing import Dict, Any
import workos
import crud
import json
import requests
from datetime import datetime
from database import get_db
from config import get_settings
from functools import lru_cache

# Initialize WorkOS client
settings = get_settings()
workos.api_key = settings.WORKOS_API_KEY
workos.client_id = settings.WORKOS_CLIENT_ID
workos.redirect_uri = settings.WORKOS_REDIRECT_URI

router = APIRouter()

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

@router.get("/api/auth/login")
async def login():
    """
    Returns the authorization URL for WorkOS User Management authentication.
    
    The frontend will redirect to this URL, WorkOS will authenticate the user,
    and then redirect back to the frontend's callback URL.
    """
    authorization_url = workos.user_management.get_authorization_url(
        client_id=settings.WORKOS_CLIENT_ID,
        redirect_uri=settings.WORKOS_REDIRECT_URI,
        provider="google"  # Can be made configurable
    )
    return {"authorization_url": authorization_url}

@router.post("/api/auth/callback")
async def callback(payload: dict = Body(...), response: Response = None, db: Session = Depends(get_db)):
    """
    Handles the callback from WorkOS after authentication.
    Exchanges code for tokens, provisions user, and sets WorkOS access_token as session cookie.
    """
    try:
        # Extract code from payload
        code = payload.get("code")
        if not code:
            raise HTTPException(status_code=400, detail="Missing code parameter")

        # Exchange code for tokens using WorkOS User Management
        auth_response = workos.user_management.authenticate_with_code(
            code=code,
            client_id=settings.WORKOS_CLIENT_ID,
            redirect_uri=settings.WORKOS_REDIRECT_URI
        )
        
        # Extract tokens and user info
        access_token = auth_response["access_token"]
        refresh_token = auth_response["refresh_token"]
        user = auth_response["user"]
        session_id = auth_response["session_id"]
        
        # Create or update user in our database
        db_user = crud.create_or_update_user(db, user)
        
        # Store session info and refresh token
        session_data = {
            "session_id": session_id,
            "refresh_token": refresh_token,
            "user_id": user["id"]
        }
        crud.create_app_session(db, db_user.id, session_data)
        
        # Set WorkOS access_token directly as secure HTTP-only cookie
        response = JSONResponse(content={"message": "Login successful"})
        response.set_cookie(
            key="session_token",
            value=access_token,  # Using WorkOS token directly
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=30 * 60  # 30 minutes
        )
        
        # Log activity
        crud.create_activity_log(db, db_user.id, "login")
        
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication error: {str(e)}")


@router.post("/auth/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    """
    Handles user logout by:
    1. Validating the WorkOS token
    2. Invalidating the local session
    3. Getting the WorkOS logout URL
    4. Clearing the session cookie
    """
    print("--- LOGOUT ENDPOINT HIT ---") # DEBUG LINE
    try:
        # Get the WorkOS access token from the cookie
        access_token = request.cookies.get("session_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Validate the WorkOS token and extract claims
        try:
            payload = validate_workos_token(access_token)
            session_id = payload.get("sid")
            user_id = payload.get("sub")
            if not session_id:
                raise ValueError("No session ID in token")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Get the WorkOS logout URL
        logout_url = f"https://api.workos.com/user_management/sessions/logout?session_id={session_id}"

        # Invalidate the session in our database
        crud.invalidate_session(db, session_id)
        
        # Log activity if we have a user ID
        if user_id:
            crud.create_activity_log(db, user_id, "logout")

        # Clear the session cookie
        response.delete_cookie("session_token")

        return JSONResponse(
            content={"workos_logout_url": logout_url},
            status_code=200
        )

    except Exception as e:
        print(f"--- ERROR IN LOGOUT ENDPOINT (auth.py): {type(e).__name__} - {str(e)} ---") # DEBUG LINE
        raise HTTPException(status_code=500, detail=f"Internal server error during logout: {str(e)}")


@router.get("/api/auth/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    """
    Returns the current authenticated user's info if the WorkOS session is valid, else 401.
    """
    access_token = request.cookies.get("session_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        # Validate WorkOS token
        payload = validate_workos_token(access_token)
        workos_user_id = payload.get("sub")
        session_id = payload.get("sid")
        
        if not workos_user_id or not session_id:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        
        # Get user from our database by WorkOS user ID
        user = crud.get_user_by_workos_id(db, workos_user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        # Get current session info
        session = crud.get_app_session_by_workos_session_id(db, session_id)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        # Update last activity
        crud.update_session_activity(db, session.id)
            
        return {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "session": {
                "ip_address": session.ip_address,
                "user_agent": session.user_agent,
                "last_activity": session.updated_at
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")


# Helper function to refresh an expired WorkOS token
async def refresh_workos_token(refresh_token: str) -> Dict[str, str]:
    """
    Use a refresh token to get a new access token from WorkOS.
    Returns a dict with new access_token and refresh_token.
    """
    try:
        token_response = workos.user_management.refresh_authentication(
            refresh_token=refresh_token,
            client_id=settings.WORKOS_CLIENT_ID
        )
        return {
            "access_token": token_response["access_token"],
            "refresh_token": token_response["refresh_token"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to refresh token: {str(e)}")

# Helper function to check if a token needs refreshing
def token_needs_refresh(payload: Dict[str, Any]) -> bool:
    """
    Check if a token is close to expiration and needs refreshing.
    Returns True if token expires in less than 5 minutes.
    """
    exp = payload.get("exp")
    if not exp:
        return False
        
    expiration = datetime.fromtimestamp(exp)
    now = datetime.utcnow()
    time_left = expiration - now
    
    # Refresh if less than 5 minutes left
    return time_left.total_seconds() < 300  # 5 minutes in seconds
