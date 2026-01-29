"""
Esquemas de colaborador
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ColaboradorCreate(BaseModel):
    """Cria perfil de colaborador"""
    user_id: int
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    estado_civil: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    data_admissao: Optional[date] = None
    salario: Optional[float] = None
    cnpj: Optional[str] = None
    meta_horas: Optional[float] = None
    contato_emergencia: Optional[str] = None
    telefone_emergencia: Optional[str] = None


class ColaboradorUpdate(BaseModel):
    """Atualiza perfil de colaborador"""
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    endereco: Optional[str] = None
    salario: Optional[float] = None
    banco_horas: Optional[float] = None
    ativo: Optional[bool] = None


class ColaboradorResponse(BaseModel):
    """Resposta de colaborador"""
    id: int
    user_id: int
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    data_admissao: Optional[date] = None
    salario: Optional[float] = None
    banco_horas: float
    cnpj: Optional[str] = None
    meta_horas: Optional[float] = None
    ativo: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
