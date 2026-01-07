"""
Empresa, Chat, Notificacao, etc schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Empresa
class EmpresaUpdate(BaseModel):
    """Update company settings"""
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    logo: Optional[str] = None
    jornada_horas: Optional[float] = None
    jornada_dias: Optional[int] = None
    tolerancia_minutos: Optional[int] = None


class EmpresaResponse(BaseModel):
    """Company response"""
    id: int
    nome: str
    cnpj: Optional[str] = None
    logo: Optional[str] = None
    jornada_horas: float
    jornada_dias: int
    tolerancia_minutos: int
    ponto_ativo: bool
    solicitacoes_ativo: bool
    okrs_ativo: bool
    mural_ativo: bool
    
    class Config:
        from_attributes = True


# Chat
class ChatMessageCreate(BaseModel):
    """Create chat message"""
    destinatario_id: int
    mensagem: str


class ChatMessageResponse(BaseModel):
    """Chat message response"""
    id: int
    remetente_id: int
    destinatario_id: int
    mensagem: str
    lida: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Notificacao
class NotificacaoResponse(BaseModel):
    """Notification response"""
    id: int
    user_id: int
    tipo: str
    titulo: str
    mensagem: str
    link: Optional[str] = None
    lida: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Documento
class DocumentoCreate(BaseModel):
    """Create document"""
    tipo: str
    nome: str
    descricao: Optional[str] = None
    url: str
    tamanho: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentoResponse(BaseModel):
    """Document response"""
    id: int
    user_id: int
    tipo: str
    nome: str
    url: str
    verificado: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Beneficio
class BeneficioResponse(BaseModel):
    """Benefit response"""
    id: int
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    valor: Optional[float] = None
    ativo: bool
    
    class Config:
        from_attributes = True


# Avaliacao
class AvaliacaoCreate(BaseModel):
    """Create evaluation"""
    avaliado_id: int
    titulo: str
    periodo: Optional[str] = None
    nota_desempenho: Optional[float] = None
    nota_comportamento: Optional[float] = None
    nota_tecnica: Optional[float] = None
    nota_geral: Optional[float] = None
    pontos_fortes: Optional[str] = None
    pontos_melhoria: Optional[str] = None
    comentarios: Optional[str] = None


class AvaliacaoResponse(BaseModel):
    """Evaluation response"""
    id: int
    avaliador_id: int
    avaliado_id: int
    titulo: str
    nota_geral: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Lembrete
class LembreteCreate(BaseModel):
    """Create reminder"""
    titulo: str
    descricao: Optional[str] = None
    data_hora: datetime


class LembreteResponse(BaseModel):
    """Reminder response"""
    id: int
    user_id: int
    titulo: str
    data_hora: datetime
    concluido: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
