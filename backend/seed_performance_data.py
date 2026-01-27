"""
Script para popular o banco de dados com dados de teste de Performance/CPA
Usado apenas em ambiente de desenvolvimento
"""
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Adiciona o diretorio pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.performance import (
    CpaChannelMetrics,
    CpaDailyMetric,
    CpaEvent,
    CpaCostsConfig,
    CpaIntegrationHealth,
    CpaFunnelStep
)


def seed_performance_data(cliente_id: int = 1):
    """
    Popula o banco com dados de teste de performance
    
    Args:
        cliente_id: ID do cliente para vincular os dados (padrão: 1)
    """
    db = SessionLocal()
    
    try:
        print(f"\n ➔ Iniciando seed de dados de performance para cliente_id={cliente_id}...")
        
        # Data base (hoje)
        hoje = datetime.now()
        
        # ===== 1. CONFIGURAÇÃO DE CUSTOS =====
        print("\n  ❗  Criando configuração de custos...")
        
        # Verifica se já existe
        custos_existente = db.query(CpaCostsConfig).filter(
            CpaCostsConfig.cliente_id == cliente_id
        ).first()
        
        if custos_existente:
            print("  ⚠️  Configuração de custos já existe, pulando...")
        else:
            custos = CpaCostsConfig(
                cliente_id=cliente_id,
                gateway=2.5,
                transporte=18.0,
                picking=2.0,
                imposto=12.0,
                checkout=1.8
            )
            db.add(custos)
            print("  ✅  Configuração de custos criada")
        
        # ===== 2. MÉTRICAS DE CANAIS =====
        print("\n  ❗  Criando métricas de canais...")
        
        canais_data = [
            {
                'channel_id': 'yampi',
                'channel_name': 'Yampi',
                'channel_type': 'Checkout',
                'faturamento': 185000,
                'gasto_ads': 62000,
                'pedidos': 920,
                'ticket_medio': 201,
                'novos_clientes': 180,
                'recompra': 140,
                'retencao': 32,
                'custo_produtos': 68000,
                'custos_variaveis': 15500,
                'lucro_liquido': 24500,
                'cpa': 68,
                'roas': 2.98,
                'margem_contribuicao': 28,
                'margem_apos_aquisicao': 18,
                'alertas': ['ROAS 3h caiu 12%', 'Checkout saudavel'],
                'tendencia': [62, 75, 68, 82, 79, 91, 88],
                'distribuicao_gastos': {
                    'marketing': 42000,
                    'operacional': 12500,
                    'administrativo': 5000,
                    'outro': 2500
                }
            },
            {
                'channel_id': 'mercado-livre',
                'channel_name': 'Mercado Livre',
                'channel_type': 'Marketplace',
                'faturamento': 126000,
                'gasto_ads': 22000,
                'pedidos': 610,
                'ticket_medio': 206,
                'novos_clientes': 90,
                'recompra': 95,
                'retencao': 27,
                'custo_produtos': 51000,
                'custos_variaveis': 19200,
                'lucro_liquido': 18300,
                'cpa': 59,
                'roas': 5.73,
                'margem_contribuicao': 31,
                'margem_apos_aquisicao': 22,
                'alertas': ['Tarifa marketplace acima da media'],
                'tendencia': [48, 52, 49, 55, 60, 63, 61],
                'distribuicao_gastos': {
                    'marketing': 12000,
                    'operacional': 7000,
                    'administrativo': 2500,
                    'outro': 500
                }
            },
            {
                'channel_id': 'tiktok-shop',
                'channel_name': 'TikTok Shop',
                'channel_type': 'Marketplace',
                'faturamento': 72000,
                'gasto_ads': 18000,
                'pedidos': 420,
                'ticket_medio': 171,
                'novos_clientes': 110,
                'recompra': 60,
                'retencao': 18,
                'custo_produtos': 28000,
                'custos_variaveis': 9100,
                'lucro_liquido': 11100,
                'cpa': 43,
                'roas': 4.0,
                'margem_contribuicao': 26,
                'margem_apos_aquisicao': 15,
                'alertas': ['Volume abaixo da mediana nas ultimas 3h'],
                'tendencia': [33, 41, 39, 44, 47, 45, 51],
                'distribuicao_gastos': {
                    'marketing': 10500,
                    'operacional': 5000,
                    'administrativo': 1800,
                    'outro': 700
                }
            },
            {
                'channel_id': 'shopify',
                'channel_name': 'Shopify',
                'channel_type': 'Checkout',
                'faturamento': 54000,
                'gasto_ads': 14500,
                'pedidos': 190,
                'ticket_medio': 284,
                'novos_clientes': 48,
                'recompra': 40,
                'retencao': 22,
                'custo_produtos': 21000,
                'custos_variaveis': 6100,
                'lucro_liquido': 7200,
                'cpa': 76,
                'roas': 3.72,
                'margem_contribuicao': 24,
                'margem_apos_aquisicao': 12,
                'alertas': ['Custo de transporte subindo'],
                'tendencia': [21, 19, 24, 27, 26, 30, 32],
                'distribuicao_gastos': {
                    'marketing': 8000,
                    'operacional': 4200,
                    'administrativo': 1800,
                    'outro': 500
                }
            }
        ]
        
        for canal_data in canais_data:
            # Verifica se já existe
            canal_existente = db.query(CpaChannelMetrics).filter(
                CpaChannelMetrics.cliente_id == cliente_id,
                CpaChannelMetrics.channel_id == canal_data['channel_id'],
                CpaChannelMetrics.date == hoje.date()
            ).first()
            
            if canal_existente:
                print(f"  ⚠️  Canal {canal_data['channel_name']} já existe para hoje, pulando...")
                continue
            
            canal = CpaChannelMetrics(
                cliente_id=cliente_id,
                date=hoje.date(),
                period_type='daily',
                **canal_data
            )
            db.add(canal)
            print(f"  ✅  Canal criado: {canal_data['channel_name']}")
        
        # ===== 3. MÉTRICAS DIÁRIAS (últimos 7 dias) =====
        print("\n  ❗  Criando métricas diárias...")
        
        dias_semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
        metricas_diarias = [
            {'pedidos_pagos': 248, 'pedidos_yampi': 220, 'pedidos_market': 28, 'ticket_yampi': 299.8, 'ticket_market': 232.1, 'gasto_ads': 31850, 'faturamento': 73500, 'roas': 2.31, 'cpa': 51.9, 'margem': 27.3},
            {'pedidos_pagos': 268, 'pedidos_yampi': 236, 'pedidos_market': 32, 'ticket_yampi': 307.8, 'ticket_market': 217.1, 'gasto_ads': 30110, 'faturamento': 76890, 'roas': 2.55, 'cpa': 48.6, 'margem': 28.4},
            {'pedidos_pagos': 279, 'pedidos_yampi': 246, 'pedidos_market': 33, 'ticket_yampi': 309.0, 'ticket_market': 204.2, 'gasto_ads': 28950, 'faturamento': 78970, 'roas': 2.73, 'cpa': 46.6, 'margem': 29.1},
            {'pedidos_pagos': 343, 'pedidos_yampi': 305, 'pedidos_market': 38, 'ticket_yampi': 307.0, 'ticket_market': 214.6, 'gasto_ads': 33210, 'faturamento': 96480, 'roas': 2.90, 'cpa': 44.0, 'margem': 30.2},
            {'pedidos_pagos': 335, 'pedidos_yampi': 281, 'pedidos_market': 54, 'ticket_yampi': 306.3, 'ticket_market': 208.4, 'gasto_ads': 35980, 'faturamento': 97240, 'roas': 2.70, 'cpa': 46.6, 'margem': 28.6},
            {'pedidos_pagos': 324, 'pedidos_yampi': 280, 'pedidos_market': 44, 'ticket_yampi': 336.1, 'ticket_market': 216.6, 'gasto_ads': 34120, 'faturamento': 101380, 'roas': 2.97, 'cpa': 45.4, 'margem': 30.5},
            {'pedidos_pagos': 297, 'pedidos_yampi': 260, 'pedidos_market': 37, 'ticket_yampi': 331.8, 'ticket_market': 267.4, 'gasto_ads': 32540, 'faturamento': 100950, 'roas': 3.10, 'cpa': 42.9, 'margem': 31.1}
        ]
        
        for i, metrica_data in enumerate(metricas_diarias):
            dia_data = hoje - timedelta(days=6-i)
            dia_label = dias_semana[dia_data.weekday()]
            
            # Verifica se já existe
            metrica_existente = db.query(CpaDailyMetric).filter(
                CpaDailyMetric.cliente_id == cliente_id,
                CpaDailyMetric.date == dia_data.date()
            ).first()
            
            if metrica_existente:
                print(f"  ⚠️  Métrica diária para {dia_label} já existe, pulando...")
                continue
            
            metrica = CpaDailyMetric(
                cliente_id=cliente_id,
                date=dia_data.date(),
                day_label=dia_label,
                channel_id=None,  # Métrica agregada de todos os canais
                **metrica_data
            )
            db.add(metrica)
            print(f"  ✅  Métrica criada: {dia_label} ({dia_data.date()})")
        
        # ===== 4. FUNIL DE CONVERSÃO =====
        print("\n  ❗  Criando funil de conversão...")
        
        funil_steps = [
            {'step_order': 1, 'step_label': 'Landing views', 'value': 6800, 'target': 7000},
            {'step_order': 2, 'step_label': 'Add to cart', 'value': 1420, 'target': 1500},
            {'step_order': 3, 'step_label': 'Initiate checkout', 'value': 980, 'target': 1050},
            {'step_order': 4, 'step_label': 'Payment info', 'value': 720, 'target': 800},
            {'step_order': 5, 'step_label': 'Purchases', 'value': 610, 'target': 680}
        ]
        
        for step_data in funil_steps:
            # Verifica se já existe
            step_existente = db.query(CpaFunnelStep).filter(
                CpaFunnelStep.cliente_id == cliente_id,
                CpaFunnelStep.date == hoje.date(),
                CpaFunnelStep.step_order == step_data['step_order']
            ).first()
            
            if step_existente:
                print(f"  ⚠️  Step {step_data['step_label']} já existe, pulando...")
                continue
            
            step = CpaFunnelStep(
                cliente_id=cliente_id,
                date=hoje.date(),
                **step_data
            )
            db.add(step)
            print(f"  ✅  Step criado: {step_data['step_label']}")
        
        # ===== 5. EVENTOS EM TEMPO REAL =====
        print("\n  ❗  Criando eventos em tempo real...")
        
        eventos_data = [
            {'titulo': 'Novo pedido pago', 'origem': 'Yampi', 'valor': 329, 'tipo': 'pedido'},
            {'titulo': 'Gasto Ads acima da meta/h', 'origem': 'Facebook Ads', 'valor': 820, 'tipo': 'alerta'},
            {'titulo': 'Pedido marketplace', 'origem': 'Mercado Livre', 'valor': 199, 'tipo': 'pedido'},
            {'titulo': 'ROAS < alvo', 'origem': 'TikTok Ads', 'valor': 0, 'tipo': 'alerta'},
            {'titulo': 'Checkout iniciado', 'origem': 'Shopify', 'valor': 450, 'tipo': 'conversao'},
            {'titulo': 'Meta diária atingida', 'origem': 'Sistema', 'valor': 0, 'tipo': 'notificacao'}
        ]
        
        for i, evento_data in enumerate(eventos_data):
            # Eventos com timestamps recentes (últimos 30 minutos)
            timestamp = hoje - timedelta(minutes=(30 - i * 5))
            
            evento = CpaEvent(
                cliente_id=cliente_id,
                timestamp=timestamp,
                **evento_data
            )
            db.add(evento)
            print(f"  ✅  Evento criado: {evento_data['titulo']}")
        
        # ===== 6. STATUS DE INTEGRAÇÕES =====
        print("\n  ❗  Criando status de integrações...")
        
        integracoes_data = [
            {'integration_id': 'yampi', 'integration_name': 'Yampi', 'status': 'ok', 'message': None},
            {'integration_id': 'shopify', 'integration_name': 'Shopify', 'status': 'warning', 'message': 'Webhook atrasado'},
            {'integration_id': 'fbads', 'integration_name': 'Facebook Ads', 'status': 'ok', 'message': None},
            {'integration_id': 'gads', 'integration_name': 'Google Ads', 'status': 'ok', 'message': None},
            {'integration_id': 'mercadolivre', 'integration_name': 'Mercado Livre', 'status': 'warning', 'message': 'Rate limit, reprocessando'},
            {'integration_id': 'tiktok-shop', 'integration_name': 'TikTok Shop', 'status': 'ok', 'message': None}
        ]
        
        for integ_data in integracoes_data:
            # Verifica se já existe
            integ_existente = db.query(CpaIntegrationHealth).filter(
                CpaIntegrationHealth.cliente_id == cliente_id,
                CpaIntegrationHealth.integration_id == integ_data['integration_id']
            ).first()
            
            if integ_existente:
                # Atualiza se já existe
                integ_existente.integration_name = integ_data['integration_name']
                integ_existente.status = integ_data['status']
                integ_existente.message = integ_data['message']
                integ_existente.last_sync = hoje
                print(f"  ♻️ Integração atualizada: {integ_data['integration_name']}")
            else:
                # Cria nova
                integ = CpaIntegrationHealth(
                    cliente_id=cliente_id,
                    last_sync=hoje,
                    **integ_data
                )
                db.add(integ)
                print(f"  ✅  Integração criada: {integ_data['integration_name']}")
        
        # Commit final
        db.commit()
        
        print("\n")
        print("  ✅  SEED CONCLUÍDO COM SUCESSO!")
        print("-" * 60)
        print(f"\n Dados criados para cliente_id={cliente_id}")
        print("\n Resumo:")
        print(f"  • 4 canais de vendas")
        print(f"  • 7 dias de métricas diárias")
        print(f"  • 5 etapas do funil de conversão")
        print(f"  • Eventos em tempo real")
        print(f"  • 6 integrações configuradas")
        print(f"  • 1 configuração de custos")
        print("\n Acesse o dashboard de Performance para visualizar os dados!")
        
    except Exception as e:
        print(f"\n❌ ERRO ao popular dados: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Popula o banco com dados de teste de Performance')
    parser.add_argument(
        '--cliente-id',
        type=int,
        default=1,
        help='ID do cliente para vincular os dados (padrão: 1)'
    )
    
    args = parser.parse_args()
    
    print(" ➔ SEED - Dados de Performance/CPA")
    print("-" * 60)
    
    seed_performance_data(cliente_id=args.cliente_id)

