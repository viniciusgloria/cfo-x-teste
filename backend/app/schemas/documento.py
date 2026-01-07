"""
Documento schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentoBase(BaseModel):
    nome: str
    tipo: str
    url: str
    categoria: Optional[str] = None


class DocumentoCreate(DocumentoBase):
    user_id: int


class Documento(DocumentoBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
