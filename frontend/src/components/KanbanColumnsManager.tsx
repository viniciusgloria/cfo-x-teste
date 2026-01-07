import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, GripVertical, RotateCcw } from 'lucide-react';
import { useTarefasStore } from '../store/tarefasStore';
import { KanbanColumn } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from './ui/ConfirmModal';

interface KanbanColumnsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KanbanColumnsManager: React.FC<KanbanColumnsManagerProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const kanbanColumns = useTarefasStore((s) => s.kanbanColumns);
  const criarColuna = useTarefasStore((s) => s.criarColuna);
  const atualizarColuna = useTarefasStore((s) => s.atualizarColuna);
  const deletarColuna = useTarefasStore((s) => s.deletarColuna);
  const reordenarColunas = useTarefasStore((s) => s.reordenarColunas);
  const resetarColunasKanban = useTarefasStore((s) => s.resetarColunasKanban);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novaColuna, setNovaColuna] = useState({ nome: '', cor: '#3B82F6' });
  const [colunaParaDeletar, setColunaParaDeletar] = useState<KanbanColumn | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const colunasOrdenadas = [...kanbanColumns].sort((a, b) => a.ordem - b.ordem);

  const handleCriar = () => {
    if (!novaColuna.nome.trim()) {
      addToast('Digite um nome para a coluna', 'error');
      return;
    }

    criarColuna({
      nome: novaColuna.nome,
      cor: novaColuna.cor,
      ordem: kanbanColumns.length,
      isPadrao: false,
    });

    setNovaColuna({ nome: '', cor: '#3B82F6' });
    addToast('Coluna criada com sucesso!', 'success');
  };

  const handleAtualizar = (id: string, nome: string, cor: string) => {
    if (!nome.trim()) {
      addToast('O nome não pode estar vazio', 'error');
      return;
    }

    atualizarColuna(id, { nome, cor });
    setEditandoId(null);
    addToast('Coluna atualizada!', 'success');
  };

  const handleDeletar = () => {
    if (!colunaParaDeletar) return;

    if (colunaParaDeletar.isPadrao) {
      addToast('Não é possível deletar colunas padrão', 'error');
      setColunaParaDeletar(null);
      return;
    }

    deletarColuna(colunaParaDeletar.id);
    addToast('Coluna deletada. Tarefas movidas para "A Fazer"', 'success');
    setColunaParaDeletar(null);
  };

  const handleResetar = () => {
    resetarColunasKanban();
    addToast('Colunas resetadas para o padrão', 'success');
    setShowResetConfirm(false);
  };

  const handleDragStart = (e: React.DragEvent, colunaId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colunaId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetOrdem: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    reordenarColunas(draggedId, targetOrdem);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Gerenciar Colunas Kanban</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Personalize as colunas do seu quadro Kanban
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Nova Coluna */}
            <div className="bg-blue-50 dark:bg-slate-900/60 p-4 rounded-lg border border-blue-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Plus size={18} />
                Nova Coluna
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={novaColuna.nome}
                  onChange={(e) => setNovaColuna({ ...novaColuna, nome: e.target.value })}
                  placeholder="Nome da coluna"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  onKeyPress={(e) => e.key === 'Enter' && handleCriar()}
                />
                <input
                  type="color"
                  value={novaColuna.cor}
                  onChange={(e) => setNovaColuna({ ...novaColuna, cor: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border"
                />
                <button
                  onClick={handleCriar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>

            {/* Lista de Colunas */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Colunas Existentes</h3>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw size={16} />
                  Resetar para Padrão
                </button>
              </div>

              <div className="space-y-2">
                {colunasOrdenadas.map((coluna) => (
                  <div
                    key={coluna.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, coluna.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, coluna.ordem)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg/10 transition-shadow cursor-move"
                  >
                    {editandoId === coluna.id ? (
                      <EditColunaForm
                        coluna={coluna}
                        onSave={(nome, cor) => handleAtualizar(coluna.id, nome, cor)}
                        onCancel={() => setEditandoId(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <GripVertical size={20} className="text-gray-400" />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: coluna.cor }}
                        />
                        <span className="flex-1 font-medium text-gray-800">{coluna.nome}</span>
                        {coluna.isPadrao && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Padrão
                          </span>
                        )}
                        <button
                          onClick={() => setEditandoId(coluna.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setColunaParaDeletar(coluna)}
                          disabled={coluna.isPadrao}
                          className={`p-2 rounded transition-colors ${
                            coluna.isPadrao
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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

      {/* Confirm Delete Modal */}
      {colunaParaDeletar && (
        <ConfirmModal
          isOpen={!!colunaParaDeletar}
          onClose={() => setColunaParaDeletar(null)}
          onConfirm={handleDeletar}
          title="Deletar Coluna"
          message={`Tem certeza que deseja deletar a coluna "${colunaParaDeletar.nome}"? As tarefas desta coluna serão movidas para "A Fazer".`}
          confirmText="Deletar"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetar}
        title="Resetar Colunas"
        message="Tem certeza que deseja resetar as colunas para o padrão? Todas as colunas personalizadas serão removidas e as tarefas serão movidas para as colunas padrão."
        confirmText="Resetar"
        cancelText="Cancelar"
        type="warning"
      />
    </>
  );
};

interface EditColunaFormProps {
  coluna: KanbanColumn;
  onSave: (nome: string, cor: string) => void;
  onCancel: () => void;
}

const EditColunaForm: React.FC<EditColunaFormProps> = ({ coluna, onSave, onCancel }) => {
  const [nome, setNome] = useState(coluna.nome);
  const [cor, setCor] = useState(coluna.cor);

  const handleSave = () => {
    if (nome.trim()) {
      onSave(nome, cor);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
      />
      <input
        type="color"
        value={cor}
        onChange={(e) => setCor(e.target.value)}
        className="w-16 h-10 rounded-lg cursor-pointer border"
      />
      <button
        onClick={handleSave}
        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        Salvar
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
      >
        Cancelar
      </button>
    </div>
  );
};
