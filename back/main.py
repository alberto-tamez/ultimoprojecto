from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import models, schemas, crud, auth
from database import engine, get_db
from config import get_settings
from routes import login, users, logs, predict, history

# Create database tables
models.Base.metadata.create_all(bind=engine)

settings = get_settings()
app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(login.router)
app.include_router(logs.router)
app.include_router(history.router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with PostgreSQL"}