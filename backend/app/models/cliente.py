"""
Cliente (Client/Customer) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class StatusContrato(str, enum.Enum):
    """Contract status"""
    ATIVO = "ativo"
    INATIVO = "inativo"
    SUSPENSO = "suspenso"
    TRIAL = "trial"


class Cliente(Base):
    """Client/Customer CRM"""
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    nome = Column(String(255), nullable=False, index=True)
    cnpj = Column(String(18), unique=True)
    razao_social = Column(String(255))
    
    # Contact
    email = Column(String(255))
    telefone = Column(String(20))
    endereco = Column(String(500))
    
    # Contract
    status = Column(SQLEnum(StatusContrato), default=StatusContrato.ATIVO, nullable=False)
    mrr = Column(Float, default=0)  # Monthly Recurring Revenue
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    
    # Responsible
    responsavel_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    
    # OMIE integration
    omie_id = Column(String(100), unique=True, index=True)
    omie_sync = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    responsavel = relationship("User", backref="clientes_responsavel")
