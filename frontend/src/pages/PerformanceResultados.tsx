import { useEffect, useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Megaphone,
  Activity,
  TrendingUp,
  DollarSign,
  Zap,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Bell,
  BarChart3,
  Crosshair,
  Info,
  ShoppingCart,
  Users
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageBanner } from '../components/ui/PageBanner';
import { Tooltip } from '../components/ui/Tooltip';
import { PerformanceChannelView } from '../components/PerformanceChannelView';
import { CpaSnapshot, CpaChannelSnapshot, CpaCostsConfig } from '../types/performance';
import { useClientePerformance } from '../hooks/useClientePerformance';
import { performanceService } from '../services/performanceService';

type VisaoPrincipal = 'geral' | 'canais' | 'publicidade' | 'custos' | 'margens';
type WindowRange = 'today' | 'yesterday' | '7d' | 'custom';

const currency = (value?: number) => {
  const safe = Number.isFinite(value as number) ? (value as number) : 0;
  return safe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

const percent = (value: number) => `${value.toFixed(1)}%`;

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

// Componente de Skeleton para Loading
const SkeletonCard = () => (
  <Card className="p-6 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
      <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-1"></div>
    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-48"></div>
  </Card>
);

// Helper para formatar tempo decorrido
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins === 0) return 'agora mesmo';
  if (diffMins === 1) return '1 minuto atrás';
  if (diffMins < 60) return `${diffMins}m atrás`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1h atrás';
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return `${Math.floor(diffHours / 24)}d atrás`;
};

// Componente para mostrar quando dados estão vazios
const EmptyDataState = ({ message = 'Sem dados disponíveis para este período' }: { message?: string }) => (
  <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/30">
    <div className="text-center">
      <AlertCircle size={48} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
      <p className="text-slate-600 dark:text-slate-300 font-medium">{message}</p>
    </div>
  </div>
);

const fadeClass = 'transition-opacity duration-300 ease-out';

// Helper para gerar cores gradativas baseado na porcentagem
const getGradualColor = (type: 'positive' | 'negative' | 'equal', percentage: number | null) => {
  const pct = percentage ? Math.min(100, Math.abs(percentage)) / 100 : 0.5;
  
  if (type === 'positive') {
    // Verde: 10b981 (base) até 059669 (escuro)
    const r = Math.round(16 + (5 - 16) * pct);
    const g = Math.round(185 + (150 - 185) * pct);
    const b = Math.round(129 + (105 - 129) * pct);
    return { bg: `rgba(${r},${g},${b},0.12)`, text: `rgb(${r},${g},${b})`, spark: `rgb(${r},${g},${b})` };
  } else if (type === 'negative') {
    // Vermelho: f43f5e (base) até dc2626 (escuro)
    const r = Math.round(244 + (220 - 244) * pct);
    const g = Math.round(63 + (38 - 63) * pct);
    const b = Math.round(94 + (38 - 94) * pct);
    return { bg: `rgba(${r},${g},${b},0.12)`, text: `rgb(${r},${g},${b})`, spark: `rgb(${r},${g},${b})` };
  } else {
    // Para 'equal': use verde se percentage >= 0, vermelho se < 0, ambos com gradientes
    if (percentage !== null && percentage >= 0) {
      // Verde: 10b981 (base) até 059669 (escuro)
      const r = Math.round(16 + (5 - 16) * pct);
      const g = Math.round(185 + (150 - 185) * pct);
      const b = Math.round(129 + (105 - 129) * pct);
      return { bg: `rgba(${r},${g},${b},0.12)`, text: `rgb(${r},${g},${b})`, spark: `rgb(${r},${g},${b})` };
    } else if (percentage !== null && percentage < 0) {
      // Vermelho: f43f5e (base) até dc2626 (escuro)
      const r = Math.round(244 + (220 - 244) * pct);
      const g = Math.round(63 + (38 - 63) * pct);
      const b = Math.round(94 + (38 - 94) * pct);
      return { bg: `rgba(${r},${g},${b},0.12)`, text: `rgb(${r},${g},${b})`, spark: `rgb(${r},${g},${b})` };
    } else {
      // Cinza: 9ca3af (base) até 4b5563 (escuro)
      const r = Math.round(156 + (75 - 156) * pct);
      const g = Math.round(163 + (85 - 163) * pct);
      const b = Math.round(175 + (99 - 175) * pct);
      return { bg: `rgba(${r},${g},${b},0.12)`, text: `rgb(${r},${g},${b})`, spark: '#9ca3af' };
    }
  }
};

const windowOptions: { id: WindowRange; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: '7d', label: '7 dias' },
  { id: 'custom', label: 'Calendário' }
];

const visaoOptions: { id: VisaoPrincipal; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'geral', label: 'Geral', icon: LayoutDashboard, color: 'text-emerald-600' },
  { id: 'canais', label: 'Canais de Venda', icon: ShoppingBag, color: 'text-sky-600' },
  { id: 'publicidade', label: 'Publicidade', icon: Megaphone, color: 'text-amber-600' },
  { id: 'custos', label: 'Custos & Operações', icon: Activity, color: 'text-rose-600' },
  { id: 'margens', label: 'Margens & Resultados', icon: TrendingUp, color: 'text-indigo-600' }
];

const canalAliasMap: Record<string, string> = {
  mercadolivre: 'mercado-livre',
  'tiktok-shop': 'tiktok-shop',
  yampi: 'yampi',
  shopify: 'shopify'
};

const aggregateDaily = (rows: CpaSnapshot['diarias'], costs: CpaCostsConfig) => {
  const faturamento = rows.reduce((sum, r) => sum + r.faturamento, 0);
  const gastoAds = rows.reduce((sum, r) => sum + r.gastoAds, 0);
  const pedidos = rows.reduce((sum, r) => sum + r.pedidosPagos, 0);
  const dias = Math.max(rows.length, 1);
  const ticket = pedidos > 0 ? faturamento / pedidos : 0;
  const roas = gastoAds > 0 ? faturamento / gastoAds : 0;
  const cpaMedio = pedidos > 0 ? gastoAds / pedidos : 0;

  const custoProdutos = faturamento * 0.22;
  const custoPercentual = (costs.gateway + costs.checkout + costs.imposto) / 100;
  const custosVariaveis = faturamento * custoPercentual + (costs.transporte + costs.picking) * pedidos;
  const margem1 = faturamento > 0
    ? ((faturamento - custoProdutos - custosVariaveis - gastoAds) / faturamento) * 100
    : 0;
  const margem2 = margem1; // margem2 = margem1 (custos fixos devem vir da configuração)
  const lucro = faturamento - custoProdutos - custosVariaveis - gastoAds;

  return { faturamento, gastoAds, pedidos, ticket, roas, cpaMedio, margem1, margem2, lucro, dias };
};

const aggregateChannels = (rows: { faturamento: number; gastoAds: number; pedidos: number }[], costs: CpaCostsConfig, dias = 7) => {
  const faturamento = rows.reduce((sum, r) => sum + r.faturamento, 0);
  const gastoAds = rows.reduce((sum, r) => sum + r.gastoAds, 0);
  const pedidos = rows.reduce((sum, r) => sum + r.pedidos, 0);
  const ticket = pedidos > 0 ? faturamento / pedidos : 0;
  const roas = gastoAds > 0 ? faturamento / gastoAds : 0;
  const cpaMedio = pedidos > 0 ? gastoAds / pedidos : 0;

  const custoProdutos = faturamento * 0.22;
  const custoPercentual = (costs.gateway + costs.checkout + costs.imposto) / 100;
  const custosVariaveis = faturamento * custoPercentual + (costs.transporte + costs.picking) * pedidos;
  const margem1 = faturamento > 0
    ? ((faturamento - custoProdutos - custosVariaveis - gastoAds) / faturamento) * 100
    : 0;
  const margem2 = margem1; // margem2 = margem1 (custos fixos devem vir da configuração)
  const lucro = faturamento - custoProdutos - custosVariaveis - gastoAds;

  return { faturamento, gastoAds, pedidos, ticket, roas, cpaMedio, margem1, margem2, lucro, dias };
};

const evolucaoCustos: Array<{ date: string; produtos: number; logistica: number; impostos: number; comissoes: number; tarifas: number }> = [];

