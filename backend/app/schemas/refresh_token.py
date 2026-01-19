"""
Esquemas de token de renovacao
"""
from pydantic import BaseModel
from datetime import datetime


class RefreshTokenRequest(BaseModel):
    """Requisicao para renovar token de acesso usando token de renovacao"""
    refresh_token: str


class TokenPairResponse(BaseModel):
    """Resposta com token de acesso e token de renovacao"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_expires_in: int = 900  # 15 minutos em segundos
    refresh_expires_in: int = 604800  # 7 dias em segundos
