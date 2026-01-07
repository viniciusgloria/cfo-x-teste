import React, { useState } from 'react';
import { Subtask } from '../types';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTarefasStore } from '../store/tarefasStore';

interface SubtasksEditorProps {
  tarefaId: string;
  subtasks: Subtask[];
  level?: number;
  tarefaPaiId?: string;
}

export function SubtasksEditor({
  tarefaId,
  subtasks,
  level = 0,
  tarefaPaiId,
}: SubtasksEditorProps) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [novoTexto, setNovoTexto] = useState('');

  const {
    adicionarSubtask,
    editarSubtask,
    deletarSubtask,
    toggleSubtask,
  } = useTarefasStore();

  const handleToggleExpandido = (id: string) => {
    const novo = new Set(expandidos);
    if (novo.has(id)) {
      novo.delete(id);
    } else {
      novo.add(id);
    }
    setExpandidos(novo);
  };

  const handleAdicionarSubtask = (subtaskPaiId?: string) => {
    if (!novoTexto.trim()) return;
    adicionarSubtask(tarefaId, novoTexto, subtaskPaiId);
    setNovoTexto('');
  };

  const handleEditarSubtask = (id: string, novoTitulo: string) => {
    if (!novoTitulo.trim()) return;
    editarSubtask(tarefaId, id, novoTitulo, tarefaPaiId);
    setEditandoId(null);
    setEditandoTexto('');
  };

  const handleDeletarSubtask = (id: string) => {
    deletarSubtask(tarefaId, id, tarefaPaiId);
  };

  const handleToggleSubtask = (id: string) => {
    toggleSubtask(tarefaId, id, tarefaPaiId);
  };

  if (level > 3) return null; // Limitar profundidade

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-4 border-l-2 border-gray-200 dark:border-slate-700 pl-4' : ''}`}>
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="space-y-1">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800 group">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={subtask.concluido}
              onChange={() => handleToggleSubtask(subtask.id)}
              className="w-4 h-4 cursor-pointer"
            />

            {/* Expand/Collapse */}
            {subtask.subtasks && subtask.subtasks.length > 0 ? (
              <button
                onClick={() => handleToggleExpandido(subtask.id)}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition text-gray-700 dark:text-slate-300"
              >
                {expandidos.has(subtask.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Texto */}
            {editandoId === subtask.id ? (
              <input
                type="text"
                value={editandoTexto}
                onChange={(e) => setEditandoTexto(e.target.value)}
                onBlur={() => handleEditarSubtask(subtask.id, editandoTexto)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditarSubtask(subtask.id, editandoTexto);
                  if (e.key === 'Escape') setEditandoId(null);
                }}
                autoFocus
                className="flex-1 px-2 py-1 border border-blue-400 dark:border-emerald-500 rounded text-sm focus:outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            ) : (
              <span
                onClick={() => {
                  setEditandoId(subtask.id);
                  setEditandoTexto(subtask.titulo);
                }}
                className={`flex-1 text-sm cursor-pointer px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800 ${
                  subtask.concluido ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-200'
                }`}
              >
                {subtask.titulo}
              </span>
            )}

            {/* Ações */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDeletarSubtask(subtask.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition"
                title="Deletar subtask"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtasks aninhadas */}
          {subtask.subtasks && subtask.subtasks.length > 0 && expandidos.has(subtask.id) && (
            <SubtasksEditor
              tarefaId={tarefaId}
              subtasks={subtask.subtasks}
              level={level + 1}
              tarefaPaiId={subtask.id}
            />
          )}

          {/* Adicionar subtask aninhada */}
          {expandidos.has(subtask.id) && level < 3 && (
            <div className="ml-8 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nova subtask..."
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdicionarSubtask(subtask.id);
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={() => handleAdicionarSubtask(subtask.id)}
                className="p-1 bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Adicionar subtask no nível atual */}
      {level === 0 && (
        <div className="flex gap-2 items-center mt-3 pt-2 border-t border-gray-200 dark:border-slate-700">
          <input
            type="text"
            placeholder="+ Adicionar subtask..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdicionarSubtask();
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => handleAdicionarSubtask()}
            disabled={!novoTexto.trim()}
            className="px-3 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 transition text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
