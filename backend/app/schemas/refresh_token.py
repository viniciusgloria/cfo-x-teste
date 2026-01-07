"""
Refresh Token Schemas
"""
from pydantic import BaseModel
from datetime import datetime


class RefreshTokenRequest(BaseModel):
    """Request para renovar access token usando refresh token"""
    refresh_token: str


class TokenPairResponse(BaseModel):
    """Resposta com access token e refresh token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_expires_in: int = 900  # 15 minutos em segundos
    refresh_expires_in: int = 604800  # 7 dias em segundos
