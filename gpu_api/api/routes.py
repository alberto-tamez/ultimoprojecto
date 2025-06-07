from fastapi import APIRouter, UploadFile, File, HTTPException, status
import pandas as pd
import torch
import numpy as np
from collections import Counter
import logging
from model.loader import get_model
from io import StringIO
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
model, label_map = get_model()

@router.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Process a CSV file and predict the most suitable crop based on soil and climate data.
    
    Args:
        file: CSV file with soil and climate parameters
        
    Returns:
        Dict with predictions, metadata, and processed data
        
    Raises:
        HTTPException: If there's an error processing the file or making predictions
    """
    try:
        # Read file content
        contents = await file.read()
        logger.info("CSV file loaded successfully")
        
        # Parse CSV data
        df = pd.read_csv(StringIO(contents.decode("utf-8")))
        
        # Select only numeric columns for processing
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            raise ValueError("CSV does not contain valid numeric columns")
            
        # Convert to tensor (immutable operation)
        data_np = numeric_df.to_numpy(dtype=np.float32)
        tensor = torch.tensor(data_np)
        
        logger.info(f"Data converted to tensor with shape {tensor.shape}")
        
        # Make predictions using the model
        model.eval()
        with torch.no_grad():
            preds = model(tensor)
            predicted_classes = torch.argmax(preds, dim=1).tolist()
            confidence_scores = torch.nn.functional.softmax(preds, dim=1).max(dim=1)[0].tolist()
        
        # Process predictions as a list of objects with crop name as key and confidence as value
        predictions = []
        for i, (pred_class, confidence) in enumerate(zip(predicted_classes, confidence_scores)):
            # Get the crop label from the mapping
            crop_label = label_map.get(pred_class, f"unknown_{pred_class}")
            
            # Create a prediction object with crop name as key and confidence as value
            predictions.append({crop_label: round(float(confidence), 4)})
        
        # Get the most common prediction
        counts = Counter(predicted_classes)
        most_common_class, count = counts.most_common(1)[0]
        most_common_label = label_map.get(most_common_class, f"unknown_{most_common_class}")
        
        logger.info(f"Most common prediction: {most_common_label} (occurred {count} times)")
        
        # Return structured response matching the specified format
        return {
            "predictions": predictions,
            "metadata": {
                "samples_processed": len(df),
                "features_used": len(numeric_df.columns),
                "model_type": "PyTorch Neural Network"
            }
        }

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing prediction: {str(e)}"
        )
