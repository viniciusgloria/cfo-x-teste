"""
Modelo de Cliente.

Representa dados de CRM e contrato de cada cliente.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class StatusContrato(str, enum.Enum):
    """Status do ciclo de vida do contrato do cliente."""
    ATIVO = "ativo"
    INATIVO = "inativo"
    SUSPENSO = "suspenso"
    TRIAL = "trial"


class Cliente(Base):
    """Registro de cliente usado por CRM e cobrança."""
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificação básica.
    nome = Column(String(255), nullable=False, index=True)
    cnpj = Column(String(18), unique=True)
    razao_social = Column(String(255))
    
    # Contatos principais.
    email = Column(String(255))
    telefone = Column(String(20))
    endereco = Column(String(500))
    
    # Status do contrato e termos comerciais.
    status = Column(SQLEnum(StatusContrato), default=StatusContrato.ATIVO, nullable=False)
    mrr = Column(Float, default=0)  # Receita recorrente mensal (MRR)
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    
    # Responsável interno pela conta.
    responsavel_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    
    # Metadados de sincronização OMIE.
    omie_id = Column(String(100), unique=True, index=True)
    omie_sync = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Referência ao usuário responsável (opcional).
    responsavel = relationship("User", backref="clientes_responsavel")
