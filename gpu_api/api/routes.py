from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import torch
import numpy as np
from collections import Counter
import logging
from model.loader import get_model
from io import StringIO

router = APIRouter()
model, label_map = get_model()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Realiza una predicción del cultivo más probable con base en los datos del CSV cargado.
    Devuelve solo el cultivo más común en todas las predicciones.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))
        logging.info("[CSV] Archivo CSV cargado correctamente.")

        # Preprocesamiento: eliminar columnas que no sean numéricas (opcional)
        df = df.select_dtypes(include=[np.number])

        if df.empty:
            raise ValueError("El CSV no contiene columnas numéricas válidas.")

        # Conversión a tensor
        data_np = df.to_numpy(dtype=np.float32)
        tensor = torch.tensor(data_np)

        logging.info(f"[PREDICT] Datos convertidos a tensor con shape {tensor.shape}")

        # Predicciones
        model.eval()
        with torch.no_grad():
            preds = model(tensor)
            predicted_classes = torch.argmax(preds, dim=1).tolist()

        # Obtener la clase más común
        counts = Counter(predicted_classes)
        most_common_class, count = counts.most_common(1)[0]
        most_common_label = label_map.get(most_common_class, f"clase_{most_common_class}")

        logging.info(f"[RESULTADO] Predicción más común: {most_common_label} (ocurrió {count} veces)")

        return {
            "prediction": most_common_label
        }

    except Exception as e:
        logging.error(f"[ERROR] Al procesar la predicción: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error en la predicción: {str(e)}")
