"""
Modelo de Solicitação.

Registra solicitações de colaboradores e o fluxo de aprovação.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoSolicitacao(str, enum.Enum):
    """Categorias de solicitação; define campos aplicáveis."""
    MATERIAL = "material"
    SALA = "sala"
    REEMBOLSO = "reembolso"
    FERIAS = "ferias"
    HOME_OFFICE = "home_office"
    AJUSTE_PONTO = "ajuste_ponto"


class StatusSolicitacao(str, enum.Enum):
    """Status de aprovação da solicitação."""
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    CANCELADA = "cancelada"


class Solicitacao(Base):
    """Solicitação genérica que pode ser aprovada ou rejeitada."""
    __tablename__ = "solicitacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Descrição principal da solicitação.
    tipo = Column(SQLEnum(TipoSolicitacao), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # Campos opcionais conforme o tipo.
    data_inicio = Column(DateTime(timezone=True))  # Para férias, home office
    data_fim = Column(DateTime(timezone=True))
    valor = Column(Float)  # Para reembolso
    sala = Column(String(100))  # Para sala
    quantidade = Column(Integer)  # Para material
    
    # Lista de anexos em JSON com URLs.
    anexos = Column(Text)
    
    # Dados do fluxo de aprovação.
    status = Column(SQLEnum(StatusSolicitacao), default=StatusSolicitacao.PENDENTE, nullable=False)
    aprovador_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    resposta = Column(Text)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    data_aprovacao = Column(DateTime(timezone=True))
    
    # Relacionamentos separados para solicitante e aprovador.
    user = relationship("User", foreign_keys=[user_id], backref="solicitacoes")
    aprovador = relationship("User", foreign_keys=[aprovador_id])
