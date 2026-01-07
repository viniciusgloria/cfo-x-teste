import React, { useMemo } from 'react';
import { X, TrendingUp, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { Tarefa } from '../types';
import { useColaboradoresStore } from '../store/colaboradoresStore';

interface MetricasColaborador {
  id: string;
  nome: string;
  total: number;
  concluidas: number;
  emAndamento: number;
  atrasadas: number;
  horasTrabalhadas: number;
  taxaConclusao: number;
  urgentes: number;
  altas: number;
  score: number;
}

interface RelatorioProductividadeProps {
  isOpen: boolean;
  onClose: () => void;
  tarefas: Tarefa[];
}

export const RelatorioProductividade: React.FC<RelatorioProductividadeProps> = ({
  isOpen,
  onClose,
  tarefas,
}) => {
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);

  const metricas = useMemo(() => {
    if (!colaboradores || !Array.isArray(colaboradores)) return [];
    
    const relatorio: MetricasColaborador[] = colaboradores.map((colab) => {
      const colabId = String(colab.id);
      const tarefasDoColab = tarefas.filter(t => t.colaboradorIds.includes(colabId));
      
      const total = tarefasDoColab.length;
      const concluidas = tarefasDoColab.filter(t => t.status === 'feito').length;
      const emAndamento = tarefasDoColab.filter(t => t.status === 'fazendo').length;
      const atrasadas = tarefasDoColab.filter(t => 
        t.dataVencimento && 
        new Date(t.dataVencimento) < new Date() && 
        t.status !== 'feito'
      ).length;
      const horasTrabalhadas = tarefasDoColab.reduce((sum, t) => sum + (t.tempoTotalHoras || 0), 0);
      const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;
      
      // Calcular tarefas por prioridade
      const urgentes = tarefasDoColab.filter(t => t.prioridade === 'urgente' && t.status !== 'feito').length;
      const altas = tarefasDoColab.filter(t => t.prioridade === 'alta' && t.status !== 'feito').length;

      // Score normalizado entre 0-100
      const baseScore = taxaConclusao; // 0-100 base
      const bonusUrgentes = Math.min(concluidas * 5, 20); // até +20 por conclusões
      const penaltyAtrasadas = Math.min(atrasadas * 10, 30); // até -30 por atrasos
      const score = Math.max(0, Math.min(100, baseScore + (bonusUrgentes / 2) - (penaltyAtrasadas / 3)));

      return {
        id: colabId,
        nome: colab.nomeCompleto || colab.nome || colab.name || `Colaborador ${colabId}`,
        total,
        concluidas,
        emAndamento,
        atrasadas,
        horasTrabalhadas,
        taxaConclusao,
        urgentes,
        altas,
        score,
      };
    });

    return relatorio
      .filter((r: MetricasColaborador) => r.total > 0)
      .sort((a: MetricasColaborador, b: MetricasColaborador) => b.score - a.score);
  }, [tarefas, colaboradores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={28} />
              Relatório de Produtividade
            </h2>
            <p className="text-sm text-blue-100 mt-1">Visão geral do desempenho por colaborador</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-900 dark:text-slate-100">
          {metricas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
              <p>Nenhum dado de produtividade disponível</p>
              <p className="text-sm mt-2">Atribua tarefas aos colaboradores para gerar métricas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cards de métricas gerais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-slate-900/70 p-4 rounded-lg border border-blue-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total de Tarefas</p>
                      <p className="text-2xl font-bold text-blue-700">{tarefas.length}</p>
                    </div>
                    <CheckCircle size={32} className="text-blue-400" />
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-slate-900/70 p-4 rounded-lg border border-green-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Concluídas</p>
                      <p className="text-2xl font-bold text-green-700">
                        {tarefas.filter(t => t.status === 'feito').length}
                      </p>
                    </div>
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-slate-900/70 p-4 rounded-lg border border-yellow-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Em Andamento</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {tarefas.filter(t => t.status === 'fazendo').length}
                      </p>
                    </div>
                    <Clock size={32} className="text-yellow-400" />
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-slate-900/70 p-4 rounded-lg border border-red-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Atrasadas</p>
                      <p className="text-2xl font-bold text-red-700">
                        {metricas.reduce((sum: number, m: MetricasColaborador) => sum + m.atrasadas, 0)}
                      </p>
                    </div>
                    <AlertCircle size={32} className="text-red-400" />
                  </div>
                </div>
              </div>

              {/* Tabela de colaboradores */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-800 border-b-2 border-gray-300 dark:border-slate-700">
                      <th className="text-left p-3 font-semibold text-gray-700">#</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Colaborador</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Total</th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        <span className="flex items-center justify-center gap-1">
                          <CheckCircle size={16} className="text-green-600" />
                          Concluídas
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        <span className="flex items-center justify-center gap-1">
                          <Clock size={16} className="text-yellow-600" />
                          Em Andamento
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        <span className="flex items-center justify-center gap-1">
                          <AlertCircle size={16} className="text-red-600" />
                          Atrasadas
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        <span className="flex items-center justify-center gap-1">
                          🔴 Altas
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        <span className="flex items-center justify-center gap-1">
                          🔥 Urgentes
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">Horas</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Taxa Conclusão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.map((metrica: MetricasColaborador, index: number) => (
                      <tr 
                        key={metrica.id} 
                        className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-blue-50' : ''}`}
                      >
                        <td className="p-3 text-center">
                          {index === 0 && <span className="text-xl">🥇</span>}
                          {index === 1 && <span className="text-xl">🥈</span>}
                          {index === 2 && <span className="text-xl">🥉</span>}
                          {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                        </td>
                        <td className="p-3 font-medium text-gray-800">{metrica.nome}</td>
                        <td className="p-3 text-center font-semibold">{metrica.total}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                            {metrica.concluidas}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">
                            {metrica.emAndamento}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded font-semibold ${
                            metrica.atrasadas > 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {metrica.atrasadas}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded font-semibold ${
                            metrica.altas > 0 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {metrica.altas}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded font-semibold ${
                            metrica.urgentes > 0 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {metrica.urgentes}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold text-blue-600">
                          {metrica.horasTrabalhadas.toFixed(1)}h
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${metrica.taxaConclusao}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {metrica.taxaConclusao}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-slate-900/80 border-gray-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
