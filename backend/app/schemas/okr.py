"""
OKR schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.okr import TipoOKR


class OKRCreate(BaseModel):
    """Create OKR"""
    tipo: TipoOKR
    objetivo: str
    key_result: str
    meta: float
    atual: float = 0
    unidade: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    descricao: Optional[str] = None
    setor: Optional[str] = None


class OKRUpdate(BaseModel):
    """Update OKR"""
    atual: Optional[float] = None
    objetivo: Optional[str] = None
    key_result: Optional[str] = None
    meta: Optional[float] = None


class OKRResponse(BaseModel):
    """OKR response"""
    id: int
    user_id: int
    tipo: TipoOKR
    objetivo: str
    key_result: str
    meta: float
    atual: float
    unidade: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    descricao: Optional[str] = None
    setor: Optional[str] = None
    progresso: float
    created_at: datetime
    
    class Config:
        from_attributes = True