type ResumoItem = { label: string; value: number; type: 'positive' | 'negative' | 'equal'; percentage: number | null; trend?: number[] };

// Mock data para Resumo Executivo por cenário
const resumoExecutivoCenarios: Record<'real' | 'orcado', ResumoItem[]> = {
  real: [],
  orcado: []
};

// Mock data para Fluxo Financeiro por cenário
const fluxoFinanceiroCenarios: Record<'real' | 'orcado', ResumoItem[]> = {
  real: [],
  orcado: []
};

// Mocks de tendência para sparklines
const resumoTrendMap: Record<string, number[]> = {};

// Detalhes rápidos para drill-down em linhas específicas
const detalheLinhaMap: Record<string, string[]> = {};

// Mocks de tendência para sparklines (Fluxo Financeiro)
const fluxoTrendMap: Record<string, number[]> = {};

// Função para gerar distribuição de gastos baseada no snapshot
const generateDistribuicaoGastos = (snapshot: CpaSnapshot): Array<{ name: string; value: number; pct: number; color: string }> => {
  if (!snapshot || !snapshot.diarias.length) {
    return []; // sem dados no snapshot, retorna vazio
  }

  const aggregated = aggregateDaily(snapshot.diarias, snapshot.custos);
  const totalFaturamento = aggregated.faturamento;
  
  // Calcular valores baseados nos dados reais
  const produtos = totalFaturamento * 0.1443; // CMV
  const logistica = totalFaturamento * 0.0415; // CVD
  const impostos = totalFaturamento * (snapshot.custos.imposto / 100);
  const ads = aggregated.gastoAds;
  const outros = totalFaturamento * 0.0256; // Outros custos
  
  const totalGastos = produtos + logistica + impostos + ads + outros;
  
  return [
    { name: 'Produtos', value: produtos, pct: (produtos / totalGastos) * 100, color: '#ef4444' },
    { name: 'Logística', value: logistica, pct: (logistica / totalGastos) * 100, color: '#f97316' },
    { name: 'Impostos', value: impostos, pct: (impostos / totalGastos) * 100, color: '#f59e0b' },
    { name: 'Ads', value: ads, pct: (ads / totalGastos) * 100, color: '#a855f7' },
    { name: 'Outros', value: outros, pct: (outros / totalGastos) * 100, color: '#10b981' }
  ];
};


// Mock data para Custos vs Receita
const custosVsReceita: Array<{ date: string; custos: number; receita: number }> = [];

// Mock data para Alertas de Custos
const alertasCustos: Array<{ tipo: string; texto: string; impacto: string }> = [];

// Helpers para waterfall e visualização

// Mock data para eventos de tempo real (para dashboard futura)
const eventosTempoReal: Array<{ tipo: string; valor: number; timestamp: string; canal: string }> = [];

const tabelaDiariaPorCanal: Array<{ dia: string; canal: string; pedidos: number; faturamento: number; gastoAds: number; roas: number; cpa: number; margem: number }> = [];

// Mock data para telas segmentadas por canal
const canalSegmentadoTrendData: Record<string, Array<{ date: string; faturamento: number; pedidos: number; roas: number }>> = {};

const tabelaDiariaSegmentada: Record<string, Array<{ dia: string; canal: string; pedidos: number; ticket: number; cpa: number; roas: number; cmv: number; cvd: number; margem: number }>> = {};

const eventosCanalSegmentado: Record<string, Array<{ tipo: string; valor: number; timestamp: string }>> = {};

// Mock data para Publicidade - Geral
const publicidadeTrendData: Array<{ date: string; metaAds: number; googleAds: number; tiktokAds: number }> = [];

const publicidadeDistribuicao: Array<{ name: string; value: number; color: string }> = [];

const publicidadeDetalhes: Array<{ plataforma: string; gasto: number; cliques: number; ctr: number; conversoes: number; cpa: number; roas: number }> = [];

const publicidadeFunil: Array<{ plataforma: string; impressoes: number; cliques: number; ctr: number; conversoes: number; taxaConv: number; cpa: number }> = [];

const publicidadeSegmentada: Record<string, {
  nome: string;
  resumo: { gasto: number; cpa: number; roas: number };
  trend: { date: string; gasto: number; conversoes: number; cpc: number; cpa: number }[];
  funil: { impressoes: number; cliques: number; ctr: number; conversoes: number; taxaConv: number; cpa: number };
  campanhas: { campanha: string; status: 'Ativa' | 'Pausada'; gasto: number; cliques: number; ctr: number; conversoes: number; cpa: number; roas: number }[];
  cpcCpaTrend: { date: string; cpc: number; cpa: number }[];
}> = {};

