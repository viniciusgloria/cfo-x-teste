import React, { useState } from 'react';
import { Flag, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Milestone, Tarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { ConfirmModal } from './ui/ConfirmModal';

interface MetasPanelProps {
  milestones?: Milestone[];
  tarefas?: Tarefa[];
  onSelectMilestone?: (milestoneId: string) => void;
}

const MetasPanel: React.FC<MetasPanelProps> = ({
  milestones: milestonesProp,
  tarefas: tarefasProp,
  onSelectMilestone,
}) => {
  const storeMilestones = useTarefasStore((s) => s.milestones);
  const storeTarefas = useTarefasStore((s) => s.tarefas);
  
  const milestones = milestonesProp || storeMilestones;
  const tarefas = tarefasProp || storeTarefas;
  const [novoMilestone, setNovoMilestone] = useState('');
  const [novaData, setNovaData] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [dataEdicao, setDataEdicao] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const criarMilestone = useTarefasStore((s) => s.criarMilestone);
  const atualizarMilestone = useTarefasStore((s) => s.atualizarMilestone);
  const deletarMilestone = useTarefasStore((s) => s.deletarMilestone);

  const handleCriar = () => {
    if (!novoMilestone.trim() || !novaData) return;

    criarMilestone({
      titulo: novoMilestone.trim(),
      data: novaData,
      tarefaIds: [],
      cor: '#3b82f6',
    });

    setNovoMilestone('');
    setNovaData('');
  };

  const handleSalvarEdicao = (id: string) => {
    if (!textoEdicao.trim() || !dataEdicao) return;

    atualizarMilestone(id, {
      titulo: textoEdicao.trim(),
      data: dataEdicao,
    });

    setEditandoId(null);
    setTextoEdicao('');
    setDataEdicao('');
  };

  const handleDeletar = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const getMilestoneProgress = (milestone: Milestone) => {
    if (milestone.tarefaIds.length === 0) return 0;

    const tarefasDoMilestone = tarefas.filter((t) =>
      milestone.tarefaIds.includes(t.id)
    );

    const concluidas = tarefasDoMilestone.filter(
      (t) => t.status === 'feito'
    ).length;

    return Math.round((concluidas / tarefasDoMilestone.length) * 100);
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const isOverdue = (data: string) => {
    return new Date(data) < new Date() && new Date(data).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flag size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Metas</h2>
      </div>

      {/* Criar nova meta */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-3">
          <input
            type="text"
            value={novoMilestone}
            onChange={(e) => setNovoMilestone(e.target.value)}
            placeholder="Nome da meta"
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-sm"
            />
            <button
              onClick={handleCriar}
              disabled={!novoMilestone.trim() || !novaData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de metas */}
      <div className="space-y-3">
        {sortedMilestones.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhuma meta criada</p>
        ) : (
          sortedMilestones.map((milestone) => {
            const progress = getMilestoneProgress(milestone);
            const tarefasCount = milestone.tarefaIds.length;
            const isLate = isOverdue(milestone.data);

            return (
              <div
                key={milestone.id}
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  isLate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => onSelectMilestone?.(milestone.id)}
              >
                {editandoId === milestone.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="date"
                      value={dataEdicao}
                      onChange={(e) => setDataEdicao(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSalvarEdicao(milestone.id);
                        }}
                        className="flex-1 px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 flex items-center justify-center gap-1"
                      >
                        <Check size={14} />
                        Salvar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditandoId(null);
                          setTextoEdicao('');
                          setDataEdicao('');
                        }}
                        className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 flex items-center justify-center gap-1"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{milestone.titulo}</p>
                        <p className={`text-xs mt-1 ${isLate ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          {new Date(milestone.data).toLocaleDateString('pt-BR')}
                          {isLate && ' (ATRASADA)'}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditandoId(milestone.id);
                            setTextoEdicao(milestone.titulo);
                            setDataEdicao(milestone.data);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Editar"
                        >
                          <Edit2 size={14} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletar(milestone.id);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Deletar"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{tarefasCount} tarefas</span>
                        <span className="font-semibold text-gray-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Timeline visual */}
      {sortedMilestones.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cronograma</h3>
          <div className="space-y-2">
            {sortedMilestones.slice(0, 5).map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  {index < sortedMilestones.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-medium text-gray-700">{milestone.titulo}</p>
                  <p className="text-gray-500">
                    {new Date(milestone.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        title="Deseja realmente deletar esta meta?"
        onConfirm={() => {
          if (deleteTargetId) {
            deletarMilestone(deleteTargetId);
          }
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
};

export default MetasPanel;
