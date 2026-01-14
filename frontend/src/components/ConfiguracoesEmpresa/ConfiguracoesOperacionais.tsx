import React from 'react';
import { Info } from 'lucide-react';
import { Select } from '../ui/Select';

interface ConfiguracoesOperacionaisProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

const MOEDAS = [
  { value: 'BRL', label: 'BRL - Real Brasileiro' },
  { value: 'USD', label: 'USD - Dólar Americano' },
];

const IDIOMAS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (United States)' },
];

const FUSOS_HORARIOS = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/Brasilia', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Recife', label: 'Recife (GMT-3)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
];

const FORMATOS_DATA = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

export function ConfiguracoesOperacionais({
  data,
  onChange,
  isLoading,
}: ConfiguracoesOperacionaisProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Moeda Padrão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Moeda Padrão:
          </label>
          <Select
            options={MOEDAS}
            value={data.moeda_padrao || 'BRL'}
            onChange={(value) => onChange({ moeda_padrao: value })}
            disabled={isLoading}
          />
        </div>

        {/* Idioma Padrão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Idioma Padrão:
          </label>
          <Select
            options={IDIOMAS}
            value={data.idioma_padrao || 'pt-BR'}
            onChange={(value) => onChange({ idioma_padrao: value })}
            disabled={isLoading}
          />
        </div>

        {/* Formato de Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formato de Data:
          </label>
          <Select
            options={FORMATOS_DATA}
            value={data.formato_data || 'DD/MM/YYYY'}
            onChange={(value) => onChange({ formato_data: value })}
            disabled={isLoading}
          />
        </div>

        {/* Fuso Horário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fuso Horário:
          </label>
          <Select
            options={FUSOS_HORARIOS}
            value={data.fuso_horario || 'America/Sao_Paulo'}
            onChange={(value) => onChange({ fuso_horario: value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-4">
        <p className="text-sm text-red-900 dark:text-red-300 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span><strong>Dica:</strong> As configurações operacionais afetam como datas, horas e valores monetários são exibidos em todo o sistema.</span>
        </p>
      </div>
    </div>
  );
}

export default ConfiguracoesOperacionais;
