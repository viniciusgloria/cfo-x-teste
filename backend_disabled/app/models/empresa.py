"""
Modelo de Empresa (configurações).

Armazena configurações globais da organização.
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from ..database import Base


class Empresa(Base):
    """Configuração da empresa e flags de funcionalidades."""
    __tablename__ = "empresa"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identidade legal e pública.
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True)
    razao_social = Column(String(255))
    
    # Canais de contato públicos.
    email = Column(String(255))
    telefone = Column(String(20))
    site = Column(String(255))
    
    # Endereço físico.
    endereco = Column(String(500))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    
    # Branding usado pelo frontend.
    logo = Column(String(500))
    cor_primaria = Column(String(7))  # Cor hexadecimal
    cor_secundaria = Column(String(7))
    
    # Jornada usada pelo ponto e RH.
    jornada_horas = Column(Float, default=8)  # Horas por dia
    jornada_dias = Column(Integer, default=5)  # Dias por semana
    tolerancia_minutos = Column(Integer, default=10)  # Tolerância de atraso
    
    # Flags para habilitar módulos.
    ponto_ativo = Column(Boolean, default=True)
    solicitacoes_ativo = Column(Boolean, default=True)
    okrs_ativo = Column(Boolean, default=True)
    mural_ativo = Column(Boolean, default=True)
    
    # Flags para indicar integrações habilitadas.
    omie_integrado = Column(Boolean, default=False)
    google_integrado = Column(Boolean, default=False)
    
    # Configurações extras em JSON para flexibilidade.
    configuracoes = Column(Text)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
