"""
Modelo de Benefício.

Representa um item do catálogo de benefícios e suas regras de elegibilidade.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Beneficio(Base):
    """Definição de benefício e divisão de custos."""
    __tablename__ = "beneficios"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Descrição base exibida aos colaboradores.
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(100))  # VR, VT, Saúde, etc.
    
    # Valor total e como é dividido entre empresa e colaborador.
    valor = Column(Float)
    valor_empresa = Column(Float)  # Parcela da empresa
    valor_colaborador = Column(Float)  # Parcela do colaborador
    
    # Flags de elegibilidade por tipo de contrato.
    elegivel_clt = Column(Boolean, default=True)
    elegivel_pj = Column(Boolean, default=False)
    
    # Toggle para desativar sem apagar histórico.
    ativo = Column(Boolean, default=True)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
