"""
Esquemas de autenticacao
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Credenciais de login"""
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    """Resposta de token JWT"""
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    """Requisicao de troca de senha"""
    senha_atual: str
    senha_nova: str
