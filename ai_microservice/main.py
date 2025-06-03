from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

from config import get_settings

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, str]:
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

# Example request model
class AIRequest(BaseModel):
    text: str
    parameters: Optional[Dict[str, Any]] = None

# Example response model
class AIResponse(BaseModel):
    result: str
    metadata: Optional[Dict[str, Any]] = None

# Example AI processing endpoint
@app.post("/process", response_model=AIResponse)
async def process_text(request: AIRequest) -> AIResponse:
    """
    Process input text using AI and return the result.
    
    This is a placeholder for your AI processing logic.
    """
    # Example processing - replace with actual AI logic
    processed_text = f"Processed: {request.text.upper()}"
    
    return AIResponse(
        result=processed_text,
        metadata={
            "model": "example_model",
            "parameters": request.parameters or {}
        }
    )

# Root endpoint with service information
@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with service information"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }

def start():
    """Run the FastAPI application"""
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )

if __name__ == "__main__":
    start()
