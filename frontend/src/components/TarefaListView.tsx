import React from 'react';
import { Trash2, Edit2, Eye, Copy, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { Tarefa } from '../types';
import TarefaStatusBadge from './TarefaStatusBadge';

interface TarefaListViewProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleWatcher: (id: string) => void;
  watcherIds?: string[];
}

const TarefaListView: React.FC<TarefaListViewProps> = ({
  tarefas,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleWatcher,
  watcherIds = [],
}) => {
  const priorityColors: Record<string, string> = {
    urgente: 'text-red-600 bg-red-50',
    alta: 'text-orange-600 bg-orange-50',
    media: 'text-yellow-600 bg-yellow-50',
    baixa: 'text-blue-600 bg-blue-50',
  };

  const statusLabels: Record<string, string> = {
    a_fazer: 'A Fazer',
    fazendo: 'Fazendo',
    feito: 'Feito',
  };

  const statusColors: Record<string, string> = {
    a_fazer: 'text-red-600 bg-red-50',
    fazendo: 'text-yellow-600 bg-yellow-50',
    feito: 'text-green-600 bg-green-50',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-800 border-b-2 border-gray-300 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Título</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 w-32">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 w-24">Prioridade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 w-32">Vencimento</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200 w-20">Checklist</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200 w-20">Comentários</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200 w-20">Anexos</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200 w-28">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tarefas.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                Nenhuma tarefa encontrada
              </td>
            </tr>
          ) : (
            tarefas.map((tarefa) => {
              const checklistCompleted = tarefa.checklist?.filter((item) => item.concluido).length || 0;
              const checklistTotal = tarefa.checklist?.length || 0;

              return (
                <tr
                  key={tarefa.id}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => onEdit(tarefa)}
                >
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className={`font-medium ${tarefa.status === 'feito' ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-900 dark:text-slate-100'}`}>
                        {tarefa.titulo}
                      </p>
                      {tarefa.descricao && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 mt-1">{tarefa.descricao}</p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[tarefa.status]} dark:bg-opacity-20`}>
                      {statusLabels[tarefa.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[tarefa.prioridade]} dark:bg-opacity-20`}>
                      {tarefa.prioridade}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {tarefa.dataVencimento ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-slate-100">{new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR')}</span>
                        <TarefaStatusBadge
                          dataVencimento={tarefa.dataVencimento}
                          status={tarefa.status}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">Sem data</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-sm">
                    {checklistTotal > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <CheckSquare size={16} className="text-blue-500 dark:text-blue-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-slate-100">{checklistCompleted}/{checklistTotal}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-sm">
                    {tarefa.comentarios && tarefa.comentarios.length > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare size={16} className="text-gray-600 dark:text-slate-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-slate-100">{tarefa.comentarios.length}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-sm">
                    {tarefa.anexos && tarefa.anexos.length > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Paperclip size={16} className="text-gray-600 dark:text-slate-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-slate-100">{tarefa.anexos.length}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatcher(tarefa.id);
                        }}
                        className={`p-1.5 hover:bg-gray-200 rounded ${
                          watcherIds.includes(tarefa.id) ? 'text-blue-600' : 'text-gray-600'
                        }`}
                        title="Seguir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(tarefa.id);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(tarefa);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Deseja realmente deletar esta tarefa?')) {
                            onDelete(tarefa.id);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded text-red-600"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TarefaListView;
