"""
Mural (social wall) schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.mural import TipoPost


class PostCreate(BaseModel):
    """Create post"""
    tipo: TipoPost
    titulo: str
    conteudo: str
    imagem: Optional[str] = None
    anexos: Optional[str] = None


class PostUpdate(BaseModel):
    """Update post"""
    titulo: Optional[str] = None
    conteudo: Optional[str] = None
    fixado: Optional[bool] = None


class PostCommentCreate(BaseModel):
    """Create comment"""
    conteudo: str


class PostReactionCreate(BaseModel):
    """Create reaction"""
    tipo: str


class PostResponse(BaseModel):
    """Post response"""
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
