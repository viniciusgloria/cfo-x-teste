"""
Modelo de Folha Clientes (BPO interno).

Cada registro representa um item de folha de pagamento de um cliente.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class SituacaoFolha(str, enum.Enum):
    """Status do ciclo de vida do item de folha."""
    PENDENTE = "pendente"
    AGENDADO = "agendado"
    PAGO = "pago"
    CANCELADO = "cancelado"


class StatusOMIE(str, enum.Enum):
    """Status de sincronização com a OMIE."""
    NAO_ENVIADO = "nao_enviado"
    ENVIADO = "enviado"
    ERRO = "erro"
    SINCRONIZADO = "sincronizado"


class FolhaCliente(Base):
    """Item de folha de cliente para processamento BPO."""
    __tablename__ = "folha_clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Referência ao cliente dono do registro.
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Dados do colaborador informados pelo cliente.
    colaborador_nome = Column(String(255), nullable=False)
    funcao = Column(String(100))
    empresa = Column(String(255))  # Nome da empresa do cliente
    
    # Detalhes de alocação de custos.
    ctt = Column(String(100))  # Centro de custo
    percentual = Column(Float, default=100)  # Percentual de alocação
    
    # Valores monetários que compõem o item de folha.
    valor_base = Column(Float, nullable=False)
    adicional = Column(Float, default=0)
    reembolso = Column(Float, default=0)
    desconto = Column(Float, default=0)
    valor_total = Column(Float, nullable=False)
    
    # Status de pagamento e identificadores.
    situacao = Column(SQLEnum(SituacaoFolha), default=SituacaoFolha.PENDENTE, nullable=False)
    data_pagamento = Column(Date)
    nota_fiscal = Column(String(100))
    
    # Metadados de sincronização OMIE para conciliação.
    status_omie = Column(SQLEnum(StatusOMIE), default=StatusOMIE.NAO_ENVIADO, nullable=False)
    omie_id = Column(String(100), unique=True)
    omie_erro = Column(String(500))
    
    # Mês de referência no formato YYYY-MM.
    mes_referencia = Column(String(7), nullable=False)  # YYYY-MM
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Referência ao cliente no ORM.
    cliente = relationship("Cliente", backref="folhas")
