"""
Cliente schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.cliente import StatusContrato


class ClienteCreate(BaseModel):
    """Create client"""
    nome: str
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    status: StatusContrato = StatusContrato.ATIVO
    mrr: float = 0
    data_inicio: Optional[datetime] = None
    responsavel_id: Optional[int] = None


class ClienteUpdate(BaseModel):
    """Update client"""
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    status: Optional[StatusContrato] = None
    mrr: Optional[float] = None
    responsavel_id: Optional[int] = None


class ClienteResponse(BaseModel):
    """Client response"""
    id: int
    nome: str
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    status: StatusContrato
    mrr: float
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    responsavel_id: Optional[int] = None
    omie_id: Optional[str] = None
    omie_sync: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
