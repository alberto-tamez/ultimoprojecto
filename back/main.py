from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import get_engine
from .config import get_settings
from .routes import users, logs, history, auth, ai_service

# Get database engine and create tables
engine = get_engine()
models.Base.metadata.create_all(bind=engine)

settings = get_settings()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", # Next.js frontend
        # Add other origins if needed, e.g., your production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(users.router)
app.include_router(logs.router)
app.include_router(history.router)
app.include_router(auth.router)
app.include_router(ai_service.router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with PostgreSQL"}