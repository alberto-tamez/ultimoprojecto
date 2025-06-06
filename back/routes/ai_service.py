from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import requests # For making HTTP requests to the AI microservice
import json

from auth import get_current_active_user # Authentication dependency
from database import get_db # Database session dependency
from models import User # User model for type hinting
from config import get_settings # For potential future configuration

settings = get_settings()
router = APIRouter()

AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337" # As provided by the user

@router.post("/api/ai/forward/{path:path}")
@router.get("/api/ai/forward/{path:path}") # Add GET support
async def forward_to_ai_microservice(
    path: str, # Captures the rest of the path
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Ensures user is authenticated
):
    """
    Authenticated endpoint to forward requests to the AI microservice.
    It captures the path and forwards the request body, method, and relevant headers.
    """
    target_url = f"{AI_MICROSERVICE_BASE_URL}/{path}"

    # Prepare data and headers for the forwarded request
    data = await request.body()
    headers = {
        key: value for key, value in request.headers.items()
        if key.lower() not in ['host', 'connection', 'accept-encoding', 'content-length'] # Filter out problematic headers
    }
    # Ensure Content-Type is preserved or set
    if 'content-type' not in headers and data:
        headers['content-type'] = 'application/json' # Default if not present and body exists

    try:
        method = request.method.upper()
        
        response = requests.request(
            method=method,
            url=target_url,
            headers=headers,
            data=data,
            params=request.query_params,
            timeout=30 # Adding a timeout
        )

        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        # Try to parse JSON, otherwise return raw content
        try:
            response_json = response.json()
            return JSONResponse(content=response_json, status_code=response.status_code)
        except json.JSONDecodeError:
            # If not JSON, return raw text content with appropriate content type
            # For simplicity, we'll return as JSON with a detail field for non-JSON responses
            # A more robust solution might inspect response.headers['Content-Type']
            return JSONResponse(content={"detail": response.text}, status_code=response.status_code)

    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail=f"AI microservice unavailable at {target_url}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail=f"AI microservice request timed out for {target_url}")
    except requests.exceptions.HTTPError as e:
        error_detail = f"AI microservice error: {e.response.status_code}"
        try:
            error_content = e.response.json()
        except json.JSONDecodeError:
            error_content = e.response.text
        
        print(f"AI Microservice Error Content: {error_content}")
        return JSONResponse(
            content={"detail": error_detail, "microservice_response": error_content},
            status_code=e.response.status_code
        )
    except Exception as e:
        print(f"Unexpected error forwarding to AI microservice: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error while forwarding request: {str(e)}")
