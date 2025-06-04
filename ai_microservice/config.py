from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
from functools import lru_cache

class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Application Settings
    APP_NAME: str = "CSV Analysis Service"
    APP_VERSION: str = "1.0.0"
    
    # CORS - Accepts comma-separated list of origins or "*" for all
    CORS_ORIGINS: Union[str, List[str]] = "*"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith('['):
            return [origin.strip() for origin in v.split(",")] if v != "*" else ["*"]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

@lru_cache()
def get_settings() -> Settings:
    return Settings()
