"""
Rotas para gerenciar permissões por role
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.permissao import PermissaoRole
from ..schemas.permissao import PermissaoRoleCreate, PermissaoRoleResponse, PermissaoRoleUpdate
from ..auth import get_current_user
from typing import Dict, List

router = APIRouter(prefix="/api/permissoes", tags=["permissoes"])

# Roles válidos no sistema
ROLES_VALIDOS = ["admin", "gestor", "colaborador", "cliente"]


@router.get("/role/{role}", response_model=PermissaoRoleResponse)
def obter_permissoes_role(role: str, db: Session = Depends(get_db)):
    """
    Obter permissões de um role específico.
    Pode ser acessado por qualquer usuário para verificar quais páginas pode acessar.
    """
    if role not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role inválido. Deve ser um de: {', '.join(ROLES_VALIDOS)}"
        )
    
    permissao = db.query(PermissaoRole).filter(PermissaoRole.role == role).first()
    
    if not permissao:
        # Se não existir, retornar padrão (tudo habilitado)
        permissao_padrao = PermissaoRole(role=role)
        return permissao_padrao.to_dict()
    
    return permissao


@router.get("/", response_model=Dict[str, PermissaoRoleResponse])
def obter_todas_permissoes(db: Session = Depends(get_db)):
    """
    Obter permissões de todos os roles.
    Apenas para fins informativos (usado na aba Permissões de Configurações).
    """
    permissoes = {}
    
    for role in ROLES_VALIDOS:
        perm = db.query(PermissaoRole).filter(PermissaoRole.role == role).first()
        if perm:
            permissoes[role] = perm
        else:
            # Retornar padrão se não existir
            permissoes[role] = PermissaoRole(role=role)
    
    return permissoes


@router.put("/role/{role}", response_model=PermissaoRoleResponse)
def atualizar_permissoes_role(
    role: str,
    permissoes: PermissaoRoleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Atualizar permissões de um role específico.
    Apenas o administrador pode fazer isso.
    """
    # Verificar se o usuário é admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem modificar permissões"
        )
    
    if role not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role inválido. Deve ser um de: {', '.join(ROLES_VALIDOS)}"
        )
    
    # Buscar ou criar registro de permissões
    perm = db.query(PermissaoRole).filter(PermissaoRole.role == role).first()
    
    if not perm:
        # Se não existir, criar novo com valores padrão
        perm = PermissaoRole(role=role)
        db.add(perm)
    
    # Atualizar apenas os campos fornecidos
    update_data = permissoes.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(perm, field, value)
    
    db.commit()
    db.refresh(perm)
    
    return perm


@router.post("/role/{role}", response_model=PermissaoRoleResponse)
def criar_ou_resetar_permissoes_role(
    role: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Criar ou resetar permissões de um role para valores padrão (todos habilitados).
    Apenas o administrador pode fazer isso.
    """
    # Verificar se o usuário é admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem modificar permissões"
        )
    
    if role not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role inválido. Deve ser um de: {', '.join(ROLES_VALIDOS)}"
        )
    
    # Deletar permissão existente se houver
    perm_existente = db.query(PermissaoRole).filter(PermissaoRole.role == role).first()
    if perm_existente:
        db.delete(perm_existente)
    
    # Criar nova com valores padrão
    perm = PermissaoRole(role=role)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    
    return perm
