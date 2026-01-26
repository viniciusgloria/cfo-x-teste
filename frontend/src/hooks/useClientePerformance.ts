import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useClientesStore, Cliente } from '../store/clientesStore';

interface IntegracaoInfo {
  key: string;
  categoria: 'erp' | 'marketplace' | 'ads' | 'gateway';
  hasCredentials: boolean;
}

export interface SubmenuDisponivel {
  key: string;
  label: string;
  categoria: 'marketplace' | 'gateway' | 'ads' | 'erp';
}

export const useClientePerformance = () => {
  const { user } = useAuthStore();
  const { clientes, fetchClientes } = useClientesStore();
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // Carregar clientes ao montar
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Definir cliente selecionado automaticamente
  useEffect(() => {
    if (!user) return;

    // Se for cliente, buscar o cliente vinculado a ele
    if (user.role === 'cliente') {
      // Assumindo que o user tem uma propriedade clienteId ou o email/id vincula ao cliente
      const clienteDoUsuario = clientes.find(c => c.contatosPrincipais.emailPrincipal === user.email);
      if (clienteDoUsuario) {
        setClienteSelecionado(clienteDoUsuario);
      }
    } else {
      // Para admin, gestor e colaborador, selecionar primeiro cliente aprovado por padrão
        const primeiroCliente = clientes.find(c => c.status !== 'rascunho');
      if (primeiroCliente && !clienteSelecionado) {
        setClienteSelecionado(primeiroCliente);
      }
    }
  }, [user, clientes, clienteSelecionado]);

  // Mapear integrações configuradas no cliente
  const integracoesDisponiveis = useMemo(() => {
    if (!clienteSelecionado?.omieConfig?.integracoes) return [];

    const integracoes: IntegracaoInfo[] = [];
    const config = clienteSelecionado.omieConfig.integracoes;

    // Verificar ERPs
    if (config.erp) {
      Object.entries(config.erp).forEach(([key, creds]) => {
        const hasData = Object.values(creds).some(v => v && String(v).trim() !== '');
        if (hasData) {
          integracoes.push({ key, categoria: 'erp', hasCredentials: true });
        }
      });
    }

    // Verificar Marketplaces
    if (config.marketplace) {
      Object.entries(config.marketplace).forEach(([key, creds]) => {
        const hasData = Object.values(creds).some(v => v && String(v).trim() !== '');
        if (hasData) {
          integracoes.push({ key, categoria: 'marketplace', hasCredentials: true });
        }
      });
    }

    // Verificar ADS
    if (config.ads) {
      Object.entries(config.ads).forEach(([key, creds]) => {
        const hasData = Object.values(creds).some(v => v && String(v).trim() !== '');
        if (hasData) {
          integracoes.push({ key, categoria: 'ads', hasCredentials: true });
        }
      });
    }

    // Verificar Gateways
    if (config.gateway) {
      Object.entries(config.gateway).forEach(([key, creds]) => {
        const hasData = Object.values(creds).some(v => v && String(v).trim() !== '');
        if (hasData) {
          integracoes.push({ key, categoria: 'gateway', hasCredentials: true });
        }
      });
    }

    return integracoes;
  }, [clienteSelecionado]);

  // Mapear nomes das plataformas
  const plataformaNomes: Record<string, string> = {
    // ERPs
    omie: 'Omie',
    conta_azul: 'Conta Azul',
    bling: 'Bling',
    tiny: 'Tiny',
    // Marketplaces
    mercado_livre: 'Mercado Livre',
    tiktok_shop: 'TikTok Shop',
    shopee: 'Shopee',
    amazon_br: 'Amazon BR',
    magalu: 'Magalu',
    aliexpress: 'AliExpress',
    shein: 'Shein',
    // Gateways
    yampi: 'Yampi',
    cartpanda: 'CartPanda',
    appmax: 'AppMax',
    shopify: 'Shopify',
    mercado_pago: 'Mercado Pago',
    pagarme: 'Pagar.me',
    nuvemshop: 'Nuvemshop',
    paypal: 'PayPal',
    pagseguro: 'PagSeguro',
    // ADS
    google_ads: 'Google Ads',
    meta_ads: 'Meta Ads',
    mercado_livre_ads: 'Mercado Livre Ads',
    tiktok_ads: 'TikTok Ads',
    kwai_ads: 'Kwai Ads',
    amazon_ads: 'Amazon Ads',
    shopee_ads: 'Shopee Ads',
    pinterest_ads: 'Pinterest Ads',
  };

  // Obter submenus disponíveis para Canais de Venda (Marketplace + Gateway)
  const submenusCanaisVenda = useMemo(() => {
    const submenus: SubmenuDisponivel[] = [];
    
    integracoesDisponiveis.forEach(int => {
      if (int.categoria === 'marketplace' || int.categoria === 'gateway') {
        submenus.push({
          key: int.key,
          label: plataformaNomes[int.key] || int.key,
          categoria: int.categoria
        });
      }
    });

    return submenus;
  }, [integracoesDisponiveis]);

  // Obter submenus disponíveis para Publicidade (ADS)
  const submenusPublicidade = useMemo(() => {
    const submenus: SubmenuDisponivel[] = [];
    
    integracoesDisponiveis.forEach(int => {
      if (int.categoria === 'ads') {
        submenus.push({
          key: int.key,
          label: plataformaNomes[int.key] || int.key,
          categoria: int.categoria
        });
      }
    });

    return submenus;
  }, [integracoesDisponiveis]);

  // Obter submenus disponíveis para ERP (futuro)
  const submenusERP = useMemo(() => {
    const submenus: SubmenuDisponivel[] = [];
    
    integracoesDisponiveis.forEach(int => {
      if (int.categoria === 'erp') {
        submenus.push({
          key: int.key,
          label: plataformaNomes[int.key] || int.key,
          categoria: int.categoria
        });
      }
    });

    return submenus;
  }, [integracoesDisponiveis]);

  // Lista de clientes disponíveis (filtrados por status)
  const clientesDisponiveis = useMemo(() => {
     // Para admin/gestor/colaborador: mostrar todos os clientes (exceto rascunhos)
     // Para cliente: mostrar apenas o próprio
     if (user?.role === 'cliente') {
      const clienteDoUsuario = clientes.find(c => c.contatosPrincipais.emailPrincipal === user.email);
      return clienteDoUsuario ? [clienteDoUsuario] : [];
     }
     // Para outros perfis, mostrar todos exceto rascunhos
     return clientes.filter(c => c.status !== 'rascunho');
  }, [clientes]);

  return {
    user,
    clienteSelecionado,
    setClienteSelecionado,
    clientesDisponiveis,
    integracoesDisponiveis,
    submenusCanaisVenda,
    submenusPublicidade,
    submenusERP,
    // Helper para verificar se deve mostrar select
    mostrarSelectCliente: user?.role !== 'cliente',
  };
};
