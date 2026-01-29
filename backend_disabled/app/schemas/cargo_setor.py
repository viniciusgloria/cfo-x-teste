"""
Esquemas de cargo e setor
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CargoCreate(BaseModel):
    """Cria cargo"""
    nome: str
    descricao: Optional[str] = None
    nivel: Optional[str] = None


class CargoResponse(BaseModel):
    """Resposta de cargo"""
    id: int
    nome: str
    descricao: Optional[str] = None
    nivel: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SetorCreate(BaseModel):
    """Cria setor"""
    nome: str
    descricao: Optional[str] = None
    gestor_id: Optional[int] = None


class SetorResponse(BaseModel):
    """Resposta de setor"""
    id: int
    nome: str
    descricao: Optional[str] = None
    gestor_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
