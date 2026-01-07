import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoSala = 'call' | 'reuniao';

export interface ReservaSala {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  tipoSala: TipoSala;
  data: string; // formato: YYYY-MM-DD
  horaInicio: string; // formato: HH:mm
  horaFim: string; // formato: HH:mm
  motivo: string;
  criadoEm: string;
  status: 'ativa' | 'cancelada';
}

interface ReservasState {
  reservas: ReservaSala[];
  adicionarReserva: (reserva: Omit<ReservaSala, 'id' | 'criadoEm' | 'status'>) => boolean;
  cancelarReserva: (id: string) => void;
  verificarDisponibilidade: (tipoSala: TipoSala, data: string, horaInicio: string, horaFim: string) => { disponivel: boolean; conflito?: ReservaSala };
  getReservasPorData: (data: string) => ReservaSala[];
  reset: () => void;
}

const mockReservas: ReservaSala[] = [];
export const useReservasStore = create<ReservasState>()(
  persist(
    (set, get) => ({
      reservas: mockReservas,
      
      adicionarReserva: (reserva) => {
        const { verificarDisponibilidade } = get();
        const { disponivel } = verificarDisponibilidade(
          reserva.tipoSala,
          reserva.data,
          reserva.horaInicio,
          reserva.horaFim
        );

        if (!disponivel) {
          return false;
        }

        const novaReserva: ReservaSala = {
          ...reserva,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          status: 'ativa',
        };

        set((state) => ({
          reservas: [...state.reservas, novaReserva],
        }));

        return true;
      },

      cancelarReserva: (id) => {
        set((state) => ({
          reservas: state.reservas.map((r) =>
            r.id === id ? { ...r, status: 'cancelada' } : r
          ),
        }));
      },

      verificarDisponibilidade: (tipoSala, data, horaInicio, horaFim) => {
        const reservasAtivas = get().reservas.filter(
          (r) => r.status === 'ativa' && r.tipoSala === tipoSala && r.data === data
        );

        const toMinutes = (time: string) => {
          const [h, m] = time.split(':').map(Number);
          return h * 60 + m;
        };

        const inicioMin = toMinutes(horaInicio);
        const fimMin = toMinutes(horaFim);

        for (const reserva of reservasAtivas) {
          const resInicioMin = toMinutes(reserva.horaInicio);
          const resFimMin = toMinutes(reserva.horaFim);

          // Verificar sobreposição
          const temConflito =
            (inicioMin >= resInicioMin && inicioMin < resFimMin) ||
            (fimMin > resInicioMin && fimMin <= resFimMin) ||
            (inicioMin <= resInicioMin && fimMin >= resFimMin);

          if (temConflito) {
            return { disponivel: false, conflito: reserva };
          }
        }

        return { disponivel: true };
      },

      getReservasPorData: (data) => {
        return get().reservas.filter((r) => r.data === data && r.status === 'ativa');
      },

      reset: () => set({ reservas: mockReservas }),
    }),
    { name: 'cfo:reservas', partialize: (s) => ({ reservas: s.reservas }) }
  )
);
