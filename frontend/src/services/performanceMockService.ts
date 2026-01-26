import { CpaSnapshot, CpaChannelMetrics, CpaDailyMetric, CpaFunnelStep, CpaEvent, CpaIntegrationHealth, CpaChannelSnapshot } from '../types/performance';

const canais: CpaChannelMetrics[] = [
  {
    id: 'yampi',
    nome: 'Yampi',
    tipo: 'Checkout',
    faturamento: 185000,
    gastoAds: 62000,
    pedidos: 920,
    ticketMedio: 201,
    novosClientes: 180,
    recompra: 140,
    retencao: 32,
    custoProdutos: 68000,
    custosVariaveis: 15500,
    lucroLiquido: 24500,
    cpa: 68,
    roas: 2.98,
    margemContribuicao: 28,
    alertas: ['ROAS 3h caiu 12%', 'Checkout saudavel'],
    tendencia: [62, 75, 68, 82, 79, 91, 88]
  },
  {
    id: 'mercado-livre',
    nome: 'Mercado Livre',
    tipo: 'Marketplace',
    faturamento: 126000,
    gastoAds: 22000,
    pedidos: 610,
    ticketMedio: 206,
    novosClientes: 90,
    recompra: 95,
    retencao: 27,
    custoProdutos: 51000,
    custosVariaveis: 19200,
    lucroLiquido: 18300,
    cpa: 59,
    roas: 5.73,
    margemContribuicao: 31,
    alertas: ['Tarifa marketplace acima da media'],
    tendencia: [48, 52, 49, 55, 60, 63, 61]
  },
  {
    id: 'tiktok-shop',
    nome: 'TikTok Shop',
    tipo: 'Marketplace',
    faturamento: 72000,
    gastoAds: 18000,
    pedidos: 420,
    ticketMedio: 171,
    novosClientes: 110,
    recompra: 60,
    retencao: 18,
    custoProdutos: 28000,
    custosVariaveis: 9100,
    lucroLiquido: 11100,
    cpa: 43,
    roas: 4,
    margemContribuicao: 26,
    alertas: ['Volume abaixo da mediana nas ultimas 3h'],
    tendencia: [33, 41, 39, 44, 47, 45, 51]
  },
  {
    id: 'shopify',
    nome: 'Shopify',
    tipo: 'Checkout',
    faturamento: 54000,
    gastoAds: 14500,
    pedidos: 190,
    ticketMedio: 284,
    novosClientes: 48,
    recompra: 40,
    retencao: 22,
    custoProdutos: 21000,
    custosVariaveis: 6100,
    lucroLiquido: 7200,
    cpa: 76,
    roas: 3.72,
    margemContribuicao: 24,
    alertas: ['Custo de transporte subindo'],
    tendencia: [21, 19, 24, 27, 26, 30, 32]
  }
];

const eventosTempoReal: CpaEvent[] = [
  { titulo: 'Novo pedido pago', origem: 'Yampi', valor: 329, ha: '2m' },
  { titulo: 'Gasto Ads acima da meta/h', origem: 'Facebook Ads', valor: 820, ha: '5m' },
  { titulo: 'Pedido marketplace', origem: 'Mercado Livre', valor: 199, ha: '7m' },
  { titulo: 'ROAS < alvo', origem: 'TikTok Ads', valor: 0, ha: '12m' }
];

const funilMock: CpaFunnelStep[] = [
  { label: 'Landing views', value: 6800, target: 7000 },
  { label: 'Add to cart', value: 1420, target: 1500 },
  { label: 'Initiate checkout', value: 980, target: 1050 },
  { label: 'Payment info', value: 720, target: 800 },
  { label: 'Purchases', value: 610, target: 680 }
];

