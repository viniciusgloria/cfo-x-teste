"""
Empresa (Company) configuration model
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from ..database import Base


class Empresa(Base):
    """Company configuration and settings"""
    __tablename__ = "empresa"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True)
    razao_social = Column(String(255))
    
    # Contact
    email = Column(String(255))
    telefone = Column(String(20))
    site = Column(String(255))
    
    # Address
    endereco = Column(String(500))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    
    # Branding
    logo = Column(String(500))
    cor_primaria = Column(String(7))  # Hex color
    cor_secundaria = Column(String(7))
    
    # Work settings
    jornada_horas = Column(Float, default=8)  # Hours per day
    jornada_dias = Column(Integer, default=5)  # Days per week
    tolerancia_minutos = Column(Integer, default=10)  # Late tolerance
    
    # Features enabled
    ponto_ativo = Column(Boolean, default=True)
    solicitacoes_ativo = Column(Boolean, default=True)
    okrs_ativo = Column(Boolean, default=True)
    mural_ativo = Column(Boolean, default=True)
    
    # Integrations
    omie_integrado = Column(Boolean, default=False)
    google_integrado = Column(Boolean, default=False)
    
    # Additional settings (JSON)
    configuracoes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
