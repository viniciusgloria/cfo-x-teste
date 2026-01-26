"""
Esquemas de ponto (controle de jornada)
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.ponto import TipoPonto, StatusAjuste


class PontoCreate(BaseModel):
    """Cria registro de ponto"""
    tipo: TipoPonto
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    localizacao: Optional[str] = None


class PontoResponse(BaseModel):
    """Resposta de registro de ponto"""
    id: int
    user_id: int
    tipo: TipoPonto
    timestamp: datetime
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    localizacao: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AjustePontoCreate(BaseModel):
    """Cria solicitacao de ajuste de ponto"""
    data: datetime
    tipo: TipoPonto
    horario_original: Optional[datetime] = None
    horario_ajustado: datetime
    motivo: str


class AjustePontoUpdate(BaseModel):
    """Atualiza status do ajuste"""
    status: StatusAjuste
    resposta: Optional[str] = None


class AjustePontoResponse(BaseModel):
    """Resposta de ajuste"""
    id: int
    user_id: int
    data: datetime
    tipo: TipoPonto
    horario_original: Optional[datetime] = None
    horario_ajustado: datetime
    motivo: str
    status: StatusAjuste
    aprovador_id: Optional[int] = None
    resposta: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