const diarias: CpaDailyMetric[] = [
  { dia: 'Seg', pedidosPagos: 248, pedidosYampi: 220, pedidosMarket: 28, ticketYampi: 299.8, ticketMarket: 232.1, gastoAds: 31850, faturamento: 73500, roas: 2.31, cpa: 51.9, margem: 27.3 },
  { dia: 'Ter', pedidosPagos: 268, pedidosYampi: 236, pedidosMarket: 32, ticketYampi: 307.8, ticketMarket: 217.1, gastoAds: 30110, faturamento: 76890, roas: 2.55, cpa: 48.6, margem: 28.4 },
  { dia: 'Qua', pedidosPagos: 279, pedidosYampi: 246, pedidosMarket: 33, ticketYampi: 309.0, ticketMarket: 204.2, gastoAds: 28950, faturamento: 78970, roas: 2.73, cpa: 46.6, margem: 29.1 },
  { dia: 'Qui', pedidosPagos: 343, pedidosYampi: 305, pedidosMarket: 38, ticketYampi: 307.0, ticketMarket: 214.6, gastoAds: 33210, faturamento: 96480, roas: 2.90, cpa: 44.0, margem: 30.2 },
  { dia: 'Sex', pedidosPagos: 335, pedidosYampi: 281, pedidosMarket: 54, ticketYampi: 306.3, ticketMarket: 208.4, gastoAds: 35980, faturamento: 97240, roas: 2.70, cpa: 46.6, margem: 28.6 },
  { dia: 'Sab', pedidosPagos: 324, pedidosYampi: 280, pedidosMarket: 44, ticketYampi: 336.1, ticketMarket: 216.6, gastoAds: 34120, faturamento: 101380, roas: 2.97, cpa: 45.4, margem: 30.5 },
  { dia: 'Dom', pedidosPagos: 297, pedidosYampi: 260, pedidosMarket: 37, ticketYampi: 331.8, ticketMarket: 267.4, gastoAds: 32540, faturamento: 100950, roas: 3.10, cpa: 42.9, margem: 31.1 }
];

const integracoes: CpaIntegrationHealth[] = [
  { id: 'yampi', nome: 'Yampi', status: 'ok', lastSyncMinutes: 6 },
  { id: 'shopify', nome: 'Shopify', status: 'warning', lastSyncMinutes: 28, message: 'Webhook atrasado' },
  { id: 'fbads', nome: 'Facebook Ads', status: 'ok', lastSyncMinutes: 4 },
  { id: 'gads', nome: 'Google Ads', status: 'ok', lastSyncMinutes: 5 },
  { id: 'mercadolivre', nome: 'Mercado Livre', status: 'warning', lastSyncMinutes: 32, message: 'Rate limit, reprocessando' },
  { id: 'tiktok-shop', nome: 'TikTok Shop', status: 'ok', lastSyncMinutes: 9 }
];

const custos = {
  gateway: 2.5,
  transporte: 18,
  picking: 2,
  imposto: 12,
  checkout: 1.8
};

export async function fetchCpaSnapshot(): Promise<CpaSnapshot> {
  return {
    canais,
    funil: funilMock,
    diarias,
    eventos: eventosTempoReal,
    custos,
    integracoes
  };
}

