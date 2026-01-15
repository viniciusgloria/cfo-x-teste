"""
Modelo de Feedback.

Registra reconhecimento ou melhoria entre usuários.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoFeedback(str, enum.Enum):
    """Categoria de feedback usada em filtros e rótulos."""
    POSITIVO = "positivo"
    CONSTRUTIVO = "construtivo"
    RECONHECIMENTO = "reconhecimento"


class Feedback(Base):
    """Mensagem de feedback entre dois usuários."""
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Remetente e destinatário (duas referências a User).
    remetente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destinatario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Campos principais do feedback.
    tipo = Column(SQLEnum(TipoFeedback), nullable=False)
    titulo = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    
    # Ligação opcional com OKR ou tarefa.
    okr_id = Column(Integer, ForeignKey("okrs.id", ondelete="SET NULL"))
    tarefa_id = Column(Integer, ForeignKey("tarefas.id", ondelete="SET NULL"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relacionamentos separados por papel para evitar ambiguidade.
    remetente = relationship("User", foreign_keys=[remetente_id])
    destinatario = relationship("User", foreign_keys=[destinatario_id], backref="feedbacks_recebidos")
