import React, { useState } from 'react';
import { Edit2, Trash2, Clock, Users, Tag, TrendingUp, Eye, Copy, Flag, Repeat } from 'lucide-react';
import { Tarefa } from '../types';
import { useOKRsStore } from '../store/okrsStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { useTarefasStore } from '../store/tarefasStore';
import { ConfirmModal } from './ui/ConfirmModal';
import TarefaStatusBadge from './TarefaStatusBadge';
import { BloqueadorIndicador } from './BloqueadorIndicador';
import { SubtasksProgress } from './SubtasksProgress';

// Função utilitária para conversão de horas
const horasParaHHMM = (horasDecimais: number): string => {
  const horas = Math.floor(horasDecimais);
  const minutos = Math.round((horasDecimais - horas) * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
};

interface TarefaCardProps {
  tarefa: Tarefa;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  setorColorMap?: Record<string, string>;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleWatcher?: (id: string) => void;
  onRepeat?: (id: string) => void;
  onOpenTimesheet?: (id: string) => void;
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  baixa: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  alta: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  urgente: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const priorityBorderColors: Record<string, string> = {
  baixa: 'border-l-blue-500',
  media: 'border-l-yellow-500',
  alta: 'border-l-orange-500',
  urgente: 'border-l-red-500',
};

const TarefaCard: React.FC<TarefaCardProps> = ({
  tarefa,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  // setorColorMap = {},
  isSelected = false,
  onSelect,
  onDuplicate,
  onToggleWatcher,
  onRepeat,
  onOpenTimesheet,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(tarefa.titulo);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const okrs = useOKRsStore((s: any) => s.okrs);
  const colaboradores = useColaboradoresStore((s: any) => s.colaboradores);
  const user = useAuthStore((s) => s.user);
  const milestones = useTarefasStore((s) => s.milestones);
  const { obterBloqueadoresUIState, validarDependenciasUI, obterProgressoSubtasks, atualizarTarefa } = useTarefasStore((s) => ({
    obterBloqueadoresUIState: s.obterBloqueadoresUIState,
    validarDependenciasUI: s.validarDependenciasUI,
    obterProgressoSubtasks: s.obterProgressoSubtasks,
    atualizarTarefa: s.atualizarTarefa,
  }));

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== tarefa.titulo) {
      atualizarTarefa(tarefa.id, { titulo: editedTitle.trim() });
    } else {
      setEditedTitle(tarefa.titulo);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(tarefa.titulo);
      setIsEditingTitle(false);
    }
  };

  const okr = okrs.find((o: any) => o.id === tarefa.okrId);
  const milestone = milestones.find(m => m.id === tarefa.milestoneId);
  const bloqueadores = obterBloqueadoresUIState(tarefa.id);
  const dependenciasAtendidas = validarDependenciasUI(tarefa.id);
  const progresoSubtasks = obterProgressoSubtasks(tarefa.id);
  // const setor = setores.find((s: any) => s.id === tarefa.tags?.[0]?.setorId);
  const colaboradoresInfo = colaboradores.filter((c: any) =>
    tarefa.colaboradorIds.includes(String(c.id))
  );

  const colors = priorityColors[tarefa.prioridade] || priorityColors.baixa;
  const borderColor = priorityBorderColors[tarefa.prioridade] || priorityBorderColors.baixa;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`p-3 rounded-lg bg-white dark:bg-slate-900 border-l-4 ${borderColor} cursor-move hover:shadow-md dark:hover:shadow-lg/10 transition-shadow group border border-transparent dark:border-slate-800 ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-emerald-400' : ''
      }`}
    >
      {/* Header com prioridade e checkbox */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(tarefa.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 cursor-pointer"
            />
          )}
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="text-sm font-medium w-full px-2 py-1 border border-blue-500 dark:border-emerald-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            ) : (
              <p 
                className={`text-sm font-medium line-clamp-2 cursor-text dark:text-slate-100 ${tarefa.status === 'feito' ? 'line-through text-gray-500 dark:text-slate-500' : ''}`}
                onDoubleClick={handleTitleDoubleClick}
                title="Duplo-clique para editar"
              >
                {tarefa.titulo}
              </p>
            )}
            {tarefa.descricao && (
              <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-1 mt-1">{tarefa.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {onToggleWatcher && user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatcher(tarefa.id);
              }}
              className={`p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded ${tarefa.watcherIds?.includes(user.id) ? 'text-blue-600 dark:text-emerald-400' : 'text-gray-600 dark:text-slate-400'}`}
              title="Seguir tarefa"
            >
              <Eye size={14} />
            </button>
          )}
          {onRepeat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRepeat(tarefa.id);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-purple-600 dark:text-purple-400"
              title="Repetir/Recorrer tarefa"
            >
              <Repeat size={14} />
            </button>
          )}
          {onOpenTimesheet && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTimesheet(tarefa.id);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-600 dark:text-slate-400"
              title="Registrar tempo"
            >
              <Clock size={14} />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(tarefa.id);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-600 dark:text-slate-400"
              title="Duplicar tarefa"
            >
              <Copy size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tarefa);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-600 dark:text-slate-400"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
            title="Deletar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}
        >
          {tarefa.prioridade}
        </span>
        <TarefaStatusBadge dataVencimento={tarefa.dataVencimento} status={tarefa.status} />
        <BloqueadorIndicador bloqueadores={bloqueadores} dependenciasAtendidas={dependenciasAtendidas} />
      </div>

      {/* Tags e Setor */}
      {tarefa.tags && tarefa.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tarefa.tags.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300`}
              style={tag.cor ? { backgroundColor: tag.cor + '20', color: tag.cor } : {}}
            >
              <Tag size={12} />
              {tag.nome}
            </span>
          ))}
        </div>
      )}

      {/* OKR e Timesheet info */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          {tarefa.subtasks && tarefa.subtasks.length > 0 && (
            <div className="flex items-center gap-1">
              <span>📋 {progresoSubtasks.completas}/{progresoSubtasks.total}</span>
            </div>
          )}
          {tarefa.checklist && tarefa.checklist.length > 0 && (
            <div className="flex items-center gap-1">
              <input type="checkbox" readOnly checked={tarefa.checklist.every(item => item.concluido)} className="w-3 h-3" />
              <span>{tarefa.checklist.filter(item => item.concluido).length}/{tarefa.checklist.length}</span>
            </div>
          )}
          {tarefa.tempoTotalHoras > 0 && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{horasParaHHMM(tarefa.tempoTotalHoras)}</span>
            </div>
          )}
          {colaboradoresInfo.length > 0 && (
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{colaboradoresInfo.length}</span>
            </div>
          )}
          {okr && (
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
              <TrendingUp size={12} />
              <span className="truncate max-w-[80px]">{okr.objetivo.substring(0, 15)}...</span>
            </div>
          )}
          {milestone && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{backgroundColor: milestone.cor + '30', color: milestone.cor}}>
              <Flag size={12} />
              <span className="truncate max-w-[80px]">{milestone.titulo.substring(0, 15)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progresso de Subtasks */}
      {progresoSubtasks.total > 0 && (
        <div className="mb-2">
          <SubtasksProgress 
            total={progresoSubtasks.total}
            completas={progresoSubtasks.completas}
            percentual={progresoSubtasks.percentual}
          />
        </div>
      )}

      {/* Colaboradores Avatares */}
      {colaboradoresInfo.length > 0 && (
        <div className="flex -space-x-2">
          {colaboradoresInfo.slice(0, 3).map((colab: any) => (
            <div
              key={colab.id}
              className="w-6 h-6 rounded-full bg-gray-300 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-900"
              title={colab.name}
            >
              {colab.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {colaboradoresInfo.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-900">
              +{colaboradoresInfo.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmação de deleção */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Deletar tarefa: ${tarefa.titulo}?`}
        onConfirm={(reason?: string) => {
          onDelete(tarefa.id);
          if (reason) {
            console.log(`[Motivo da deleção] ${tarefa.titulo}: ${reason}`);
          }
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
};

export default TarefaCard;
