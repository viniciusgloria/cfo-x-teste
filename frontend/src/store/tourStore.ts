import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  tourCompleted: boolean;       // usuário já concluiu totalmente o tour
  showTour: boolean;            // controlar visibilidade atual
  autoTourShown: boolean;       // já exibimos automaticamente uma vez
  completeTour: () => void;     // concluir e marcar como não mais auto
  startTour: () => void;        // abrir manualmente
  closeTour: () => void;        // fechar sem concluir
  markAutoShown: () => void;    // marcar primeira exibição automática
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      tourCompleted: false,
      showTour: false,
      autoTourShown: false,
      completeTour: () => set({ tourCompleted: true, showTour: false }),
      startTour: () => set({ showTour: true }),
      closeTour: () => set({ showTour: false }),
      markAutoShown: () => set({ autoTourShown: true }),
    }),
    {
      name: 'cfo:tour',
    }
  )
);
