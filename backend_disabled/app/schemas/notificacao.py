"""
Esquemas de notificacao
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificacaoBase(BaseModel):
    titulo: str
    mensagem: str
    tipo: str


class NotificacaoCreate(NotificacaoBase):
    user_id: int


class Notificacao(NotificacaoBase):
    id: int
    user_id: int
    lida: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
