"""
User model - Authentication and user data
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles in the system"""
    ADMIN = "admin"
    GESTOR = "gestor"
    COLABORADOR = "colaborador"
    CLIENTE = "cliente"
    VISITANTE = "visitante"


class UserType(str, enum.Enum):
    """User employment type"""
    CLT = "CLT"
    PJ = "PJ"


class User(Base):
    """User model for authentication and profile"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nome = Column(String(255), nullable=False)
    senha_hash = Column(String(255), nullable=False)
    
    # Role and type
    role = Column(SQLEnum(UserRole), default=UserRole.COLABORADOR, nullable=False)
    tipo = Column(SQLEnum(UserType), nullable=True)  # CLT or PJ (null for non-employees)
    
    # Additional info
    cargo = Column(String(100))
    setor = Column(String(100))
    telefone = Column(String(20))
    avatar = Column(String(500))
    
    # Status
    ativo = Column(Boolean, default=True, nullable=False)
    primeiro_acesso = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
