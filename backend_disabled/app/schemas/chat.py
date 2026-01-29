"""
Esquemas de chat
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ChatMessageBase(BaseModel):
    mensagem: str
    destinatario_id: int


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessage(ChatMessageBase):
    id: int
    remetente_id: int
    lida: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
