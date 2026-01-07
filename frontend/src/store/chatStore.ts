import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mensagem {
  id: number;
  conversaId: number;
  remetenteId: string;
  texto: string;
  timestamp: string;
  lida: boolean;
}

export interface Conversa {
  id: number;
  participantes: string[]; // IDs dos participantes
  nomeGrupo?: string;
  ultimaMensagem?: string;
  ultimaAtualizacao: string;
  naoLidas: number;
}

interface ChatState {
  conversas: Conversa[];
  mensagens: Mensagem[];
  conversaAtiva: number | null;
  setConversaAtiva: (id: number | null) => void;
  enviarMensagem: (conversaId: number, texto: string, remetenteId: string) => void;
  marcarComoLida: (conversaId: number) => void;
  iniciarConversa: (participantes: string[]) => number;
  getMensagensDaConversa: (conversaId: number) => Mensagem[];
  reset: () => void;
}

const mockMensagens: Mensagem[] = [];
const mockConversas: Conversa[] = [];
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversas: mockConversas,
      mensagens: mockMensagens,
      conversaAtiva: null,

      setConversaAtiva: (id) => set({ conversaAtiva: id }),

      enviarMensagem: (conversaId, texto, remetenteId) => {
        const novaMensagem: Mensagem = {
          id: Date.now(),
          conversaId,
          remetenteId,
          texto,
          timestamp: new Date().toISOString(),
          lida: false,
        };
        set((state) => ({
          mensagens: [...state.mensagens, novaMensagem],
          conversas: state.conversas.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  ultimaMensagem: texto,
                  ultimaAtualizacao: novaMensagem.timestamp,
                  naoLidas: c.naoLidas + 1,
                }
              : c
          ),
        }));
      },

      marcarComoLida: (conversaId) => {
        set((state) => ({
          conversas: state.conversas.map((c) =>
            c.id === conversaId ? { ...c, naoLidas: 0 } : c
          ),
          mensagens: state.mensagens.map((m) =>
            m.conversaId === conversaId ? { ...m, lida: true } : m
          ),
        }));
      },

      iniciarConversa: (participantes: string[]) => {
        const novaConversa: Conversa = {
          id: Date.now(),
          participantes,
          ultimaMensagem: '',
          ultimaAtualizacao: new Date().toISOString(),
          naoLidas: 0,
        };
        set((state) => ({
          conversas: [...state.conversas, novaConversa],
        }));
        return novaConversa.id;
      },

      getMensagensDaConversa: (conversaId) => {
        return get().mensagens.filter((m) => m.conversaId === conversaId);
      },

      reset: () =>
        set({
          conversas: [],
          mensagens: [],
          conversaAtiva: null,
        }),
    }),
    {
      name: 'cfo:chat',
    }
  )
);
