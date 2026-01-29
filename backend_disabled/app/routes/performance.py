"""
Rotas para Performance/CPA - Dashboard de métricas e análise de canais
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime, timedelta
from typing import Optional, List
from ..database import get_db
from ..dependencies import get_current_user
from ..models.performance import (
    CpaChannelMetrics,
    CpaDailyMetric,
    CpaEvent,
    CpaCostsConfig,
    CpaIntegrationHealth,
    CpaFunnelStep
)
from ..schemas.performance import (
    CpaChannelMetricsCreate,
    CpaChannelMetricsUpdate,
    CpaChannelMetricsResponse,
    CpaDailyMetricCreate,
    CpaDailyMetricResponse,
    CpaEventCreate,
    CpaEventResponse,
    CpaCostsConfigCreate,
    CpaCostsConfigUpdate,
    CpaCostsConfigResponse,
    CpaIntegrationHealthCreate,
    CpaIntegrationHealthUpdate,
    CpaIntegrationHealthResponse,
    CpaFunnelStepCreate,
    CpaFunnelStepResponse,
    CpaSnapshot,
    CpaChannelSnapshot
)

router = APIRouter(prefix="/api/performance", tags=["performance"])


# ===== HELPER FUNCTIONS =====

def get_cliente_id_from_user(current_user, cliente_id_param: Optional[int] = None):
    """
    Determina o cliente_id baseado no role do usuário:
    - Se for 'cliente': retorna o ID do cliente vinculado ao usuário
    - Se for admin/gestor/colaborador: permite especificar cliente_id ou usa o primeiro disponível
    """
    if current_user.role == 'cliente':
        # Para clientes, retornar o próprio cliente_id (assumindo que está em user.cliente_id)
        # Se não houver campo cliente_id no user, você precisará buscar na tabela de clientes
        # por enquanto vamos assumir que existe
        if hasattr(current_user, 'cliente_id') and current_user.cliente_id:
            return current_user.cliente_id
        # Alternativa: buscar pelo email na tabela de clientes
        return None
    else:
        # Para admin/gestor/colaborador, usar o cliente_id fornecido
        return cliente_id_param


def format_channel_for_response(channel: CpaChannelMetrics) -> dict:
    """Formata um canal para a resposta da API (formato esperado pelo frontend)"""
    return {
        'id': channel.channel_id,
        'nome': channel.channel_name,
        'tipo': channel.channel_type,
        'faturamento': channel.faturamento,
        'gastoAds': channel.gasto_ads,
        'pedidos': channel.pedidos,
        'ticketMedio': channel.ticket_medio,
        'novosClientes': channel.novos_clientes,
        'recompra': channel.recompra,
        'retencao': channel.retencao,
        'custoProdutos': channel.custo_produtos,
        'custosVariaveis': channel.custos_variaveis,
        'lucroLiquido': channel.lucro_liquido,
        'cpa': channel.cpa,
        'roas': channel.roas,
        'margemContribuicao': channel.margem_contribuicao,
        'alertas': channel.alertas or [],
        'tendencia': channel.tendencia or []
    }


# ===== SNAPSHOT PRINCIPAL =====

@router.get("/snapshot")
def get_cpa_snapshot(
    start_date: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
    cliente_id: Optional[int] = Query(None, description="ID do cliente (apenas para admin/gestor)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retorna snapshot completo de performance com todos os dados agregados
    """
    # Determinar cliente_id baseado no usuário
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado. Forneça cliente_id ou verifique seu cadastro."
        )
    
    # Processar datas
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de data inválido. Use YYYY-MM-DD"
            )
    else:
        # Padrão: últimos 7 dias
        end_dt = datetime.now()
        start_dt = end_dt - timedelta(days=7)
    
    # Buscar dados do período
    
    # 1. Canais
    canais_query = db.query(CpaChannelMetrics).filter(
        and_(
            CpaChannelMetrics.cliente_id == target_cliente_id,
            CpaChannelMetrics.date >= start_dt,
            CpaChannelMetrics.date <= end_dt
        )
    ).order_by(CpaChannelMetrics.date.desc())
    
    canais_data = canais_query.all()
    
    # Agrupar por canal (pegar métricas mais recentes de cada canal)
    canais_dict = {}
    for canal in canais_data:
        if canal.channel_id not in canais_dict:
            canais_dict[canal.channel_id] = canal
    
    canais = [format_channel_for_response(c) for c in canais_dict.values()]
    
    # 2. Métricas diárias
    diarias_query = db.query(CpaDailyMetric).filter(
        and_(
            CpaDailyMetric.cliente_id == target_cliente_id,
            CpaDailyMetric.date >= start_dt,
            CpaDailyMetric.date <= end_dt
        )
    ).order_by(CpaDailyMetric.date)
    
    diarias = [d.to_dict() for d in diarias_query.all()]
    
    # 3. Funil
    funil_query = db.query(CpaFunnelStep).filter(
        and_(
            CpaFunnelStep.cliente_id == target_cliente_id,
            CpaFunnelStep.date >= start_dt,
            CpaFunnelStep.date <= end_dt
        )
    ).order_by(CpaFunnelStep.step_order)
    
    funil = [{'label': f.step_label, 'value': f.value, 'target': f.target} for f in funil_query.all()]
    
    # 4. Eventos (últimos 50)
    eventos_query = db.query(CpaEvent).filter(
        CpaEvent.cliente_id == target_cliente_id
    ).order_by(desc(CpaEvent.timestamp)).limit(50)
    
    eventos = [e.to_dict() for e in eventos_query.all()]
    
    # 5. Configuração de custos
    custos_config = db.query(CpaCostsConfig).filter(
        CpaCostsConfig.cliente_id == target_cliente_id
    ).first()
    
    if custos_config:
        custos = custos_config.to_dict()
    else:
        # Criar configuração padrão se não existir
        custos_config = CpaCostsConfig(
            cliente_id=target_cliente_id,
            gateway=2.5,
            transporte=18.0,
            picking=2.0,
            imposto=12.0,
            checkout=1.8
        )
        db.add(custos_config)
        db.commit()
        custos = custos_config.to_dict()
    
    # 6. Status de integrações
    integracoes_query = db.query(CpaIntegrationHealth).filter(
        CpaIntegrationHealth.cliente_id == target_cliente_id
    )
    
    integracoes = [i.to_dict() for i in integracoes_query.all()]
    
    # Retornar snapshot completo
    return {
        'canais': canais,
        'funil': funil,
        'diarias': diarias,
        'eventos': eventos,
        'custos': {
            'gateway': custos['gateway'],
            'transporte': custos['transporte'],
            'picking': custos['picking'],
            'imposto': custos['imposto'],
            'checkout': custos['checkout']
        },
        'integracoes': integracoes
    }


