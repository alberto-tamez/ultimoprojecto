from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models
from ..schemas import PredictionLog
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/history",
    tags=["Historial"]
)

@router.get(
    "/",
    response_model=list[PredictionLog],
    summary="Historial de predicciones del usuario",
    description="Devuelve una lista de predicciones realizadas por el usuario actual, incluyendo fecha, resultado y archivo enviado."
)
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return (
        db.query(models.PredictionLog)
        .filter(models.PredictionLog.user_id == current_user.id)
        .order_by(models.PredictionLog.timestamp.desc())
        .all()
    )