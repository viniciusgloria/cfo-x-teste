"""
Modelos para Performance/CPA - Métricas de canais, eventos e custos
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class CpaChannelMetrics(Base):
    """
    Métricas de performance por canal de venda (Yampi, Mercado Livre, TikTok Shop, etc)
    """
    __tablename__ = "cpa_channel_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, index=True)  # ID do cliente (referência)
    
    # Identificação do canal
    channel_id = Column(String(100), nullable=False, index=True)  # yampi, mercado-livre, tiktok-shop, etc
    channel_name = Column(String(255), nullable=False)  # Nome do canal
    channel_type = Column(String(50), nullable=False)  # Checkout, Marketplace
    
    # Período de referência
    date = Column(DateTime(timezone=True), nullable=False, index=True)  # Data de referência
    period_type = Column(String(20), default='daily')  # daily, weekly, monthly
    
    # Métricas financeiras
    faturamento = Column(Float, default=0.0)
    gasto_ads = Column(Float, default=0.0)
    custo_produtos = Column(Float, default=0.0)  # CMV
    custos_variaveis = Column(Float, default=0.0)  # CVD
    lucro_liquido = Column(Float, default=0.0)
    
    # Métricas de vendas
    pedidos = Column(Integer, default=0)
    ticket_medio = Column(Float, default=0.0)
    
    # Métricas de clientes
    novos_clientes = Column(Integer, default=0)
    recompra = Column(Integer, default=0)
    retencao = Column(Float, default=0.0)  # Percentual
    
    # Métricas de performance
    cpa = Column(Float, default=0.0)  # Custo por aquisição
    roas = Column(Float, default=0.0)  # Return on Ad Spend
    margem_contribuicao = Column(Float, default=0.0)  # Percentual
    margem_apos_aquisicao = Column(Float, default=0.0)  # Percentual
    
    # Alertas e tendências (armazenados como JSON)
    alertas = Column(JSON, default=list)  # Lista de strings com alertas
    tendencia = Column(JSON, default=list)  # Lista de números para sparkline
    
    # Distribuição de gastos (JSON)
    distribuicao_gastos = Column(JSON, default=dict)  # {marketing: X, operacional: Y, administrativo: Z, outro: W}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'clienteId': self.cliente_id,
            'channelId': self.channel_id,
            'channelName': self.channel_name,
            'channelType': self.channel_type,
            'date': self.date.isoformat() if self.date else None,
            'periodType': self.period_type,
            'faturamento': self.faturamento,
            'gastoAds': self.gasto_ads,
            'custoProdutos': self.custo_produtos,
            'custosVariaveis': self.custos_variaveis,
            'lucroLiquido': self.lucro_liquido,
            'pedidos': self.pedidos,
            'ticketMedio': self.ticket_medio,
            'novosClientes': self.novos_clientes,
            'recompra': self.recompra,
            'retencao': self.retencao,
            'cpa': self.cpa,
            'roas': self.roas,
            'margemContribuicao': self.margem_contribuicao,
            'margemAposAquisicao': self.margem_apos_aquisicao,
            'alertas': self.alertas or [],
            'tendencia': self.tendencia or [],
            'distribuicaoGastos': self.distribuicao_gastos or {}
        }


class CpaDailyMetric(Base):
    """
    Métricas diárias agregadas (todos os canais ou por canal específico)
    """
    __tablename__ = "cpa_daily_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, index=True)
    
    # Identificação
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    day_label = Column(String(20))  # Seg, Ter, Qua, etc
    channel_id = Column(String(100))  # Opcional: se for métrica de canal específico
    
    # Métricas de pedidos
    pedidos_pagos = Column(Integer, default=0)
    pedidos_yampi = Column(Integer, default=0)
    pedidos_market = Column(Integer, default=0)
    
    # Tickets médios
    ticket_yampi = Column(Float, default=0.0)
    ticket_market = Column(Float, default=0.0)
    
    # Métricas financeiras
    gasto_ads = Column(Float, default=0.0)
    faturamento = Column(Float, default=0.0)
    
    # Métricas de performance
    roas = Column(Float, default=0.0)
    cpa = Column(Float, default=0.0)
    margem = Column(Float, default=0.0)  # Percentual
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'clienteId': self.cliente_id,
            'date': self.date.isoformat() if self.date else None,
            'dia': self.day_label,
            'channelId': self.channel_id,
            'pedidosPagos': self.pedidos_pagos,
            'pedidosYampi': self.pedidos_yampi,
            'pedidosMarket': self.pedidos_market,
            'ticketYampi': self.ticket_yampi,
            'ticketMarket': self.ticket_market,
            'gastoAds': self.gasto_ads,
            'faturamento': self.faturamento,
            'roas': self.roas,
            'cpa': self.cpa,
            'margem': self.margem
        }


class CpaEvent(Base):
    """
    Eventos em tempo real (novos pedidos, alertas de gastos, etc)
    """
    __tablename__ = "cpa_events"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, index=True)
    
    # Dados do evento
    titulo = Column(String(255), nullable=False)
    origem = Column(String(100), nullable=False)  # Yampi, Facebook Ads, etc
    valor = Column(Float, default=0.0)
    tipo = Column(String(50))  # pedido, ads, alert, etc
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Metadados adicionais
    event_metadata = Column(JSON, default=dict)

    def to_dict(self):
        """Retorna evento formatado para o frontend"""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        diff = now - self.timestamp
        
        # Calcular "há X tempo"
        seconds = int(diff.total_seconds())
        if seconds < 60:
            ha = f'{seconds}s'
        elif seconds < 3600:
            ha = f'{seconds // 60}m'
        elif seconds < 86400:
            ha = f'{seconds // 3600}h'
        else:
            ha = f'{seconds // 86400}d'
        
        return {
            'id': self.id,
            'clienteId': self.cliente_id,
            'titulo': self.titulo,
            'origem': self.origem,
            'valor': self.valor,
            'tipo': self.tipo,
            'ha': ha,
            'timestamp': self.timestamp.isoformat()
        }


class CpaCostsConfig(Base):
    """
    Configurações de custos operacionais (gateway, transporte, impostos, etc)
    """
    __tablename__ = "cpa_costs_config"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, unique=True, index=True)
    
    # Custos em percentual
    gateway = Column(Float, default=2.5)  # % sobre venda
    imposto = Column(Float, default=12.0)  # % sobre venda
    checkout = Column(Float, default=1.8)  # % sobre venda
    
    # Custos fixos por pedido
    transporte = Column(Float, default=18.0)  # R$ por pedido
    picking = Column(Float, default=2.0)  # R$ por pedido
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'clienteId': self.cliente_id,
            'gateway': self.gateway,
            'transporte': self.transporte,
            'picking': self.picking,
            'imposto': self.imposto,
            'checkout': self.checkout
        }


class CpaIntegrationHealth(Base):
    """
    Status de saúde das integrações (última sincronização, erros, etc)
    """
    __tablename__ = "cpa_integration_health"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, index=True)
    
    # Identificação da integração
    integration_id = Column(String(100), nullable=False, index=True)  # yampi, shopify, fbads, etc
    integration_name = Column(String(255), nullable=False)
    
    # Status
    status = Column(String(20), default='ok')  # ok, warning, error
    last_sync = Column(DateTime(timezone=True))
    message = Column(Text)  # Mensagem de erro/alerta
    
    # Metadados
    integration_metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        """Retorna status formatado para o frontend"""
        from datetime import datetime, timezone
        
        last_sync_minutes = 0
        if self.last_sync:
            now = datetime.now(timezone.utc)
            diff = now - self.last_sync
            last_sync_minutes = int(diff.total_seconds() / 60)
        
        return {
            'id': self.integration_id,
            'nome': self.integration_name,
            'status': self.status,
            'lastSyncMinutes': last_sync_minutes,
            'message': self.message
        }


class CpaFunnelStep(Base):
    """
    Etapas do funil de conversão
    """
    __tablename__ = "cpa_funnel_steps"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False, index=True)
    
    # Período de referência
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Etapa do funil
    step_order = Column(Integer, nullable=False)  # 1, 2, 3, 4, 5
    step_label = Column(String(100), nullable=False)  # Landing views, Add to cart, etc
    
    # Métricas
    value = Column(Integer, default=0)  # Quantidade nesta etapa
    target = Column(Integer, default=0)  # Meta para esta etapa
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'clienteId': self.cliente_id,
            'date': self.date.isoformat() if self.date else None,
            'stepOrder': self.step_order,
            'label': self.step_label,
            'value': self.value,
            'target': self.target
        }
