"""
User schemas for validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from ..models.user import UserRole, UserType


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    nome: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.COLABORADOR
    tipo: Optional[UserType] = None
    cargo: Optional[str] = None
    setor: Optional[str] = None
    telefone: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    senha: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    nome: Optional[str] = None
    role: Optional[UserRole] = None
    tipo: Optional[UserType] = None
    cargo: Optional[str] = None
    setor: Optional[str] = None
    telefone: Optional[str] = None
    avatar: Optional[str] = None
    ativo: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    ativo: bool
    primeiro_acesso: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """User with hashed password (internal use)"""
    senha_hash: str
