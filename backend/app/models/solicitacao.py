"""
Solicitação (Request) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoSolicitacao(str, enum.Enum):
    """Request types"""
    MATERIAL = "material"
    SALA = "sala"
    REEMBOLSO = "reembolso"
    FERIAS = "ferias"
    HOME_OFFICE = "home_office"
    AJUSTE_PONTO = "ajuste_ponto"


class StatusSolicitacao(str, enum.Enum):
    """Request status"""
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    CANCELADA = "cancelada"


class Solicitacao(Base):
    """Request/Approval model"""
    __tablename__ = "solicitacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Request details
    tipo = Column(SQLEnum(TipoSolicitacao), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # Specific fields based on type
    data_inicio = Column(DateTime(timezone=True))  # For ferias, home_office
    data_fim = Column(DateTime(timezone=True))
    valor = Column(Float)  # For reembolso
    sala = Column(String(100))  # For sala
    quantidade = Column(Integer)  # For material
    
    # Files/attachments
    anexos = Column(Text)  # JSON array of file URLs
    
    # Status and approval
    status = Column(SQLEnum(StatusSolicitacao), default=StatusSolicitacao.PENDENTE, nullable=False)
    aprovador_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    resposta = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    data_aprovacao = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="solicitacoes")
    aprovador = relationship("User", foreign_keys=[aprovador_id])
