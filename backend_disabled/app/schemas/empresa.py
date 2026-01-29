"""
Esquemas de empresa, chat, notificacao, etc
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Empresa
class EmpresaUpsert(BaseModel):
    """Cria ou atualiza configuracoes da empresa"""
    nome: str
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    site: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    logo: Optional[str] = None
    cor_primaria: Optional[str] = None
    cor_secundaria: Optional[str] = None
    jornada_horas: Optional[float] = None
    jornada_dias: Optional[int] = None
    tolerancia_minutos: Optional[int] = None
    ponto_ativo: Optional[bool] = None
    solicitacoes_ativo: Optional[bool] = None
    okrs_ativo: Optional[bool] = None
    mural_ativo: Optional[bool] = None
    configuracoes: Optional[dict] = None


class EmpresaUpdate(BaseModel):
    """Atualiza configuracoes da empresa"""
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    logo: Optional[str] = None
    jornada_horas: Optional[float] = None
    jornada_dias: Optional[int] = None
    tolerancia_minutos: Optional[int] = None


class EmpresaResponse(BaseModel):
    """Resposta da empresa"""
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
    """Cria mensagem de chat"""
    destinatario_id: int
    mensagem: str


class ChatMessageResponse(BaseModel):
    """Resposta de mensagem de chat"""
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
    """Resposta de notificacao"""
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
    """Cria documento"""
    tipo: str
    nome: str
    descricao: Optional[str] = None
    url: str
    tamanho: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentoResponse(BaseModel):
    """Resposta de documento"""
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
    """Resposta de beneficio"""
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
    """Cria avaliacao"""
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
    """Resposta de avaliacao"""
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
    """Cria lembrete"""
    titulo: str
    descricao: Optional[str] = None
    data_hora: datetime


class LembreteResponse(BaseModel):
    """Resposta de lembrete"""
    id: int
    user_id: int
    titulo: str
    data_hora: datetime
    concluido: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
