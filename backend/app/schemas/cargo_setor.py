"""
Cargo and Setor schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CargoCreate(BaseModel):
    """Create position"""
    nome: str
    descricao: Optional[str] = None
    nivel: Optional[str] = None


class CargoResponse(BaseModel):
    """Position response"""
    id: int
    nome: str
    descricao: Optional[str] = None
    nivel: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SetorCreate(BaseModel):
    """Create department"""
    nome: str
    descricao: Optional[str] = None
    gestor_id: Optional[int] = None


class SetorResponse(BaseModel):
    """Department response"""
    id: int
    nome: str
    descricao: Optional[str] = None
    gestor_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
