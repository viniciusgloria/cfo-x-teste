import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment, User } from '../types';
import { useNotificacoesStore } from './notificacoesStore';

export type TipoSolicitacaoPonto = 'ajuste' | 'atestado';
export type AlvoAjuste = 'entrada' | 'saida';
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'rejeitada';

export interface SolicitacaoPonto {
  id: string;
  colaboradorEmail: string; // lookup to colaboradoresStore when necessário
  colaboradorNome: string;
  data: string; // dd/mm/yyyy
  tipo: TipoSolicitacaoPonto;
  alvo?: AlvoAjuste; // para ajuste
  horarioNovo?: string; // HH:MM
  motivo: string;
  anexos?: Attachment[]; // para atestado
  status: StatusSolicitacao;
  createdAt: string; // ISO
  decididoPor?: Pick<User, 'id' | 'name' | 'role'>;
  decididoEm?: string; // ISO
}

interface AjustesPontoState {
  solicitacoes: SolicitacaoPonto[];
  adicionar: (s: Omit<SolicitacaoPonto, 'id' | 'status' | 'createdAt'>) => string;
  atualizarStatus: (id: string, status: StatusSolicitacao, decididoPor?: Pick<User, 'id' | 'name' | 'role'>) => void;
  reset: () => void;
}

export const useAjustesPontoStore = create<AjustesPontoState>()(
  persist(
    (set) => ({
      solicitacoes: [],
      adicionar: (dados) => {
        const id = Date.now().toString();
        const novo: SolicitacaoPonto = {
          ...dados,
          id,
          status: 'pendente',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ solicitacoes: [novo, ...state.solicitacoes] }));
        try {
          useNotificacoesStore.getState().adicionarNotificacao({
            tipo: 'nova_solicitacao_gestor',
            titulo: 'Nova solicitação de ponto',
            mensagem: `${novo.colaboradorNome} enviou uma solicitação de ${novo.tipo === 'ajuste' ? 'ajuste' : 'atestado'} para ${novo.data}`,
            link: '/solicitacoes',
            icone: 'Clock',
            cor: 'text-blue-600',
          });
        } catch (e) {
          // ignore notification errors in client
        }
        return id;
      },
      atualizarStatus: (id, status, decididoPor) =>
        set((state) => {
          const solicitacao = state.solicitacoes.find(s => s.id === id);
          
          // Emitir notificação para o colaborador sobre resultado
          if (solicitacao && status !== 'pendente') {
            try {
              useNotificacoesStore.getState().adicionarNotificacao({
                tipo: status === 'aprovada' ? 'ajuste_aprovado' : 'ajuste_rejeitado',
                titulo: status === 'aprovada' 
                  ? 'Solicitação de ponto aprovada' 
                  : 'Solicitação de ponto rejeitada',
                mensagem: `Sua solicitação de ${solicitacao.tipo} para ${solicitacao.data} foi ${status}.`,
                link: '/ponto',
                prioridade: status === 'rejeitada' ? 'alta' : 'media',
                categoria: 'ponto',
              });
            } catch (e) {
              // ignore notification errors
            }
          }
          
          return {
            solicitacoes: state.solicitacoes.map((s) =>
              s.id === id ? { ...s, status, decididoPor, decididoEm: new Date().toISOString() } : s
            ),
          };
        }),
      reset: () => set({ solicitacoes: [] }),
    }),
    { name: 'cfo:ajustes-ponto', partialize: (s) => ({ solicitacoes: s.solicitacoes }) }
  )
);
