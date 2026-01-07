import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { TempoTarefa, Colaborador } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';

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

interface TarefasTimesheetProps {
  tarefaId: string;
  tempos: TempoTarefa[];
  tempoTotal: number;
}

const TarefasTimesheet: React.FC<TarefasTimesheetProps> = ({
  tarefaId,
  tempos,
  tempoTotal,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [horas, setHoras] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const adicionarTempoTarefa = useTarefasStore((s) => s.adicionarTempoTarefa);
  const removerTempoTarefa = useTarefasStore((s) => s.removerTempoTarefa);
  const usuario = useColaboradoresStore((s) => s.usuarioAtual) as Colaborador | undefined;

  const handleAddTempo = () => {
    if (!horas || horas.trim() === '') {
      console.warn('[TarefasTimesheet] Valor inválido de horas:', horas);
      return;
    }

    const horasDecimais = hhmmParaHoras(horas);
    if (horasDecimais <= 0) {
      console.warn('[TarefasTimesheet] Valor convertido inválido:', horasDecimais);
      return;
    }

    adicionarTempoTarefa(tarefaId, {
      tarefaId,
      colaboradorId: usuario?.id ? String(usuario.id) : 'usuario',
      inicio: new Date(data).toISOString(),
      horasRegistradas: horasDecimais,
      descricao: descricao || undefined,
    });

    setHoras('');
    setDescricao('');
    setData(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900/70 rounded-lg p-4 mb-4 border border-transparent dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-gray-700 dark:text-slate-200">Timesheet</h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Total: <strong>{horasParaHHMM(tempoTotal)}</strong>
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
        >
          <Plus size={16} />
          Registrar tempo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                <Clock size={14} className="inline mr-1" />
                Horas (HH:MM)
              </label>
              <input
                type="text"
                placeholder="02:30"
                value={horas}
                onChange={(e) => {
                  const valor = e.target.value;
                  // Permitir apenas números e dois pontos
                  if (/^[0-9:]*$/.test(valor)) {
                    setHoras(valor);
                  }
                }}
                onBlur={(e) => {
                  // Formatar automaticamente ao sair do campo
                  const valor = e.target.value;
                  if (valor && !valor.includes(':')) {
                    // Se digitou só números, assume que são horas
                    const num = parseInt(valor);
                    if (!isNaN(num)) {
                      setHoras(`${String(num).padStart(2, '0')}:00`);
                    }
                  } else if (valor.includes(':')) {
                    // Formatar para HH:MM
                    const [h, m] = valor.split(':');
                    const horas = parseInt(h) || 0;
                    const minutos = parseInt(m) || 0;
                    setHoras(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                placeholder="O que foi feito?"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddTempo}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
            >
              Salvar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tempos registrados */}
      <div className="space-y-2">
        {tempos && tempos.length > 0 ? (
          tempos.map((tempo) => (
            <div
              key={tempo.id}
              className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{horasParaHHMM(tempo.horasRegistradas)}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    em {new Date(tempo.inicio).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {tempo.descricao && (
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{tempo.descricao}</p>
                )}
              </div>
              <button
                onClick={() => removerTempoTarefa(tarefaId, tempo.id)}
                className="p-2 hover:bg-red-100 rounded text-red-600"
                title="Remover"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
            Nenhum tempo registrado ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default TarefasTimesheet;
