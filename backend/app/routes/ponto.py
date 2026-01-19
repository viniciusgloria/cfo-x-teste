"""
Rotas de ponto (controle de jornada)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models.ponto import Ponto, AjustePonto
from ..models.user import User
from ..schemas.ponto import (
    PontoCreate, PontoResponse,
    AjustePontoCreate, AjustePontoUpdate, AjustePontoResponse
)
from ..dependencies import get_current_user, get_current_gestor_or_admin

router = APIRouter(prefix="/ponto", tags=["Ponto"])


@router.post("/", response_model=PontoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_ponto(
    ponto_data: PontoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra ponto"""
    novo_ponto = Ponto(
        user_id=current_user.id,
        tipo=ponto_data.tipo,
        timestamp=datetime.utcnow(),
        latitude=ponto_data.latitude,
        longitude=ponto_data.longitude,
        localizacao=ponto_data.localizacao,
    )
    
    db.add(novo_ponto)
    db.commit()
    db.refresh(novo_ponto)
    
    return novo_ponto


@router.get("/", response_model=List[PontoResponse])
async def listar_pontos(
    user_id: Optional[int] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista pontos"""
    query = db.query(Ponto)
    
    # Filtra por usuario
    if user_id:
        query = query.filter(Ponto.user_id == user_id)
    else:
        query = query.filter(Ponto.user_id == current_user.id)
    
    # Filtra por intervalo de datas
    if data_inicio:
        query = query.filter(Ponto.timestamp >= data_inicio)
    if data_fim:
        query = query.filter(Ponto.timestamp <= data_fim)
    
    pontos = query.order_by(Ponto.timestamp.desc()).offset(skip).limit(limit).all()
    return pontos


@router.post("/ajustes", response_model=AjustePontoResponse, status_code=status.HTTP_201_CREATED)
async def solicitar_ajuste(
    ajuste_data: AjustePontoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Solicita ajuste de ponto"""
    novo_ajuste = AjustePonto(
        user_id=current_user.id,
        data=ajuste_data.data,
        tipo=ajuste_data.tipo,
        horario_original=ajuste_data.horario_original,
        horario_ajustado=ajuste_data.horario_ajustado,
        motivo=ajuste_data.motivo,
    )
    
    db.add(novo_ajuste)
    db.commit()
    db.refresh(novo_ajuste)
    
    return novo_ajuste


@router.get("/ajustes", response_model=List[AjustePontoResponse])
async def listar_ajustes(
    user_id: Optional[int] = None,
    status_filtro: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista solicitacoes de ajuste"""
    query = db.query(AjustePonto)
    
    if user_id:
        query = query.filter(AjustePonto.user_id == user_id)
    else:
        query = query.filter(AjustePonto.user_id == current_user.id)
    
    if status_filtro:
        query = query.filter(AjustePonto.status == status_filtro)
    
    ajustes = query.order_by(AjustePonto.created_at.desc()).all()
    return ajustes


@router.put("/ajustes/{ajuste_id}", response_model=AjustePontoResponse)
async def atualizar_ajuste(
    ajuste_id: int,
    ajuste_update: AjustePontoUpdate,
    current_user: User = Depends(get_current_gestor_or_admin),
    db: Session = Depends(get_db)
):
    """Atualiza status do ajuste (gestor/admin)"""
    ajuste = db.query(AjustePonto).filter(AjustePonto.id == ajuste_id).first()
    if not ajuste:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adjustment not found"
        )
    
    ajuste.status = ajuste_update.status
    ajuste.resposta = ajuste_update.resposta
    ajuste.aprovador_id = current_user.id
    
    db.commit()
    db.refresh(ajuste)
    
    return ajuste
