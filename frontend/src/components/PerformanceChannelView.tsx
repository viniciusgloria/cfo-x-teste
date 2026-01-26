import { useMemo } from 'react';
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
  LineChart,
  Line
} from 'recharts';
import { Card } from './ui/Card';
import { DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';
import { CpaChannelSnapshot } from '../types/performance';

interface PerformanceChannelViewProps {
  channelData: CpaChannelSnapshot;
  previousData?: CpaChannelSnapshot;
  windowRange?: 'today' | 'yesterday' | '7d' | 'custom';
  expandedIndex: number | null;
  onExpandToggle: (index: number | null) => void;
}

const currency = (value?: number) => {
  const safe = Number.isFinite(value as number) ? (value as number) : 0;
  return safe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

const percent = (value: number) => `${value.toFixed(1)}%`;

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

const formatDelta = (
  current: number,
  previous: number | null | undefined,
  type: 'currency' | 'number' | 'percent' | 'pp',
  windowRange: 'today' | 'yesterday' | '7d' | 'custom' = 'today'
) => {
  if (previous === null || previous === undefined) return 'Sem comparativo disponível';
  if (!Number.isFinite(previous) || previous === 0) return 'Sem base anterior';
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '-';
  const spanLabel = (() => {
    if (windowRange === 'today') return 'vs ontem';
    if (windowRange === 'yesterday') return 'vs anteontem';
    if (windowRange === '7d') return 'vs semana anterior';
    if (windowRange === 'custom') return 'vs período anterior';
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

const getGradualColor = (type: 'positive' | 'negative' | 'equal', percentage: number | null) => {
  const pct = percentage ? Math.min(100, Math.abs(percentage)) / 100 : 0.5;
  
  if (type === 'positive') {
    return {
      bg: `rgba(34, 197, 94, ${0.08 + pct * 0.12})`,
      text: '#16a34a',
      spark: '#22c55e'
    };
  } else if (type === 'negative') {
    return {
      bg: `rgba(239, 68, 68, ${0.08 + pct * 0.12})`,
      text: '#dc2626',
      spark: '#ef4444'
    };
  }
  return {
    bg: 'rgba(148, 163, 184, 0.08)',
    text: '#64748b',
    spark: '#94a3b8'
  };
};

export function PerformanceChannelView({
  channelData,
  previousData,
  windowRange = 'today',
  expandedIndex,
  onExpandToggle
}: PerformanceChannelViewProps) {
  // Dados para distribuição de gastos
  const distribuicaoGastosData = useMemo(() => {
    const gastos = channelData.distribuicaoGastos;
    return [
      { name: 'Marketing', value: gastos.marketing, color: '#3b82f6' },
      { name: 'Operacional', value: gastos.operacional, color: '#10b981' },
      { name: 'Administrativo', value: gastos.administrativo, color: '#f59e0b' },
      { name: 'Outro', value: gastos.outro, color: '#8b5cf6' }
    ];
  }, [channelData.distribuicaoGastos]);

  // Resumo executivo com dados do canal
  const resumoData = useMemo(() => {
    const totalGastos = Object.values(channelData.distribuicaoGastos).reduce((a, b) => a + b, 0);
    return [
      {
        label: 'VENDA TOTAL',
        value: channelData.faturamento,
        type: 'positive' as const,
        percentage: 5.2,
        trend: [65000, 78000, 82000, 92000, 96000, 105000, 185000]
      },
      {
        label: 'Margem de Contribuição',
        value: Math.round(channelData.faturamento * (channelData.margemContribuicao / 100)),
        type: 'positive' as const,
        percentage: 2.1,
        trend: [18000, 22000, 26000, 29000, 31000, 33000, 51800]
      },
      {
        label: 'Margem Após Aquisição',
        value: Math.round(channelData.faturamento * (channelData.margemAposAquisicao / 100)),
        type: 'positive' as const,
        percentage: 1.5,
        trend: [10000, 13000, 17000, 19000, 21000, 22000, 33300]
      },
      {
        label: 'Custo de Produtos',
        value: channelData.custoProdutos,
        type: 'negative' as const,
        percentage: 0.3,
        trend: [15000, 18000, 21000, 25000, 28000, 32000, 68000]
      },
      {
        label: 'Custos Variáveis',
        value: channelData.custosVariaveis,
        type: 'negative' as const,
        percentage: -1.2,
        trend: [5000, 6000, 7000, 8000, 9000, 10000, 15500]
      },
      {
        label: 'Gastos Operacionais',
        value: totalGastos,
        type: 'negative' as const,
        percentage: 3.8,
        trend: [5000, 8000, 10000, 12000, 14000, 16000, 62000]
      },
      {
        label: 'Lucro Líquido',
        value: channelData.lucroLiquido,
        type: 'positive' as const,
        percentage: 8.5,
        trend: [40000, 46000, 44000, 47000, 45000, 47000, 24500]
      }
    ];
  }, [channelData]);

  return (
    <>
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Venda Total</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {currency(channelData.faturamento)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {(() => {
              const helper = formatDelta(channelData.faturamento, previousData?.faturamento, 'currency', windowRange);
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
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Margem de Contribuição
            </span>
            <TrendingUp size={20} className="text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {percent(channelData.margemContribuicao)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {(() => {
              const helper = formatDelta(channelData.margemContribuicao, previousData?.margemContribuicao, 'pp', windowRange);
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
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Margem Após Aquisição
            </span>
            <ShieldCheck size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {percent(channelData.margemAposAquisicao)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {(() => {
              const helper = formatDelta(channelData.margemAposAquisicao, previousData?.margemAposAquisicao, 'pp', windowRange);
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição de Gastos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoGastosData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos Totais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={distribuicaoGastosData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo Executivo</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Clique em cada tópico para ver o detalhamento.
          </span>
        </div>
        <div className="space-y-2">
          {resumoData.map((item, idx) => {
            const colors = getGradualColor(item.type, item.percentage);
            const bg = colors.bg;
            const sparkData = (item.trend || []).map((v, i2) => ({ idx: i2, value: v }));
            const isExpanded = expandedIndex === idx;

            return (
              <div key={idx}>
                <div
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent min-h-12 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: bg }}
                  title={`${item.label} · ${currency(item.value)} · ${item.percentage !== null ? percent(Math.abs(item.percentage)) : ''}`}
                  onClick={() => onExpandToggle(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium" style={{ color: colors.text }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-1">
                    {item.label !== 'VENDA TOTAL' && sparkData.length > 0 && (
                      <LineChart
                        width={90}
                        height={32}
                        data={sparkData}
                        margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
                      >
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={colors.spark}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    )}
                    {item.percentage !== null && item.label !== 'VENDA TOTAL' && (
                      <span className="text-sm w-16 text-center font-semibold" style={{ color: colors.text }}>
                        {percent(Math.abs(item.percentage))}
                      </span>
                    )}
                  </div>
                  <span className="font-bold flex-1 text-right" style={{ color: colors.text }}>
                    {item.type === 'negative' ? '-' : item.type === 'positive' ? '+' : '='}
                    {currency(Math.abs(item.value))}
                  </span>
                </div>
                {isExpanded && (
                  <div className="ml-4 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{item.label}</p>
                    <p className="mb-1">
                      Valor:{' '}
                      <span className="font-bold" style={{ color: colors.text }}>
                        {currency(item.value)}
                      </span>
                    </p>
                    {item.percentage !== null && (
                      <p className="mb-2">
                        Variação:{' '}
                        <span className="font-bold" style={{ color: colors.text }}>
                          {percent(Math.abs(item.percentage))}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
