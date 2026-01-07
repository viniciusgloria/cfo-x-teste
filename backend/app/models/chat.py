"""
Chat message model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ChatMessage(Base):
    """Chat messages between users"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # From/To
    remetente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destinatario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Message content
    mensagem = Column(Text, nullable=False)
    
    # Status
    lida = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    remetente = relationship("User", foreign_keys=[remetente_id])
    destinatario = relationship("User", foreign_keys=[destinatario_id], backref="mensagens_recebidas")
