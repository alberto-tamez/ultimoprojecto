import pandas as pd
import torch
import io
from fastapi import UploadFile, HTTPException

async def csv_to_tensor(file: UploadFile):
    try:
        # Leer y decodificar el archivo
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))

        # Convertir a tensor float32
        return torch.tensor(df.values, dtype=torch.float32)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando el CSV: {str(e)}")
