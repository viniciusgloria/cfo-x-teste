"""
Modelo de mensagens de chat.

Armazena mensagens diretas entre usuários.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ChatMessage(Base):
    """Mensagem enviada entre dois usuários."""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Remetente e destinatário (duas referências a User).
    remetente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destinatario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conteúdo da mensagem (texto).
    mensagem = Column(Text, nullable=False)
    
    # Status de leitura para o destinatário.
    lida = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relacionamentos separados por papel (remetente vs destinatário).
    remetente = relationship("User", foreign_keys=[remetente_id])
    destinatario = relationship("User", foreign_keys=[destinatario_id], backref="mensagens_recebidas")
