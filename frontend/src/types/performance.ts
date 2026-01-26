export type CpaChannelType = 'Checkout' | 'Marketplace';

export interface CpaChannelMetrics {
  id: string;
  nome: string;
  tipo: CpaChannelType;
  faturamento: number;
  gastoAds: number;
  pedidos: number;
  ticketMedio: number;
  novosClientes: number;
  recompra: number;
  retencao: number;
  custoProdutos: number;
  custosVariaveis: number;
  lucroLiquido: number;
  cpa: number;
  roas: number;
  margemContribuicao: number;
  alertas: string[];
  tendencia: number[];
}

export interface CpaFunnelStep {
  label: string;
  value: number;
  target: number;
}

export interface CpaDailyMetric {
  dia: string;
  pedidosPagos: number;
  pedidosYampi: number;
  pedidosMarket: number;
  ticketYampi: number;
  ticketMarket: number;
  gastoAds: number;
  faturamento: number;
  roas: number;
  cpa: number;
  margem: number;
}

export interface CpaEvent {
  titulo: string;
  origem: string;
  valor: number;
  ha: string;
}

export interface CpaCostsConfig {
  gateway: number; // percentual
  transporte: number; // valor por pedido
  picking: number; // valor por pedido
  imposto: number; // percentual
  checkout: number; // percentual
}

export type IntegrationStatus = 'ok' | 'warning' | 'error';

export interface CpaIntegrationHealth {
  id: string;
  nome: string;
  status: IntegrationStatus;
  lastSyncMinutes: number;
  message?: string;
}

export interface CpaChannelSnapshot {
  // Dados do canal específico
  canaiId: string;
  canalNome: string;
  canalTipo: CpaChannelType;
  
  // Métricas principais
  faturamento: number;
  gastoAds: number;
  pedidos: number;
  ticketMedio: number;
  
  // Margens
  margemContribuicao: number;
  margemAposAquisicao: number;
  custoProdutos: number;
  custosVariaveis: number;
  lucroLiquido: number;
  
  // Performance
  novosClientes: number;
  recompra: number;
  retencao: number;
  cpa: number;
  roas: number;
  
  // Distribuição de gastos específica do canal
  distribuicaoGastos: {
    marketing: number;
    operacional: number;
    administrativo: number;
    outro: number;
  };
  
  // Dados diários para gráficos
  diarias: CpaDailyMetric[];
  
  // Alertas e status
  alertas: string[];
  tendencia: number[];
}

export interface CpaSnapshot {
  canais: CpaChannelMetrics[];
  funil: CpaFunnelStep[];
  diarias: CpaDailyMetric[];
  eventos: CpaEvent[];
  custos: CpaCostsConfig;
  integracoes: CpaIntegrationHealth[];
}