export default function CPA() {
  const { } = useToast();
  
  // Snapshot vazio default
  const emptySnapshot: CpaSnapshot = {
    canais: [],
    funil: [],
    diarias: [],
    eventos: [],
    custos: {
      gateway: 0,
      transporte: 0,
      picking: 0,
      imposto: 0,
      checkout: 0
    },
    integracoes: []
  };
  
  // Hook para gerenciar seleção de cliente e integrações disponíveis
  const {
    clienteSelecionado,
    setClienteSelecionado,
    clientesDisponiveis,
    submenusCanaisVenda,
    submenusPublicidade,
    mostrarSelectCliente
  } = useClientePerformance();
  
  const [snapshot, setSnapshot] = useState<CpaSnapshot>(emptySnapshot);
  const [visaoPrincipal, setVisaoPrincipal] = useState<VisaoPrincipal>('geral');
  const [subVisao, setSubVisao] = useState<string>('geral');
  const [windowRange, setWindowRange] = useState<WindowRange>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [refreshJanela, setRefreshJanela] = useState('5m');
  const [loading, setLoading] = useState(true);
  const [trendOffset, setTrendOffset] = useState(0); // 0 = últimos 7 dias, 1 = 7 dias anteriores, etc.
  const [expandedLinhaIndex, setExpandedLinhaIndex] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [channelSnapshot, setChannelSnapshot] = useState<CpaChannelSnapshot | null>(null);
  const [channelSnapshotPrevious, setChannelSnapshotPrevious] = useState<CpaChannelSnapshot | null>(null);

  // Hook para distribuição de gastos dinâmica baseada no snapshot
  const distribuicaoGastosData = useMemo(() => generateDistribuicaoGastos(snapshot), [snapshot]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Buscando dados de performance...');
      // Buscar dados reais da API
      const data = await performanceService.getCpaSnapshot();
      console.log('✅ Dados recebidos:', data);
      setSnapshot(data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados de performance:', error);
      // Em caso de erro, mantém snapshot vazio
      setSnapshot(emptySnapshot);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const handleReload = () => {
    fetchData();
  };

  // Carregamento inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Buscar dados de canal específico quando subVisao muda (apenas para visão de margens)
  useEffect(() => {
    if (visaoPrincipal === 'margens' && subVisao !== 'geral') {
      // Nota: performanceService será implementado
      setChannelSnapshot(null);
      setChannelSnapshotPrevious(null);
    }
  }, [subVisao, visaoPrincipal, windowRange, customStart, customEnd]);

  // Auto-refresh baseado em refreshJanela
  useEffect(() => {
    const intervals: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000
    };

    const interval = intervals[refreshJanela];
    if (!interval) return;

    const timer = setInterval(() => {
      fetchData();
    }, interval);

    return () => clearInterval(timer);
  }, [refreshJanela]);

  // Recarregar dados ao mudar período
  useEffect(() => {
    if (windowRange !== 'custom') {
      fetchData();
    }
  }, [windowRange]);

  // Recarregar dados ao mudar período customizado
  useEffect(() => {
    if (windowRange === 'custom' && customStart && customEnd) {
      fetchData();
    }
  }, [customStart, customEnd]);

  // Atualizar offset de tendência quando os dados mudam
  useEffect(() => {
    setTrendOffset(0);
  }, [windowRange, snapshot.diarias.length]);

  useEffect(() => {
    setSubVisao('geral');
  }, [visaoPrincipal]);

  const customWindowLength = useMemo(() => {
    if (!customStart || !customEnd) return null;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  }, [customEnd, customStart]);

  const janelaDiarias = useMemo(() => {
    const rows = snapshot.diarias;
    if (!rows.length) return [];
    if (windowRange === 'custom' && customWindowLength) {
      if (rows.length <= customWindowLength) return rows;
      return rows.slice(-customWindowLength);
    }
    if (windowRange === 'today') return rows.slice(-1);
    if (windowRange === 'yesterday') return rows.slice(-2, -1);
    if (windowRange === '7d') return rows.slice(-7);
    return rows;
  }, [customWindowLength, snapshot.diarias, windowRange]);

  // Janela imediatamente anterior com o mesmo tamanho da janela atual (para comparativo)
  const janelaAnterior = useMemo(() => {
    if (windowRange === 'custom') {
      if (!customWindowLength) return [];
      const rows = snapshot.diarias;
      if (rows.length <= customWindowLength) return [];
      const start = Math.max(0, rows.length - customWindowLength * 2);
      const end = rows.length - customWindowLength;
      return rows.slice(start, end);
    }
    const rows = snapshot.diarias;
    const len = janelaDiarias.length;
    if (!len || rows.length <= len) return [];
    const start = Math.max(0, rows.length - len * 2);
    const end = rows.length - len;
    return rows.slice(start, end);
  }, [customWindowLength, janelaDiarias.length, snapshot.diarias, windowRange]);

  const canaisSegmentados = useMemo(() => {
    if (visaoPrincipal !== 'canais' && visaoPrincipal !== 'geral') return [];
    return snapshot.canais;
  }, [snapshot.canais, visaoPrincipal]);

  const canaisVisiveis = useMemo(() => {
    if (subVisao === 'geral') return canaisSegmentados;
    const target = canalAliasMap[subVisao] || subVisao;
    return canaisSegmentados.filter((c) => c.id === target);
  }, [canaisSegmentados, subVisao]);

  const totaisAnteriores = useMemo(() => {
    if (!janelaAnterior.length) return null;
    return aggregateDaily(janelaAnterior, snapshot.custos);
  }, [snapshot.custos, janelaAnterior]);

  const formatDelta = (current: number, previous: number | null | undefined, type: 'currency' | 'number' | 'percent' | 'pp') => {
    if (previous === null || previous === undefined) return 'Sem comparativo disponível';
    if (!Number.isFinite(previous) || previous === 0) return 'Sem base anterior';
    const diff = current - previous;
    const sign = diff >= 0 ? '+' : '-';
    const spanLabel = (() => {
      if (windowRange === 'today') return 'vs ontem';
      if (windowRange === 'yesterday') return 'vs anteontem';
      if (windowRange === '7d') return 'vs semana anterior';
      if (windowRange === 'custom' && customWindowLength) return `vs ${customWindowLength} dias anteriores`;
      return 'vs período anterior';
    })();
    if (type === 'currency') {
      return `${sign}${currency(Math.abs(diff))} ${spanLabel}`;
    }
    if (type === 'number') {
      return `${sign}${formatNumber(Math.abs(diff))} ${spanLabel}`;
    }
    if (type === 'percent') {
      const pct = (diff / previous) * 100;
      return `${sign}${Math.abs(pct).toFixed(1)}% ${spanLabel}`;
    }
      return `${sign}${Math.abs(diff).toFixed(1)}% ${spanLabel}`;
  };

  const totais = useMemo(() => {
    const canaisFonte = subVisao === 'geral' ? canaisSegmentados : canaisVisiveis;
    if (canaisFonte.length) {
      return aggregateChannels(
        canaisFonte.map((c) => ({ faturamento: c.faturamento, gastoAds: c.gastoAds, pedidos: c.pedidos })),
        snapshot.custos
      );
    }
    return aggregateDaily(janelaDiarias, snapshot.custos);
  }, [canaisSegmentados, canaisVisiveis, snapshot.custos, janelaDiarias, subVisao]);

  // Submenus filtrados dinamicamente baseado nas integrações do cliente
  const submenuItems = useMemo(() => {
    const baseSubmenus: { id: string; label: string }[] = [];
    
    // Sempre mostrar "Visão Geral"
    const visaoGeral = baseSubmenus.filter(item => item.id === 'geral');
    
    // Se não houver cliente selecionado, mostrar apenas visão geral
    if (!clienteSelecionado) {
      return visaoGeral;
    }
    
    // Filtrar submenus baseado nas integrações do cliente
    let submenusDisponiveis: { id: string; label: string }[] = [];
    
    if (visaoPrincipal === 'canais' || visaoPrincipal === 'margens') {
      // Para Canais de Venda e Margens, mostrar Marketplace + Gateway
      submenusDisponiveis = submenusCanaisVenda.map(submenu => {
        // Mapear keys das integrações para os IDs dos submenus
        const keyToSubmenuId: Record<string, string> = {
          'mercado_livre': 'mercado-livre',
          'tiktok_shop': 'tiktok-shop',
          'yampi': 'yampi',
          'shopify': 'shopify',
          'cartpanda': 'cartpanda',
          'appmax': 'appmax',
          'mercado_pago': 'mercado-pago',
          'pagarme': 'pagarme',
          'nuvemshop': 'nuvemshop',
          'paypal': 'paypal',
          'pagseguro': 'pagseguro',
          'amazon_br': 'amazon-br',
          'magalu': 'magalu',
          'shopee': 'shopee',
          'aliexpress': 'aliexpress',
          'shein': 'shein',
        };
        
        return {
          id: keyToSubmenuId[submenu.key] || submenu.key,
          label: submenu.label
        };
      });
    } else if (visaoPrincipal === 'publicidade') {
      // Para Publicidade, mostrar ADS
      submenusDisponiveis = submenusPublicidade.map(submenu => {
        const keyToSubmenuId: Record<string, string> = {
          'google_ads': 'google-ads',
          'meta_ads': 'meta-ads',
          'tiktok_ads': 'tiktok-ads',
          'mercado_livre_ads': 'mercado-livre-ads',
          'kwai_ads': 'kwai-ads',
          'amazon_ads': 'amazon-ads',
          'shopee_ads': 'shopee-ads',
          'pinterest_ads': 'pinterest-ads',
        };
        
        return {
          id: keyToSubmenuId[submenu.key] || submenu.key,
          label: submenu.label
        };
      });
    }
    
    // Retornar Visão Geral + submenus disponíveis
    return [...visaoGeral, ...submenusDisponiveis];
  }, [visaoPrincipal, clienteSelecionado, submenusCanaisVenda, submenusPublicidade]);

  // Atualizar offset de tendência quando os dados mudam
  useEffect(() => {
    setTrendOffset(0);
  }, [windowRange, snapshot.diarias.length]);

  // Função auxiliar para formatar rótulo da janela
  const generateResumoFromSnapshot = useMemo((): ResumoItem[] => {
    if (!snapshot || !snapshot.diarias.length) {
      // Fallback para dados mock quando não há snapshot
      return resumoExecutivoCenarios['real'];
    }

    // Calcular totais do período selecionado
    const aggregated = aggregateDaily(snapshot.diarias, snapshot.custos);
    const vendaTotalVal = aggregated.faturamento;
    const impostoVal = -(vendaTotalVal * (snapshot.custos.imposto / 100));
    const faturamentoLiquidoVal = vendaTotalVal + impostoVal;
    
    // CMV (Custo dos Produtos Vendidos) - estimativa baseada nos custos
    const cmv = -(vendaTotalVal * 0.1443); // 14.43% baseado no mock
    const lucroBruto = faturamentoLiquidoVal + cmv;
    
    // CVD (Custos Variáveis de Distribuição)
    const cvd = -(vendaTotalVal * 0.0415); // 4.15% baseado no mock
    const margemContribuicao = lucroBruto + cvd;
    
    // CVA (Custos Variáveis de Aquisição) - baseado no gastoAds
    const cva = -aggregated.gastoAds;
    const margemAposAquisicao = margemContribuicao + cva;

    // Calcular tendências baseadas nos últimos 7 dias
    const last7Days = snapshot.diarias.slice(-7);
    const trends = {
      vendaTotal: last7Days.map(d => d.faturamento),
      imposto: last7Days.map(d => -(d.faturamento * (snapshot.custos.imposto / 100))),
      faturamentoLiquido: last7Days.map(d => d.faturamento * (1 - snapshot.custos.imposto / 100)),
      cmv: last7Days.map(d => -(d.faturamento * 0.1443)),
      lucroBruto: last7Days.map(d => d.faturamento * (1 - snapshot.custos.imposto / 100 - 0.1443)),
      cvd: last7Days.map(d => -(d.faturamento * 0.0415)),
      margemContribuicao: last7Days.map(d => d.faturamento * (1 - snapshot.custos.imposto / 100 - 0.1443 - 0.0415)),
      cva: last7Days.map(d => -d.gastoAds),
      margemAposAquisicao: last7Days.map(d => d.faturamento * (1 - snapshot.custos.imposto / 100 - 0.1443 - 0.0415) - d.gastoAds)
    };

    return [
      { 
        label: 'VENDA TOTAL', 
        value: vendaTotalVal, 
        type: 'positive' as const, 
        percentage: null, 
        trend: trends.vendaTotal 
      },
      { 
        label: 'IMPOSTO', 
        value: impostoVal, 
        type: 'negative' as const, 
        percentage: -(snapshot.custos.imposto), 
        trend: trends.imposto 
      },
      { 
        label: 'FATURAMENTO LÍQUIDO', 
        value: faturamentoLiquidoVal, 
        type: 'equal' as const, 
        percentage: (faturamentoLiquidoVal / vendaTotalVal) * 100, 
        trend: trends.faturamentoLiquido 
      },
      { 
        label: 'CMV', 
        value: cmv, 
        type: 'negative' as const, 
        percentage: -14.43, 
        trend: trends.cmv 
      },
      { 
        label: 'LUCRO BRUTO', 
        value: lucroBruto, 
        type: 'equal' as const, 
        percentage: (lucroBruto / vendaTotalVal) * 100, 
        trend: trends.lucroBruto 
      },
      { 
        label: 'CVD', 
        value: cvd, 
        type: 'negative' as const, 
        percentage: -4.15, 
        trend: trends.cvd 
      },
      { 
        label: 'MARGEM CONTRIBUIÇÃO', 
        value: margemContribuicao, 
        type: 'equal' as const, 
        percentage: (margemContribuicao / vendaTotalVal) * 100, 
        trend: trends.margemContribuicao 
      },
      { 
        label: 'CVA', 
        value: cva, 
        type: 'negative' as const, 
        percentage: vendaTotalVal > 0 ? -(aggregated.gastoAds / vendaTotalVal) * 100 : 0, 
        trend: trends.cva 
      },
      { 
        label: 'MARGEM APÓS AQUISIÇÃO', 
        value: margemAposAquisicao, 
        type: 'equal' as const, 
        percentage: vendaTotalVal > 0 ? (margemAposAquisicao / vendaTotalVal) * 100 : 0, 
        trend: trends.margemAposAquisicao 
      }
    ];
  }, [snapshot]);

  const resumoData = useMemo(() => generateResumoFromSnapshot, [generateResumoFromSnapshot]);
  // fluxoData não está mais mockado - deve vir da API no futuro
  const fluxoData: ResumoItem[] = [];

  const cardsResumo = [
    {
      label: 'Venda Total',
      valor: currency(totais.faturamento),
      helper: formatDelta(totais.faturamento, totaisAnteriores?.faturamento, 'currency'),
      icon: DollarSign,
      color: 'text-emerald-600',
      description: 'Receita bruta total gerada pelas vendas no período selecionado, incluindo todos os canais de venda.'
    },
    {
      label: 'Gastos Ads Total',
      valor: currency(totais.gastoAds),
      helper: formatDelta(totais.gastoAds, totaisAnteriores?.gastoAds, 'currency'),
      icon: Megaphone,
      color: 'text-amber-600',
      description: 'Total investido em publicidade paga (Google Ads, Meta Ads, TikTok Ads, etc.) durante o período.'
    },
    {
      label: 'ROAS',
      valor: totais.roas.toFixed(2),
      helper: formatDelta(totais.roas, totaisAnteriores?.roas, 'number'),
      icon: BarChart3,
      color: 'text-indigo-600',
      description: 'Return on Ad Spend - Retorno sobre investimento em publicidade. Indica quantos reais de receita são gerados para cada real investido em anúncios.'
    },
    {
      label: 'Margem Após Aquisição',
      valor: `${percent(totais.margem2)}`,
      helper: formatDelta(totais.margem2, totaisAnteriores?.margem2, 'pp'),
      icon: Crosshair,
      color: 'text-sky-600',
      description: 'Lucro restante após deduzir todos os custos operacionais e de aquisição de clientes. Representa a margem real do negócio.'
    },
    {
      label: 'CPA Médio',
      valor: currency(totais.cpaMedio),
      helper: formatDelta(totais.cpaMedio, totaisAnteriores?.cpaMedio, 'currency'),
      icon: BarChart3,
      color: 'text-rose-600',
      description: 'Custo de Aquisição de Cliente - Valor médio gasto para conquistar cada novo cliente através de publicidade.'
    },
    {
      label: 'Ticket Médio',
      valor: currency(totais.ticket),
      helper: formatDelta(totais.ticket, totaisAnteriores?.ticket, 'currency'),
      icon: ShoppingCart,
      color: 'text-slate-700',
      description: 'Valor médio gasto por pedido/cliente. Calculado dividindo o faturamento total pelo número de pedidos.'
    }
  ];

  const alertasPrioritarios = canaisSegmentados
    .flatMap((c) => c.alertas.map((a) => ({ canal: c.nome, texto: a })))
    .slice(0, 6);

  const alertasParaExibir = alertasPrioritarios;

    // Top 3 canais por faturamento
    const topCanais = useMemo(() => {
      if (!canaisSegmentados.length) return [];
      return [...canaisSegmentados]
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 3)
        .map((c) => ({
          name: c.nome,
          faturamento: c.faturamento,
          gastoAds: c.gastoAds,
          margem: c.margemContribuicao,
          pedidos: c.pedidos,
          ticket: c.ticketMedio
        }));
    }, [canaisSegmentados]);

    const gastosAdsPie = topCanais.map((c, idx) => ({ name: c.name, value: c.gastoAds, color: ['#0ea5e9', '#f59e0b', '#10b981'][idx] || '#0ea5e9' }));
    const vendasPie = topCanais.map((c, idx) => ({ name: c.name, value: c.faturamento, color: ['#10b981', '#3b82f6', '#f59e0b'][idx] || '#10b981' }));

    const trendLines = useMemo(() => {
      const windowSize = 7;
      const rows = snapshot.diarias;
      if (!rows.length) return [];
      const start = Math.max(0, rows.length - windowSize * (trendOffset + 1));
      const end = Math.max(start, rows.length - windowSize * trendOffset);
      const slice = rows.slice(start, end);
      return slice.map((row) => ({
        date: row.dia,
        faturamento: row.faturamento,
        pedidos: row.pedidosPagos,
        gastoAds: row.gastoAds,
        cpa: row.cpa,
        roas: row.roas,
        mpa: row.faturamento > 0 ? ((row.faturamento - row.gastoAds) / row.faturamento) * 100 : 0
      }));
    }, [snapshot.diarias, trendOffset]);

  return (
    <div className="space-y-6">
      <PageBanner
        title="Performance & Resultados"
        icon={<Activity size={32} />}
        right={
          <div className="flex items-center gap-3">
            {/* MENU PRINCIPAL COM ÍCONES */}
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
              {visaoOptions.map((opt) => {
                const Icon = opt.icon;
                const active = visaoPrincipal === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setVisaoPrincipal(opt.id)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                    title={opt.label}
                  >
                    <Icon size={16} className={opt.color} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-8 w-px bg-gray-300" />

            {/* CONTROLES ADICIONAIS */}
            <div className="flex items-center gap-2">
              <select
                value={refreshJanela}
                onChange={(e) => setRefreshJanela(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  title="Janela de atualização"
                >
                  <option value="5m">Atualizar a cada 5m</option>
                  <option value="15m">Atualizar a cada 15m</option>
                  <option value="30m">Atualizar a cada 30m</option>
                  <option value="1h">Atualizar a cada 1h</option>
                </select>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Bell size={14} />
                  <span>{getTimeAgo(lastUpdate)}</span>
                </div>
                <Button 
                  variant="outlineContrast" 
                  className={`flex items-center gap-2 transition-all ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-100'}`} 
                  onClick={handleReload} 
                  disabled={loading} 
                  title={loading ? 'Carregando dados...' : 'Recarregar dados'}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                  {loading ? 'Carregando...' : 'Recarregar'}
                </Button>
              </div>
            </div>
          }
        />

        {/* Select de Cliente (apenas para Admin, Gestor e Colaborador) */}
        {mostrarSelectCliente && (
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-slate-600 dark:text-slate-400" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cliente:
              </label>
              {clientesDisponiveis.length > 0 ? (
                <select
                  value={clienteSelecionado?.id || ''}
                  onChange={(e) => {
                    const cliente = clientesDisponiveis.find(c => c.id === Number(e.target.value));
                    if (cliente) setClienteSelecionado(cliente);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {clientesDisponiveis.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.dadosGerais.nomeFantasia || cliente.dadosGerais.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex-1 text-sm text-slate-500 dark:text-slate-400 italic">
                  Nenhum cliente cadastrado ainda. Cadastre um cliente para visualizar os dados de performance.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submenu Dinâmico */}
        {submenuItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {submenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSubVisao(item.id)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  subVisao === item.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Menu de Período */}
        <div className="flex flex-wrap items-center gap-2">
          {windowOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setWindowRange(opt.id);
                if (opt.id !== 'custom') {
                  setCustomStart('');
                  setCustomEnd('');
                }
              }}
              className={`rounded-full border px-3 py-1 text-sm ${
                windowRange === opt.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {windowRange === 'custom' && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-1">
                <span>Início</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              <label className="flex items-center gap-1">
                <span>Fim</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
            </div>
          )}
        </div>

      {/* Máscara para páginas em desenvolvimento */}
      {(visaoPrincipal === 'canais' || visaoPrincipal === 'publicidade' || visaoPrincipal === 'custos') && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle size={64} className="text-slate-400 dark:text-slate-500" />
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
              A página está em desenvolvimento!
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Este módulo estará disponível na próxima versão do sistema.
            </p>
          </div>
        </Card>
      )}

      {/* Visão Canais de Venda */}
      {false && visaoPrincipal === 'canais' && subVisao === 'geral' && (
        <>
          {/* Cards Resumo Canais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Venda Total</span>
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(2653600)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+12.5% vs período anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos ADS</span>
                <Zap size={20} className="text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(404500)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">-3.2% vs período anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ROAS</span>
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">6.56x</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+0.24x vs período anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Qtd Pedidos/Dia</span>
                <ShoppingBag size={20} className="text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">847</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+8.3% vs período anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MPA</span>
                <TrendingUp size={20} className="text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">40.8%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+1.2% vs período anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">% da Margem</span>
                <ShieldCheck size={20} className="text-rose-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">40.2%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+0.8% vs período anterior</p>
            </Card>
          </div>

          {/* Venda por Canal - 100% width (oculto) */}

          {/* Distribuição + Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Distribuição por Canal - 30% */}
            <Card className="p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Canal</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Yampi', value: 410000, color: '#10b981' },
                      { name: 'Mercado Livre', value: 295400, color: '#0ea5e9' },
                      { name: 'TikTok Shop', value: 128200, color: '#f59e0b' }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {[
                      { name: 'Yampi', value: 410000, color: '#10b981' },
                      { name: 'Mercado Livre', value: 295400, color: '#0ea5e9' },
                      { name: 'TikTok Shop', value: 128200, color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`dist-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Detalhes por Canal - 70% */}
            <Card className="p-6 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalhes por Canal</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr className="text-left text-gray-600 dark:text-gray-400 text-xs font-semibold">
                      <th className="pb-2 px-2">Canal</th>
                      <th className="pb-2 px-2">Faturamento</th>
                      <th className="pb-2 px-2">Gastos ADS</th>
                      <th className="pb-2 px-2">ROAS</th>
                      <th className="pb-2 px-2">CPA</th>
                      <th className="pb-2 px-2">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">Yampi</td>
                      <td className="py-3 px-2 text-emerald-600 font-semibold">{currency(410000)}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(63850)}</td>
                      <td className="py-3 px-2 text-amber-600 font-medium">6.42x</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(66.75)}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">39%</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">Mercado Livre</td>
                      <td className="py-3 px-2 text-emerald-600 font-semibold">{currency(295400)}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(43270)}</td>
                      <td className="py-3 px-2 text-amber-600 font-medium">6.82x</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(55.36)}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">42%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">TikTok Shop</td>
                      <td className="py-3 px-2 text-emerald-600 font-semibold">{currency(128200)}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(24380)}</td>
                      <td className="py-3 px-2 text-amber-600 font-medium">5.25x</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(76.42)}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs font-semibold">36%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Alertas */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Alertas
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">CPA elevado no TikTok Shop</p>
                  <p className="text-xs text-red-600">CPA subiu 15% em relação ao dia anterior</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">ROAS em queda no Mercado Livre</p>
                  <p className="text-xs text-red-600">Redução de 8% vs. última semana</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tempo Real */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pedidos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-emerald-600" />
                Pedidos (Tempo Real)
              </h3>
              <div className="space-y-2">
                {eventosTempoReal
                  .filter((e) => e.tipo === 'pedido')
                  .map((evento, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{evento.canal}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{evento.timestamp}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">{currency(evento.valor)}</p>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Gastos ADS */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-purple-600" />
                Gastos ADS (Tempo Real)
              </h3>
              <div className="space-y-2">
                {eventosTempoReal
                  .filter((e) => e.tipo === 'ads')
                  .map((evento, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{evento.canal}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{evento.timestamp}</p>
                      </div>
                      <p className="text-sm font-bold text-purple-600">{currency(evento.valor)}</p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Pedidos por Dia */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pedidos por Dia</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left text-gray-600 dark:text-gray-400 text-xs font-semibold">
                    <th className="pb-2 px-2">Canal</th>
                    <th className="pb-2 px-2">Pedidos</th>
                    <th className="pb-2 px-2">Faturamento</th>
                    <th className="pb-2 px-2">Gasto Ads</th>
                    <th className="pb-2 px-2">ROAS</th>
                    <th className="pb-2 px-2">CPA</th>
                    <th className="pb-2 px-2">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    new Map(
                      tabelaDiariaPorCanal.map(row => [row.canal, row])
                    ).values()
                  ).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{row.canal}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.pedidos}</td>
                      <td className="py-3 px-2 text-emerald-600 font-semibold">{currency(row.faturamento)}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(row.gastoAds)}</td>
                      <td className="py-3 px-2 text-amber-600 font-medium">{row.roas.toFixed(2)}x</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(row.cpa)}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">{row.margem}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Canais Segmentados - Yampi, Mercado Livre, TikTok Shop */}
      {false && visaoPrincipal === 'canais' && subVisao !== 'geral' && (
        <>
          {(() => {
            const trendData = canalSegmentadoTrendData[subVisao as keyof typeof canalSegmentadoTrendData] || [];
            const tabelaDados = tabelaDiariaSegmentada[subVisao as keyof typeof tabelaDiariaSegmentada] || [];
            const eventos = eventosCanalSegmentado[subVisao as keyof typeof eventosCanalSegmentado] || [];
            const ultimoPedido = tabelaDados[tabelaDados.length - 1] || { pedidos: 0 };
            const mpa = tabelaDados.length ? (tabelaDados.reduce((sum, d) => sum + d.roas, 0) / tabelaDados.length).toFixed(2) : '0';
            const margem = tabelaDados.length ? (tabelaDados.reduce((sum, d) => sum + d.margem, 0) / tabelaDados.length).toFixed(1) : '0';

            return (
              <>
                {/* 3 Cards Topo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Qtd de Pedidos (Hoje)</span>
                      <ShoppingBag size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{ultimoPedido.pedidos}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Últimas 24h</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MPA</span>
                      <TrendingUp size={20} className="text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{mpa}x</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Média 7 dias</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">% da Margem</span>
                      <ShieldCheck size={20} className="text-rose-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{margem}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Média 7 dias</p>
                  </Card>
                </div>

                {/* Trend 7 Dias */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trend 7 Dias</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trendData} margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis yAxisId="left" stroke="#0f172a" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#6366f1" domain={[0, 'dataMax + 5']} />
                      <RechartsTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="faturamento" name="Venda Total" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="pedidos" name="Pedidos" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Alertas */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-rose-600" />
                    Alertas
                  </h3>
                  <div className="space-y-2">
                    {Number(mpa) < 6.5 && (
                      <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-300 dark:border-rose-500">
                        <AlertTriangle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">ROAS em queda</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">ROAS {mpa}x está abaixo da meta (6.5x)</p>
                        </div>
                      </div>
                    )}
                    {Number(margem) < 35 && (
                      <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-300 dark:border-rose-500">
                        <AlertTriangle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Margem baixa</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Margem {margem}% está abaixo da meta (35%)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Tempo Real 50/50 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-emerald-600" />
                      Pedidos
                    </h3>
                    <div className="space-y-2">
                      {eventos.filter((e) => e.tipo === 'pedido').map((evento, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{evento.timestamp}</span>
                          <span className="text-sm font-bold text-emerald-600">{currency(evento.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap size={20} className="text-purple-600" />
                      Gastos ADS
                    </h3>
                    <div className="space-y-2">
                      {eventos.filter((e) => e.tipo === 'ads').map((evento, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{evento.timestamp}</span>
                          <span className="text-sm font-bold text-purple-600">{currency(evento.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Tabela Diária */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pedidos por Dia</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200 dark:border-slate-700">
                        <tr className="text-left text-gray-600 dark:text-gray-400 text-xs font-semibold">
                          <th className="pb-2 px-2">Canal</th>
                          <th className="pb-2 px-2">Nº Pedidos</th>
                          <th className="pb-2 px-2">Ticket</th>
                          <th className="pb-2 px-2">CPA</th>
                          <th className="pb-2 px-2">ROAS</th>
                          <th className="pb-2 px-2">CMV</th>
                          <th className="pb-2 px-2">CVD</th>
                          <th className="pb-2 px-2">Margem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(
                          new Map(
                            tabelaDados.map(row => [row.canal, row])
                          ).values()
                        ).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{row.canal}</td>
                            <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.pedidos}</td>
                            <td className="py-3 px-2 text-emerald-600 font-semibold">{currency(row.ticket)}</td>
                            <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(row.cpa)}</td>
                            <td className="py-3 px-2 text-amber-600 font-medium">{row.roas.toFixed(2)}x</td>
                            <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.cmv.toFixed(1)}%</td>
                            <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.cvd.toFixed(1)}%</td>
                            <td className="py-3 px-2">
                              <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">{row.margem}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Aquisição / Retenção 50/50 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">% Aquisição</h3>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">45%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Novos clientes na semana</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">+12% vs semana anterior</p>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">% Retenção</h3>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-4xl font-bold text-sky-600 mb-2">68%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Clientes recorrentes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">+5% vs semana anterior</p>
                    </div>
                  </Card>
                </div>
              </>
            );
          })()}
        </>
      )}

      {/* Publicidade - Geral */}
      {false && visaoPrincipal === 'publicidade' && subVisao === 'geral' && (
        <>
          {/* 3 Cards Topo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gasto Total</span>
                <Zap size={20} className="text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(135370)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Últimos 7 dias</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPA Médio</span>
                <Activity size={20} className="text-rose-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(72.25)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Média das plataformas</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ROAS</span>
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">6.80x</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Média consolidada</p>
            </Card>
          </div>

          {/* Gasto por Plataforma - Gráfico Linhas */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gasto por Plataforma (7 dias)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={publicidadeTrendData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(v: number) => currency(v)} />
                <Legend />
                <Line type="monotone" dataKey="metaAds" name="Meta Ads" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="googleAds" name="Google Ads" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tiktokAds" name="TikTok Ads" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição + Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Distribuição Gasto ADS - 30% */}
            <Card className="p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição Gasto ADS</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={publicidadeDistribuicao}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {publicidadeDistribuicao.map((entry, index) => (
                      <Cell key={`dist-pub-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gasto por Plataforma - Tabela 70% */}
            <Card className="p-6 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gasto por Plataforma</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr className="text-left text-gray-600 dark:text-gray-400 text-xs font-semibold">
                      <th className="pb-2 px-2">Plataforma</th>
                      <th className="pb-2 px-2">Gasto</th>
                      <th className="pb-2 px-2">Cliques</th>
                      <th className="pb-2 px-2">CTR</th>
                      <th className="pb-2 px-2">Conversões</th>
                      <th className="pb-2 px-2">CPA</th>
                      <th className="pb-2 px-2">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicidadeDetalhes.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{row.plataforma}</td>
                        <td className="py-3 px-2 text-purple-600 font-semibold">{currency(row.gasto)}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.cliques.toLocaleString('pt-BR')}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.ctr.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{row.conversoes}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{currency(row.cpa)}</td>
                        <td className="py-3 px-2 text-amber-600 font-medium">{row.roas.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Funil de Conversão + CPC/CPA */}
          <div className="space-y-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Funil de Conversão</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Impressões → Cliques → Conversões por plataforma</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>CTR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Taxa conv.</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {publicidadeFunil.map((item) => {
                    const clickRate = item.cliques / item.impressoes;
                    const convRate = item.conversoes / item.cliques;
                    return (
                      <div key={item.plataforma} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200 font-medium">
                          <span>{item.plataforma}</span>
                          <div className="flex gap-6 text-slate-600 dark:text-slate-400">
                            <span>{item.impressoes.toLocaleString('pt-BR')}</span>
                            <span>{item.cliques.toLocaleString('pt-BR')}</span>
                            <span>{item.conversoes.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>CTR</span>
                              <span>{(clickRate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-2 bg-blue-500" style={{ width: `${Math.min(clickRate * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>Taxa de conversão</span>
                              <span>{(convRate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-2 bg-emerald-500" style={{ width: `${Math.min(convRate * 100, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {publicidadeFunil.map((item) => (
                    <div key={item.plataforma} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.plataforma}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">CTR {item.ctr}% · Taxa conv. {item.taxaConv}%</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">R$ {item.cpa.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.impressoes.toLocaleString('pt-BR')}</p>
                          <p className="text-slate-500 dark:text-slate-400">Impressões</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.cliques.toLocaleString('pt-BR')}</p>
                          <p className="text-slate-500 dark:text-slate-400">Cliques</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.conversoes.toLocaleString('pt-BR')}</p>
                          <p className="text-slate-500 dark:text-slate-400">Conversões</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

        </>
      )}

      {/* Publicidade - Segmentada por plataforma */}
      {false && visaoPrincipal === 'publicidade' && subVisao !== 'geral' && (() => {
        const plataforma = publicidadeSegmentada[subVisao as keyof typeof publicidadeSegmentada];
        if (!plataforma) return null;
        const pieCampanhas = plataforma.campanhas.map((c, idx) => ({
          name: c.campanha,
          value: c.gasto,
          color: ['#6366F1', '#22C55E', '#F59E0B', '#EC4899', '#06B6D4'][idx % 5]
        }));

        return (
          <>
            {/* Cards topo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gasto Total</span>
                  <Zap size={20} className="text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(plataforma.resumo.gasto)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{plataforma.nome} · últimos 7 dias</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPA Médio</span>
                  <Activity size={20} className="text-rose-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(plataforma.resumo.cpa)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Média das campanhas</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ROAS</span>
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{plataforma.resumo.roas.toFixed(2)}x</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{plataforma.nome}</p>
              </Card>
            </div>

            {/* Trend gasto + conversões */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{plataforma.nome} · Gasto e CPA (7 dias)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={plataforma.trend} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366F1" tickFormatter={(v) => `R$${v}`} />
                  <RechartsTooltip formatter={(v: number, key) => key === 'conversoes' ? v.toLocaleString('pt-BR') : currency(v)} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="gasto" name="Gasto" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cpa" name="CPA" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Distribuição + Tabela de campanhas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Campanha</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieCampanhas} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieCampanhas.map((entry, index) => (
                        <Cell key={`camp-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => currency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campanhas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-slate-700">
                      <tr className="text-left text-gray-600 dark:text-gray-400 text-xs font-semibold">
                        <th className="pb-2 px-2">Campanha</th>
                        <th className="pb-2 px-2">Status</th>
                        <th className="pb-2 px-2 text-right">Gasto</th>
                        <th className="pb-2 px-2 text-right">Cliques</th>
                        <th className="pb-2 px-2 text-right">CTR</th>
                        <th className="pb-2 px-2 text-right">Conversões</th>
                        <th className="pb-2 px-2 text-right">CPA</th>
                        <th className="pb-2 px-2 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plataforma.campanhas.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{row.campanha}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Ativa' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-purple-600 font-semibold">{currency(row.gasto)}</td>
                          <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{row.cliques.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{row.ctr.toFixed(1)}%</td>
                          <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{row.conversoes.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{currency(row.cpa)}</td>
                          <td className="py-3 px-2 text-right text-amber-600 font-medium">{row.roas.toFixed(1)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Funil + CPC & CPA + Comparativo */}
            <div className="space-y-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Funil de Conversão</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Impressões → Cliques → Conversões ({plataforma.nome})</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>CTR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Taxa conv.</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200 font-medium">
                      <span>{plataforma.nome}</span>
                      <div className="flex gap-6 text-slate-600 dark:text-slate-400">
                        <span>{plataforma.funil.impressoes.toLocaleString('pt-BR')}</span>
                        <span>{plataforma.funil.cliques.toLocaleString('pt-BR')}</span>
                        <span>{plataforma.funil.conversoes.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>CTR</span>
                          <span>{plataforma.funil.ctr.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-2 bg-blue-500" style={{ width: `${Math.min(plataforma.funil.ctr, 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Taxa de conversão</span>
                          <span>{plataforma.funil.taxaConv.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-2 bg-emerald-500" style={{ width: `${Math.min(plataforma.funil.taxaConv, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">CPA Médio</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">CTR {plataforma.funil.ctr}% · Taxa conv. {plataforma.funil.taxaConv}%</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{currency(plataforma.funil.cpa)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{plataforma.funil.impressoes.toLocaleString('pt-BR')}</p>
                        <p className="text-slate-500 dark:text-slate-400">Impressões</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{plataforma.funil.cliques.toLocaleString('pt-BR')}</p>
                        <p className="text-slate-500 dark:text-slate-400">Cliques</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-md p-2 text-center">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{plataforma.funil.conversoes.toLocaleString('pt-BR')}</p>
                        <p className="text-slate-500 dark:text-slate-400">Conversões</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPC & CPA</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Variação diária ({plataforma.nome})</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500" />CPC</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500" />CPA</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plataforma.cpcCpaTrend} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(v) => `R$${v}`}/>
                      <RechartsTooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="cpc" name="CPC" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="cpa" name="CPA" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comparativo de Campanhas</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status, gasto, cliques, CTR, conversões, CPA e ROAS</p>
                  </div>
                </div>
                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/40">
                      <tr className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                        <th className="px-6 py-3 text-left">Campanha</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Gasto</th>
                        <th className="px-4 py-3 text-right">Cliques</th>
                        <th className="px-4 py-3 text-right">CTR</th>
                        <th className="px-4 py-3 text-right">Conv.</th>
                        <th className="px-4 py-3 text-right">CPA</th>
                        <th className="px-4 py-3 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {plataforma.campanhas.map((item) => (
                        <tr key={item.campanha} className="text-sm text-slate-700 dark:text-slate-200">
                          <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.campanha}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Ativa' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">R$ {item.gasto.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-right">{item.cliques.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-right">{item.ctr.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right">{item.conversoes.toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3 text-right">R$ {item.cpa.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{item.roas.toFixed(1)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        );
      })()}

      {/* Visão Geral - Renderizado quando não está em Canais */}
      {visaoPrincipal === 'geral' && (
        <>
          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {loading ? (
              Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)
            ) : (
              cardsResumo.map((card, idx) => (
                <Card key={idx} className={`p-6 ${fadeClass}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</span>
                      <Tooltip content={card.description} side="top">
                        <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.valor}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {card.helper && (
                      <>
                        <span className={`text-base ${card.helper.startsWith('+') ? 'text-emerald-600 dark:text-emerald-500 font-semibold' : card.helper.startsWith('-') ? 'text-red-600 dark:text-red-500 font-semibold' : ''}`}>
                          {card.helper.charAt(0)}
                        </span>
                        {card.helper.slice(1)}
                      </>
                    )}
                  </p>
                </Card>
              ))
            )}
          </div>

      {/* Trend 7 dias - full width */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-8 gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trend 7 Dias:</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setTrendOffset((v) => v + 1)}
                  disabled={loading || snapshot.diarias.length <= (trendOffset + 1) * 7}
                  title="Ver 7 dias anteriores"
                >
                  ← 7 dias antes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setTrendOffset((v) => Math.max(0, v - 1))}
                  disabled={loading || trendOffset === 0}
                  title="Voltar para mais recente"
                >
                  7 dias seguintes →
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="h-80 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
            ) : trendLines && trendLines.length > 0 ? (
              <div className={`${fadeClass} mt-6`}>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={trendLines} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#0f172a" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" tickFormatter={(v) => `${v}`}
                  domain={[0, 'dataMax + 20']} />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="faturamento" name="Venda Total" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="pedidos" name="Qtd Pedidos" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="mpa" name="MPA (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
            ) : (
              <EmptyDataState message="Nenhum dado disponível para este período" />
            )}
          </Card>

          {/* Top 3 + Distribuições */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 3 Canais de Venda:</h3>
              {loading ? (
                <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
              ) : topCanais && topCanais.length > 0 ? (
                <div className={fadeClass}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topCanais}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="faturamento" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyDataState message="Sem canais de venda neste período" />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos Ads:</h3>
              {loading ? (
                <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
              ) : gastosAdsPie && gastosAdsPie.length > 0 ? (
                <div className={fadeClass}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={gastosAdsPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {gastosAdsPie.map((entry, index) => (
                          <Cell key={`gads-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyDataState message="Sem gastos com ads neste período" />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Venda Total:</h3>
              {loading ? (
                <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
              ) : vendasPie && vendasPie.length > 0 ? (
                <div className={fadeClass}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={vendasPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {vendasPie.map((entry, index) => (
                          <Cell key={`vendas-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyDataState message="Sem dados de vendas neste período" />
              )}
            </Card>
          </div>

          {/* Principais canais */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Principais Canais:</h3>
            {loading ? (
              <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
            ) : topCanais && topCanais.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${fadeClass}`}>
              {topCanais.map((c) => (
                <div key={c.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600">{currency(c.faturamento)}</div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>Pedidos: {formatNumber(c.pedidos || 0)}</div>
                    <div>Ticket Médio: {currency(c.ticket || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <EmptyDataState message="Nenhum canal de venda ativo neste período" />
            )}
          </Card>

          {/* Alertas */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Alertas
              </h3>
              <span className="text-sm text-red-700">{alertasParaExibir.length} alertas</span>
            </div>
            {alertasParaExibir && alertasParaExibir.length > 0 ? (
            <div className="space-y-3">
              {alertasParaExibir.map((alerta, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alerta.texto}</p>
                    <p className="text-xs text-red-600">Canal: {alerta.canal}</p>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-300">Sem alertas neste período</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Custos & Operações */}
      {false && visaoPrincipal === 'custos' && (
        <>
          {/* Cards de Custos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {loading ? (
              Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)
            ) : (
            custosCards.map((card, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</span>
                  <card.icon size={20} className={card.color} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.valor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Últimos 7 dias</p>
              </Card>
            ))
            )}
          </div>

          {/* Distribuição de Custos + Custos por Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
            <Card className="p-6 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição de Custos</h3>
              {loading ? (
                <div className="h-80 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
              ) : custosData && custosData.length > 0 ? (
                <div className={fadeClass}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={custosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {custosData.map((entry, index) => (
                          <Cell key={`custos-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyDataState message="Sem dados de custos neste período" />
              )}
            </Card>

            <Card className="p-6 lg:col-span-7">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custos por Categoria</h3>
              {loading ? (
                <div className="h-80 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
              ) : custosPorCategoria && custosPorCategoria.length > 0 ? (
                <div className={fadeClass}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={custosPorCategoria} layout="horizontal" margin={{ left: 80, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="categoria" stroke="#9ca3af" width={70} />
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="valor" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyDataState message="Sem dados de categorias neste período" />
              )}
            </Card>
          </div>

          {/* Evolução de Custos */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evolução de Custos</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={evolucaoCustos} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(v: number) => currency(v)} />
                <Legend />
                <Line type="monotone" dataKey="produtos" name="Produtos" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="logistica" name="Logística" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="impostos" name="Impostos" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="comissoes" name="Comissões" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tarifas" name="Tarifas" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Custos vs Receita */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custos vs Receita</h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={custosVsReceita} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(v: number) => currency(v)} />
                <Legend />
                <Bar yAxisId="left" dataKey="custos" name="Custos Totais" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="receita" name="Receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Alertas de Custos */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Alertas
              </h3>
              <span className="text-sm text-red-700">{alertasCustos.length} alertas</span>
            </div>
            <div className="space-y-3">
              {alertasCustos.map((alerta, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alerta.texto}</p>
                    <p className="text-xs text-red-600">Impacto: {alerta.impacto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Margens & Resultados */}
      {visaoPrincipal === 'margens' && (
        <>
          {subVisao === 'geral' && (
            <>
              {/* Cards Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Venda Total</span>
                    <DollarSign size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currency(resumoData.find((i) => i.label === 'VENDA TOTAL')?.value || 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {(() => {
                      const helper = formatDelta(totais.faturamento, totaisAnteriores?.faturamento, 'currency');
                      return helper && (
                        <>
                          <span className={`text-base font-semibold ${
                            helper.startsWith('+') 
                              ? 'text-emerald-600 dark:text-emerald-500' 
                              : helper.startsWith('-') 
                              ? 'text-red-600 dark:text-red-500' 
                              : ''
                          }`}>
                            {helper.charAt(0)}
                          </span>
                          {helper.slice(1)}
                        </>
                      );
                    })()}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Margem de Contribuição</span>
                    <TrendingUp size={20} className="text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {percent(Math.abs(totais.margem1 || 0))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {(() => {
                      const helper = formatDelta(totais.margem1, totaisAnteriores?.margem1, 'pp');
                      return helper && (
                        <>
                          <span className={`text-base font-semibold ${
                            helper.startsWith('+') 
                              ? 'text-emerald-600 dark:text-emerald-500' 
                              : helper.startsWith('-') 
                              ? 'text-red-600 dark:text-red-500' 
                              : ''
                          }`}>
                            {helper.charAt(0)}
                          </span>
                          {helper.slice(1)}
                        </>
                      );
                    })()}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Margem Após Aquisição</span>
                    <ShieldCheck size={20} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{percent(Math.abs(totais.margem2 || 0))}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {(() => {
                      const helper = formatDelta(totais.margem2, totaisAnteriores?.margem2, 'pp');
                      return helper && (
                        <>
                          <span className={`text-base font-semibold ${
                            helper.startsWith('+') 
                              ? 'text-emerald-600 dark:text-emerald-500' 
                              : helper.startsWith('-') 
                              ? 'text-red-600 dark:text-red-500' 
                              : ''
                          }`}>
                            {helper.charAt(0)}
                          </span>
                          {helper.slice(1)}
                        </>
                      );
                    })()}
                  </p>
                </Card>
              </div>

              {/* Distribuição de Gastos + Gastos Totais */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição de Gastos:</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={distribuicaoGastosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {distribuicaoGastosData.map((entry, index) => (
                          <Cell key={`gastos-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 lg:col-span-7">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos Totais:</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={distribuicaoGastosData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="category" dataKey="name" stroke="#9ca3af" />
                      <YAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {distribuicaoGastosData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Resumo Executivo */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo Executivo:</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Clique em cada tópico para ver o detalhamento.</span>
                </div>
                <div className="space-y-2">
                  {resumoData.map((item, idx) => {
                    const colors = getGradualColor(item.type, item.percentage);
                    const bg = colors.bg;
                    const sparkData = (resumoTrendMap[item.label] || item.trend || []).map((v, i2) => ({ idx: i2, value: v }));
                    const isExpanded = expandedLinhaIndex === idx;
                    return (
                      <div key={idx}>
                        <div
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent min-h-12 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ background: bg }}
                          title={`${item.label} · ${currency(item.value)} · ${item.percentage !== null ? percent(Math.abs(item.percentage)) : ''}`}
                          onClick={() => setExpandedLinhaIndex(isExpanded ? null : idx)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2 flex-1">
                            {item.label !== 'VENDA TOTAL' && sparkData.length > 0 && (
                              <LineChart width={90} height={32} data={sparkData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                                <Line type="monotone" dataKey="value" stroke={colors.spark} strokeWidth={2} dot={false} />
                              </LineChart>
                            )}
                            {item.percentage !== null && (
                              <span className="text-sm w-16 text-center font-semibold" style={{ color: colors.text }}>
                                {percent(Math.abs(item.percentage))}
                              </span>
                            )}
                          </div>
                          <span className="font-bold flex-1 text-right" style={{ color: colors.text }}>
                            {item.type === 'negative' ? '-' : item.type === 'equal' ? '=' : '+'}{currency(Math.abs(item.value))}
                          </span>
                        </div>
                        {isExpanded && (
                          <div className="ml-4 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">{item.label}</p>
                            <p className="mb-1">Valor: <span className="font-bold" style={{ color: colors.text }}>{currency(item.value)}</span></p>
                            {item.percentage !== null && (
                              <p className="mb-2">Percentual: <span className="font-bold" style={{ color: colors.text }}>{percent(Math.abs(item.percentage))}</span></p>
                            )}
                            {detalheLinhaMap[item.label] && (
                              <div className="mt-2 space-y-1">
                                {detalheLinhaMap[item.label].map((d, i2) => (
                                  <p key={i2} className="text-xs text-gray-600 dark:text-gray-400">• {d}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Sugestão do Analista:</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Fluxo Financeiro ocultado para desenvolvimento futuro */}
              {false && (
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fluxo Financeiro</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Heatmap por linha · Bridge</span>
                  </div>
                  <div className="space-y-2">
                    {fluxoData.map((item, idx) => {
                      const colors = getGradualColor(item.type, item.percentage);
                      const bg = colors.bg;
                      const isExpanded = expandedLinhaIndex === (100 + idx);
                      return (
                        <div key={idx}>
                          <div
                            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent min-h-12 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: bg }}
                            title={`${item.label} · ${currency(item.value)} · ${item.percentage !== null ? percent(Math.abs(item.percentage)) : ''}`}
                            onClick={() => setExpandedLinhaIndex(isExpanded ? null : 100 + idx)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium" style={{ color: colors.text }}>
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 flex-1">
                              {item.label !== 'Receitas Operacionais' && ((fluxoTrendMap[item.label] || item.trend || []).length > 0) && (
                                <LineChart width={90} height={32} data={(fluxoTrendMap[item.label] || item.trend || []).map((v, i2) => ({ idx: i2, value: v }))} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                                  <Line type="monotone" dataKey="value" stroke={colors.spark} strokeWidth={2} dot={false} />
                                </LineChart>
                              )}
                              {item.percentage !== null && (
                                <span className="text-sm w-16 text-center font-semibold" style={{ color: colors.text }}>
                                  {percent(Math.abs(item.percentage))}
                                </span>
                              )}
                            </div>
                            <span className="font-bold flex-1 text-right" style={{ color: colors.text }}>
                              {item.type === 'negative' ? '-' : item.type === 'equal' ? '=' : '+'}{currency(Math.abs(item.value))}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="ml-4 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                              <p className="font-semibold text-gray-900 dark:text-white mb-2">{item.label}</p>
                              <p className="mb-1">Valor: <span className="font-bold" style={{ color: colors.text }}>{currency(item.value)}</span></p>
                              {item.percentage !== null && (
                                <p className="mb-2">Percentual: <span className="font-bold" style={{ color: colors.text }}>{percent(Math.abs(item.percentage))}</span></p>
                              )}
                              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Sugestão do Analista:</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}

          {subVisao !== 'geral' && channelSnapshot && (
            <PerformanceChannelView 
              channelData={channelSnapshot}
              previousData={channelSnapshotPrevious ?? undefined}
              windowRange={windowRange}
              expandedIndex={expandedLinhaIndex}
              onExpandToggle={setExpandedLinhaIndex}
            />
          )}
        </>
      )}
    </div>
  );
};
