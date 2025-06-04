from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from io import StringIO
import logging

from config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="CSV Analysis Service",
    version="1.0.0",
    description="A microservice for analyzing CSV files with a neural network",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class AnalysisResult(BaseModel):
    predictions: List[float]
    metadata: Dict[str, Any]

# Dummy neural network model
def train_dummy_model(X: np.ndarray, y: np.ndarray) -> MLPClassifier:
    """Train a simple neural network model."""
    model = MLPClassifier(
        hidden_layer_sizes=(10, 5),
        max_iter=1000,
        random_state=42
    )
    model.fit(X, y)
    return model

def process_csv(file_content: str) -> Dict[str, Any]:
    """Process CSV file and return predictions."""
    try:
        # Read CSV into DataFrame
        df = pd.read_csv(StringIO(file_content))
        
        # Simple preprocessing
        # Assuming last column is the target and others are features
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        
        # Train a simple model (in production, you'd load a pre-trained model)
        model = train_dummy_model(X, y)
        
        # Make predictions (here we're just using the training data for demo)
        predictions = model.predict_proba(X)[:, 1].tolist()
        
        return {
            "predictions": predictions,
            "metadata": {
                "samples_processed": len(X),
                "features_used": X.shape[1],
                "model_type": "MLPClassifier"
            }
        }
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Error processing CSV: {str(e)}"
        )

# Single endpoint for CSV analysis
@app.post("/analyze-csv", response_model=AnalysisResult)
async def analyze_csv(file: UploadFile = File(...)) -> AnalysisResult:
    """
    Analyze a CSV file using a neural network.
    
    The CSV should have features in all columns except the last one,
    which will be treated as the target variable.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported"
        )
    
    try:
        content = await file.read()
        result = process_csv(content.decode('utf-8'))
        return AnalysisResult(**result)
    except Exception as e:
        logger.error(f"Error in analyze_csv: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the file: {str(e)}"
        )

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

# Root endpoint with service information
@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with service information"""
    return {
        "service": "CSV Analysis Service",
        "version": "1.0.0",
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
