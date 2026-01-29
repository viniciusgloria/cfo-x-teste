"""
Esquemas de tarefa
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.tarefa import StatusTarefa, PrioridadeTarefa


class TarefaCreate(BaseModel):
    """Cria tarefa"""
    titulo: str
    descricao: Optional[str] = None
    responsavel_id: Optional[int] = None
    status: StatusTarefa = StatusTarefa.TODO
    prioridade: PrioridadeTarefa = PrioridadeTarefa.MEDIA
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    prazo: Optional[datetime] = None
    projeto: Optional[str] = None
    tags: Optional[str] = None
    tempo_estimado: Optional[int] = None


class TarefaUpdate(BaseModel):
    """Atualiza tarefa"""
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    responsavel_id: Optional[int] = None
    status: Optional[StatusTarefa] = None
    prioridade: Optional[PrioridadeTarefa] = None
    progresso: Optional[int] = None
    tempo_gasto: Optional[int] = None
    bloqueada: Optional[bool] = None
    motivo_bloqueio: Optional[str] = None


class TarefaCommentCreate(BaseModel):
    """Cria comentario de tarefa"""
    conteudo: str


class TarefaResponse(BaseModel):
    """Resposta de tarefa"""
    id: int
    titulo: str
    descricao: Optional[str] = None
    criador_id: int
    responsavel_id: Optional[int] = None
    status: StatusTarefa
    prioridade: PrioridadeTarefa
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    prazo: Optional[datetime] = None
    projeto: Optional[str] = None
    progresso: int
    tempo_estimado: Optional[int] = None
    tempo_gasto: int
    bloqueada: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
