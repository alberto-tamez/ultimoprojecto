from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import requests  # For making HTTP requests to the AI microservice
import json
import logging
from typing import Dict, Any

from auth import get_current_active_user  # Authentication dependency
from database import get_db  # Database session dependency
from models import User  # User model for type hinting
from config import get_settings  # For potential future configuration

settings = get_settings()
router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
)
logger = logging.getLogger(__name__)

# Configuration - Pure values
AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337"  # Base URL for the AI microservice
AI_PREDICT_ENDPOINT = f"{AI_MICROSERVICE_BASE_URL}/analyze-csv"  # Correct endpoint for CSV analysis

# Pure function to construct API URLs
def get_ai_endpoint(path: str) -> str:
    """Pure function to construct AI microservice endpoint URLs"""
    return f"{AI_MICROSERVICE_BASE_URL}/{path}"

@router.post("/forward/{path:path}")
@router.get("/forward/{path:path}") # Add GET support
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
        logger.error(f"Unexpected error forwarding to AI microservice: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error while forwarding request: {str(e)}")


def validate_file_extension(filename: str) -> bool:
    """
    Pure function to validate file extension.
    
    Args:
        filename: Name of the file to validate
        
    Returns:
        bool: True if file has a .csv extension, False otherwise
    """
    return filename.lower().endswith('.csv')


async def process_csv_with_ai(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Pure function to process a CSV file with the AI microservice.
    
    Args:
        file_content: Raw bytes of the CSV file
        filename: Name of the file
        
    Returns:
        Dict[str, Any]: JSON response from the AI microservice
        
    Raises:
        HTTPException: If there's an error communicating with the microservice
    """
    try:
        # Create immutable data structure for the request
        files = {'file': (filename, file_content, 'text/csv')}
        
        # Log the request attempt
        logger.info(f"Sending request to AI microservice at {AI_PREDICT_ENDPOINT}")
        
        # Make the request with proper error handling
        response = requests.post(
            AI_PREDICT_ENDPOINT,
            files=files,
            timeout=30  # 30 seconds timeout
        )
        
        # Log the response status
        logger.info(f"AI microservice response status: {response.status_code}")
        
        # Handle HTTP errors
        response.raise_for_status()
        
        # Return the parsed JSON response
        return response.json()
    except requests.exceptions.ConnectionError as e:
        # Connection errors (e.g., service not running, network issues)
        error_msg = f"Cannot connect to AI microservice at {AI_PREDICT_ENDPOINT}: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI microservice unavailable: {str(e)}"
        )
    except requests.exceptions.Timeout as e:
        # Timeout errors
        error_msg = f"Timeout connecting to AI microservice: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI microservice request timed out"
        )
    except requests.exceptions.HTTPError as e:
        # HTTP errors from the microservice
        error_msg = f"AI microservice returned error: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI microservice error: {str(e)}"
        )
    except requests.exceptions.RequestException as e:
        # All other request errors
        error_msg = f"Error calling AI microservice: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to process request with AI microservice: {str(e)}"
        )
    except Exception as e:
        # Unexpected errors
        error_msg = f"Unexpected error processing request: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Pure function to check if a file is a CSV
def is_csv_file(filename: str) -> bool:
    """Pure function to validate if a filename has a .csv extension"""
    return filename.lower().endswith('.csv')

@router.get("/test")
async def test_connection():
    """Test endpoint to verify API connectivity without authentication"""
    return {"status": "success", "message": "AI service API is accessible"}

@router.get("/test-auth")
async def test_auth_connection(current_user: User = Depends(get_current_active_user)):
    """Test endpoint to verify authentication is working"""
    return {
        "status": "success", 
        "message": "Authentication successful", 
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "is_active": current_user.is_active
        }
    }

@router.post("/predict-test", include_in_schema=True)
async def predict_from_csv_test(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> JSONResponse:
    """
    Test endpoint to accept a CSV file and forward it to the AI microservice without authentication.
    This is for testing purposes only and should be removed in production.
    
    Args:
        file: CSV file to process
        db: Database session
        
    Returns:
        JSONResponse: Response from the AI microservice
    """
    # Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are accepted"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Process the CSV with the AI microservice
        result = await process_csv_with_ai(file_content, file.filename)
        
        # Log the successful request
        logger.info(f"Successfully processed CSV file: {file.filename}")
        
        # Return the AI microservice response
        return JSONResponse(content=result)
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        # Log and handle other exceptions
        logger.error(f"Error processing CSV file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV file: {str(e)}"
        )

@router.post("/predict")
async def predict_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> JSONResponse:
    """
    Endpoint to accept a CSV file, forward it to the AI microservice,
    and return the prediction results.
    
    Args:
        file: CSV file to process
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        JSONResponse: Response from the AI microservice
    """
    # Validate file type
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )

    try:
        # Read file content
        file_content = await file.read()
        
        # Process with AI microservice
        result = await process_csv_with_ai(file_content, file.filename)
        
        # Log the prediction request
        logger.info(f"Prediction requested by user {current_user.id} for file {file.filename}")
        
        # Return the AI microservice response
        return JSONResponse(content=result)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing prediction: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing your request"
        )
