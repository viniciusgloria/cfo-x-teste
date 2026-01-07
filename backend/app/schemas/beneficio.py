"""
Benefício schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BeneficioBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    valor: float
    tipo: str


class BeneficioCreate(BeneficioBase):
    pass


class Beneficio(BeneficioBase):
    id: int
    ativo: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
