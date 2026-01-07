"""
Ponto (Time tracking) models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoPonto(str, enum.Enum):
    """Type of time tracking entry"""
    ENTRADA = "entrada"
    SAIDA = "saida"
    INTERVALO_INICIO = "intervalo_inicio"
    INTERVALO_FIM = "intervalo_fim"


class StatusAjuste(str, enum.Enum):
    """Status of adjustment request"""
    PENDENTE = "pendente"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"


class Ponto(Base):
    """Time tracking entries"""
    __tablename__ = "pontos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Entry details
    tipo = Column(SQLEnum(TipoPonto), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Location (optional)
    latitude = Column(String(50))
    longitude = Column(String(50))
    localizacao = Column(String(255))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", backref="pontos")


class AjustePonto(Base):
    """Time tracking adjustment requests"""
    __tablename__ = "ajustes_ponto"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Adjustment details
    data = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(SQLEnum(TipoPonto), nullable=False)
    horario_original = Column(DateTime(timezone=True))
    horario_ajustado = Column(DateTime(timezone=True), nullable=False)
    motivo = Column(Text, nullable=False)
    
    # Status
    status = Column(SQLEnum(StatusAjuste), default=StatusAjuste.PENDENTE, nullable=False)
    aprovador_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    resposta = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="ajustes_ponto")
    aprovador = relationship("User", foreign_keys=[aprovador_id])
