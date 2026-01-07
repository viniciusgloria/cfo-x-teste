import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TemplateTarefa, FrequenciaTemplate, TagTarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';

interface TemplateTarefaModalProps {
  isOpen: boolean;
  template?: TemplateTarefa;
  onClose: () => void;
  onSave: (template: Partial<TemplateTarefa>) => void;
}

const TemplateTarefaModal: React.FC<TemplateTarefaModalProps> = ({
  isOpen,
  template,
  onClose,
  onSave,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [frequencia, setFrequencia] = useState<FrequenciaTemplate>('semanal');
  const [colaboradorIds, setColaboradorIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagTarefa[]>([]);
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dia, setDia] = useState<number | ''>('');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [okrId, setOkrId] = useState('');
  const [ativa, setAtiva] = useState(true);

  const allTags = useTarefasStore((s) => s.tags);
  const colaboradores = useColaboradoresStore((s: any) => s.colaboradores);

  useEffect(() => {
    if (template) {
      setTitulo(template.titulo);
      setDescricao(template.descricao || '');
      setFrequencia(template.frequencia);
      setColaboradorIds(template.colaboradorIds);
      setTags(template.tags);
      setPrioridade(template.prioridade);
      setDataInicio(template.dataInicio.split('T')[0]);
      setDataFim(template.dataFim ? template.dataFim.split('T')[0] : '');
      setDia(template.dia || '');
      setDiasSemana(template.diasSemana || []);
      setOkrId(template.okrId || '');
      setAtiva(template.ativa);
    }
  }, [template, isOpen]);

  const handleSave = () => {
    if (!titulo.trim()) return;

    onSave({
      titulo,
      descricao,
      frequencia,
      colaboradorIds,
      tags,
      prioridade,
      dataInicio: new Date(dataInicio).toISOString(),
      dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
      dia: dia ? parseInt(String(dia)) : undefined,
      diasSemana: diasSemana.length > 0 ? diasSemana : undefined,
      okrId: okrId || undefined,
      ativa,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setFrequencia('semanal');
    setColaboradorIds([]);
    setTags([]);
    setPrioridade('media');
    setDataInicio('');
    setDataFim('');
    setDia('');
    setDiasSemana([]);
    setOkrId('');
    setAtiva(true);
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

  const toggleDiaSemana = (dia: number) => {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  if (!isOpen) return null;

  const diasSemanaLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {template ? 'Editar Template de Tarefa' : 'Novo Template de Tarefa'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
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
              placeholder="Nome do template"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do template"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
            />
          </div>

          {/* Frequência */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Frequência de Repetição:
              </label>
              <select
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value as FrequenciaTemplate)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              >
                <option value="unica">Única</option>
                <option value="diaria">Diária</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

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
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Data Início: *
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Data Fim (opcional):
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Configuração por frequência */}
          {frequencia === 'mensal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Dia do Mês (1-31):
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dia}
                onChange={(e) => setDia(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
          )}

          {(frequencia === 'semanal' || frequencia === 'quinzenal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Dias da Semana:
              </label>
              <div className="flex gap-2">
                {diasSemanaLabels.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDiaSemana(idx)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      diasSemana.includes(idx)
                        ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colaboradores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Colaboradores:</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-950">
              {colaboradores.map((colab) => {
                const colabId = String(colab.id);
                return (
                  <label key={colab.id} className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-slate-100">
                    <input
                      type="checkbox"
                      checked={colaboradorIds.includes(colabId)}
                      onChange={() => toggleColaborador(colabId)}
                      className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
                    />
                    <span className="text-sm">{colab.nomeCompleto}</span>
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
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-slate-100">
              <input
                type="checkbox"
                checked={ativa}
                onChange={(e) => setAtiva(e.target.checked)}
                className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
              />
              <span className="text-sm font-medium">Ativa</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!titulo.trim() || !dataInicio}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateTarefaModal;
