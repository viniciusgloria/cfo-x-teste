"""
Configuracao da aplicacao
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Configuracoes da aplicacao"""
    
    # Ambiente
    ENVIRONMENT: str = "development"
    
    # Banco de dados
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Aplicacao
    APP_NAME: str = "CFO X API"
    APP_VERSION: str = "0.0.0 Em Desenvolvimento"
    DEBUG: bool = False
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Logs
    LOG_LEVEL: str = "INFO"
    
    # OMIE (para uso futuro)
    OMIE_API_KEY: str = ""
    OMIE_API_SECRET: str = ""
    OMIE_APP_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Interpreta origens CORS - permite URL do frontend e localhost em dev"""
        origins = [self.FRONTEND_URL]
        if self.ENVIRONMENT == "development" or self.DEBUG:
            origins.extend([
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://172.18.0.6:5173",  # Docker network  # Permite todas as origens em desenvolvimento
            ])
        return origins
    
    @property
    def is_production(self) -> bool:
        """Verifica se esta em producao"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_staging(self) -> bool:
        """Verifica se esta em staging"""
        return self.ENVIRONMENT == "staging"


settings = Settings()
