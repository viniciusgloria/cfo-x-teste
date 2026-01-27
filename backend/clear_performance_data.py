"""
Script para limpar dados de Performance/CPA do banco de dados
ATENÇÃO: Este script NÃO deleta o usuário administrador (admin@cfohub.com)
Usado apenas em ambiente de desenvolvimento
"""
import sys
import os
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
from app.models.user import User


def clear_performance_data(cliente_id: int = None, force: bool = False):
    """
    Limpa todos os dados de performance do banco
    
    Args:
        cliente_id: Se fornecido, deleta apenas dados deste cliente. 
                   Se None, deleta de todos os clientes.
        force: Se True, não pede confirmação
    """
    db = SessionLocal()
    
    try:
        # Verificar se existe usuário admin
        admin_user = db.query(User).filter(User.email == "admin@cfohub.com").first()
        
        if not admin_user:
            print("\n⚠️  ATENÇÃO: Usuário admin não encontrado!")
            print("   Execute 'python init_db.py' primeiro para criar o usuário admin.")
        
        # Confirmação
        if not force:
            print("\n" + "=" * 60)
            print("⚠️  ATENÇÃO: OPERAÇÃO DESTRUTIVA")
            print("=" * 60)
            
            if cliente_id:
                print(f"\nEsta operação irá DELETAR TODOS os dados de Performance")
                print(f"do cliente_id={cliente_id}:")
            else:
                print("\nEsta operação irá DELETAR TODOS os dados de Performance")
                print("de TODOS OS CLIENTES:")
            
            print("\n  • Métricas de canais")
            print("  • Métricas diárias")
            print("  • Eventos em tempo real")
            print("  • Configurações de custos")
            print("  • Status de integrações")
            print("  • Funil de conversão")
            
            print("\n✅  O usuário admin@cfohub.com será PRESERVADO")
            print("✅  Outros usuários e dados do sistema serão PRESERVADOS")
            
            # Detectar se está em ambiente não-interativo (Docker, CI/CD, etc)
            try:
                confirmacao = input("\n⚠️ Deseja continuar? Digite 'SIM' para confirmar: ")
            except EOFError:
                print("\n❌ ERRO: Ambiente não-interativo detectado!")
                print("\n💡 Dica: Use a flag --force para executar sem confirmação:")
                print("   docker exec cfohub-backend python clear_performance_data.py --force")
                return
            
            if confirmacao != "SIM":
                print("\n❌ Operação cancelada pelo usuário.")
                return
        
        print("\n⚠️  Iniciando limpeza de dados de performance...")
        
        # Contadores
        total_deletado = 0
        
        # ===== 1. EVENTOS =====
        print("\n⚠️ Deletando eventos...")
        if cliente_id:
            eventos_deletados = db.query(CpaEvent).filter(
                CpaEvent.cliente_id == cliente_id
            ).delete()
        else:
            eventos_deletados = db.query(CpaEvent).delete()
        
        print(f"  ✅  {eventos_deletados} eventos deletados")
        total_deletado += eventos_deletados
        
        # ===== 2. FUNIL =====
        print("\n⚠️ Deletando etapas do funil...")
        if cliente_id:
            funil_deletado = db.query(CpaFunnelStep).filter(
                CpaFunnelStep.cliente_id == cliente_id
            ).delete()
        else:
            funil_deletado = db.query(CpaFunnelStep).delete()
        
        print(f"  ✅  {funil_deletado} etapas deletadas")
        total_deletado += funil_deletado
        
        # ===== 3. MÉTRICAS DIÁRIAS =====
        print("\n⚠️ Deletando métricas diárias...")
        if cliente_id:
            diarias_deletadas = db.query(CpaDailyMetric).filter(
                CpaDailyMetric.cliente_id == cliente_id
            ).delete()
        else:
            diarias_deletadas = db.query(CpaDailyMetric).delete()
        
        print(f"  ✅  {diarias_deletadas} métricas diárias deletadas")
        total_deletado += diarias_deletadas
        
        # ===== 4. MÉTRICAS DE CANAIS =====
        print("\n⚠️ Deletando métricas de canais...")
        if cliente_id:
            canais_deletados = db.query(CpaChannelMetrics).filter(
                CpaChannelMetrics.cliente_id == cliente_id
            ).delete()
        else:
            canais_deletados = db.query(CpaChannelMetrics).delete()
        
        print(f"  ✅  {canais_deletados} métricas de canais deletadas")
        total_deletado += canais_deletados
        
        # ===== 5. STATUS DE INTEGRAÇÕES =====
        print("\n⚠️ Deletando status de integrações...")
        if cliente_id:
            integracoes_deletadas = db.query(CpaIntegrationHealth).filter(
                CpaIntegrationHealth.cliente_id == cliente_id
            ).delete()
        else:
            integracoes_deletadas = db.query(CpaIntegrationHealth).delete()
        
        print(f"  ✅  {integracoes_deletadas} integrações deletadas")
        total_deletado += integracoes_deletadas
        
        # ===== 6. CONFIGURAÇÕES DE CUSTOS =====
        print("\n⚠️ Deletando configurações de custos...")
        if cliente_id:
            custos_deletados = db.query(CpaCostsConfig).filter(
                CpaCostsConfig.cliente_id == cliente_id
            ).delete()
        else:
            custos_deletados = db.query(CpaCostsConfig).delete()
        
        print(f"  ✅  {custos_deletados} configurações deletadas")
        total_deletado += custos_deletados
        
        # Commit
        db.commit()
        
        print("\n" + "=" * 60)
        print("✅  LIMPEZA CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        print(f"\n⚠️  Total de registros deletados: {total_deletado}")
        
        if admin_user:
            print("\n✅  Usuário admin preservado:")
            print(f"   Email: {admin_user.email}")
            print(f"   Nome: {admin_user.nome}")
        
        print("\n 💡 Dica: Execute 'python seed_performance_data.py' para popular novamente")
        
    except Exception as e:
        print(f"\n❌ ERRO ao limpar dados: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Limpa dados de Performance do banco (preserva usuário admin)'
    )
    parser.add_argument(
        '--cliente-id',
        type=int,
        default=None,
        help='ID do cliente para deletar dados. Se omitido, deleta de todos os clientes.'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Força execução sem pedir confirmação (CUIDADO!)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("⚠️  CLEAR - Dados de Performance/CPA")
    print("=" * 60)
    
    clear_performance_data(cliente_id=args.cliente_id, force=args.force)
