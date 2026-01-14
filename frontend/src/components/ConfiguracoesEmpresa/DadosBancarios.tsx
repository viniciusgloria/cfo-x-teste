import React from 'react';
import { Info } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface DadosBancariosProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

const BANCOS = [
  { value: '001', label: '001 - Banco do Brasil' },
  { value: '004', label: '004 - Banco da Amazônia' },
  { value: '007', label: '007 - BNDES - Banco Nacional de Desenvolvimento' },
  { value: '012', label: '012 - Banco Inbursa' },
  { value: '015', label: '015 - Banco Actinver' },
  { value: '017', label: '017 - Banco Votorantim' },
  { value: '021', label: '021 - Banco do Estado de São Paulo' },
  { value: '024', label: '024 - Banco G.E. Money' },
  { value: '029', label: '029 - Banco do Nordeste' },
  { value: '033', label: '033 - Santander' },
  { value: '036', label: '036 - Banco Bradesco Financiamentos' },
  { value: '037', label: '037 - Banpará' },
  { value: '038', label: '038 - Banco Cruzeiro do Sul' },
  { value: '041', label: '041 - Banco Banrisul' },
  { value: '044', label: '044 - Banco BBM' },
  { value: '045', label: '045 - Banco Mufg Brasil' },
  { value: '050', label: '050 - Banco Sumitomo Mitsui Brasil' },
  { value: '062', label: '062 - Banco de Desenvolvimento do Extremo Sul' },
  { value: '066', label: '066 - Banco Morgan Stanley' },
  { value: '070', label: '070 - Banco de Braga & Villela' },
  { value: '078', label: '078 - Banco JP Morgan' },
  { value: '079', label: '079 - Banco Itauleasing' },
  { value: '081', label: '081 - Banco Credit Suisse' },
  { value: '084', label: '084 - Banco de Desenvolvimento do Centro-Oeste' },
  { value: '094', label: '094 - Banco Finasa' },
  { value: '102', label: '102 - Banco XP' },
  { value: '104', label: '104 - Caixa Econômica Federal' },
  { value: '106', label: '106 - Banco Itaucred' },
  { value: '107', label: '107 - Banco Itaubba' },
  { value: '111', label: '111 - Banco Oliveira Trust' },
  { value: '113', label: '113 - Banco Matrixin' },
  { value: '116', label: '116 - Banco Ativo' },
  { value: '117', label: '117 - Banco B Múltiplo' },
  { value: '118', label: '118 - Banco Lombard' },
  { value: '120', label: '120 - Banco Text' },
  { value: '121', label: '121 - Banco Bom' },
  { value: '122', label: '122 - Banco Finterra' },
  { value: '124', label: '124 - Banco Transatlântico' },
  { value: '125', label: '125 - Banco Petrobras' },
  { value: '126', label: '126 - Banco Uniprime' },
  { value: '127', label: '127 - Banco Privê' },
  { value: '128', label: '128 - Banco Cred System' },
  { value: '129', label: '129 - Banco Confia' },
  { value: '130', label: '130 - Banco Carrefour' },
  { value: '131', label: '131 - Banco BV' },
  { value: '132', label: '132 - Banco Invex' },
  { value: '133', label: '133 - Banco Metrópole' },
  { value: '134', label: '134 - Banco Diagonal' },
  { value: '135', label: '135 - Banco BMG' },
  { value: '136', label: '136 - Banco Moneymax' },
  { value: '137', label: '137 - Banco Sofisa' },
  { value: '138', label: '138 - Banco Bancoop' },
  { value: '139', label: '139 - Banco Safra Leasing' },
  { value: '141', label: '141 - Banco Scotiabank' },
  { value: '143', label: '143 - Banco Cibanco' },
  { value: '144', label: '144 - Banco Pagatech' },
  { value: '145', label: '145 - Banco BBTM' },
  { value: '146', label: '146 - Banco Easynvest' },
  { value: '147', label: '147 - Banco Sinergitec' },
  { value: '148', label: '148 - Banco Neon' },
  { value: '149', label: '149 - Banco Topázio' },
  { value: '150', label: '150 - Banco Sofiex' },
  { value: '151', label: '151 - Banco Sura' },
  { value: '152', label: '152 - Banco Olé' },
  { value: '155', label: '155 - Banco Pactual' },
  { value: '156', label: '156 - Banco Pottencial' },
  { value: '157', label: '157 - Banco ICBC' },
  { value: '158', label: '158 - Banco Cres' },
  { value: '159', label: '159 - Banco Pine' },
  { value: '160', label: '160 - Banco PlannP' },
  { value: '161', label: '161 - Banco Luso Brasileiro' },
  { value: '166', label: '166 - Banco Rabobank' },
  { value: '168', label: '168 - Banco Rabobank' },
  { value: '180', label: '180 - Banco Fintec' },
  { value: '213', label: '213 - Banco Arbixa' },
  { value: '237', label: '237 - Bradesco' },
  { value: '260', label: '260 - Nubank' },
  { value: '341', label: '341 - Itaú Unibanco' },
  { value: '389', label: '389 - Banco Mercantil do Brasil' },
  { value: '422', label: '422 - Banco Safra' },
  { value: '633', label: '633 - Banco Inter' },
];

export function DadosBancarios({
  data,
  onChange,
  isLoading,
}: DadosBancariosProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código do Banco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banco:
          </label>
          <Select
            options={BANCOS}
            value={data.codigo_banco || '001'}
            onChange={(value) => onChange({ codigo_banco: value })}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Selecione o banco responsável pelos pagamentos
          </p>
        </div>

        {/* Agência */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Agência:
          </label>
          <Input
            type="text"
            value={data.agencia || ''}
            onChange={(e) => onChange({ agencia: e.target.value })}
            disabled={isLoading}
            placeholder="0000"
            maxLength={5}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número da agência bancária
          </p>
        </div>

        {/* Conta Corrente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conta Corrente:
          </label>
          <Input
            type="text"
            value={data.conta_corrente || ''}
            onChange={(e) => onChange({ conta_corrente: e.target.value })}
            disabled={isLoading}
            placeholder="0000000-0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número da conta com dígito verificador
          </p>
        </div>

        {/* Dia de Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dia do Pagamento:
          </label>
          <Input
            type="number"
            value={data.dia_pagamento || ''}
            onChange={(e) => onChange({ dia_pagamento: parseInt(e.target.value) })}
            disabled={isLoading}
            min="1"
            max="31"
            placeholder="30"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dia do mês em que os pagamentos são realizados
          </p>
        </div>
      </div>

      {/* Card informativo */}
      <div className="bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span><strong>Segurança:</strong> Estes dados bancários são criptografados e armazenados com segurança. Apenas administradores podem acessá-los.</span>
        </p>
      </div>
    </div>
  );
}

export default DadosBancarios;
