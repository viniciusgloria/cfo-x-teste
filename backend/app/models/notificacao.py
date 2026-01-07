"""
Notificação (Notification) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoNotificacao(str, enum.Enum):
    """Notification type"""
    INFO = "info"
    SUCESSO = "sucesso"
    AVISO = "aviso"
    ERRO = "erro"


class Notificacao(Base):
    """User notifications"""
    __tablename__ = "notificacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Notification content
    tipo = Column(SQLEnum(TipoNotificacao), default=TipoNotificacao.INFO, nullable=False)
    titulo = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    
    # Link/action
    link = Column(String(500))
    
    # Status
    lida = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", backref="notificacoes")
