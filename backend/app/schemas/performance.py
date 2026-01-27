"""
Schemas de validação para Performance/CPA
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


# ===== SCHEMAS BÁSICOS =====

class CpaChannelMetricsBase(BaseModel):
    """Schema base para métricas de canal"""
    channel_id: str
    channel_name: str
    channel_type: str  # Checkout, Marketplace
    date: datetime
    period_type: str = 'daily'
    faturamento: float = 0.0
    gasto_ads: float = 0.0
    custo_produtos: float = 0.0
    custos_variaveis: float = 0.0
    lucro_liquido: float = 0.0
    pedidos: int = 0
    ticket_medio: float = 0.0
    novos_clientes: int = 0
    recompra: int = 0
    retencao: float = 0.0
    cpa: float = 0.0
    roas: float = 0.0
    margem_contribuicao: float = 0.0
    margem_apos_aquisicao: float = 0.0
    alertas: List[str] = []
    tendencia: List[float] = []
    distribuicao_gastos: Dict[str, float] = {}


class CpaChannelMetricsCreate(CpaChannelMetricsBase):
    """Schema para criar métricas de canal"""
    cliente_id: int


class CpaChannelMetricsUpdate(BaseModel):
    """Schema para atualizar métricas de canal (todos campos opcionais)"""
    channel_name: Optional[str] = None
    channel_type: Optional[str] = None
    faturamento: Optional[float] = None
    gasto_ads: Optional[float] = None
    custo_produtos: Optional[float] = None
    custos_variaveis: Optional[float] = None
    lucro_liquido: Optional[float] = None
    pedidos: Optional[int] = None
    ticket_medio: Optional[float] = None
    novos_clientes: Optional[int] = None
    recompra: Optional[int] = None
    retencao: Optional[float] = None
    cpa: Optional[float] = None
    roas: Optional[float] = None
    margem_contribuicao: Optional[float] = None
    margem_apos_aquisicao: Optional[float] = None
    alertas: Optional[List[str]] = None
    tendencia: Optional[List[float]] = None
    distribuicao_gastos: Optional[Dict[str, float]] = None


class CpaChannelMetricsResponse(BaseModel):
    """Schema de resposta para métricas de canal"""
    id: int
    clienteId: int
    channelId: str
    channelName: str
    channelType: str
    date: str
    periodType: str
    faturamento: float
    gastoAds: float
    custoProdutos: float
    custosVariaveis: float
    lucroLiquido: float
    pedidos: int
    ticketMedio: float
    novosClientes: int
    recompra: int
    retencao: float
    cpa: float
    roas: float
    margemContribuicao: float
    margemAposAquisicao: float
    alertas: List[str]
    tendencia: List[float]
    distribuicaoGastos: Dict[str, float]

    class Config:
        from_attributes = True


# ===== DAILY METRICS =====

class CpaDailyMetricBase(BaseModel):
    """Schema base para métricas diárias"""
    date: datetime
    day_label: Optional[str] = None
    channel_id: Optional[str] = None
    pedidos_pagos: int = 0
    pedidos_yampi: int = 0
    pedidos_market: int = 0
    ticket_yampi: float = 0.0
    ticket_market: float = 0.0
    gasto_ads: float = 0.0
    faturamento: float = 0.0
    roas: float = 0.0
    cpa: float = 0.0
    margem: float = 0.0


class CpaDailyMetricCreate(CpaDailyMetricBase):
    """Schema para criar métrica diária"""
    cliente_id: int


class CpaDailyMetricResponse(BaseModel):
    """Schema de resposta para métrica diária"""
    id: int
    clienteId: int
    date: str
    dia: Optional[str]
    channelId: Optional[str]
    pedidosPagos: int
    pedidosYampi: int
    pedidosMarket: int
    ticketYampi: float
    ticketMarket: float
    gastoAds: float
    faturamento: float
    roas: float
    cpa: float
    margem: float

    class Config:
        from_attributes = True


# ===== EVENTS =====

class CpaEventBase(BaseModel):
    """Schema base para eventos"""
    titulo: str
    origem: str
    valor: float = 0.0
    tipo: Optional[str] = None
    event_metadata: Dict = {}


class CpaEventCreate(CpaEventBase):
    """Schema para criar evento"""
    cliente_id: int


class CpaEventResponse(BaseModel):
    """Schema de resposta para evento"""
    id: int
    clienteId: int
    titulo: str
    origem: str
    valor: float
    tipo: Optional[str]
    ha: str
    timestamp: str

    class Config:
        from_attributes = True


# ===== COSTS CONFIG =====

class CpaCostsConfigBase(BaseModel):
    """Schema base para configuração de custos"""
    gateway: float = 2.5
    transporte: float = 18.0
    picking: float = 2.0
    imposto: float = 12.0
    checkout: float = 1.8


class CpaCostsConfigCreate(CpaCostsConfigBase):
    """Schema para criar configuração de custos"""
    cliente_id: int


class CpaCostsConfigUpdate(BaseModel):
    """Schema para atualizar configuração de custos"""
    gateway: Optional[float] = None
    transporte: Optional[float] = None
    picking: Optional[float] = None
    imposto: Optional[float] = None
    checkout: Optional[float] = None


class CpaCostsConfigResponse(BaseModel):
    """Schema de resposta para configuração de custos"""
    id: int
    clienteId: int
    gateway: float
    transporte: float
    picking: float
    imposto: float
    checkout: float

    class Config:
        from_attributes = True


# ===== INTEGRATION HEALTH =====

class CpaIntegrationHealthBase(BaseModel):
    """Schema base para saúde de integração"""
    integration_id: str
    integration_name: str
    status: str = 'ok'
    message: Optional[str] = None
    integration_metadata: Dict = {}


class CpaIntegrationHealthCreate(CpaIntegrationHealthBase):
    """Schema para criar status de integração"""
    cliente_id: int


class CpaIntegrationHealthUpdate(BaseModel):
    """Schema para atualizar status de integração"""
    status: Optional[str] = None
    message: Optional[str] = None
    integration_metadata: Optional[Dict] = None


class CpaIntegrationHealthResponse(BaseModel):
    """Schema de resposta para saúde de integração"""
    id: str
    nome: str
    status: str
    lastSyncMinutes: int
    message: Optional[str]

    class Config:
        from_attributes = True


# ===== FUNNEL STEPS =====

class CpaFunnelStepBase(BaseModel):
    """Schema base para etapa do funil"""
    date: datetime
    step_order: int
    step_label: str
    value: int = 0
    target: int = 0


class CpaFunnelStepCreate(CpaFunnelStepBase):
    """Schema para criar etapa do funil"""
    cliente_id: int


class CpaFunnelStepResponse(BaseModel):
    """Schema de resposta para etapa do funil"""
    label: str
    value: int
    target: int

    class Config:
        from_attributes = True


# ===== SCHEMAS COMPOSTOS =====

class CpaChannelSnapshot(BaseModel):
    """Snapshot completo de um canal específico"""
    canaiId: str
    canalNome: str
    canalTipo: str
    faturamento: float
    gastoAds: float
    pedidos: int
    ticketMedio: float
    margemContribuicao: float
    margemAposAquisicao: float
    custoProdutos: float
    custosVariaveis: float
    lucroLiquido: float
    novosClientes: int
    recompra: int
    retencao: float
    cpa: float
    roas: float
    distribuicaoGastos: Dict[str, float]
    diarias: List[CpaDailyMetricResponse]
    alertas: List[str]
    tendencia: List[float]


class CpaSnapshot(BaseModel):
    """Snapshot completo de performance (todos os canais)"""
    canais: List[Dict]  # Lista de CpaChannelMetrics simplificado
    funil: List[Dict]  # Lista de CpaFunnelStep
    diarias: List[Dict]  # Lista de CpaDailyMetric
    eventos: List[Dict]  # Lista de CpaEvent
    custos: Dict  # CpaCostsConfig
    integracoes: List[Dict]  # Lista de CpaIntegrationHealth
