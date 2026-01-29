"""
Rotas de gestao de usuarios
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.cliente import Cliente, StatusContrato
from ..schemas.user import UserResponse, UserUpdate, UserCreate
from ..dependencies import get_current_user, get_current_admin
from ..auth import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    role: Optional[str] = None,
    setor: Optional[str] = None,
    ativo: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista usuarios com filtros opcionais"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if setor:
        query = query.filter(User.setor == setor)
    if ativo is not None:
        query = query.filter(User.ativo == ativo)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Busca usuario por ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Busca usuario por email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cria novo usuario (apenas admin)"""
    # Verifica se email existe
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
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
        empresa=user_data.empresa,
        grupoId=user_data.grupoId,
        grupoNome=user_data.grupoNome,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Atualiza usuario (apenas admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Atualiza campos
    for field, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Remove usuario (apenas admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Se for um usuário cliente, marcar também o cliente associado como inativo
    if user.role == 'cliente':
        # Procura cliente pelo email do usuário ou pela empresa
        cliente = db.query(Cliente).filter(
            (Cliente.email == user.email) | 
            (Cliente.nome == user.empresa)
        ).first()
        
        if cliente:
            cliente.status = StatusContrato.INATIVO
    
    # Exclusao logica - apenas marca como inativo
    user.ativo = False
    db.commit()
    
    return None
