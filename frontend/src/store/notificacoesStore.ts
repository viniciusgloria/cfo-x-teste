import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoNotificacao =
  | 'solicitacao_aprovada'
  | 'solicitacao_rejeitada'
  | 'nova_solicitacao_gestor'
  | 'ajuste_ponto_aprovado'
  | 'ajuste_ponto_rejeitado'
  | 'ajuste_aprovado'
  | 'ajuste_rejeitado'
  | 'nova_mensagem_mural'
  | 'feedback_recebido'
  | 'okr_atualizado'
  | 'reserva_sala_proxima'
  | 'aniversario'
  | 'aviso_sistema'
  | 'documento_aprovado'
  | 'documento_rejeitado'
  | 'documento_enviado'
  | 'documento_pendente'
  | 'documento_pendente_gestor'
  | 'lembrete'
  | 'folha_alerta'
  | 'folha_gerada'
  | 'folha_paga'
  | 'beneficio_atualizado'
  | 'avaliacao_pendente'
  | 'avaliacao_concluida'
  | 'tarefa_atualizada'
  | 'tarefa_atribuida'
  | 'tarefa_comentada'
  | 'tarefa_status_mudou'
  | 'tarefa_vencimento_proximo';

export type PrioridadeNotificacao = 'alta' | 'media' | 'baixa';
export type CategoriaNotificacao = 'rh' | 'documentos' | 'ponto' | 'solicitacoes' | 'mural' | 'sistema' | 'beneficios' | 'folha' | 'desenvolvimento' | 'tarefas' | 'outros';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  link?: string; // URL para redirecionar ao clicar
  icone?: string; // Nome do ícone lucide
  cor?: string; // Cor do ícone
  destinatarioId?: string; // ID do colaborador que deve receber (undefined = todos)
  prioridade?: PrioridadeNotificacao;
  categoria?: CategoriaNotificacao;
}

