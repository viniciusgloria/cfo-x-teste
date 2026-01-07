"""
Avaliação (Performance review) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Avaliacao(Base):
    """Performance reviews and evaluations"""
    __tablename__ = "avaliacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Evaluator and evaluated
    avaliador_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    avaliado_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Evaluation details
    titulo = Column(String(255), nullable=False)
    periodo = Column(String(100))  # Q1 2025, etc.
    
    # Scores (1-10)
    nota_desempenho = Column(Float)
    nota_comportamento = Column(Float)
    nota_tecnica = Column(Float)
    nota_geral = Column(Float)
    
    # Feedback
    pontos_fortes = Column(Text)
    pontos_melhoria = Column(Text)
    comentarios = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    avaliador = relationship("User", foreign_keys=[avaliador_id])
    avaliado = relationship("User", foreign_keys=[avaliado_id], backref="avaliacoes_recebidas")
