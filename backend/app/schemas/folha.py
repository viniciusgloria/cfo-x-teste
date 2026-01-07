"""
Folha (Payroll) schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from ..models.folha_clientes import SituacaoFolha, StatusOMIE


class FolhaClienteCreate(BaseModel):
    """Create client payroll entry"""
    cliente_id: int
    colaborador_nome: str
    funcao: Optional[str] = None
    empresa: Optional[str] = None
    ctt: Optional[str] = None
    percentual: float = 100
    valor_base: float
    adicional: float = 0
    reembolso: float = 0
    desconto: float = 0
    valor_total: float
    mes_referencia: str


class FolhaClienteUpdate(BaseModel):
    """Update client payroll entry"""
    situacao: Optional[SituacaoFolha] = None
    data_pagamento: Optional[date] = None
    nota_fiscal: Optional[str] = None
    status_omie: Optional[StatusOMIE] = None


class FolhaClienteResponse(BaseModel):
    """Client payroll response"""
    id: int
    cliente_id: int
    colaborador_nome: str
    funcao: Optional[str] = None
    empresa: Optional[str] = None
    valor_base: float
    valor_total: float
    situacao: SituacaoFolha
    status_omie: StatusOMIE
    mes_referencia: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class FolhaPagamentoCreate(BaseModel):
    """Create internal payroll entry"""
    user_id: int
    mes_referencia: str
    salario_base: float
    horas_extras: float = 0
    adicional_noturno: float = 0
    bonus: float = 0
    comissao: float = 0
    inss: float = 0
    irrf: float = 0
    vale_transporte: float = 0
    vale_refeicao: float = 0
    plano_saude: float = 0
    outros_descontos: float = 0
    total_proventos: float
    total_descontos: float
    salario_liquido: float


class FolhaPagamentoResponse(BaseModel):
    """Internal payroll response"""
    id: int
    user_id: int
    mes_referencia: str
    salario_base: float
    total_proventos: float
    total_descontos: float
    salario_liquido: float
    data_pagamento: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
