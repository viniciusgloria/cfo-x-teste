"""
Benefício (Benefit) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Beneficio(Base):
    """Employee benefits"""
    __tablename__ = "beneficios"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Benefit info
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(100))  # VR, VT, Saúde, etc.
    
    # Value
    valor = Column(Float)
    valor_empresa = Column(Float)  # Company contribution
    valor_colaborador = Column(Float)  # Employee contribution
    
    # Eligibility
    elegivel_clt = Column(Boolean, default=True)
    elegivel_pj = Column(Boolean, default=False)
    
    # Status
    ativo = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
