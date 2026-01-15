"""
Authentication routes - Login, register, password management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database import get_db
from ..models.user import User
from ..models.refresh_token import RefreshToken
from ..schemas.auth import LoginRequest, TokenResponse, PasswordChange
from ..schemas.user import UserCreate, UserResponse
from ..schemas.refresh_token import RefreshTokenRequest, TokenPairResponse
from ..auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token
)
from ..password_validator import validate_password_policy
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenPairResponse)
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint
    Returns access token (15min) and refresh token (7 days)
    """
    # Find user by email
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
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Create access token (15 min)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    
    # Create refresh token (7 days)
    refresh_token_str = create_refresh_token()
    refresh_token_obj = RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "access_expires_in": 900,  # 15 min
        "refresh_expires_in": 604800,  # 7 days
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register new user
    Admin-only in production, open for first setup
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    is_valid, error_msg = validate_password_policy(user_data.senha, user_data.email)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Create new user
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
    """Get current authenticated user info"""
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify current password
    if not verify_password(password_data.senha_atual, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength
    is_valid, error_msg = validate_password_policy(password_data.senha_nova, current_user.email)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Prevent reusing the same password
    if verify_password(password_data.senha_nova, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha não pode ser igual à senha atual"
        )
    
    # Update password
    current_user.senha_hash = get_password_hash(password_data.senha_nova)
    current_user.primeiro_acesso = False
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/refresh", response_model=TokenPairResponse)
@limiter.limit("10/minute")
async def refresh_access_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Renova access token usando refresh token
    """
    # Buscar refresh token no banco
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_data.refresh_token
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verificar se token é válido
    if not refresh_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked"
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.id == refresh_token.user_id).first()
    if not user or not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Atualizar last_used do refresh token
    refresh_token.last_used = datetime.utcnow()
    
    # Criar novo access token
    new_access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    
    # Criar novo refresh token (rotation)
    new_refresh_token_str = create_refresh_token()
    new_refresh_token_obj = RefreshToken(
        token=new_refresh_token_str,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    # Revogar refresh token antigo
    refresh_token.revoked = True
    
    db.add(new_refresh_token_obj)
    db.commit()
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token_str,
        "token_type": "bearer",
        "access_expires_in": 900,
        "refresh_expires_in": 604800,
    }


@router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout - revoga refresh token
    """
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_data.refresh_token,
        RefreshToken.user_id == current_user.id
    ).first()
    
    if refresh_token:
        refresh_token.revoked = True
        db.commit()
    
    return {"message": "Logged out successfully"}
    
    # Update password
    current_user.senha_hash = get_password_hash(password_data.senha_nova)
    current_user.primeiro_acesso = False
    db.commit()
    
    return {"message": "Password changed successfully"}
