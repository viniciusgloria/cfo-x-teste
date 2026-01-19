"""
Esquemas de lembrete
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LembreteBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_lembrete: datetime


class LembreteCreate(LembreteBase):
    user_id: int


class Lembrete(LembreteBase):
    id: int
    user_id: int
    concluido: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
