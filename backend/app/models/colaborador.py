"""
Colaborador (Employee) model - Extended user profile
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Date, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Colaborador(Base):
    """Employee extended profile"""
    __tablename__ = "colaboradores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Personal data
    cpf = Column(String(14), unique=True)
    rg = Column(String(20))
    data_nascimento = Column(Date)
    estado_civil = Column(String(50))
    
    # Address
    endereco = Column(String(500))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    
    # Employment data
    data_admissao = Column(Date)
    data_demissao = Column(Date)
    salario = Column(Float)
    banco_horas = Column(Float, default=0)  # Hours
    
    # PJ specific
    cnpj = Column(String(18))  # For PJ employees
    meta_horas = Column(Float)  # Monthly hour goal for PJ
    
    # Documents
    documentos = Column(Text)  # JSON array of document URLs
    
    # Emergency contact
    contato_emergencia = Column(String(255))
    telefone_emergencia = Column(String(20))
    
    # Status
    ativo = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="colaborador_profile")
