"""
Cargo (Position) and Setor (Department) models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Cargo(Base):
    """Job positions/roles"""
    __tablename__ = "cargos"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Position info
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text)
    nivel = Column(String(50))  # Junior, Pleno, Senior, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Setor(Base):
    """Departments/sectors"""
    __tablename__ = "setores"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Department info
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text)
    
    # Manager
    gestor_id = Column(Integer)  # Reference to user, but not FK to avoid circular dependency
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
