"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login credentials"""
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class PasswordChange(BaseModel):
    """Password change request"""
    senha_atual: str
    senha_nova: str
