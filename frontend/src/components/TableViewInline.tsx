import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, CheckSquare, MessageSquare, Paperclip, Calendar, Users, Flag } from 'lucide-react';
import { Tarefa, KanbanStatus } from '../types';
import TarefaStatusBadge from './TarefaStatusBadge';

interface TableViewInlineProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTarefaChange: (id: string, updates: Partial<Tarefa>) => void;
  colaboradores?: Array<{ id: string; nome: string }>;
}

const TableViewInline: React.FC<TableViewInlineProps> = ({
  tarefas,
  onEdit,
  onDelete,
  onDuplicate,
  onTarefaChange,
  colaboradores = [],
}) => {
  const [editingCell, setEditingCell] = useState<{ tarefaId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const priorityColors: Record<string, string> = {
    urgente: 'text-red-600 bg-red-50 border border-red-200',
    alta: 'text-orange-600 bg-orange-50 border border-orange-200',
    media: 'text-yellow-600 bg-yellow-50 border border-yellow-200',
    baixa: 'text-blue-600 bg-blue-50 border border-blue-200',
  };

  const startEdit = (tarefaId: string, field: string, currentValue: any) => {
    setEditingCell({ tarefaId, field });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = (tarefaId: string, field: string) => {
    if (editValue.trim()) {
      onTarefaChange(tarefaId, { [field]: editValue });
    }
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, tarefaId: string, field: string) => {
    if (e.key === 'Enter') {
      saveEdit(tarefaId, field);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const isEditing = (tarefaId: string, field: string) =>
    editingCell?.tarefaId === tarefaId && editingCell?.field === field;

  const formatarData = (data?: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Status</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-28">Prioridade</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32">Vencimento</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">Colaboradores</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tarefas.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Nenhuma tarefa encontrada
              </td>
            </tr>
          ) : (
            tarefas.map((tarefa) => (
              <tr
                key={tarefa.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Título - Editável */}
                <td className="px-4 py-3 text-sm">
                  {isEditing(tarefa.id, 'titulo') ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, tarefa.id, 'titulo')}
                      onBlur={() => saveEdit(tarefa.id, 'titulo')}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <div
                      onClick={() => startEdit(tarefa.id, 'titulo', tarefa.titulo)}
                      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded font-medium text-gray-900"
                    >
                      {tarefa.titulo}
                    </div>
                  )}
                </td>

                {/* Status - Dropdown */}
                <td className="px-4 py-3 text-sm">
                  {isEditing(tarefa.id, 'status') ? (
                    <select
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        onTarefaChange(tarefa.id, { status: editValue as KanbanStatus });
                        cancelEdit();
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="a_fazer">A Fazer</option>
                      <option value="fazendo">Fazendo</option>
                      <option value="feito">Feito</option>
                    </select>
                  ) : (
                    <div
                      onClick={() => startEdit(tarefa.id, 'status', tarefa.status)}
                      className="cursor-pointer"
                    >
                      <TarefaStatusBadge status={tarefa.status} />
                    </div>
                  )}
                </td>

                {/* Prioridade - Dropdown */}
                <td className="px-4 py-3 text-sm text-center">
                  {isEditing(tarefa.id, 'prioridade') ? (
                    <select
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        onTarefaChange(tarefa.id, { prioridade: editValue });
                        cancelEdit();
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  ) : (
                    <div
                      onClick={() => startEdit(tarefa.id, 'prioridade', tarefa.prioridade)}
                      className={`cursor-pointer inline-block px-2 py-1 rounded font-medium flex items-center gap-1 justify-center ${
                        priorityColors[tarefa.prioridade] || priorityColors['media']
                      }`}
                    >
                      <Flag size={14} />
                      {tarefa.prioridade?.charAt(0).toUpperCase() + tarefa.prioridade?.slice(1)}
                    </div>
                  )}
                </td>

                {/* Vencimento - Date Input */}
                <td className="px-4 py-3 text-sm text-center">
                  {isEditing(tarefa.id, 'dataVencimento') ? (
                    <input
                      ref={inputRef}
                      type="date"
                      value={
                        editValue
                          ? new Date(editValue).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, tarefa.id, 'dataVencimento')}
                      onBlur={() => {
                        if (editValue) {
                          onTarefaChange(tarefa.id, {
                            dataVencimento: new Date(editValue).toISOString(),
                          });
                        }
                        cancelEdit();
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <div
                      onClick={() => startEdit(tarefa.id, 'dataVencimento', tarefa.dataVencimento)}
                      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-2 justify-center text-gray-700"
                    >
                      <Calendar size={16} />
                      {formatarData(tarefa.dataVencimento)}
                    </div>
                  )}
                </td>

                {/* Colaboradores - Multi-select */}
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {tarefa.colaboradorIds.length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      tarefa.colaboradorIds.map((colabId) => {
                        const colab = colaboradores.find((c) => c.id === colabId);
                        return (
                          <span key={colabId} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            {colab?.nome?.split(' ')[0] || 'Colab'}
                          </span>
                        );
                      })
                    )}
                  </div>
                </td>

                {/* Ações */}
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => onEdit(tarefa)}
                      title="Editar detalhes"
                      className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button
                      onClick={() => onDuplicate(tarefa.id)}
                      title="Duplicar"
                      className="p-1.5 hover:bg-green-100 rounded text-green-600 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(tarefa.id)}
                      title="Deletar"
                      className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableViewInline;
