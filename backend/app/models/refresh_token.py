"""
Refresh Token Model
Para implementar sistema de refresh tokens mais seguro
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from ..database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="refresh_tokens")
    
    def is_expired(self):
        """Verifica se o token expirou"""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        """Verifica se o token é válido (não revogado e não expirado)"""
        return not self.revoked and not self.is_expired()
