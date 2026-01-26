"""
Schemas para validação de permissões por role
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PermissaoRoleBase(BaseModel):
    """Base schema com todas as permissões"""
    dashboard: bool = True
    notificacoes: bool = True
    tarefas: bool = True
    ponto: bool = True
    mural: bool = True
    calendario: bool = True
    clientes: bool = True
    chat: bool = True
    documentos: bool = True
    feedbacks: bool = True
    solicitacoes: bool = True
    configuracoes: bool = True
    beneficios: bool = True
    performance: bool = True
    colaboradores: bool = True
    folha_pagamento: bool = True
    folha_clientes: bool = True
    avaliacoes: bool = True
    okrs: bool = True
    relatorios: bool = True


class PermissaoRoleCreate(PermissaoRoleBase):
    """Schema para criar/atualizar permissões"""
    role: str  # admin, gestor, colaborador, cliente


class PermissaoRoleUpdate(BaseModel):
    """Schema para atualizar parcialmente permissões"""
    dashboard: Optional[bool] = None
    notificacoes: Optional[bool] = None
    tarefas: Optional[bool] = None
    ponto: Optional[bool] = None
    mural: Optional[bool] = None
    calendario: Optional[bool] = None
    clientes: Optional[bool] = None
    chat: Optional[bool] = None
    documentos: Optional[bool] = None
    feedbacks: Optional[bool] = None
    solicitacoes: Optional[bool] = None
    configuracoes: Optional[bool] = None
    beneficios: Optional[bool] = None
    performance: Optional[bool] = None
    colaboradores: Optional[bool] = None
    folha_pagamento: Optional[bool] = None
    folha_clientes: Optional[bool] = None
    avaliacoes: Optional[bool] = None
    okrs: Optional[bool] = None
    relatorios: Optional[bool] = None


class PermissaoRoleResponse(PermissaoRoleBase):
    """Schema de resposta com dados adicionais"""
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
