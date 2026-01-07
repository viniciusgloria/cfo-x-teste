import React, { useState } from 'react';
import { Tarefa } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
}

export function CalendarView({ tarefas, onTarefaClick }: CalendarViewProps) {
  const [data, setData] = useState(new Date());

  const mesAtual = data.getMonth();
  const anoAtual = data.getFullYear();

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();

  const tarefasPorData: Record<string, Tarefa[]> = {};

  tarefas.forEach((tarefa) => {
    if (tarefa.dataVencimento) {
      const data = new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR');
      if (!tarefasPorData[data]) tarefasPorData[data] = [];
      tarefasPorData[data].push(tarefa);
    }
  });

  const handleMesAnterior = () => {
    setData(new Date(anoAtual, mesAtual - 1, 1));
  };

  const handleProximoMes = () => {
    setData(new Date(anoAtual, mesAtual + 1, 1));
  };

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const dias = [];
  for (let i = 0; i < primeiroDia; i++) {
    dias.push(null);
  }
  for (let i = 1; i <= diasNoMes; i++) {
    dias.push(i);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          {nomesMeses[mesAtual]} {anoAtual}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleMesAnterior}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition text-gray-900 dark:text-slate-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleProximoMes}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition text-gray-900 dark:text-slate-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {diasSemana.map((dia) => (
          <div key={dia} className="text-center font-semibold text-gray-600 dark:text-slate-300 py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia, index) => {
          const dataFormatada =
            dia !== null
              ? new Date(anoAtual, mesAtual, dia).toLocaleDateString('pt-BR')
              : '';
          const tarefasNoDia = tarefasPorData[dataFormatada] || [];
          const ehHoje =
            dia === new Date().getDate() &&
            mesAtual === new Date().getMonth() &&
            anoAtual === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`min-h-24 p-2 rounded border-2 transition ${
                dia === null
                  ? 'bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800'
                  : ehHoje
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
              }`}
            >
              {dia !== null && (
                <>
                  <div className={`font-semibold mb-1 ${ehHoje ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-300'}`}>
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {tarefasNoDia.slice(0, 3).map((tarefa) => (
                      <button
                        key={tarefa.id}
                        onClick={() => onTarefaClick(tarefa)}
                        className={`block w-full text-left text-xs p-1 rounded truncate transition ${
                          tarefa.status === 'feito'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 line-through'
                            : tarefa.status === 'fazendo'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                        } hover:shadow-md`}
                        title={tarefa.titulo}
                      >
                        {tarefa.titulo}
                      </button>
                    ))}
                    {tarefasNoDia.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 p-1">
                        +{tarefasNoDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
