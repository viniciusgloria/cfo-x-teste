import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface SmtpConfigProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
  onTestConnection?: () => Promise<void>;
}

export function SmtpConfig({
  data,
  onChange,
  isLoading,
  onTestConnection,
}: SmtpConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    // Validação básica
    if (!data.smtp_host?.trim()) {
      toast.error('Preenchha o host SMTP');
      return;
    }
    if (!data.smtp_porta) {
      toast.error('Preencha a porta SMTP');
      return;
    }
    if (!data.smtp_usuario?.trim()) {
      toast.error('Preencha o usuário SMTP');
      return;
    }
    if (!data.smtp_senha?.trim()) {
      toast.error('Preencha a senha SMTP');
      return;
    }

    setTestingConnection(true);
    try {
      if (onTestConnection) {
        await onTestConnection();
      } else {
        toast.success('Configuração SMTP válida (modo simulação)');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão SMTP');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seção de Configuração SMTP */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Configuração do Servidor SMTP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Host SMTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Host SMTP
            </label>
            <Input
              type="text"
              value={data.smtp_host || ''}
              onChange={(e) => onChange({ smtp_host: e.target.value })}
              disabled={isLoading}
              placeholder="smtp.gmail.com"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Servidor de saída de e-mails
            </p>
          </div>

          {/* Porta SMTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Porta
            </label>
            <Input
              type="number"
              value={data.smtp_porta || 587}
              onChange={(e) => onChange({ smtp_porta: parseInt(e.target.value) })}
              disabled={isLoading}
              placeholder="587"
              min="1"
              max="65535"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Porta padrão: 587 (TLS) ou 465 (SSL)
            </p>
          </div>

          {/* Usuário SMTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Usuário
            </label>
            <Input
              type="email"
              value={data.smtp_usuario || ''}
              onChange={(e) => onChange({ smtp_usuario: e.target.value })}
              disabled={isLoading}
              placeholder="seu.email@gmail.com"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              E-mail ou usuário de autenticação
            </p>
          </div>

          {/* Senha SMTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={data.smtp_senha || ''}
                onChange={(e) => onChange({ smtp_senha: e.target.value })}
                disabled={isLoading}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Senha ou token de aplicação
            </p>
          </div>

          {/* Usar TLS */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="smtp_tls"
              checked={data.smtp_tls !== false}
              onChange={(e) => onChange({ smtp_tls: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="smtp_tls" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Usar TLS
            </label>
          </div>

          {/* Usar SSL */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="smtp_ssl"
              checked={data.smtp_ssl === true}
              onChange={(e) => onChange({ smtp_ssl: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="smtp_ssl" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Usar SSL
            </label>
          </div>
        </div>

        {/* Botão testar conexão */}
        <Button
          onClick={handleTestConnection}
          disabled={isLoading || testingConnection}
          variant="secondary"
        >
          {testingConnection ? 'Testando...' : 'Testar Conexão'}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Seção de Remetente */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Configuração de Remetente
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* E-mail de Remetente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail de Remetente
            </label>
            <Input
              type="email"
              value={data.smtp_remetente_email || data.smtp_usuario || ''}
              onChange={(e) => onChange({ smtp_remetente_email: e.target.value })}
              disabled={isLoading}
              placeholder="noreply@empresa.com.br"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              E-mail que aparecerá no campo "De" dos e-mails
            </p>
          </div>

          {/* Nome de Remetente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Remetente
            </label>
            <Input
              type="text"
              value={data.smtp_remetente_nome || ''}
              onChange={(e) => onChange({ smtp_remetente_nome: e.target.value })}
              disabled={isLoading}
              placeholder="CFO Hub"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nome que aparecerá no campo "De" dos e-mails
            </p>
          </div>
        </div>
      </div>

      {/* Cards informativos */}
      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Dica para Gmail:</strong> Use "smtp.gmail.com" porta 587 com TLS, ou crie uma <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">senha de aplicação</a>.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>⚠️ Segurança:</strong> Nunca compartilhe estas credenciais. Elas são armazenadas criptografadas e acessíveis apenas a administradores.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SmtpConfig;
