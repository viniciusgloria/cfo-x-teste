"""
Modelo de Lembrete.

Usado para lembretes pessoais e notificações.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Lembrete(Base):
    """Registro de lembrete ligado a um usuário."""
    __tablename__ = "lembretes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conteúdo do lembrete.
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # Data/hora programadas do lembrete.
    data_hora = Column(DateTime(timezone=True), nullable=False)
    
    # Flags de conclusão e envio de notificação.
    concluido = Column(Boolean, default=False)
    notificado = Column(Boolean, default=False)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Referência ao usuário dono do lembrete.
    user = relationship("User", backref="lembretes")
