import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Feedback {
  id: string;
  de: { nome: string; avatar: string };
  para: { nome: string; avatar: string };
  tipo: 'positivo' | 'construtivo' | 'avaliacao';
  titulo: string;
  mensagem: string;
  data: string;
  privado: boolean;
  nota?: number;
}

interface FeedbacksState {
  feedbacks: Feedback[];
  feedbacksEnviados: Feedback[];
  adicionarFeedback: (fb: Feedback) => void;
  adicionarFeedbackEnviado: (fb: Feedback) => void;
  solicitarFeedback: (paraQuem: string, tipo: string, pergunta: string, anonimo: boolean) => void;
  reset: () => void;
}

const mockFeedbacks: Feedback[] = [];
export const useFeedbacksStore = create<FeedbacksState>()(
  persist(
    (set) => ({
      feedbacks: mockFeedbacks,
      feedbacksEnviados: [],
      adicionarFeedback: (fb) => set((state) => ({
        feedbacks: [fb, ...state.feedbacks]
      })),
      adicionarFeedbackEnviado: (fb) => set((state) => ({
        feedbacksEnviados: [fb, ...state.feedbacksEnviados]
      })),
      solicitarFeedback: (paraQuem, tipo, pergunta, anonimo) => {
        console.log('Feedback solicitado:', { paraQuem, tipo, pergunta, anonimo });
      },
      reset: () => set({ feedbacks: mockFeedbacks, feedbacksEnviados: [] }),
    }),
    { name: 'cfo:feedbacks', partialize: (s) => ({ feedbacks: s.feedbacks, feedbacksEnviados: s.feedbacksEnviados }) }
  )
);
