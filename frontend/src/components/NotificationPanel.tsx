import { useState } from 'react';
import { X, AlertTriangle, Mail } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useClientesStore } from '../store/clientesStore';

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className = '' }: NotificationPanelProps) {
  const { notificacoes, marcarNotificacaoComoLida } = useClientesStore();
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Filtrar notificações do usuário atual que são importantes (devoluções)
  const userNotifications = notificacoes.filter(notif =>
    notif.tipo === 'cliente_devolucao' &&
    !notif.lida &&
    !dismissedNotifications.has(notif.id)
  );

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(notificationId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    marcarNotificacaoComoLida(notificationId);
  };

  if (userNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {userNotifications.map((notif) => (
        <Card key={notif.id} className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                  Cadastro precisa de ajustes
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => handleDismiss(notif.id)}
                  className="text-orange-600 hover:text-orange-800 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {notif.mensagem}
              </p>

              {notif.comentariosDevolucao && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                      Correções necessárias:
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {notif.comentariosDevolucao}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Button
                  onClick={() => window.location.href = '/cadastro-cliente?id=' + notif.clienteId}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Fazer correções
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Marcar como lida
                </Button>
              </div>

              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                📧 Um e-mail foi enviado para seu endereço cadastrado com mais detalhes
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}