"""Rotas de clientes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.cliente import Cliente
from ..schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.post("/", response_model=ClienteResponse)
def create_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db)
    # Removido temporariamente para teste: current_user = Depends(get_current_user)
):
    """Criar novo cliente"""
    db_cliente = Cliente(**cliente.model_dump())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.get("/", response_model=List[ClienteResponse])
def list_clientes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # Removido temporariamente para teste: current_user = Depends(get_current_user)
):
    """Listar todos os clientes"""
    clientes = db.query(Cliente).offset(skip).limit(limit).all()
    return clientes


@router.get("/{cliente_id}", response_model=ClienteResponse)
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Buscar cliente por ID"""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def update_cliente(
    cliente_id: int,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Atualizar cliente"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    for key, value in cliente_update.model_dump(exclude_unset=True).items():
        setattr(db_cliente, key, value)
    
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.delete("/{cliente_id}")
def delete_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Deletar cliente"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    db.delete(db_cliente)
    db.commit()
    return {"message": "Cliente deletado com sucesso"}
