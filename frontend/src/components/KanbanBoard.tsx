import React, { useState } from 'react';
import { Plus, Trash2, Clock, User } from 'lucide-react';
import { Tarefa, KanbanStatus } from '../types';

interface KanbanBoardProps {
  tarefas: Tarefa[];
  onMoverTarefa: (tarefaId: string, novoStatus: KanbanStatus) => void;
  onAbrirTarefa: (tarefaId: string) => void;
  onDeletarTarefa: (tarefaId: string) => void;
  onAdicionarTarefa: (status: KanbanStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tarefas,
  onMoverTarefa,
  onAbrirTarefa,
  onDeletarTarefa,
  onAdicionarTarefa,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const statusConfig: Record<KanbanStatus, { label: string; cor: string; bg: string }> = {
    a_fazer: { label: 'A Fazer', cor: 'bg-gray-100', bg: 'bg-red-50' },
    fazendo: { label: 'Fazendo', cor: 'bg-yellow-100', bg: 'bg-yellow-50' },
    feito: { label: 'Feito', cor: 'bg-green-100', bg: 'bg-green-50' },
  };

  const tarefasPorStatus: Record<KanbanStatus, Tarefa[]> = {
    a_fazer: [],
    fazendo: [],
    feito: [],
  };

  tarefas.forEach((t) => {
    tarefasPorStatus[t.status].push(t);
  });

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'border-red-500 bg-red-50';
      case 'alta':
        return 'border-orange-500 bg-orange-50';
      case 'media':
        return 'border-yellow-500 bg-yellow-50';
      case 'baixa':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const TarefaCard: React.FC<{ tarefa: Tarefa }> = ({ tarefa }) => (
    <div
      draggable
      onDragStart={() => setDraggedTaskId(tarefa.id)}
      onDragEnd={() => setDraggedTaskId(null)}
      onClick={() => onAbrirTarefa(tarefa.id)}
      className={`p-3 rounded-lg border-l-4 cursor-move hover:shadow-md transition-shadow ${getPrioridadeColor(
        tarefa.prioridade
      )}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{tarefa.titulo}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeletarTarefa(tarefa.id);
          }}
          className="text-gray-400 hover:text-red-600 flex-shrink-0"
          title="Deletar tarefa"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{tarefa.descricao}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {tarefa.tags.slice(0, 2).map((tag) => (
          <span
            key={tag.id}
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: tag.cor || '#e5e7eb', opacity: 0.7 }}
          >
            {tag.nome}
          </span>
        ))}
        {tarefa.tags.length > 2 && (
          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
            +{tarefa.tags.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 border-t pt-2">
        {tarefa.tempoTotalHoras > 0 && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{tarefa.tempoTotalHoras}h</span>
          </div>
        )}
        {tarefa.colaboradorIds.length > 0 && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{tarefa.colaboradorIds.length}</span>
          </div>
        )}
      </div>
    </div>
  );

  const DropZone: React.FC<{ status: KanbanStatus; tarefas: Tarefa[] }> = ({
    status,
    tarefas: taskList,
  }) => (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-100');
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove('bg-blue-100');
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-blue-100');
        if (draggedTaskId) {
          onMoverTarefa(draggedTaskId, status);
          setDraggedTaskId(null);
        }
      }}
      className={`flex-1 p-4 rounded-lg border-2 border-dashed border-gray-300 transition-colors min-h-[500px] ${statusConfig[status].bg}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">
          {statusConfig[status].label}
          <span className="ml-2 text-sm text-gray-500">({taskList.length})</span>
        </h3>
        <button
          onClick={() => onAdicionarTarefa(status)}
          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-white rounded"
          title={`Adicionar nova tarefa em ${statusConfig[status].label}`}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {taskList.map((tarefa) => (
          <TarefaCard key={tarefa.id} tarefa={tarefa} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.keys(statusConfig) as KanbanStatus[]).map((status) => (
        <DropZone key={status} status={status} tarefas={tarefasPorStatus[status]} />
      ))}
    </div>
  );
};

export default KanbanBoard;
