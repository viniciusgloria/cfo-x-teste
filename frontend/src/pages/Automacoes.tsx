import React from 'react';
import { Zap, Plus } from 'lucide-react';
import AutomationBuilder from '../components/AutomationBuilder';
import PageBanner from '../components/ui/PageBanner';

const Automacoes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automações</h1>
              <p className="text-gray-600 dark:text-slate-300 mt-1">Configure automações para executar ações automaticamente baseadas em triggers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AutomationBuilder />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📖 Dicas</h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-slate-200">
                <li>
                  <strong>Triggers:</strong> São eventos que acionam a automação (ex: tarefa criada).
                </li>
                <li>
                  <strong>Condições:</strong> Filtram quando a automação realmente executa.
                </li>
                <li>
                  <strong>Ações:</strong> O que acontece quando a automação é acionada.
                </li>
                <li>
                  <strong>Status:</strong> Use o toggle para ativar ou desativar temporariamente.
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Caso de Uso</h4>
              <p className="text-sm text-blue-800">
                Crie uma automação para notificar o time quando uma tarefa urgente é criada e mudar seu status
                automaticamente para "Fazendo" quando alguém for atribuído.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Recurso Premium</h4>
              <p className="text-sm text-green-800">
                Webhooks e integrações externas estão disponíveis no plano Enterprise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automacoes;




