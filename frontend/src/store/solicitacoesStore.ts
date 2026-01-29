import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';
import { useNotificacoesStore } from './notificacoesStore';

export interface Solicitacao {
  id: string;
  tipo: 'material' | 'documento' | 'reembolso' | 'ferias' | 'homeoffice';
  titulo: string;
  descricao: string;
  valor?: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  solicitante: { nome: string; avatar: string };
  data: string;
  urgencia: 'baixa' | 'media' | 'alta';
  anexos?: Attachment[];
  respostaGestor?: {
    enviadoEm: string;
    enviadoPor: string;
    mensagem?: string;
  };
  arquivosResposta?: Attachment[];
}

interface SolicitacoesState {
  solicitacoes: Solicitacao[];
  adicionarSolicitacao: (sol: Solicitacao) => void;
  atualizarStatus: (id: string, status: 'aprovada' | 'rejeitada') => void;
  enviarRespostaComArquivos: (id: string, arquivos: Attachment[], mensagem: string, gestorNome: string) => void;
  reset: () => void;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: '1',
    tipo: 'material',
    titulo: 'Solicitação Demo 1',
    descricao: 'Solicitação de material para demonstração',
    status: 'pendente',
    solicitante: { nome: 'João Silva', avatar: '' },
    data: new Date().toISOString(),
    urgencia: 'alta',
  },
  {
    id: '2',
    tipo: 'ferias',
    titulo: 'Solicitação Demo 2',
    descricao: 'Solicitação de férias para exemplo',
    status: 'aprovada',
    solicitante: { nome: 'Maria Santos', avatar: '' },
    data: new Date(Date.now() - 86400000).toISOString(),
    urgencia: 'media',
  },
];

export const useSolicitacoesStore = create<SolicitacoesState>()(
  persist(
    (set) => ({
      solicitacoes: mockSolicitacoes,
      adicionarSolicitacao: (sol) => set((state) => ({
        solicitacoes: [sol, ...state.solicitacoes]
      })),
      atualizarStatus: (id, status) => set((state) => {
        const solicitacao = state.solicitacoes.find(s => s.id === id);
        if (solicitacao) {
          // Emitir notificação para o solicitante
          useNotificacoesStore.getState().adicionarNotificacao({
            tipo: status === 'aprovada' ? 'solicitacao_aprovada' : 'solicitacao_rejeitada',
            titulo: status === 'aprovada' 
              ? `Solicitação aprovada: ${solicitacao.titulo}`
              : `Solicitação rejeitada: ${solicitacao.titulo}`,
            mensagem: status === 'aprovada'
              ? `Sua solicitação "${solicitacao.titulo}" foi aprovada.`
              : `Sua solicitação "${solicitacao.titulo}" foi rejeitada.`,
            link: '/solicitacoes',
            prioridade: solicitacao.urgencia === 'alta' ? 'alta' : 'media',
            categoria: 'solicitacoes',
          });
        }
        return {
          solicitacoes: state.solicitacoes.map(sol =>
            sol.id === id ? { ...sol, status } : sol
          )
        };
      }),
      enviarRespostaComArquivos: (id, arquivos, mensagem, gestorNome) => set((state) => {
        const solicitacao = state.solicitacoes.find(s => s.id === id);
        if (solicitacao) {
          // Emitir notificação para o solicitante
          useNotificacoesStore.getState().adicionarNotificacao({
            tipo: 'documento_aprovado',
            titulo: `Resposta recebida: ${solicitacao.titulo}`,
            mensagem: `${gestorNome} respondeu sua solicitação "${solicitacao.titulo}" com ${arquivos.length} arquivo(s).`,
            link: '/solicitacoes',
            prioridade: 'media',
            categoria: 'solicitacoes',
          });
        }
        return {
          solicitacoes: state.solicitacoes.map(sol =>
            sol.id === id 
              ? {
                  ...sol,
                  arquivosResposta: arquivos,
                  respostaGestor: {
                    enviadoEm: new Date().toLocaleDateString('pt-BR'),
                    enviadoPor: gestorNome,
                    mensagem
                  }
                }
              : sol
          )
        };
      }),
      reset: () => set({ solicitacoes: mockSolicitacoes }),
    }),
    { name: 'cfo:solicitacoes', partialize: (s) => ({ solicitacoes: s.solicitacoes }) }
  )
);
