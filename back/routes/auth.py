from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Optional
import workos
import schemas
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
    return RedirectResponse(url="/")


@router.post("/api/auth/callback")
async def post_callback(
    payload: dict = Body(...),
    response: Response = None,
    db: Session = Depends(get_db)
):
    """
    Handles the callback from WorkOS after authentication, exchanges code for tokens, provisions user, sets session cookie.
    """
    code = payload.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code in request body")
    try:
        profile = workos.client.sso.get_profile_and_token(code)
        user_info = profile.profile
        user = crud.get_user_by_email(db, email=user_info.email)
        if not user:
            user_data = schemas.UserCreate(
                email=user_info.email,
                name=f"{user_info.first_name} {user_info.last_name}".strip(),
                role="user",
                google_id=user_info.id,
            )
            user = crud.create_user(db=db, user=user_data)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        resp = JSONResponse(status_code=200, content={"message": "Authenticated"})
        resp.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=not settings.DEBUG,
            samesite="lax"
        )
        return resp
    except Exception:
        raise HTTPException(status_code=400, detail="Could not validate credentials")


@router.get("/api/auth/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    """
    Returns the current authenticated user's info if the session is valid, else 401.
    """
    token = request.cookies.get("access_token")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token[7:], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = crud.get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"id": user.id, "email": user.email, "name": user.name}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/api/auth/logout")
async def logout(response: Response):
    """
    Log the user out by clearing the authentication cookie.
    Returns the WorkOS logout URL to end the global session.
    """
    resp = JSONResponse({"workos_logout_url": "https://api.workos.com/user_management/sessions/logout"})
    resp.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return resp

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
