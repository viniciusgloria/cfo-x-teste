import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { KanbanStatus } from '../types';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useCargosSetoresStore } from '../store/cargosSetoresStore';

interface TarefasFilterPanelProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status?: KanbanStatus) => void;
  onColaboradorChange: (colaboradorId?: string) => void;
  onSetorChange: (setorId?: string) => void;
  onPriorityChange: (priority?: string) => void;
  searchValue: string;
  statusValue?: KanbanStatus;
  colaboradorValue?: string;
  setorValue?: string;
  priorityValue?: string;
}

const TarefasFilterPanel: React.FC<TarefasFilterPanelProps> = ({
  onSearchChange,
  onStatusChange,
  onColaboradorChange,
  onSetorChange,
  onPriorityChange,
  searchValue,
  statusValue,
  colaboradorValue,
  setorValue,
  priorityValue,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const setores = useCargosSetoresStore((s) => s.setores);

  const hasActiveFilters =
    searchValue ||
    statusValue ||
    colaboradorValue ||
    setorValue ||
    priorityValue;

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange(undefined);
    onColaboradorChange(undefined);
    onSetorChange(undefined);
    onPriorityChange(undefined);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-6 border border-transparent dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600 dark:text-slate-400" />
          <h3 className="font-semibold text-gray-700 dark:text-slate-200">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded"
            >
              <X size={14} className="inline mr-1" />
              Limpar filtros
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {isExpanded ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${isExpanded ? '' : 'hidden md:grid'}`}>
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Status */}
        <select
          value={statusValue || ''}
          onChange={(e) => onStatusChange(e.target.value ? (e.target.value as KanbanStatus) : undefined)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
        >
          <option value="">Todos os status</option>
          <option value="a_fazer">A Fazer</option>
          <option value="fazendo">Fazendo</option>
          <option value="feito">Feito</option>
        </select>

        {/* Priority */}
        <select
          value={priorityValue || ''}
          onChange={(e) => onPriorityChange(e.target.value || undefined)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
        >
          <option value="">Todas as prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        {/* Colaborador */}
        <select
          value={colaboradorValue || ''}
          onChange={(e) => onColaboradorChange(e.target.value || undefined)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
        >
          <option value="">Todos os colaboradores</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Setor */}
        <select
          value={setorValue || ''}
          onChange={(e) => onSetorChange(e.target.value || undefined)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
        >
          <option value="">Todos os setores</option>
          {setores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TarefasFilterPanel;
