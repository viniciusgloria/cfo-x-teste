"""
Modelo de Notificação.

Armazena alertas para o usuário com links opcionais.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoNotificacao(str, enum.Enum):
    """Tipo/gravidade exibida na UI."""
    INFO = "info"
    SUCESSO = "sucesso"
    AVISO = "aviso"
    ERRO = "erro"


class Notificacao(Base):
    """Notificação ligada a um usuário específico."""
    __tablename__ = "notificacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conteúdo principal exibido ao usuário.
    tipo = Column(SQLEnum(TipoNotificacao), default=TipoNotificacao.INFO, nullable=False)
    titulo = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    
    # Link opcional para uma tela relacionada.
    link = Column(String(500))
    
    # Status de leitura para indicadores e contadores.
    lida = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referência ao usuário dono da notificação.
    user = relationship("User", backref="notificacoes")
