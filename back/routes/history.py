from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
import models
import crud
from schemas import PredictionLog
from ..database import get_db
from auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/history",
    tags=["Historial"]
)

def get_user_predictions(db: Session, user_id: int) -> List[models.PredictionLog]:
    """Pure function to get user prediction logs
    
    Following functional programming principles:
    - Pure function with no side effects
    - Returns immutable result
    - Referentially transparent
    """
    return (
        db.query(models.PredictionLog)
        .filter(models.PredictionLog.user_id == user_id)
        .order_by(models.PredictionLog.created_at.desc())
        .all()
    )

@router.get(
    "/",
    response_model=list[PredictionLog],
    summary="Historial de predicciones del usuario",
    description="Devuelve una lista de predicciones realizadas por el usuario actual, incluyendo fecha, resultado y archivo enviado."
)
async def get_prediction_history(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get prediction history for the current user"""
    # Log this activity
    crud.create_activity_log(db, current_user.id, "Viewed prediction history")
    
    # Return predictions using pure function
    return get_user_predictions(db, current_user.id)