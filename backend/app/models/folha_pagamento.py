"""
Modelo de Folha Pagamento (interno).

Armazena resultados de folha para colaboradores internos.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class FolhaPagamento(Base):
    """Resultado de folha de um colaborador em um mês."""
    __tablename__ = "folha_pagamento"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Mês de referência no formato YYYY-MM.
    mes_referencia = Column(String(7), nullable=False)  # YYYY-MM
    
    # Componentes de proventos.
    salario_base = Column(Float, nullable=False)
    horas_extras = Column(Float, default=0)
    adicional_noturno = Column(Float, default=0)
    bonus = Column(Float, default=0)
    comissao = Column(Float, default=0)
    
    # Descontos e benefícios.
    inss = Column(Float, default=0)
    irrf = Column(Float, default=0)
    vale_transporte = Column(Float, default=0)
    vale_refeicao = Column(Float, default=0)
    plano_saude = Column(Float, default=0)
    outros_descontos = Column(Float, default=0)
    
    # Totais calculados pela lógica de negócio.
    total_proventos = Column(Float, nullable=False)
    total_descontos = Column(Float, nullable=False)
    salario_liquido = Column(Float, nullable=False)
    
    # Metadados de pagamento e observações.
    data_pagamento = Column(Date)
    observacoes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Dono do registro no ORM.
    user = relationship("User", backref="folhas_pagamento")
