"""
OKR (Objectives and Key Results) model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoOKR(str, enum.Enum):
    """OKR scope"""
    PESSOAL = "pessoal"
    TIME = "time"
    EMPRESA = "empresa"


class OKR(Base):
    """Objectives and Key Results"""
    __tablename__ = "okrs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # OKR details
    tipo = Column(SQLEnum(TipoOKR), nullable=False)
    objetivo = Column(String(500), nullable=False)
    key_result = Column(String(500), nullable=False)
    
    # Progress
    meta = Column(Float, nullable=False)
    atual = Column(Float, default=0, nullable=False)
    unidade = Column(String(50))  # %, R$, units, etc.
    
    # Period
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim = Column(DateTime(timezone=True), nullable=False)
    
    # Additional info
    descricao = Column(Text)
    setor = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="okrs")
    
    @property
    def progresso(self) -> float:
        """Calculate progress percentage"""
        if self.meta == 0:
            return 0
        return min((self.atual / self.meta) * 100, 100)
