from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
import pandas as pd
import json
from datetime import datetime

from .. import models, schemas, crud
from ..database import get_db
from ..auth import get_current_user
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    tags=["Predicción"]
)

@router.post("/", response_model=dict)
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    # 1. Leer el archivo CSV
    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Archivo CSV inválido")

    # 2. Simular modelo (puedes reemplazar esta función)
    result = {"recommended_crop": "maíz", "confidence": 0.87}

    # 3. Guardar en base de datos
    log_entry = models.PredictionLog(
        user_id=current_user.id,
        timestamp=datetime.utcnow(),
        result=json.dumps(result),
        file_name=file.filename
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return result