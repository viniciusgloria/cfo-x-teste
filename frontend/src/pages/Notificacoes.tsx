import { useMemo, useState } from 'react';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNotificacoesStore, TipoNotificacao } from '../store/notificacoesStore';
import { Bell, CheckCircle, Filter, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const labelsTipo: Record<TipoNotificacao, string> = {
  solicitacao_aprovada: 'Solicitação Aprovada',
  solicitacao_rejeitada: 'Solicitação Rejeitada',
  nova_solicitacao_gestor: 'Nova Solicitação (Gestor)',
  ajuste_ponto_aprovado: 'Ajuste de Ponto Aprovado',
  ajuste_ponto_rejeitado: 'Ajuste de Ponto Rejeitado',
  ajuste_aprovado: 'Ajuste Aprovado',
  ajuste_rejeitado: 'Ajuste Rejeitado',
  nova_mensagem_mural: 'Mural',
  feedback_recebido: 'Feedback',
  okr_atualizado: 'OKR',
  reserva_sala_proxima: 'Reserva de Sala',
  aniversario: 'Aniversário',
  aviso_sistema: 'Aviso do Sistema',
  documento_aprovado: 'Documento Aprovado',
  documento_rejeitado: 'Documento Rejeitado',
  documento_enviado: 'Documento Enviado',
  documento_pendente: 'Documento Pendente',
  documento_pendente_gestor: 'Documento Pendente',
  lembrete: 'Lembrete',
  folha_alerta: 'Folha',
  folha_gerada: 'Folha Gerada',
  folha_paga: 'Pagamento Realizado',
  beneficio_atualizado: 'Benefício',
  avaliacao_pendente: 'Avaliação Pendente',
  avaliacao_concluida: 'Avaliação Concluída',
};

function formatTempo(dataISO: string) {
  const agora = new Date().getTime();
  const data = new Date(dataISO).getTime();
  const diffMin = Math.floor((agora - data) / (1000 * 60));
  if (diffMin < 60) return `${diffMin}m atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

export function Notificacoes() {
  const navigate = useNavigate();
  const { notificacoes, marcarComoLida, marcarTodasComoLidas, removerNotificacao } = useNotificacoesStore();
  const [filtro, setFiltro] = useState<'todas' | 'naoLidas'>('todas');
  const [filtroTipo, setFiltroTipo] = useState<TipoNotificacao | 'todos'>('todos');

  const notificacoesFiltradas = useMemo(() => {
    return notificacoes.filter((n) => {
      if (filtro === 'naoLidas' && n.lida) return false;
      if (filtroTipo !== 'todos' && n.tipo !== filtroTipo) return false;
      return true;
    });
  }, [notificacoes, filtro, filtroTipo]);

  const handleClick = (id: string, link?: string) => {
    marcarComoLida(id);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Notificações"
        icon={<Bell size={28} />}
        right={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant={filtro === 'todas' ? 'primary' : 'outline'} onClick={() => setFiltro('todas')}>
              Todas
            </Button>
            <Button variant={filtro === 'naoLidas' ? 'primary' : 'outline'} onClick={() => setFiltro('naoLidas')}>
              Não lidas
            </Button>
            <Button
              variant="outline"
              className="whitespace-nowrap flex items-center gap-2"
              onClick={() => marcarTodasComoLidas()}
            >
              <CheckCircle size={18} />
              Marcar todas como lidas
            </Button>
          </div>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-500 dark:text-slate-400" />
          <span className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-300">Filtrar por tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-700 rounded-md bg-white dark:bg-slate-900 dark:bg-gray-800 text-sm"
          >
            <option value="todos">Todos</option>
            {Object.entries(labelsTipo).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {notificacoesFiltradas.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
            <Bell size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600 dark:text-slate-300" />
            Nenhuma notificação encontrada
          </div>
        ) : (
          <div className="space-y-3">
            {notificacoesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border border-gray-200 dark:border-slate-700 ${!notif.lida ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{notif.titulo}</p>
                      {!notif.lida && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-200">{notif.mensagem}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatTempo(notif.criadoEm)}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge>{labelsTipo[notif.tipo]}</Badge>
                      {notif.categoria && <Badge>{notif.categoria}</Badge>}
                      {notif.prioridade && <Badge>{notif.prioridade}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notif.link && (
                      <Button variant="outline" onClick={() => handleClick(notif.id, notif.link)}>
                        Abrir
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => marcarComoLida(notif.id)}>
                      Marcar lida
                    </Button>
                    <button
                      onClick={() => removerNotificacao(notif.id)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}




