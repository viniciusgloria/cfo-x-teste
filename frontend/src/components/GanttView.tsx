import React from 'react';
import { Tarefa } from '../types';

interface GanttViewProps {
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
}

export function GanttView({ tarefas, onTarefaClick }: GanttViewProps) {
  // Filtrar tarefas com datas
  const tarefasComData = tarefas.filter(t => t.dataVencimento || t.dataInicio);

  if (tarefasComData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-900/50 p-6 text-center text-gray-500 dark:text-slate-400">
        <p>Nenhuma tarefa com data para exibir na timeline</p>
      </div>
    );
  }

  // Encontrar intervalo de datas
  const datas = tarefasComData
    .flatMap(t => [t.dataInicio, t.dataVencimento].filter(Boolean))
    .map(d => new Date(d!).getTime())
    .sort((a, b) => a - b);

  const dataMin = new Date(Math.min(...datas));
  const dataMax = new Date(Math.max(...datas));

  // Calcular dias totais
  const diasTotais = Math.ceil((dataMax.getTime() - dataMin.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const calcularPosicao = (data: string | undefined) => {
    if (!data) return 0;
    const d = new Date(data).getTime();
    return ((d - dataMin.getTime()) / (dataMax.getTime() - dataMin.getTime())) * 100;
  };

  const calcularLargura = (inicio: string | undefined, fim: string | undefined) => {
    if (!inicio || !fim) return 5;
    const i = new Date(inicio).getTime();
    const f = new Date(fim).getTime();
    const intervalo = f - i;
    return Math.max((intervalo / (dataMax.getTime() - dataMin.getTime())) * 100, 2);
  };

  const statusCores = {
    a_fazer: 'bg-gray-300',
    fazendo: 'bg-blue-400',
    feito: 'bg-green-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-900/50 p-6 overflow-x-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-slate-100">Timeline de Tarefas</h3>

      {/* Timeline */}
      <div className="space-y-3">
        {tarefasComData.map((tarefa) => (
          <div key={tarefa.id} className="flex gap-3">
            {/* Título */}
            <div className="w-32 flex-shrink-0 text-sm font-medium truncate text-gray-700 dark:text-slate-300">
              {tarefa.titulo.substring(0, 20)}...
            </div>

            {/* Barra */}
            <div className="flex-1 relative h-8 bg-gray-100 dark:bg-slate-800 rounded">
              <button
                onClick={() => onTarefaClick(tarefa)}
                className={`absolute h-full rounded transition hover:shadow-md cursor-pointer text-white text-xs flex items-center justify-center ${
                  statusCores[tarefa.status]
                }`}
                style={{
                  left: `${calcularPosicao(tarefa.dataInicio || tarefa.dataVencimento)}%`,
                  width: `${calcularLargura(tarefa.dataInicio, tarefa.dataVencimento)}%`,
                  minWidth: '40px',
                }}
                title={`${tarefa.titulo} (${tarefa.status})`}
              >
                {tarefa.status === 'feito' ? '✓' : '→'}
              </button>
            </div>

            {/* Datas */}
            <div className="w-32 flex-shrink-0 text-xs text-gray-600 dark:text-slate-400">
              {tarefa.dataInicio
                ? new Date(tarefa.dataInicio).toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}{' '}
              {tarefa.dataVencimento && (
                <>
                  até{' '}
                  {new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda de período */}
      <div className="mt-6 text-xs text-gray-600 dark:text-slate-400 flex items-center gap-2">
        <span>
          {dataMin.toLocaleDateString('pt-BR')} até{' '}
          {dataMax.toLocaleDateString('pt-BR')}
        </span>
        <span className="text-gray-400 dark:text-slate-500">({diasTotais} dias)</span>
      </div>

      {/* Legenda de status */}
      <div className="mt-4 flex gap-4 text-xs text-gray-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-slate-700 rounded"></div>
          <span>A Fazer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 dark:bg-green-600 rounded"></div>
          <span>Completa</span>
        </div>
      </div>
    </div>
  );
}
