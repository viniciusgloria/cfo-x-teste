"""
Folha Clientes (Client payroll) model - Internal BPO module
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class SituacaoFolha(str, enum.Enum):
    """Payroll status"""
    PENDENTE = "pendente"
    AGENDADO = "agendado"
    PAGO = "pago"
    CANCELADO = "cancelado"


class StatusOMIE(str, enum.Enum):
    """OMIE sync status"""
    NAO_ENVIADO = "nao_enviado"
    ENVIADO = "enviado"
    ERRO = "erro"
    SINCRONIZADO = "sincronizado"


class FolhaCliente(Base):
    """Client payroll entries (BPO module)"""
    __tablename__ = "folha_clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Client reference
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Employee info (from client)
    colaborador_nome = Column(String(255), nullable=False)
    funcao = Column(String(100))
    empresa = Column(String(255))  # Client's company name
    
    # Cost allocation
    ctt = Column(String(100))  # Centro de custo
    percentual = Column(Float, default=100)  # Percentage allocation
    
    # Values
    valor_base = Column(Float, nullable=False)
    adicional = Column(Float, default=0)
    reembolso = Column(Float, default=0)
    desconto = Column(Float, default=0)
    valor_total = Column(Float, nullable=False)
    
    # Payment
    situacao = Column(SQLEnum(SituacaoFolha), default=SituacaoFolha.PENDENTE, nullable=False)
    data_pagamento = Column(Date)
    nota_fiscal = Column(String(100))
    
    # OMIE integration
    status_omie = Column(SQLEnum(StatusOMIE), default=StatusOMIE.NAO_ENVIADO, nullable=False)
    omie_id = Column(String(100), unique=True)
    omie_erro = Column(String(500))
    
    # Period
    mes_referencia = Column(String(7), nullable=False)  # YYYY-MM
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cliente = relationship("Cliente", backref="folhas")
