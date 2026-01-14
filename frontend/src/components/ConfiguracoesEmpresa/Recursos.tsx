import React from 'react';
import { Timer, FileText, Target, MessageSquare, MessageCircle, FileStack, Star, Gift, BarChart3, UsersRound, UserCircle, DollarSign, TrendingUp, CheckSquare, FileSpreadsheet, LucideIcon, Clock, FolderOpen, Award, Users, UserCog, Receipt, BarChart, Info } from 'lucide-react';

interface RecursosProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

const FEATURES: Array<{
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: 'ponto_ativo',
    label: 'Ponto',
    description: 'Sistema de controle de ponto e assiduidade de colaboradores',
    icon: Clock,
  },
  {
    key: 'solicitacoes_ativo',
    label: 'Solicitações',
    description: 'Gerenciamento de solicitações de afastamentos e ajustes',
    icon: FileText,
  },
  {
    key: 'okrs_ativo',
    label: 'Desenvolvimento',
    description: 'Definição e acompanhamento de objetivos e resultados-chave',
    icon: Target,
  },
  {
    key: 'mural_ativo',
    label: 'Mural',
    description: 'Comunicação interna e mural de avisos da empresa',
    icon: MessageSquare,
  },
  {
    key: 'chat_ativo',
    label: 'Chat',
    description: 'Mensageria integrada entre colaboradores',
    icon: MessageCircle,
  },
  {
    key: 'documentos_ativo',
    label: 'Documentos',
    description: 'Gestão centralizada de arquivos e documentos',
    icon: FolderOpen,
  },
  {
    key: 'feedbacks_ativo',
    label: 'Feedbacks',
    description: 'Sistema de avaliações e feedbacks 360 graus',
    icon: MessageCircle,
  },
  {
    key: 'beneficios_ativo',
    label: 'Benefícios',
    description: 'Gerenciamento de benefícios do colaborador',
    icon: Gift,
  },
  {
    key: 'avaliacoes_ativo',
    label: 'Avaliações',
    description: 'Avaliação de desempenho de colaboradores',
    icon: Award,
  },
  {
    key: 'clientes_ativo',
    label: 'Clientes',
    description: 'Gestão de dados de clientes',
    icon: Users,
  },
  {
    key: 'colaboradores_ativo',
    label: 'Colaboradores',
    description: 'Gestão de colaboradores e folha de pagamento',
    icon: UserCog,
  },
  {
    key: 'folha_pagamento_ativo',
    label: 'Folha de Pagamento',
    description: 'Processamento e gestão de folhas de pagamento',
    icon: DollarSign,
  },
  {
    key: 'folha_clientes_ativo',
    label: 'Folha de Clientes',
    description: 'Gestão de folhas de clientes',
    icon: Receipt,
  },
  {
    key: 'tarefas_ativo',
    label: 'Tarefas',
    description: 'Sistema de gerenciamento de tarefas e projetos',
    icon: CheckSquare,
  },
  {
    key: 'relatorios_ativo',
    label: 'Relatórios',
    description: 'Geração e visualização de relatórios analíticos',
    icon: BarChart,
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
          Ative ou desative módulos globalmente. Módulos desativados não estarão disponíveis para nenhum nível de acesso. Estas configurações afetarão o acesso aos recursos para todos os colaboradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.key}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                data[feature.key]
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
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
                className="w-5 h-5 rounded mt-0.5 cursor-pointer accent-red-600"
              />

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
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
                  <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
                    Ativo
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card inf•mativo */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-red-600 dark:text-red-400" />
          <strong>Atenção:</strong> Desativar um módulo da interface não deleta seus dados. Você pode reativar a qualquer momento.
        </p>
      </div>
    </div>
  );
}

export default Recursos;
