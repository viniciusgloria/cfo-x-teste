"""
Lembrete (Reminder) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Lembrete(Base):
    """Reminders and alerts"""
    __tablename__ = "lembretes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Reminder details
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # When
    data_hora = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    concluido = Column(Boolean, default=False)
    notificado = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="lembretes")
