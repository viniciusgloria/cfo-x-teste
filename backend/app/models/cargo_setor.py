"""
Modelos de Cargo e Setor.

São tabelas de referência usadas por RH e telas de permissão.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Cargo(Base):
    """Catálogo de cargos/funções."""
    __tablename__ = "cargos"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Nome único para evitar cargos duplicados.
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text)
    nivel = Column(String(50))  # Júnior, Pleno, Sênior, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Setor(Base):
    """Catálogo de setores/departamentos."""
    __tablename__ = "setores"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Nome único para evitar setores duplicados.
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text)
    
    # Gestor armazenado como user_id sem FK para manter independência.
    gestor_id = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