interface NotificacoesState {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'criadoEm' | 'lida'>) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  removerNotificacao: (id: string) => void;
  getNotificacoesNaoLidas: () => Notificacao[];
  getNotificacoesPorUsuario: (usuarioId: string) => Notificacao[];
  adicionarNotificacaoDeLembrete: (lembrete: { id: string; titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa'; link?: string }) => void;
  notificarDocumentoAprovado: (colaboradorId: string, documentoNome: string) => void;
  notificarDocumentoRejeitado: (colaboradorId: string, documentoNome: string, motivo: string) => void;
  notificarDocumentoEnviado: (gestoresIds: string[], colaboradorNome: string, documentoTipo: string) => void;
  notificarWatchersTarefa: (watcherIds: string[], tarefaTitulo: string, tipo: 'atualizada' | 'comentada' | 'status_mudou', descricaoMudanca?: string, link?: string) => void;
  notificarTarefaAtribuida: (colaboradorId: string, tarefaTitulo: string, atribuidoPor: string, link?: string) => void;
  reset: () => void;
}

const mockNotificacoes: Notificacao[] = [];
export const useNotificacoesStore = create<NotificacoesState>()(
  persist(
    (set, get) => ({
      notificacoes: mockNotificacoes,

      adicionarNotificacao: (notificacao) => {
        const nova: Notificacao = {
          ...notificacao,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
          prioridade: notificacao.prioridade || 'media',
          categoria: notificacao.categoria || 'sistema',
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      marcarComoLida: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        }));
      },

      marcarTodasComoLidas: () => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
        }));
      },

      removerNotificacao: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.filter((n) => n.id !== id),
        }));
      },

      getNotificacoesNaoLidas: () => {
        return get().notificacoes.filter((n) => !n.lida);
      },

      getNotificacoesPorUsuario: (usuarioId) => {
        return get().notificacoes.filter(
          (n) => !n.destinatarioId || n.destinatarioId === usuarioId
        );
      },

      adicionarNotificacaoDeLembrete: (lembrete) => {
        const nova: Notificacao = {
          id: `lem-${lembrete.id}`,
          tipo: 'lembrete',
          titulo: lembrete.titulo,
          mensagem: lembrete.descricao,
          lida: false,
          criadoEm: new Date().toISOString(),
          link: lembrete.link || '/lembretes',
          icone: 'Bell',
          cor: 'text-orange-600',
          prioridade: lembrete.prioridade,
          categoria: 'rh',
        };
        set((state) => ({ notificacoes: [nova, ...state.notificacoes] }));
      },

      notificarDocumentoAprovado: (colaboradorId, documentoNome) => {
        const nova: Notificacao = {
          tipo: 'documento_aprovado',
          titulo: 'Documento Aprovado',
          mensagem: `Seu documento "${documentoNome}" foi aprovado!`,
          link: '/documentos',
          icone: 'CheckCircle',
          cor: 'text-green-600',
          destinatarioId: colaboradorId,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      notificarDocumentoRejeitado: (colaboradorId, documentoNome, motivo) => {
        const nova: Notificacao = {
          tipo: 'documento_rejeitado',
          titulo: 'Documento Rejeitado',
          mensagem: `Seu documento "${documentoNome}" foi rejeitado. Motivo: ${motivo}`,
          link: '/documentos',
          icone: 'XCircle',
          cor: 'text-red-600',
          destinatarioId: colaboradorId,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      notificarDocumentoEnviado: (gestoresIds, colaboradorNome, documentoTipo) => {
        const novasNotificacoes: Notificacao[] = gestoresIds.map((gestorId) => ({
          tipo: 'documento_pendente_gestor' as TipoNotificacao,
          titulo: 'Novo Documento Pendente',
          mensagem: `${colaboradorNome} enviou um documento do tipo "${documentoTipo}" para aprovação.`,
          link: '/documentos',
          icone: 'Clock',
          cor: 'text-yellow-600',
          destinatarioId: gestorId,
          id: `${Date.now()}-${gestorId}`,
          criadoEm: new Date().toISOString(),
          lida: false,
        }));

        set((state) => ({
          notificacoes: [...novasNotificacoes, ...state.notificacoes],
        }));
      },

      notificarWatchersTarefa: (watcherIds, tarefaTitulo, tipo, descricaoMudanca, link) => {
        const tipoMap = {
          atualizada: { tipo: 'tarefa_atualizada' as TipoNotificacao, icone: 'Edit', cor: 'text-blue-600', titulo: 'Tarefa Atualizada' },
          comentada: { tipo: 'tarefa_comentada' as TipoNotificacao, icone: 'MessageSquare', cor: 'text-purple-600', titulo: 'Novo Comentário' },
          status_mudou: { tipo: 'tarefa_status_mudou' as TipoNotificacao, icone: 'ArrowRight', cor: 'text-green-600', titulo: 'Status Alterado' },
        };

        const config = tipoMap[tipo];
        const novasNotificacoes: Notificacao[] = watcherIds.map((watcherId) => ({
          tipo: config.tipo,
          titulo: config.titulo,
          mensagem: descricaoMudanca 
            ? `A tarefa "${tarefaTitulo}" foi ${tipo === 'atualizada' ? 'atualizada' : tipo === 'comentada' ? 'comentada' : 'movida'}. ${descricaoMudanca}`
            : `A tarefa "${tarefaTitulo}" foi ${tipo === 'atualizada' ? 'atualizada' : tipo === 'comentada' ? 'comentada' : 'movida'}.`,
          link: link || '/tarefas',
          icone: config.icone,
          cor: config.cor,
          destinatarioId: watcherId,
          prioridade: 'media',
          categoria: 'tarefas',
          id: `${Date.now()}-${watcherId}-${Math.random()}`,
          criadoEm: new Date().toISOString(),
          lida: false,
        }));

        set((state) => ({
          notificacoes: [...novasNotificacoes, ...state.notificacoes],
        }));
      },

      notificarTarefaAtribuida: (colaboradorId, tarefaTitulo, atribuidoPor, link) => {
        const nova: Notificacao = {
          tipo: 'tarefa_atribuida',
          titulo: 'Nova Tarefa Atribuída',
          mensagem: `${atribuidoPor} atribuiu você à tarefa "${tarefaTitulo}".`,
          link: link || '/tarefas',
          icone: 'UserPlus',
          cor: 'text-indigo-600',
          destinatarioId: colaboradorId,
          prioridade: 'alta',
          categoria: 'tarefas',
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      reset: () => set({ notificacoes: mockNotificacoes }),
    }),
    { name: 'cfo:notificacoes', partialize: (s) => ({ notificacoes: s.notificacoes }) }
  )
);
