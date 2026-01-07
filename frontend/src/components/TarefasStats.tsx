import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Tarefa } from '../types';

interface TarefasStatsProps {
  tarefas: Tarefa[];
}

const TarefasStats: React.FC<TarefasStatsProps> = ({ tarefas }) => {
  const stats = {
    total: tarefas.length,
    aFazer: tarefas.filter(t => t.status === 'a_fazer').length,
    fazendo: tarefas.filter(t => t.status === 'fazendo').length,
    feito: tarefas.filter(t => t.status === 'feito').length,
    atrasadas: tarefas.filter(t => {
      if (t.status === 'feito' || !t.dataVencimento) return false;
      return new Date(t.dataVencimento) < new Date();
    }).length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {/* Total */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border-l-4 border-gray-400 dark:border-slate-600 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total}</p>
          </div>
          <Circle className="text-gray-400 dark:text-slate-500" size={32} />
        </div>
      </div>

      {/* A Fazer */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border-l-4 border-red-400 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">A Fazer</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.aFazer}</p>
          </div>
          <Circle className="text-red-400" size={32} />
        </div>
      </div>

      {/* Fazendo */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border-l-4 border-yellow-400 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Fazendo</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.fazendo}</p>
          </div>
          <Clock className="text-yellow-400" size={32} />
        </div>
      </div>

      {/* Feito */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border-l-4 border-green-400 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Feito</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.feito}</p>
          </div>
          <CheckCircle2 className="text-green-400" size={32} />
        </div>
      </div>

      {/* Atrasadas */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border-l-4 border-orange-400 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Atrasadas</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.atrasadas}</p>
          </div>
          <AlertCircle className="text-orange-400" size={32} />
        </div>
      </div>
    </div>
  );
};

export default TarefasStats;
