from fastapi import FastAPI
from api.routes import router as prediction_router

# Crear la app de FastAPI
app = FastAPI(
    title="Crop Prediction API",
    description="API para predecir el cultivo recomendado a partir de un archivo CSV usando un modelo entrenado.",
    version="1.0.0"
)

# Incluir las rutas definidas en api/routes.py
app.include_router(prediction_router)
