"""
Schemas de usuario para validacao
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from ..models.user import UserRole, UserType


class UserBase(BaseModel):
    """Schema base de usuario"""
    email: EmailStr
    nome: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.COLABORADOR
    tipo: Optional[UserType] = None
    cargo: Optional[str] = None
    setor: Optional[str] = None
    telefone: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    """Schema para criar usuario"""
    senha: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Schema para atualizar usuario"""
    nome: Optional[str] = None
    role: Optional[UserRole] = None
    tipo: Optional[UserType] = None
    cargo: Optional[str] = None
    setor: Optional[str] = None
    telefone: Optional[str] = None
    avatar: Optional[str] = None
    ativo: Optional[bool] = None


class UserResponse(UserBase):
    """Schema  de resposta de usuario"""
    id: int
    ativo: bool
    primeiro_acesso: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Usuario com hash de senha (uso interno)"""
    senha_hash: str
