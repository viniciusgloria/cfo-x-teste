"""
Documento (Document) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoDocumento(str, enum.Enum):
    """Document type"""
    CONTRATO = "contrato"
    RG = "rg"
    CPF = "cpf"
    COMPROVANTE_RESIDENCIA = "comprovante_residencia"
    CARTEIRA_TRABALHO = "carteira_trabalho"
    OUTRO = "outro"


class Documento(Base):
    """Documents and files"""
    __tablename__ = "documentos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Document info
    tipo = Column(SQLEnum(TipoDocumento), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(String(500))
    
    # File
    url = Column(String(500), nullable=False)
    tamanho = Column(Integer)  # Bytes
    mime_type = Column(String(100))
    
    # Status
    verificado = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="documentos")