# ===== CHANNEL SNAPSHOT =====

@router.get("/channels/{channel_id}")
def get_channel_snapshot(
    channel_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    cliente_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retorna snapshot detalhado de um canal específico
    """
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    # Processar datas
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de data inválido"
            )
    else:
        end_dt = datetime.now()
        start_dt = end_dt - timedelta(days=7)
    
    # Buscar métricas do canal
    channel_metrics = db.query(CpaChannelMetrics).filter(
        and_(
            CpaChannelMetrics.cliente_id == target_cliente_id,
            CpaChannelMetrics.channel_id == channel_id,
            CpaChannelMetrics.date >= start_dt,
            CpaChannelMetrics.date <= end_dt
        )
    ).order_by(desc(CpaChannelMetrics.date)).first()
    
    if not channel_metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Canal {channel_id} não encontrado para este cliente"
        )
    
    # Buscar métricas diárias do canal
    diarias_canal = db.query(CpaDailyMetric).filter(
        and_(
            CpaDailyMetric.cliente_id == target_cliente_id,
            CpaDailyMetric.channel_id == channel_id,
            CpaDailyMetric.date >= start_dt,
            CpaDailyMetric.date <= end_dt
        )
    ).order_by(CpaDailyMetric.date).all()
    
    # Montar resposta
    return {
        'canaiId': channel_metrics.channel_id,
        'canalNome': channel_metrics.channel_name,
        'canalTipo': channel_metrics.channel_type,
        'faturamento': channel_metrics.faturamento,
        'gastoAds': channel_metrics.gasto_ads,
        'pedidos': channel_metrics.pedidos,
        'ticketMedio': channel_metrics.ticket_medio,
        'margemContribuicao': channel_metrics.margem_contribuicao,
        'margemAposAquisicao': channel_metrics.margem_apos_aquisicao,
        'custoProdutos': channel_metrics.custo_produtos,
        'custosVariaveis': channel_metrics.custos_variaveis,
        'lucroLiquido': channel_metrics.lucro_liquido,
        'novosClientes': channel_metrics.novos_clientes,
        'recompra': channel_metrics.recompra,
        'retencao': channel_metrics.retencao,
        'cpa': channel_metrics.cpa,
        'roas': channel_metrics.roas,
        'distribuicaoGastos': channel_metrics.distribuicao_gastos or {},
        'diarias': [d.to_dict() for d in diarias_canal],
        'alertas': channel_metrics.alertas or [],
        'tendencia': channel_metrics.tendencia or []
    }


# ===== CHANNEL METRICS CRUD =====

@router.post("/channels", response_model=CpaChannelMetricsResponse)
def create_channel_metrics(
    metrics: CpaChannelMetricsCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar nova entrada de métricas de canal"""
    # Verificar permissão (apenas admin/gestor pode criar)
    if current_user.role not in ['admin', 'gestor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e gestores podem criar métricas"
        )
    
    new_metrics = CpaChannelMetrics(
        cliente_id=metrics.cliente_id,
        channel_id=metrics.channel_id,
        channel_name=metrics.channel_name,
        channel_type=metrics.channel_type,
        date=metrics.date,
        period_type=metrics.period_type,
        faturamento=metrics.faturamento,
        gasto_ads=metrics.gasto_ads,
        custo_produtos=metrics.custo_produtos,
        custos_variaveis=metrics.custos_variaveis,
        lucro_liquido=metrics.lucro_liquido,
        pedidos=metrics.pedidos,
        ticket_medio=metrics.ticket_medio,
        novos_clientes=metrics.novos_clientes,
        recompra=metrics.recompra,
        retencao=metrics.retencao,
        cpa=metrics.cpa,
        roas=metrics.roas,
        margem_contribuicao=metrics.margem_contribuicao,
        margem_apos_aquisicao=metrics.margem_apos_aquisicao,
        alertas=metrics.alertas,
        tendencia=metrics.tendencia,
        distribuicao_gastos=metrics.distribuicao_gastos
    )
    
    db.add(new_metrics)
    db.commit()
    db.refresh(new_metrics)
    
    return new_metrics.to_dict()


@router.get("/channels", response_model=List[CpaChannelMetricsResponse])
def list_channel_metrics(
    cliente_id: Optional[int] = Query(None),
    channel_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar métricas de canais com filtros opcionais"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    query = db.query(CpaChannelMetrics).filter(
        CpaChannelMetrics.cliente_id == target_cliente_id
    )
    
    if channel_id:
        query = query.filter(CpaChannelMetrics.channel_id == channel_id)
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(CpaChannelMetrics.date >= start_dt)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(CpaChannelMetrics.date <= end_dt)
        except ValueError:
            pass
    
    metrics = query.order_by(desc(CpaChannelMetrics.date)).all()
    
    return [m.to_dict() for m in metrics]


# ===== DAILY METRICS =====

@router.post("/daily", response_model=CpaDailyMetricResponse)
def create_daily_metric(
    metric: CpaDailyMetricCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar nova entrada de métrica diária"""
    if current_user.role not in ['admin', 'gestor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e gestores podem criar métricas"
        )
    
    new_metric = CpaDailyMetric(
        cliente_id=metric.cliente_id,
        date=metric.date,
        day_label=metric.day_label,
        channel_id=metric.channel_id,
        pedidos_pagos=metric.pedidos_pagos,
        pedidos_yampi=metric.pedidos_yampi,
        pedidos_market=metric.pedidos_market,
        ticket_yampi=metric.ticket_yampi,
        ticket_market=metric.ticket_market,
        gasto_ads=metric.gasto_ads,
        faturamento=metric.faturamento,
        roas=metric.roas,
        cpa=metric.cpa,
        margem=metric.margem
    )
    
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    
    return new_metric.to_dict()


@router.get("/daily", response_model=List[CpaDailyMetricResponse])
def list_daily_metrics(
    cliente_id: Optional[int] = Query(None),
    channel_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar métricas diárias com filtros opcionais"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    query = db.query(CpaDailyMetric).filter(
        CpaDailyMetric.cliente_id == target_cliente_id
    )
    
    if channel_id:
        query = query.filter(CpaDailyMetric.channel_id == channel_id)
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(CpaDailyMetric.date >= start_dt)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(CpaDailyMetric.date <= end_dt)
        except ValueError:
            pass
    
    metrics = query.order_by(CpaDailyMetric.date).all()
    
    return [m.to_dict() for m in metrics]


# ===== EVENTS =====

@router.post("/events", response_model=CpaEventResponse)
def create_event(
    event: CpaEventCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar novo evento em tempo real"""
    if current_user.role not in ['admin', 'gestor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e gestores podem criar eventos"
        )
    
    new_event = CpaEvent(
        cliente_id=event.cliente_id,
        titulo=event.titulo,
        origem=event.origem,
        valor=event.valor,
        tipo=event.tipo,
        event_metadata=event.event_metadata
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return new_event.to_dict()


@router.get("/events", response_model=List[CpaEventResponse])
def list_events(
    cliente_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar eventos em tempo real (mais recentes primeiro)"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    events = db.query(CpaEvent).filter(
        CpaEvent.cliente_id == target_cliente_id
    ).order_by(desc(CpaEvent.timestamp)).limit(limit).all()
    
    return [e.to_dict() for e in events]


# ===== COSTS CONFIG =====

@router.get("/costs/config", response_model=CpaCostsConfigResponse)
def get_costs_config(
    cliente_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter configuração de custos do cliente"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    config = db.query(CpaCostsConfig).filter(
        CpaCostsConfig.cliente_id == target_cliente_id
    ).first()
    
    if not config:
        # Criar configuração padrão
        config = CpaCostsConfig(
            cliente_id=target_cliente_id,
            gateway=2.5,
            transporte=18.0,
            picking=2.0,
            imposto=12.0,
            checkout=1.8
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return config.to_dict()


@router.put("/costs/config", response_model=CpaCostsConfigResponse)
def update_costs_config(
    costs: CpaCostsConfigUpdate,
    cliente_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Atualizar configuração de custos"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    # Buscar ou criar configuração
    config = db.query(CpaCostsConfig).filter(
        CpaCostsConfig.cliente_id == target_cliente_id
    ).first()
    
    if not config:
        config = CpaCostsConfig(cliente_id=target_cliente_id)
        db.add(config)
    
    # Atualizar campos fornecidos
    update_data = costs.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    return config.to_dict()


# ===== INTEGRATION HEALTH =====

@router.get("/integrations/health", response_model=List[CpaIntegrationHealthResponse])
def list_integrations_health(
    cliente_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar status de saúde das integrações"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    integrations = db.query(CpaIntegrationHealth).filter(
        CpaIntegrationHealth.cliente_id == target_cliente_id
    ).all()
    
    return [i.to_dict() for i in integrations]


@router.post("/integrations/health", response_model=CpaIntegrationHealthResponse)
def create_integration_health(
    integration: CpaIntegrationHealthCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar ou atualizar status de integração"""
    if current_user.role not in ['admin', 'gestor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e gestores podem gerenciar integrações"
        )
    
    # Verificar se já existe
    existing = db.query(CpaIntegrationHealth).filter(
        and_(
            CpaIntegrationHealth.cliente_id == integration.cliente_id,
            CpaIntegrationHealth.integration_id == integration.integration_id
        )
    ).first()
    
    if existing:
        # Atualizar existente
        existing.integration_name = integration.integration_name
        existing.status = integration.status
        existing.message = integration.message
        existing.integration_metadata = integration.integration_metadata
        existing.last_sync = datetime.now()
        
        db.commit()
        db.refresh(existing)
        return existing.to_dict()
    else:
        # Criar novo
        new_integration = CpaIntegrationHealth(
            cliente_id=integration.cliente_id,
            integration_id=integration.integration_id,
            integration_name=integration.integration_name,
            status=integration.status,
            message=integration.message,
            integration_metadata=integration.integration_metadata,
            last_sync=datetime.now()
        )
        
        db.add(new_integration)
        db.commit()
        db.refresh(new_integration)
        
        return new_integration.to_dict()


# ===== FUNNEL =====

@router.post("/funnel", response_model=CpaFunnelStepResponse)
def create_funnel_step(
    step: CpaFunnelStepCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Criar etapa do funil"""
    if current_user.role not in ['admin', 'gestor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e gestores podem criar etapas do funil"
        )
    
    new_step = CpaFunnelStep(
        cliente_id=step.cliente_id,
        date=step.date,
        step_order=step.step_order,
        step_label=step.step_label,
        value=step.value,
        target=step.target
    )
    
    db.add(new_step)
    db.commit()
    db.refresh(new_step)
    
    return new_step.to_dict()


@router.get("/funnel", response_model=List[CpaFunnelStepResponse])
def list_funnel_steps(
    cliente_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar etapas do funil"""
    target_cliente_id = get_cliente_id_from_user(current_user, cliente_id)
    
    if not target_cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cliente não identificado"
        )
    
    query = db.query(CpaFunnelStep).filter(
        CpaFunnelStep.cliente_id == target_cliente_id
    )
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(CpaFunnelStep.date >= start_dt)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(CpaFunnelStep.date <= end_dt)
        except ValueError:
            pass
    
    steps = query.order_by(CpaFunnelStep.step_order).all()
    
    return [s.to_dict() for s in steps]
