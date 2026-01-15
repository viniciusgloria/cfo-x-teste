"""
Modelo de Documento.

Representa um arquivo anexado ao perfil do usuário (ex.: RG, CPF).
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoDocumento(str, enum.Enum):
    """Lista padronizada de tipos de documento."""
    CONTRATO = "contrato"
    RG = "rg"
    CPF = "cpf"
    COMPROVANTE_RESIDENCIA = "comprovante_residencia"
    CARTEIRA_TRABALHO = "carteira_trabalho"
    OUTRO = "outro"


class Documento(Base):
    """Metadados do documento; conteúdo fica em armazenamento externo."""
    __tablename__ = "documentos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Classificação e rótulos exibidos no app.
    tipo = Column(SQLEnum(TipoDocumento), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(String(500))
    
    # Metadados do arquivo para download e visualização.
    url = Column(String(500), nullable=False)
    tamanho = Column(Integer)  # bytes
    mime_type = Column(String(100))  # Tipo MIME (formato do arquivo)
    
    # Flag de verificação definido por fluxo de RH/admin.
    verificado = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Referência ao usuário dono do documento.
    user = relationship("User", backref="documentos")
