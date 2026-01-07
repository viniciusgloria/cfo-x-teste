import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { ChecklistItem } from '../types';
import { useTarefasStore } from '../store/tarefasStore';

interface TarefaChecklistProps {
  tarefaId: string;
  checklist: ChecklistItem[];
}

const TarefaChecklist: React.FC<TarefaChecklistProps> = ({ tarefaId, checklist }) => {
  const [novoItem, setNovoItem] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  const adicionarChecklistItem = useTarefasStore((s) => s.adicionarChecklistItem);
  const toggleChecklistItem = useTarefasStore((s) => s.toggleChecklistItem);
  const editarChecklistItem = useTarefasStore((s) => s.editarChecklistItem);
  const deletarChecklistItem = useTarefasStore((s) => s.deletarChecklistItem);

  const handleAdicionar = () => {
    if (!novoItem.trim()) return;
    adicionarChecklistItem(tarefaId, novoItem.trim());
    setNovoItem('');
  };

  const handleEditar = (item: ChecklistItem) => {
    setEditandoId(item.id);
    setTextoEdicao(item.texto);
  };

  const handleSalvarEdicao = (itemId: string) => {
    if (!textoEdicao.trim()) return;
    editarChecklistItem(tarefaId, itemId, textoEdicao.trim());
    setEditandoId(null);
    setTextoEdicao('');
  };

  const handleDeletar = (itemId: string) => {
    deletarChecklistItem(tarefaId, itemId);
  };

  const sortedChecklist = [...checklist].sort((a, b) => a.ordem - b.ordem);
  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.concluido).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
          <CheckSquare size={18} />
          <h3>Checklist ({completedItems}/{totalItems})</h3>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
          <div
            className="bg-emerald-500 dark:bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Lista de items */}
      <div className="space-y-2">
        {sortedChecklist.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400 italic">Nenhum item na checklist</p>
        ) : (
          sortedChecklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800 ${
                item.concluido ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleChecklistItem(tarefaId, item.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {item.concluido ? (
                  <CheckSquare size={20} className="text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Square size={20} className="text-gray-400 dark:text-slate-600" />
                )}
              </button>

              {editandoId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={textoEdicao}
                    onChange={(e) => setTextoEdicao(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSalvarEdicao(item.id);
                      if (e.key === 'Escape') {
                        setEditandoId(null);
                        setTextoEdicao('');
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSalvarEdicao(item.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                  >
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      setEditandoId(null);
                      setTextoEdicao('');
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                  >
                    <X size={16} className="text-gray-600 dark:text-slate-400" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      item.concluido ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    {item.texto}
                  </span>

                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditar(item)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                      title="Editar"
                    >
                      <Edit2 size={14} className="text-gray-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDeletar(item.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                      title="Deletar"
                    >
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Adicionar novo item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdicionar();
          }}
        />
        <button
          onClick={handleAdicionar}
          disabled={!novoItem.trim()}
          className="px-3 py-2 bg-blue-500 dark:bg-emerald-500 text-white rounded hover:bg-blue-600 dark:hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default TarefaChecklist;
