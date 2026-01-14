import React from 'react';
import { Info } from 'lucide-react';

interface ConfiguracoesPontoProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

export function ConfiguracoesPonto({
  data,
  onChange,
  isLoading,
}: ConfiguracoesPontoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Horário de Entrada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horário de Entrada Padrão:
          </label>
          <input
            type="time"
            value={data.horario_entrada || '08:00'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ horario_entrada: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Horário em que os colaboradores devem registrar entrada
          </p>
        </div>

        {/* Horário de Saída */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horário de Saída Padrão:
          </label>
          <input
            type="time"
            value={data.horario_saida || '17:00'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ horario_saida: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Horário esperado para saída
          </p>
        </div>

        {/* Carga Horária Semanal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Carga Horária Semanal (horas):
          </label>
          <input
            type="number"
            value={data.carga_horaria_semanal || 40}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ carga_horaria_semanal: parseFloat(e.target.value) })}
            disabled={isLoading}
            min="1"
            max="60"
            step="0.5"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Total de horas esperadas por semana
          </p>
        </div>

        {/* Jornada Diária */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jornada Diária (horas):
          </label>
          <input
            type="number"
            value={data.jornada_horas || 8}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ jornada_horas: parseFloat(e.target.value) })}
            disabled={isLoading}
            min="1"
            max="24"
            step="0.5"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Horas de trabalho por dia
          </p>
        </div>

        {/* Dias de Trabalho por Semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dias de Trabalho por Semana:
          </label>
          <input
            type="number"
            value={data.jornada_dias || 5}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ jornada_dias: parseInt(e.target.value) })}
            disabled={isLoading}
            min="1"
            max="7"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Quantidade de dias trabalhados na semana
          </p>
        </div>

        {/* Tolerância em Minutos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tolerância de Atraso (minutos):
          </label>
          <input
            type="number"
            value={data.tolerancia_minutos || 10}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ tolerancia_minutos: parseInt(e.target.value) })}
            disabled={isLoading}
            min="0"
            max="120"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minutos de tolerância para atrasos
          </p>
        </div>
      </div>

      {/* Card informativo */}
      <div className="bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
        <p className="text-sm text-orange-900 dark:text-orange-300 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span><strong>Importante:</strong> Estas configurações estabelecem os padrões para o controle de ponto. Ajuste conforme a política de trabalho da sua empresa.</span>
        </p>
      </div>
    </div>
  );
}

export default ConfiguracoesPonto;
