"""Rotas de empresa"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.empresa import Empresa
from ..models.user import User
from ..schemas.empresa import EmpresaResponse, EmpresaUpsert
from ..dependencies import get_current_admin

router = APIRouter(prefix="/empresa", tags=["Empresa"])
logger = logging.getLogger("api.empresa")


@router.post("", response_model=EmpresaResponse)
async def upsert_empresa(
    payload: EmpresaUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Cria ou atualiza configuracoes da empresa.
    """
    data = payload.model_dump()
    logger.info("empresa_upsert payload=%s", data)

    empresa = db.query(Empresa).first()
    configuracoes = data.pop("configuracoes", None)

    if empresa is None:
        empresa = Empresa(**data)
        if configuracoes is not None:
            empresa.configuracoes = json.dumps(configuracoes, ensure_ascii=True)
        db.add(empresa)
    else:
        for key, value in data.items():
            setattr(empresa, key, value)
        if configuracoes is not None:
            empresa.configuracoes = json.dumps(configuracoes, ensure_ascii=True)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao salvar empresa"
        )

    db.refresh(empresa)
    return empresa
