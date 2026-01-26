"""
Modelo de OKR (Objetivos e Resultados-Chave).

Armazena objetivos e resultados mensuráveis de usuário ou time.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoOKR(str, enum.Enum):
    """Escopo do OKR (a quem se aplica)."""
    PESSOAL = "pessoal"
    TIME = "time"
    EMPRESA = "empresa"


class OKR(Base):
    """Registro de objetivo e resultado-chave."""
    __tablename__ = "okrs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Texto principal do OKR.
    tipo = Column(SQLEnum(TipoOKR), nullable=False)
    objetivo = Column(String(500), nullable=False)
    key_result = Column(String(500), nullable=False)
    
    # Progresso (meta numérica e valor atual).
    meta = Column(Float, nullable=False)
    atual = Column(Float, default=0, nullable=False)
    unidade = Column(String(50))  # %, R$, unidades, etc.
    
    # Janela de tempo usada nos relatórios.
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim = Column(DateTime(timezone=True), nullable=False)
    
    # Detalhes opcionais para agrupamento e descrição.
    descricao = Column(Text)
    setor = Column(String(100))
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Referência ao usuário dono do OKR.
    user = relationship("User", backref="okrs")
    
    @property
    def progresso(self) -> float:
        """Calcula o progresso em porcentagem (0-100)."""
        if self.meta == 0:
            return 0
        return min((self.atual / self.meta) * 100, 100)
