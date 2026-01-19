"""
Esquemas de avaliacao
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AvaliacaoBase(BaseModel):
    colaborador_id: int
    avaliador_id: int
    periodo: str
    nota_desempenho: Optional[float] = None
    nota_comportamento: Optional[float] = None
    comentarios: Optional[str] = None


class AvaliacaoCreate(AvaliacaoBase):
    pass


class Avaliacao(AvaliacaoBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
