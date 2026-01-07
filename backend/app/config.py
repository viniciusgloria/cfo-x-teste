"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Application
    APP_NAME: str = "CFO Hub API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # OMIE (for future use)
    OMIE_API_KEY: str = ""
    OMIE_API_SECRET: str = ""
    OMIE_APP_KEY: str = ""
    
    # Azure Storage (opcional)
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER_NAME: str = "documents"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins - permite frontend URL e localhost em dev"""
        origins = [self.FRONTEND_URL]
        if self.ENVIRONMENT == "development":
            origins.extend([
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
            ])
        return origins
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_staging(self) -> bool:
        """Check if running in staging"""
        return self.ENVIRONMENT == "staging"


settings = Settings()
