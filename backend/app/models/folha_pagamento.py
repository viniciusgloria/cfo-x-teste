"""
Folha Pagamento (Internal payroll) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class FolhaPagamento(Base):
    """Internal payroll entries"""
    __tablename__ = "folha_pagamento"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Period
    mes_referencia = Column(String(7), nullable=False)  # YYYY-MM
    
    # Values
    salario_base = Column(Float, nullable=False)
    horas_extras = Column(Float, default=0)
    adicional_noturno = Column(Float, default=0)
    bonus = Column(Float, default=0)
    comissao = Column(Float, default=0)
    
    # Deductions
    inss = Column(Float, default=0)
    irrf = Column(Float, default=0)
    vale_transporte = Column(Float, default=0)
    vale_refeicao = Column(Float, default=0)
    plano_saude = Column(Float, default=0)
    outros_descontos = Column(Float, default=0)
    
    # Totals
    total_proventos = Column(Float, nullable=False)
    total_descontos = Column(Float, nullable=False)
    salario_liquido = Column(Float, nullable=False)
    
    # Payment
    data_pagamento = Column(Date)
    observacoes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="folhas_pagamento")
