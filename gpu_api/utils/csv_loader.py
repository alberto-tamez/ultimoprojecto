import pandas as pd
import numpy as np
import torch
from fastapi import UploadFile

def load_csv_as_tensor(file: UploadFile) -> torch.Tensor:
    try:
        df = pd.read_csv(file.file)

        # Eliminar columnas no numéricas automáticamente
        df_numeric = df.select_dtypes(include=[np.number])

        if df_numeric.empty:
            raise ValueError("El CSV no contiene columnas numéricas.")

        # Convertimos a tensor
        tensor = torch.tensor(df_numeric.values, dtype=torch.float32)
        return tensor

    except Exception as e:
        raise ValueError(f"Error procesando el CSV: {e}")
