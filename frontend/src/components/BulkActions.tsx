import React, { useState } from 'react';
import { CheckSquare, Trash2, Copy, Download, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import { KanbanStatus, TagTarefa } from '../types';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { ConfirmModal } from './ui/ConfirmModal';

interface BulkActionsProps {
  selectedIds: string[];
  onMove: (ids: string[], status: KanbanStatus) => void;
  onDelete: (ids: string[]) => void;
  onAssign: (ids: string[], colaboradorId: string) => void;
  onSetPriority: (ids: string[], prioridade: 'baixa' | 'media' | 'alta' | 'urgente') => void;
  onAddTag: (ids: string[], tagId: string) => void;
  onDuplicate: (ids: string[]) => void;
  onExport: (ids: string[]) => void;
  onClearSelection: () => void;
  tags: TagTarefa[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  onMove,
  onDelete,
  onAssign,
  onSetPriority,
  onAddTag,
  onDuplicate,
  onExport,
  onClearSelection,
  tags,
}) => {
  const colaboradores = useColaboradoresStore((s: any) => s.colaboradores);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 max-w-sm z-50 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-700">{selectedIds.length} selecionadas</span>
        </div>
        <button
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-2">
        {/* Mover */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onMove(selectedIds, 'a_fazer')}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200"
          >
            A Fazer
          </button>
          <button
            onClick={() => onMove(selectedIds, 'fazendo')}
            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold hover:bg-yellow-200"
          >
            Fazendo
          </button>
          <button
            onClick={() => onMove(selectedIds, 'feito')}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200"
          >
            Feito
          </button>
        </div>

        {/* Prioridade */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              onSetPriority(selectedIds, e.target.value as 'baixa' | 'media' | 'alta' | 'urgente');
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Definir prioridade...</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        {/* Atribuir */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAssign(selectedIds, e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Atribuir a...</option>
          {colaboradores.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.nome || c.name}
            </option>
          ))}
        </select>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <TagIcon size={16} className="text-gray-500" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onAddTag(selectedIds, e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Adicionar tag...</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.nome}</option>
            ))}
          </select>
        </div>

        {/* Duplica / Exporta */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDuplicate(selectedIds)}
            className="w-full px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold hover:bg-indigo-200 flex items-center justify-center gap-1"
          >
            <Copy size={14} /> Duplicar
          </button>
          <button
            onClick={() => onExport(selectedIds)}
            className="w-full px-3 py-1.5 bg-teal-100 text-teal-700 rounded text-xs font-semibold hover:bg-teal-200 flex items-center justify-center gap-1"
          >
            <Download size={14} /> Exportar
          </button>
        </div>

        {/* Deletar */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full px-3 py-1.5 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center justify-center gap-1"
        >
          <Trash2 size={14} />
          Deletar
        </button>

        <div className="flex items-start gap-2 text-xs text-gray-500">
          <AlertTriangle size={14} className="mt-0.5 text-amber-500" />
          <span>Ações afetam apenas as tarefas selecionadas.</span>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Deletar ${selectedIds.length} tarefa(s)?`}
        onConfirm={() => {
          onDelete(selectedIds);
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
};

export default BulkActions;
