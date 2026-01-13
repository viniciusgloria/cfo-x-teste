import React from 'react';

interface RecursosProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

const FEATURES = [
  {
    key: 'ponto_ativo',
    label: 'Ponto',
    description: 'Sistema de controle de ponto e assiduidade de colaboradores',
    icon: '⏰',
  },
  {
    key: 'solicitacoes_ativo',
    label: 'Solicitações',
    description: 'Gerenciamento de solicitações de afastamentos e ajustes',
    icon: '📋',
  },
  {
    key: 'okrs_ativo',
    label: 'OKRs',
    description: 'Definição e acompanhamento de objetivos e resultados-chave',
    icon: '🎯',
  },
  {
    key: 'mural_ativo',
    label: 'Mural',
    description: 'Comunicação interna e mural de avisos da empresa',
    icon: '📰',
  },
  {
    key: 'chat_ativo',
    label: 'Chat',
    description: 'Mensageria integrada entre colaboradores',
    icon: '💬',
  },
  {
    key: 'documentos_ativo',
    label: 'Documentos',
    description: 'Gestão centralizada de arquivos e documentos',
    icon: '📄',
  },
  {
    key: 'feedbacks_ativo',
    label: 'Feedbacks',
    description: 'Sistema de avaliações e feedbacks 360 graus',
    icon: '⭐',
  },
  {
    key: 'beneficios_ativo',
    label: 'Benefícios',
    description: 'Gerenciamento de benefícios do colaborador',
    icon: '🎁',
  },
  {
    key: 'avaliacoes_ativo',
    label: 'Avaliações',
    description: 'Avaliação de desempenho de colaboradores',
    icon: '📊',
  },
  {
    key: 'clientes_ativo',
    label: 'Clientes',
    description: 'Gestão de dados de clientes',
    icon: '👥',
  },
  {
    key: 'colaboradores_ativo',
    label: 'Colaboradores',
    description: 'Gestão de colaboradores e folha de pagamento',
    icon: '👔',
  },
  {
    key: 'folha_pagamento_ativo',
    label: 'Folha de Pagamento',
    description: 'Processamento e gestão de folhas de pagamento',
    icon: '💰',
  },
  {
    key: 'folha_clientes_ativo',
    label: 'Folha Clientes',
    description: 'Gestão de folhas de clientes',
    icon: '📈',
  },
  {
    key: 'tarefas_ativo',
    label: 'Tarefas',
    description: 'Sistema de gerenciamento de tarefas e projetos',
    icon: '✓',
  },
  {
    key: 'relatorios_ativo',
    label: 'Relatórios',
    description: 'Geração e visualização de relatórios analíticos',
    icon: '📑',
  },
];

export function Recursos({
  data,
  onChange,
  isLoading,
}: RecursosProps) {
  const handleToggle = (key: string, value: boolean) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Ative ou desative os módulos e funcionalidades disponíveis para sua empresa. Estas configurações afetarão o acesso aos recursos para todos os colaboradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.key}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
              data[feature.key]
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
            }`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id={feature.key}
              checked={data[feature.key] as boolean || false}
              onChange={(e) => handleToggle(feature.key, e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 rounded mt-0.5 cursor-pointer accent-emerald-600"
            />

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{feature.icon}</span>
                <label
                  htmlFor={feature.key}
                  className="font-medium text-gray-900 dark:text-white cursor-pointer"
                >
                  {feature.label}
                </label>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>

            {/* Badge de status */}
            {data[feature.key] && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  Ativo
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>ℹ️ Dica:</strong> Desativar um módulo oculta-o da interface, mas não deleta os dados. Você pode reativar a qualquer momento.
        </p>
      </div>
    </div>
  );
}

export default Recursos;
