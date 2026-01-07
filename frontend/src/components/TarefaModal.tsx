import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Plus, Trash2, FileDown, Repeat, Info } from 'lucide-react';
import { Tarefa, TagTarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useOKRsStore } from '../store/okrsStore';
import { useAuthStore } from '../store/authStore';
import TarefaHistorico from './TarefaHistorico';
import TarefaComentarios from './TarefaComentarios';
import TarefaAnexos from './TarefaAnexos';
import TarefaChecklist from './TarefaChecklist';
import { DependenciasPanel } from './DependenciasPanel';
import { SubtasksEditor } from './SubtasksEditor';
import { exportTarefaToPDF } from '../utils/exportPDF';

// Funções utilitárias para conversão de horas
const horasParaHHMM = (horasDecimais: number): string => {
  const horas = Math.floor(horasDecimais);
  const minutos = Math.round((horasDecimais - horas) * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
};

const hhmmParaHoras = (hhmm: string): number => {
  const [horas, minutos] = hhmm.split(':').map(Number);
  if (isNaN(horas)) return 0;
  return horas + (minutos || 0) / 60;
};

interface TarefaModalProps {
  isOpen: boolean;
  tarefa?: Tarefa;
  onClose: () => void;
  onSave: (tarefa: Partial<Tarefa>) => void;
}

const TarefaModal: React.FC<TarefaModalProps> = ({ isOpen, tarefa, onClose, onSave }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [colaboradorIds, setColaboradorIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagTarefa[]>([]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [okrId, setOkrId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [novoTempo, setNovoTempo] = useState({ horas: '', descricao: '' });
  const [showPreview, setShowPreview] = useState(false);
  
  // Campos de recorrência
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState<'unica' | 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral' | 'anual'>('semanal');
  const [dataInicioRecorrencia, setDataInicioRecorrencia] = useState('');
  const [dataFimRecorrencia, setDataFimRecorrencia] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [diaDoMes, setDiaDoMes] = useState<number>(1);
  const [recorrenciaAtiva, setRecorrenciaAtiva] = useState(true);

  const allTags = useTarefasStore((s) => s.tags);
  const milestones = useTarefasStore((s) => s.milestones);
  const todasAsTarefas = useTarefasStore((s) => s.tarefas);
  const colaboradores = useColaboradoresStore((s: any) => s.colaboradores);
  const okrs = useOKRsStore((s) => s.okrs);
  const adicionarTempoTarefa = useTarefasStore((s) => s.adicionarTempoTarefa);
  const removerTempoTarefa = useTarefasStore((s) => s.removerTempoTarefa);
  const toggleWatcher = useTarefasStore((s) => s.toggleWatcher);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isOpen && tarefa) {
      setTitulo(tarefa.titulo);
      setDescricao(tarefa.descricao || '');
      setPrioridade(tarefa.prioridade);
      setColaboradorIds(tarefa.colaboradorIds || []);
      setTags(tarefa.tags || []);
      setDataVencimento(tarefa.dataVencimento ? tarefa.dataVencimento.split('T')[0] : '');
      setOkrId(tarefa.okrId || '');
      setMilestoneId(tarefa.milestoneId || '');
      
      // Carregar dados de recorrência
      setIsRecorrente(tarefa.isRecorrente || false);
      if (tarefa.recorrencia) {
        setFrequencia(tarefa.recorrencia.frequencia);
        setDataInicioRecorrencia(tarefa.recorrencia.dataInicioRecorrencia.split('T')[0]);
        setDataFimRecorrencia(tarefa.recorrencia.dataFimRecorrencia ? tarefa.recorrencia.dataFimRecorrencia.split('T')[0] : '');
        setDiasSemana(tarefa.recorrencia.diasSemana || []);
        setDiaDoMes(tarefa.recorrencia.dia || 1);
        setRecorrenciaAtiva(tarefa.recorrencia.ativa);
      }
    } else if (isOpen && !tarefa) {
      resetForm();
    }
  }, [tarefa, isOpen]);

  const handleSave = () => {
    if (!titulo.trim()) return;

    const tarefaData: Partial<Tarefa> = {
      titulo,
      descricao,
      prioridade,
      colaboradorIds,
      tags,
      dataVencimento: dataVencimento ? new Date(dataVencimento).toISOString() : undefined,
      okrId: okrId || undefined,
      milestoneId: milestoneId || undefined,
      isRecorrente,
    };

    // Adicionar recorrência se ativada
    if (isRecorrente && dataInicioRecorrencia) {
      tarefaData.recorrencia = {
        frequencia,
        dataInicioRecorrencia: new Date(dataInicioRecorrencia).toISOString(),
        dataFimRecorrencia: dataFimRecorrencia ? new Date(dataFimRecorrencia).toISOString() : undefined,
        diasSemana: frequencia === 'semanal' || frequencia === 'quinzenal' ? diasSemana : undefined,
        dia: frequencia === 'mensal' ? diaDoMes : undefined,
        ativa: recorrenciaAtiva,
        proximaExecucao: new Date(dataInicioRecorrencia).toISOString(),
      };
    }

    onSave(tarefaData);

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setPrioridade('media');
    setColaboradorIds([]);
    setTags([]);
    setDataVencimento('');
    setOkrId('');
    setMilestoneId('');
    setNovoTempo({ horas: 0, descricao: '' });
    setIsRecorrente(false);
    setFrequencia('semanal');
    setDataInicioRecorrencia('');
    setDataFimRecorrencia('');
    setDiasSemana([]);
    setDiaDoMes(1);
    setRecorrenciaAtiva(true);
  };

  const toggleColaborador = (id: string | number) => {
    const idStr = String(id);
    setColaboradorIds((prev) =>
      prev.includes(idStr) ? prev.filter((c) => c !== idStr) : [...prev, idStr]
    );
  };

  const toggleTag = (tag: TagTarefa) => {
    setTags((prev) =>
      prev.find((t) => t.id === tag.id) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <div className="flex items-center gap-2">
            {tarefa && (
              <button
                onClick={() => {
                  const colaboradoresInfo = colaboradores.filter((c: any) =>
                    tarefa.colaboradorIds.includes(String(c.id))
                  );
                  exportTarefaToPDF(tarefa, colaboradoresInfo);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Exportar como PDF"
              >
                <FileDown size={16} />
                PDF
              </button>
            )}
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Título: *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome da tarefa"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Descrição:</label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-slate-400">Suporta Markdown</span>
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-emerald-400 hover:text-blue-800 dark:hover:text-emerald-300"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? 'Editar' : 'Preview'}
              </button>
            </div>
            {!showPreview ? (
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes da tarefa em Markdown"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none border border-gray-200 dark:border-slate-700 rounded p-4 bg-gray-50 dark:bg-slate-900/70 overflow-auto max-h-80 text-gray-900 dark:text-slate-100">
                {descricao?.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{descricao}</ReactMarkdown>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400 not-prose">Nada para visualizar.</p>
                )}
              </div>
            )}
          </div>

          {/* Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Prioridade:</label>
              <select
                value={prioridade}
                onChange={(e) =>
                  setPrioridade(e.target.value as 'baixa' | 'media' | 'alta' | 'urgente')
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Data Vencimento:
              </label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Seção de Recorrência */}
          <div className="border-t dark:border-slate-800 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isRecorrente"
                checked={isRecorrente}
                onChange={(e) => setIsRecorrente(e.target.checked)}
                className="w-4 h-4 text-emerald-600"
              />
              <label htmlFor="isRecorrente" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                <Repeat size={16} className="text-blue-600 dark:text-emerald-400" />
                Tarefa Recorrente (Repetir automaticamente)
              </label>
            </div>

            {isRecorrente && (
              <div className="bg-blue-50 dark:bg-slate-900/60 p-4 rounded-lg space-y-4 border border-blue-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Frequência:
                    </label>
                    <select
                      value={frequencia}
                      onChange={(e) => setFrequencia(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    >
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Data de Início:
                    </label>
                    <input
                      type="date"
                      value={dataInicioRecorrencia}
                      onChange={(e) => setDataInicioRecorrencia(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Data de Término (opcional - deixe vazio para repetir indefinidamente):
                  </label>
                  <input
                    type="date"
                    value={dataFimRecorrencia}
                    onChange={(e) => setDataFimRecorrencia(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                  />
                </div>

                {(frequencia === 'semanal' || frequencia === 'quinzenal') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Dias da Semana:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const dayNum = index + 1;
                            setDiasSemana(prev =>
                              prev.includes(dayNum)
                                ? prev.filter(d => d !== dayNum)
                                : [...prev, dayNum]
                            );
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            diasSemana.includes(index + 1)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {frequencia === 'mensal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Dia do Mês (1-31):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={diaDoMes}
                      onChange={(e) => setDiaDoMes(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="recorrenciaAtiva"
                    checked={recorrenciaAtiva}
                    onChange={(e) => setRecorrenciaAtiva(e.target.checked)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <label htmlFor="recorrenciaAtiva" className="text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                    Recorrência ativa (criar novas tarefas automaticamente)
                  </label>
                </div>

                <div className="text-xs text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900/70 p-3 rounded border border-gray-200 dark:border-slate-700 flex gap-2">
                  <Info size={16} className="text-blue-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Como funciona:</strong> O sistema criará automaticamente novas tarefas baseadas
                    nesta configuração nos intervalos definidos. Você pode desativar a qualquer momento editando a tarefa.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                OKR Associado (Opcional):
              </label>
              <select
                value={okrId}
                onChange={(e) => setOkrId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              >
                <option value="">Nenhum OKR</option>
                {okrs.map((okr) => (
                  <option key={okr.id} value={okr.id}>
                    {okr.objetivo} ({okr.tipo}) - {okr.progresso}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Meta (Opcional):
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              >
                <option value="">Nenhuma Meta</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colaboradores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Colaboradores:</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900/50">
              {colaboradores.map((colab: any) => {
                const colabId = String(colab.id);
                return (
                  <label key={colab.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colaboradorIds.includes(colabId)}
                      onChange={() => toggleColaborador(colabId)}
                      className="rounded border-gray-300 dark:border-slate-600"
                    />
                    <span className="text-sm text-gray-900 dark:text-slate-200">{colab.nomeCompleto}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Tags (Setores):</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    tags.find((t) => t.id === tag.id)
                      ? 'bg-blue-500 dark:bg-emerald-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Watcher Toggle */}
          {tarefa && user && (
            <div className="flex items-center gap-2">
              <input
                id="watcherToggle"
                type="checkbox"
                checked={Boolean(tarefa.watcherIds?.includes(user.id))}
                onChange={() => toggleWatcher(tarefa.id, user.id)}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <label htmlFor="watcherToggle" className="text-sm text-gray-700 dark:text-slate-300">
                Seguir esta tarefa (notificações)
              </label>
            </div>
          )}

          {/* Timesheet */}
          {tarefa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Timesheet ({horasParaHHMM(tarefa.tempoTotalHoras || 0)}):
              </label>
              <div className="space-y-2">
                {tarefa.tempos.map((tempo) => (
                  <div key={tempo.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-slate-100">{horasParaHHMM(tempo.horasRegistradas)}</span>
                      {tempo.descricao && <span className="text-gray-600 dark:text-slate-400 ml-2">{tempo.descricao}</span>}
                    </div>
                    <button
                      onClick={() => removerTempoTarefa(tarefa.id, tempo.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-2 border-t dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="02:30"
                    value={novoTempo.horas}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // Permitir apenas números e dois pontos
                      if (/^[0-9:]*$/.test(valor)) {
                        setNovoTempo({ ...novoTempo, horas: valor });
                      }
                    }}
                    onBlur={(e) => {
                      // Formatar automaticamente ao sair do campo
                      const valor = e.target.value;
                      if (valor && !valor.includes(':')) {
                        // Se digitou só números, assume que são horas
                        const num = parseInt(valor);
                        if (!isNaN(num)) {
                          setNovoTempo({ ...novoTempo, horas: `${String(num).padStart(2, '0')}:00` });
                        }
                      } else if (valor.includes(':')) {
                        // Formatar para HH:MM
                        const [h, m] = valor.split(':');
                        const horas = parseInt(h) || 0;
                        const minutos = parseInt(m) || 0;
                        setNovoTempo({ ...novoTempo, horas: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}` });
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-700 rounded text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    value={novoTempo.descricao}
                    onChange={(e) => setNovoTempo({ ...novoTempo, descricao: e.target.value })}
                    placeholder="Descrição"
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-700 rounded text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (tarefa && novoTempo.horas && novoTempo.horas.trim() !== '' && colaboradorIds.length > 0) {
                        const horasDecimais = hhmmParaHoras(novoTempo.horas);
                        if (horasDecimais > 0) {
                          adicionarTempoTarefa(tarefa.id, {
                            tarefaId: tarefa.id,
                            colaboradorId: colaboradorIds[0],
                            inicio: new Date().toISOString(),
                            horasRegistradas: horasDecimais,
                            descricao: novoTempo.descricao,
                          });
                          setNovoTempo({ horas: '', descricao: '' });
                        }
                      }
                    }}
                    className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checklist */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <TarefaChecklist 
              tarefaId={tarefa.id}
              checklist={tarefa.checklist || []}
            />
          </div>
        )}

        {/* Subtasks */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Subtasks</h3>
            <SubtasksEditor 
              tarefaId={tarefa.id}
              subtasks={tarefa.subtasks || []}
            />
          </div>
        )}

        {/* Dependências */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <DependenciasPanel 
              tarefa={tarefa}
              todasAsTarefas={todasAsTarefas}
            />
          </div>
        )}

        {/* Anexos */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <TarefaAnexos 
              tarefaId={tarefa.id}
              anexos={tarefa.anexos || []}
            />
          </div>
        )}

        {/* Comentários */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <TarefaComentarios 
              tarefaId={tarefa.id}
              comentarios={tarefa.comentarios || []}
            />
          </div>
        )}

        {/* Histórico */}
        {tarefa && (
          <div className="px-6 pb-6 border-t dark:border-slate-800 pt-6">
            <TarefaHistorico logs={tarefa.logs || []} />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t dark:border-slate-800">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!titulo.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TarefaModal;
