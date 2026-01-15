"""
Modelo de Token de Atualização (refresh).

Armazena tokens de atualização de longa duração que podem ser rotacionados sem expor senhas.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from ..database import Base


class RefreshToken(Base):
    """Token de atualização (refresh) associado a uma sessão de usuário."""
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    # String aleatória opaca; não deriva de dados do usuário.
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    # Usado para rotação e auditoria de tokens.
    last_used = Column(DateTime, nullable=True)
    
    # Referência reversa de User.refresh_tokens
    user = relationship("User", back_populates="refresh_tokens")
    
    def is_expired(self):
        """Retorna True quando o horário UTC atual passa de expires_at."""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        """Token é válido apenas se não estiver revogado nem expirado."""
        return not self.revoked and not self.is_expired()
