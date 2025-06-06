from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Optional
import workos
import crud
import json
from datetime import datetime, timedelta
from database import get_db
from config import get_settings

router = APIRouter()
settings = get_settings()

# Initialize WorkOS
workos.api_key = settings.WORKOS_API_KEY
workos.base_api_url = "https://api.workos.com"

@router.get("/api/auth/login")
async def login():
    """
    Initiate the login process with WorkOS.
    Returns the authorization URL to redirect the user to WorkOS for authentication.
    """
    authorization_url = workos.client.sso.get_authorization_url(
        client_id=settings.WORKOS_CLIENT_ID,
        redirect_uri=settings.WORKOS_REDIRECT_URI,
        state=json.dumps({"provider": "Google"}),  # Or make this configurable
    )
    
    return {"authorization_url": authorization_url}

@router.get("/api/auth/callback")
async def callback(code: str, request: Request, db: Session = Depends(get_db)):
    """
    [DEPRECATED] Use POST /api/auth/callback instead. This endpoint is kept for backward compatibility.
    """


@router.post("/api/auth/callback")
async def post_callback(
    payload: dict = Body(...),
    response: Response = None,
    db: Session = Depends(get_db)
):
    """
    Handles the callback from WorkOS after authentication, exchanges code for tokens, provisions user, sets session cookie.
    """
    # Extract code from payload
    code = payload.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing code parameter")

    try:
        # Exchange code for tokens
        tokens = workos.client.sso.get_connection_tokens(
            code=code,
            redirect_uri=settings.WORKOS_REDIRECT_URI,
        )

        # Create or update user
        user = await crud.get_or_create_user(db, tokens)
        
        # Create JWT access token
        access_token = create_access_token(
            data={"sub": user.id, "sid": tokens.session.id},
            expires_delta=timedelta(hours=8)  # Match the frontend cookie duration
        )

        # Set the session cookie
        response.set_cookie(
            key="session_token",
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="lax",
            max_age=60 * 60 * 8,  # 8 hours
        )

        return {"user": user, "session_token": access_token}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    """
    Handles user logout by:
    1. Invalidating the local session
    2. Getting the WorkOS logout URL
    3. Clearing the session cookie
    """
    try:
        # Get the session token from the cookie
        session_token = request.cookies.get("session_token")
        if not session_token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Decode the JWT to get the session ID and user info
        try:
            payload = jwt.decode(
                session_token,
                settings.WORKOS_COOKIE_PASSWORD,
                algorithms=["HS256"]
            )
            session_id = payload.get("sid")
            user_id = payload.get("sub")
            if not session_id or not user_id:
                raise ValueError("Invalid session token")
        except (JWTError, ValueError) as e:
            raise HTTPException(status_code=401, detail=str(e))

        # Get the WorkOS logout URL
        logout_url = f"https://api.workos.com/user_management/sessions/logout?session_id={session_id}"

        # Invalidate the session in our database
        crud.invalidate_session(db, session_id)
        
        # Log activity
        crud.create_activity_log(db, int(user_id), "logout")

        # Clear the session cookie
        response.delete_cookie("session_token")

        return JSONResponse(
            content={"workos_logout_url": logout_url},
            status_code=200
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/auth/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    """
    Returns the current authenticated user's info if the session is valid, else 401.
    """
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(
            token,
            settings.WORKOS_COOKIE_PASSWORD,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user info
        user = crud.get_user_by_id(db, id=int(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        # Get current session info
        session = crud.get_app_session_by_workos_session_id(db, payload.get("sid"))
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
            
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
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
