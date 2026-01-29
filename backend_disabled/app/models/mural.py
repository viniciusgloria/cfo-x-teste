"""
Modelos de Mural.

Implementa posts, comentários e reações para comunicação interna.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TipoPost(str, enum.Enum):
    """Categoria do post usada em rótulos e filtros."""
    AVISO = "aviso"
    COMUNICADO = "comunicado"
    CELEBRACAO = "celebracao"
    EVENTO = "evento"


class Post(Base):
    """Post no mural com mídia opcional e reações."""
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Campos principais do post.
    tipo = Column(SQLEnum(TipoPost), nullable=False)
    titulo = Column(String(255), nullable=False)
    conteudo = Column(Text, nullable=False)
    
    # Mídias armazenadas como texto ou JSON.
    imagem = Column(String(500))
    anexos = Column(Text)  # Lista em JSON
    
    # Fixado mantém posts importantes em destaque.
    fixado = Column(Boolean, default=False)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Exclusão em cascata garante comentários/reações removidos com o post.
    user = relationship("User", backref="posts")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("PostReaction", back_populates="post", cascade="all, delete-orphan")


class PostComment(Base):
    """Comentário feito em um post."""
    __tablename__ = "post_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Corpo do comentário.
    conteudo = Column(Text, nullable=False)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referências ao post e ao autor.
    post = relationship("Post", back_populates="comments")
    user = relationship("User")


class PostReaction(Base):
    """Reação (emoji) a um post."""
    __tablename__ = "post_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # String simples para permitir emojis customizados.
    tipo = Column(String(50), nullable=False)  # curtir, amar, celebrar, etc.
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referências ao post e ao usuário que reagiu.
    post = relationship("Post", back_populates="reactions")
    user = relationship("User")
