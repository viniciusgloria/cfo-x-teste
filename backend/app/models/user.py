"""
Modelo de Usuário - autenticação e dados de perfil.

Esta é a tabela central de identidade. Outros modelos a referenciam para
permissões, propriedade e auditoria.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class UserRole(str, enum.Enum):
    """Perfis de acesso usados nas verificações de autorização."""
    ADMIN = "admin"
    GESTOR = "gestor"
    COLABORADOR = "colaborador"
    CLIENTE = "cliente"
    VISITANTE = "visitante"


class UserType(str, enum.Enum):
    """Tipo de contrato de trabalho do colaborador."""
    CLT = "CLT"
    PJ = "PJ"


class User(Base):
    """Registro de autenticação e perfil do usuário."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nome = Column(String(255), nullable=False)
    # A senha é armazenada como hash; nunca persistir senha em texto puro.
    senha_hash = Column(String(255), nullable=False)
    
    # Perfil define autorização; tipo é usado apenas para colaboradores.
    role = Column(SQLEnum(UserRole), default=UserRole.COLABORADOR, nullable=False)
    tipo = Column(SQLEnum(UserType), nullable=True)  # CLT ou PJ (nulo para não colaboradores)
    
    # Informacoes adicionais
    cargo = Column(String(100))
    setor = Column(String(100))
    telefone = Column(String(20))
    avatar = Column(String(500))
    
    # Dados de cliente
    empresa = Column(String(255), nullable=True)
    grupoId = Column(String(100), nullable=True)
    grupoNome = Column(String(255), nullable=True)
    
    # Flags de status usadas para acesso e fluxo de primeiro login.
    ativo = Column(Boolean, default=True, nullable=False)
    primeiro_acesso = Column(Boolean, default=True, nullable=False)
    
    # Carimbos de data/hora: created_at é definido na criação; updated_at só em atualizações.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
