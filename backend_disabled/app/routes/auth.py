"""
Rotas de autenticacao - login, cadastro e gestao de senha
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database import get_db
from ..models.user import User
from ..schemas.auth import LoginRequest, TokenResponse, PasswordChange
from ..schemas.user import UserCreate, UserResponse
from ..auth import (
    verify_password, 
    get_password_hash, 
    create_access_token
)
from ..password_validator import validate_password_policy
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de login - Retorna token JWT com validade de 7 dias
    """
    # Busca usuario por email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Atualiza ultimo login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Cria token de acesso JWT (7 dias)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Cadastra novo usuario
    Apenas admin em producao, aberto na primeira configuracao
    """
    # Verifica se email ja existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Valida forca da senha
    is_valid, error_msg = validate_password_policy(user_data.senha, user_data.email)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Cria novo usuario
    new_user = User(
        email=user_data.email,
        nome=user_data.nome,
        senha_hash=get_password_hash(user_data.senha),
        role=user_data.role,
        tipo=user_data.tipo,
        cargo=user_data.cargo,
        setor=user_data.setor,
        telefone=user_data.telefone,
        avatar=user_data.avatar,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Retorna dados do usuario autenticado"""
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Altera a senha do usuario"""
    # Valida a senha atual
    if not verify_password(password_data.senha_atual, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Valida a forca da nova senha
    is_valid, error_msg = validate_password_policy(password_data.senha_nova, current_user.email)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Impede reutilizar a mesma senha
    if verify_password(password_data.senha_nova, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha não pode ser igual à senha atual"
        )
    
    # Atualiza senha
    current_user.senha_hash = get_password_hash(password_data.senha_nova)
    current_user.primeiro_acesso = False
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout - Cliente deve limpar o token localmente
    """
    return {"message": "Logged out successfully"}
