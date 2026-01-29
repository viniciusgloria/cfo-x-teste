"""
Esquemas de mural (social)
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.mural import TipoPost


class PostCreate(BaseModel):
    """Cria post"""
    tipo: TipoPost
    titulo: str
    conteudo: str
    imagem: Optional[str] = None
    anexos: Optional[str] = None


class PostUpdate(BaseModel):
    """Atualiza post"""
    titulo: Optional[str] = None
    conteudo: Optional[str] = None
    fixado: Optional[bool] = None


class PostCommentCreate(BaseModel):
    """Cria comentario"""
    conteudo: str


class PostReactionCreate(BaseModel):
    """Cria reacao"""
    tipo: str


class PostResponse(BaseModel):
    """Resposta de post"""
    id: int
    user_id: int
    tipo: TipoPost
    titulo: str
    conteudo: str
    imagem: Optional[str] = None
    anexos: Optional[str] = None
    fixado: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
