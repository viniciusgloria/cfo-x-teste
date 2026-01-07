import { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PlanHistorico } from '../store/clientesStore';

interface UpsellManagerProps {
  planos: PlanHistorico[];
  planoOptions?: string[];
  onAdd: (plano: PlanHistorico) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, plano: PlanHistorico) => void;
}

export function UpsellManager({ planos, planoOptions = [], onAdd, onRemove, onUpdate }: UpsellManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanHistorico>({
    id: '',
    nomePlano: '',
    mrr: 0,
    dataInicio: '',
    dataFim: '',
    observacoes: ''
  });
  const [mrrInput, setMrrInput] = useState<string>('');

  const formatCurrency = (value: number): string => {
    if (!Number.isFinite(value)) return '';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const parseDigitsToValue = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  useEffect(() => {
    setMrrInput(formData.mrr ? formatCurrency(formData.mrr) : '');
  }, [formData.mrr, showForm]);

  const resetForm = () => {
    setFormData({
      id: '',
      nomePlano: '',
      mrr: 0,
      dataInicio: '',
      dataFim: '',
      observacoes: ''
    });
    setMrrInput(formatCurrency(0));
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.nomePlano.trim()) {
      alert('Por favor, informe o nome do plano');
      return;
    }
    if (!formData.dataInicio) {
      alert('Por favor, informe a data de início');
      return;
    }
    if (formData.mrr < 0) {
      alert('MRR não pode ser negativo');
      return;
    }

    if (editingId) {
      onUpdate(editingId, formData);
    } else {
      const newPlan: PlanHistorico = {
        ...formData,
        id: `plan-${Date.now()}`
      };
      onAdd(newPlan);
    }
    resetForm();
  };

  const handleEdit = (plano: PlanHistorico) => {
    setFormData(plano);
    setMrrInput(formatCurrency(plano.mrr));
    setEditingId(plano.id);
    setShowForm(true);
  };

  const calculateMRRHistory = () => {
    const sorted = [...planos].sort((a, b) => 
      new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
    );
    
    return sorted.map((plano) => {
      const duracao = plano.dataFim 
        ? calculateDuration(plano.dataInicio, plano.dataFim)
        : calculateDuration(plano.dataInicio, new Date().toISOString().split('T')[0]);
      
      return {
        ...plano,
        duracao,
        isAtual: !plano.dataFim
      };
    });
  };

  const calculateDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      return `${months}m ${days}d`;
    }
    return `${days}d`;
  };

  const mrrHistory = calculateMRRHistory();
  const currentMRR = mrrHistory.find(p => p.isAtual)?.mrr ?? 0;
  const totalHistorico = mrrHistory.length;
  const normalizedPlanOptions = Array.from(
    new Set(
      [...planoOptions, ...(formData.nomePlano ? [formData.nomePlano] : [])].filter(
        (option): option is string => Boolean(option && option.trim())
      )
    )
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Gerenciar Planos e Upsells</p>
          <p className="text-xs mt-1">Adicione ou atualize os planos contratados. O sistema rastreará o MRR por período para relatórios.</p>
        </div>
      </div>

      {/* Resumo de MRR */}
      {totalHistorico > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-xs text-gray-600">MRR Atual</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(currentMRR)}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-gray-600">Planos no Histórico</p>
            <p className="text-xl font-bold text-blue-600">{totalHistorico}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-gray-600">Tempo Total</p>
            <p className="text-xl font-bold text-purple-600">
              {mrrHistory.reduce((acc, p) => acc + parseInt(p.duracao), 0) > 30 
                ? `${Math.floor(mrrHistory.reduce((acc, p) => acc + parseInt(p.duracao), 0) / 30)}m`
                : `${mrrHistory.reduce((acc, p) => acc + parseInt(p.duracao), 0)}d`}
            </p>
          </Card>
        </div>
      )}

      {/* Lista de Planos */}
      {mrrHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Histórico de Planos:</h4>
          <div className="space-y-2">
            {mrrHistory.map((plano) => (
              <Card 
                key={plano.id} 
                className={`p-3 border ${plano.isAtual ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">{plano.nomePlano}</p>
                      {plano.isAtual && (
                        <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs rounded-full font-medium">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-500">MRR: <span className="font-medium text-gray-800">{formatCurrency(plano.mrr)}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duração: <span className="font-medium text-gray-800">{plano.duracao}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-500">De: <span className="font-medium text-gray-800">{new Date(plano.dataInicio).toLocaleDateString('pt-BR')}</span></p>
                      </div>
                      {plano.dataFim && (
                        <div>
                          <p className="text-gray-500">Até: <span className="font-medium text-gray-800">{new Date(plano.dataFim).toLocaleDateString('pt-BR')}</span></p>
                        </div>
                      )}
                    </div>
                    {plano.observacoes && (
                      <p className="text-xs text-gray-600 mt-2 italic">{plano.observacoes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(plano)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onRemove(plano.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Botão Adicionar */}
      {!showForm && (
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
        >
          <Plus size={18} />
          {totalHistorico === 0 ? 'Adicionar Primeiro Plano' : 'Adicionar/Fazer Upsell'}
        </Button>
      )}

      {/* Formulário */}
      {showForm && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-slate-900/60 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800 dark:text-slate-100">
              {editingId ? 'Editar Plano' : 'Controle do Plano'}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Nome do Plano:
            </label>
            <select
              value={formData.nomePlano}
              onChange={(e) => setFormData({ ...formData, nomePlano: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
            >
              <option value="">Selecione o plano</option>
              {normalizedPlanOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                MRR:
              </label>
              <input
                type="text"
                value={mrrInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw.trim()) {
                    setMrrInput('');
                    setFormData({ ...formData, mrr: 0 });
                    return;
                  }
                  const parsed = parseDigitsToValue(raw);
                  setFormData({ ...formData, mrr: parsed });
                  setMrrInput(formatCurrency(parsed));
                }}
                placeholder="R$ 0,00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                Data de Início:
              </label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Data de Término (deixar vazio se é o plano atual):
            </label>
            <input
              type="date"
              value={formData.dataFim || ''}
              onChange={(e) => setFormData({ ...formData, dataFim: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Observações:
            </label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: Upgraded devido ao crescimento da empresa"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {editingId ? 'Atualizar' : 'Adicionar'}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="flex-1 text-sm"
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
