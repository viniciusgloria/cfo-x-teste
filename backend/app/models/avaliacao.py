"""
Modelo de Avaliação (revisão de desempenho).

Registra avaliações entre dois usuários (avaliador e avaliado).
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Avaliacao(Base):
    """Armazena notas e feedbacks de um ciclo de avaliação."""
    __tablename__ = "avaliacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Duas referências a User; foreign_keys evita ambiguidades.
    avaliador_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    avaliado_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Período é um rótulo livre (ex.: "Q1 2025").
    titulo = Column(String(255), nullable=False)
    periodo = Column(String(100))  # Q1 2025, etc.
    
    # Notas opcionais (1-10). null indica "ainda não avaliado".
    nota_desempenho = Column(Float)
    nota_comportamento = Column(Float)
    nota_tecnica = Column(Float)
    nota_geral = Column(Float)
    
    # Feedback qualitativo em texto livre.
    pontos_fortes = Column(Text)
    pontos_melhoria = Column(Text)
    comentarios = Column(Text)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos separados por papel (avaliador vs avaliado).
    avaliador = relationship("User", foreign_keys=[avaliador_id])
    avaliado = relationship("User", foreign_keys=[avaliado_id], backref="avaliacoes_recebidas")
