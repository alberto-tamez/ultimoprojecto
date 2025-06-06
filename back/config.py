from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # WorkOS Configuration
    WORKOS_API_KEY: str = os.getenv("WORKOS_API_KEY", "")
    WORKOS_CLIENT_ID: str = os.getenv("WORKOS_CLIENT_ID", "")
    WORKOS_COOKIE_PASSWORD: str = os.getenv("WORKOS_COOKIE_PASSWORD", "")
    WORKOS_REDIRECT_URI: str = os.getenv("WORKOS_REDIRECT_URI", "")
    WORKOS_AUTH_DOMAIN: str = os.getenv("WORKOS_AUTH_DOMAIN", "workos.authkit.app")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
