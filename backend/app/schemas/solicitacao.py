"""
Solicitação schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.solicitacao import TipoSolicitacao, StatusSolicitacao


class SolicitacaoCreate(BaseModel):
    """Create request"""
    tipo: TipoSolicitacao
    titulo: str
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    valor: Optional[float] = None
    sala: Optional[str] = None
    quantidade: Optional[int] = None
    anexos: Optional[str] = None


class SolicitacaoUpdate(BaseModel):
    """Update request status"""
    status: StatusSolicitacao
    resposta: Optional[str] = None


class SolicitacaoResponse(BaseModel):
    """Request response"""
    id: int
    user_id: int
    tipo: TipoSolicitacao
    titulo: str
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    valor: Optional[float] = None
    sala: Optional[str] = None
    quantidade: Optional[int] = None
    anexos: Optional[str] = None
    status: StatusSolicitacao
    aprovador_id: Optional[int] = None
    resposta: Optional[str] = None
    created_at: datetime
    data_aprovacao: Optional[datetime] = None
    
    class Config:
        from_attributes = True