export async function fetchCpaChannelSnapshot(channelId: string): Promise<CpaChannelSnapshot> {
  // Dados base para cada canal
  const channelData: Record<string, CpaChannelSnapshot> = {
    yampi: {
      canaiId: 'yampi',
      canalNome: 'Yampi',
      canalTipo: 'Checkout',
      faturamento: 185000,
      gastoAds: 62000,
      pedidos: 920,
      ticketMedio: 201,
      margemContribuicao: 28,
      margemAposAquisicao: 18,
      custoProdutos: 68000,
      custosVariaveis: 15500,
      lucroLiquido: 24500,
      novosClientes: 180,
      recompra: 140,
      retencao: 32,
      cpa: 68,
      roas: 2.98,
      distribuicaoGastos: {
        marketing: 42000,
        operacional: 12500,
        administrativo: 5000,
        outro: 2500
      },
      diarias: [
        { dia: 'Seg', pedidosPagos: 130, pedidosYampi: 130, pedidosMarket: 0, ticketYampi: 299.8, ticketMarket: 0, gastoAds: 21000, faturamento: 39000, roas: 1.86, cpa: 162, margem: 25.3 },
        { dia: 'Ter', pedidosPagos: 148, pedidosYampi: 148, pedidosMarket: 0, ticketYampi: 307.8, ticketMarket: 0, gastoAds: 19500, faturamento: 45600, roas: 2.34, cpa: 132, margem: 27.4 },
        { dia: 'Qua', pedidosPagos: 155, pedidosYampi: 155, pedidosMarket: 0, ticketYampi: 309.0, ticketMarket: 0, gastoAds: 18700, faturamento: 48000, roas: 2.57, cpa: 121, margem: 28.1 },
        { dia: 'Qui', pedidosPagos: 178, pedidosYampi: 178, pedidosMarket: 0, ticketYampi: 307.0, ticketMarket: 0, gastoAds: 20100, faturamento: 54700, roas: 2.72, cpa: 113, margem: 29.2 },
        { dia: 'Sex', pedidosPagos: 185, pedidosYampi: 185, pedidosMarket: 0, ticketYampi: 306.3, ticketMarket: 0, gastoAds: 21500, faturamento: 56700, roas: 2.64, cpa: 116, margem: 27.6 },
        { dia: 'Sab', pedidosPagos: 166, pedidosYampi: 166, pedidosMarket: 0, ticketYampi: 336.1, ticketMarket: 0, gastoAds: 19200, faturamento: 55800, roas: 2.91, cpa: 116, margem: 29.5 },
        { dia: 'Dom', pedidosPagos: 158, pedidosYampi: 158, pedidosMarket: 0, ticketYampi: 331.8, ticketMarket: 0, gastoAds: 18800, faturamento: 52400, roas: 2.78, cpa: 119, margem: 30.1 }
      ],
      alertas: ['ROAS 3h caiu 12%', 'Checkout saudavel'],
      tendencia: [62, 75, 68, 82, 79, 91, 88]
    },
    'mercado-livre': {
      canaiId: 'mercado-livre',
      canalNome: 'Mercado Livre',
      canalTipo: 'Marketplace',
      faturamento: 126000,
      gastoAds: 22000,
      pedidos: 610,
      ticketMedio: 206,
      margemContribuicao: 31,
      margemAposAquisicao: 22,
      custoProdutos: 51000,
      custosVariaveis: 19200,
      lucroLiquido: 18300,
      novosClientes: 90,
      recompra: 95,
      retencao: 27,
      cpa: 59,
      roas: 5.73,
      distribuicaoGastos: {
        marketing: 12000,
        operacional: 7000,
        administrativo: 2500,
        outro: 500
      },
      diarias: [
        { dia: 'Seg', pedidosPagos: 87, pedidosYampi: 0, pedidosMarket: 87, ticketYampi: 0, ticketMarket: 232.1, gastoAds: 3150, faturamento: 20000, roas: 6.35, cpa: 36.2, margem: 30.3 },
        { dia: 'Ter', pedidosPagos: 95, pedidosYampi: 0, pedidosMarket: 95, ticketYampi: 0, ticketMarket: 217.1, gastoAds: 3100, faturamento: 20600, roas: 6.64, cpa: 32.6, margem: 31.4 },
        { dia: 'Qua', pedidosPagos: 102, pedidosYampi: 0, pedidosMarket: 102, ticketYampi: 0, ticketMarket: 204.2, gastoAds: 3200, faturamento: 20800, roas: 6.5, cpa: 31.4, marlgem: 32.1 },
        { dia: 'Qui', pedidosPagos: 115, pedidosYampi: 0, pedidosMarket: 115, ticketYampi: 0, ticketMarket: 214.6, gastoAds: 3150, faturamento: 24700, roas: 7.84, cpa: 27.4, margem: 33.2 },
        { dia: 'Sex', pedidosPagos: 108, pedidosYampi: 0, pedidosMarket: 108, ticketYampi: 0, ticketMarket: 208.4, gastoAds: 3100, faturamento: 22500, roas: 7.26, cpa: 28.7, margem: 32.6 },
        { dia: 'Sab', pedidosPagos: 112, pedidosYampi: 0, pedidosMarket: 112, ticketYampi: 0, ticketMarket: 216.6, gastoAds: 3200, faturamento: 24300, roas: 7.59, cpa: 28.6, margem: 33.5 },
        { dia: 'Dom', pedidosPagos: 91, pedidosYampi: 0, pedidosMarket: 91, ticketYampi: 0, ticketMarket: 267.4, gastoAds: 2100, faturamento: 24300, roas: 11.57, cpa: 23.1, margem: 34.1 }
      ],
      alertas: ['Tarifa marketplace acima da media'],
      tendencia: [48, 52, 49, 55, 60, 63, 61]
    },
    'tiktok-shop': {
      canaiId: 'tiktok-shop',
      canalNome: 'TikTok Shop',
      canalTipo: 'Marketplace',
      faturamento: 72000,
      gastoAds: 18000,
      pedidos: 420,
      ticketMedio: 171,
      margemContribuicao: 26,
      margemAposAquisicao: 15,
      custoProdutos: 28000,
      custosVariaveis: 9100,
      lucroLiquido: 11100,
      novosClientes: 110,
      recompra: 60,
      retencao: 18,
      cpa: 43,
      roas: 4,
      distribuicaoGastos: {
        marketing: 10500,
        operacional: 5000,
        administrativo: 1800,
        outro: 700
      },
      diarias: [
        { dia: 'Seg', pedidosPagos: 55, pedidosYampi: 0, pedidosMarket: 55, ticketYampi: 0, ticketMarket: 210, gastoAds: 2500, faturamento: 11550, roas: 4.62, cpa: 45.5, margem: 24.3 },
        { dia: 'Ter', pedidosPagos: 62, pedidosYampi: 0, pedidosMarket: 62, ticketYampi: 0, ticketMarket: 195, gastoAds: 2800, faturamento: 12090, roas: 4.32, cpa: 45.2, margem: 25.4 },
        { dia: 'Qua', pedidosPagos: 58, pedidosYampi: 0, pedidosMarket: 58, ticketYampi: 0, ticketMarket: 188, gastoAds: 2600, faturamento: 10900, roas: 4.19, cpa: 44.8, margem: 26.1 },
        { dia: 'Qui', pedidosPagos: 68, pedidosYampi: 0, pedidosMarket: 68, ticketYampi: 0, ticketMarket: 192, gastoAds: 2900, faturamento: 13100, roas: 4.52, cpa: 42.6, margem: 27.2 },
        { dia: 'Sex', pedidosPagos: 72, pedidosYampi: 0, pedidosMarket: 72, ticketYampi: 0, ticketMarket: 175, gastoAds: 3100, faturamento: 12600, roas: 4.06, cpa: 43.1, margem: 26.6 },
        { dia: 'Sab', pedidosPagos: 76, pedidosYampi: 0, pedidosMarket: 76, ticketYampi: 0, ticketMarket: 182, gastoAds: 2800, faturamento: 13830, roas: 4.94, cpa: 36.8, margem: 27.5 },
        { dia: 'Dom', pedidosPagos: 79, pedidosYampi: 0, pedidosMarket: 79, ticketYampi: 0, ticketMarket: 170, gastoAds: 2900, faturamento: 13430, roas: 4.63, cpa: 36.7, margem: 28.1 }
      ],
      alertas: ['Volume abaixo da mediana nas ultimas 3h'],
      tendencia: [33, 41, 39, 44, 47, 45, 51]
    },
    shopify: {
      canaiId: 'shopify',
      canalNome: 'Shopify',
      canalTipo: 'Checkout',
      faturamento: 54000,
      gastoAds: 14500,
      pedidos: 190,
      ticketMedio: 284,
      margemContribuicao: 24,
      margemAposAquisicao: 12,
      custoProdutos: 21000,
      custosVariaveis: 6100,
      lucroLiquido: 7200,
      novosClientes: 48,
      recompra: 40,
      retencao: 22,
      cpa: 76,
      roas: 3.72,
      distribuicaoGastos: {
        marketing: 8000,
        operacional: 4200,
        administrativo: 1800,
        outro: 500
      },
      diarias: [
        { dia: 'Seg', pedidosPagos: 26, pedidosYampi: 0, pedidosMarket: 26, ticketYampi: 0, ticketMarket: 270, gastoAds: 2000, faturamento: 7020, roas: 3.51, cpa: 77, margem: 22.3 },
        { dia: 'Ter', pedidosPagos: 25, pedidosYampi: 0, pedidosMarket: 25, ticketYampi: 0, ticketMarket: 280, gastoAds: 2050, faturamento: 7000, roas: 3.41, cpa: 82, margem: 23.4 },
        { dia: 'Qua', pedidosPagos: 27, pedidosYampi: 0, pedidosMarket: 27, ticketYampi: 0, ticketMarket: 275, gastoAds: 2100, faturamento: 7425, roas: 3.53, cpa: 78, margem: 24.1 },
        { dia: 'Qui', pedidosPagos: 29, pedidosYampi: 0, pedidosMarket: 29, ticketYampi: 0, ticketMarket: 288, gastoAds: 2150, faturamento: 8352, roas: 3.88, cpa: 74, margem: 25.2 },
        { dia: 'Sex', pedidosPagos: 32, pedidosYampi: 0, pedidosMarket: 32, ticketYampi: 0, ticketMarket: 282, gastoAds: 2250, faturamento: 9024, roas: 4.01, cpa: 70, margem: 26.6 },
        { dia: 'Sab', pedidosPagos: 28, pedidosYampi: 0, pedidosMarket: 28, ticketYampi: 0, ticketMarket: 290, gastoAds: 2100, faturamento: 8120, roas: 3.86, cpa: 75, margem: 25.5 },
        { dia: 'Dom', pedidosPagos: 23, pedidosYampi: 0, pedidosMarket: 23, ticketYampi: 0, ticketMarket: 295, gastoAds: 1855, faturamento: 6785, roas: 3.66, cpa: 81, margem: 26.1 }
      ],
      alertas: ['Custo de transporte subindo'],
      tendencia: [21, 19, 24, 27, 26, 30, 32]
    }
  };

  return channelData[channelId] || channelData.yampi;
}

export async function sendWebhookAlert(payload: Record<string, unknown>): Promise<void> {
  console.log('CPA webhook stub', payload);
}
