"""
Modelos de Ponto (controle de jornada).

Registra batidas e solicitações de ajuste.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoPonto(str, enum.Enum):
    """Tipo de evento de ponto."""
    ENTRADA = "entrada"
    SAIDA = "saida"
    INTERVALO_INICIO = "intervalo_inicio"
    INTERVALO_FIM = "intervalo_fim"


class StatusAjuste(str, enum.Enum):
    """Status de aprovação dos ajustes."""
    PENDENTE = "pendente"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"


class Ponto(Base):
    """Registro único de ponto de um usuário."""
    __tablename__ = "pontos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Tipo do evento e data/hora (UTC).
    tipo = Column(SQLEnum(TipoPonto), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Metadados de geolocalização opcionais para auditoria.
    latitude = Column(String(50))
    longitude = Column(String(50))
    localizacao = Column(String(255))
    
    # Data/hora de criação no servidor.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referência ao usuário dono do ponto.
    user = relationship("User", backref="pontos")


class AjustePonto(Base):
    """Solicitação de ajuste de um evento de ponto."""
    __tablename__ = "ajustes_ponto"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Horário original vs ajustado, com motivo obrigatório.
    data = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(SQLEnum(TipoPonto), nullable=False)
    horario_original = Column(DateTime(timezone=True))
    horario_ajustado = Column(DateTime(timezone=True), nullable=False)
    motivo = Column(Text, nullable=False)
    
    # Campos do fluxo de aprovação.
    status = Column(SQLEnum(StatusAjuste), default=StatusAjuste.PENDENTE, nullable=False)
    aprovador_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    resposta = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos separados para solicitante e aprovador.
    user = relationship("User", foreign_keys=[user_id], backref="ajustes_ponto")
    aprovador = relationship("User", foreign_keys=[aprovador_id])
