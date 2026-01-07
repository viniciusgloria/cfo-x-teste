import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseTimeToMinutes, minutesToHHMM, formatBankMinutes, diffMinutes } from '../utils/time';

export interface Localizacao {
  bairro?: string;
  cidade?: string;
  estado?: string;
  lat?: number;
  lon?: number;
  accuracy?: number;
}

export type PunchType = 'entrada' | 'saida' | 'inicio_intervalo' | 'fim_intervalo';

export interface Punch {
  type: PunchType;
  ts: number; // timestamp UTC
  hhmm: string; // formatted HH:MM
  localizacao?: Localizacao | string; // allow string for fallback "Geolocalização indefinida"
}

export interface Intervalo {
  inicioTs: number;
  fimTs?: number;
  duracaoMinutos?: number;
}

export interface RegistroDia {
  data: string; // 'DD/MM/YYYY'
  punches: Punch[]; // audit trail, chronological ascending
  intervals: Intervalo[]; // derived
  totalMinutos?: number;
  bancoHoras?: string;
  isFeriado?: boolean;
  updatedAt?: number;
}

interface PontoState {
  registros: RegistroDia[]; // most recent first in UI, but stored here newest first for convenience
  feriadosISO: string[]; // YYYY-MM-DD
  bancoHoras?: string;
  isProcessing: boolean;
  statusHoje: string;
  // actions
  setFeriados: (isoDates: string[]) => void;
  canRegisterEntrada: (date?: Date) => { ok: boolean; message?: string };
  canRegisterSaida: (date?: Date) => { ok: boolean; message?: string };
  canRegisterInicioIntervalo: (date?: Date) => { ok: boolean; message?: string };
  canRegisterFimIntervalo: (date?: Date) => { ok: boolean; message?: string };
  registrarEntrada: (localizacao?: Localizacao | string) => Promise<{ success: boolean; message: string }>;
  registrarInicioIntervalo: (localizacao?: Localizacao | string) => Promise<{ success: boolean; message: string }>;
  registrarFimIntervalo: (localizacao?: Localizacao | string) => Promise<{ success: boolean; message: string }>;
  registrarSaida: (localizacao?: Localizacao | string) => Promise<{ success: boolean; message: string }>;
  reset: () => void;
}

const DEFAULT_EXPECTED_PER_DAY = 8 * 60;

function formatDateKey(d = new Date()) {
  return d.toLocaleDateString('pt-BR'); // matches UI
}

function hhmmFromTs(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const usePontoStore = create<PontoState>()(
  persist(
    (set, get) => ({
      registros: [],
      feriadosISO: [],
      isProcessing: false,
      statusHoje: 'Registre sua entrada!',

      setFeriados: (isoDates: string[]) => set({ feriadosISO: isoDates }),

      canRegisterEntrada: (date = new Date()) => {
        const iso = date.toISOString().slice(0, 10);
        const todayKey = formatDateKey(date);
        if (get().feriadosISO.includes(iso)) return { ok: false, message: 'Hoje é feriado!' };
        const registro = get().registros.find((r) => r.data === todayKey);
        if (registro && registro.punches.some((p) => p.type === 'entrada')) {
          return { ok: false, message: 'Entrada já registrada' };
        }
        return { ok: true };
      },

      canRegisterSaida: (date = new Date()) => {
        const iso = date.toISOString().slice(0, 10);
        const todayKey = formatDateKey(date);
        if (get().feriadosISO.includes(iso)) return { ok: false, message: 'Hoje é feriado!' };
        const registro = get().registros.find((r) => r.data === todayKey);
        if (!registro || !registro.punches.some((p) => p.type === 'entrada')) {
          return { ok: false, message: 'Você precisa registrar a entrada!' };
        }
        if (registro.punches.some((p) => p.type === 'saida')) return { ok: false, message: 'Saída já registrada' };
        return { ok: true };
      },

      canRegisterInicioIntervalo: (date = new Date()) => {
        const iso = date.toISOString().slice(0, 10);
        const todayKey = formatDateKey(date);
        if (get().feriadosISO.includes(iso)) return { ok: false, message: 'Hoje é feriado!' };
        const registro = get().registros.find((r) => r.data === todayKey);
        if (!registro || !registro.punches.some((p) => p.type === 'entrada')) {
          return { ok: false, message: 'Primeiro registre a entrada!' };
        }
        // check if there's an open interval (inicio without fim)
        const hasOpenInicio = registro.punches.some((p) => p.type === 'inicio_intervalo' && !registro.punches.some((q) => q.type === 'fim_intervalo' && q.ts >= p.ts));
        if (hasOpenInicio) return { ok: false, message: 'Intervalo já iniciado' };
        return { ok: true };
      },

      canRegisterFimIntervalo: (date = new Date()) => {
        const iso = date.toISOString().slice(0, 10);
        const todayKey = formatDateKey(date);
        if (get().feriadosISO.includes(iso)) return { ok: false, message: 'Hoje é feriado!' };
        const registro = get().registros.find((r) => r.data === todayKey);
        if (!registro) return { ok: false, message: 'Não há intervalo em andamento' };
        // find last inicio without matching fim
        const inicio = registro.punches.slice().reverse().find((p) => p.type === 'inicio_intervalo' && !registro.punches.some((q) => q.type === 'fim_intervalo' && q.ts >= p.ts));
        if (!inicio) return { ok: false, message: 'Não há intervalo em andamento' };
        return { ok: true };
      },

      registrarEntrada: async (localizacao) => {
        const processing = get().isProcessing;
        if (processing) return { success: false, message: 'Processando...' };
        set({ isProcessing: true });
        try {
          const can = get().canRegisterEntrada();
          if (!can.ok) return { success: false, message: can.message || 'Não permitido' };
          const now = Date.now();
          const hh = hhmmFromTs(now);
          const dateKey = formatDateKey(new Date());
          const punch: Punch = { type: 'entrada', ts: now, hhmm: hh, localizacao: localizacao ?? 'Geolocalização indefinida' };
          set((state) => {
            const registros = [...state.registros];
            const idx = registros.findIndex((r) => r.data === dateKey);
            if (idx >= 0) {
              registros[idx] = { ...registros[idx], punches: [...registros[idx].punches, punch], updatedAt: Date.now() };
            } else {
              const novo: RegistroDia = { data: dateKey, punches: [punch], intervals: [], updatedAt: Date.now() };
              registros.unshift(novo);
            }
            return { registros, statusHoje: `Entrada registrada às ${hh}` } as any;
          });
          return { success: true, message: `Entrada registrada às ${hh}` };
        } finally {
          set({ isProcessing: false });
        }
      },

      registrarInicioIntervalo: async (localizacao) => {
        const processing = get().isProcessing;
        if (processing) return { success: false, message: 'Processando...' };
        set({ isProcessing: true });
        try {
          const can = get().canRegisterInicioIntervalo();
          if (!can.ok) return { success: false, message: can.message || 'Não permitido' };
          const now = Date.now();
          const hh = hhmmFromTs(now);
          const dateKey = formatDateKey(new Date());
          const punch: Punch = { type: 'inicio_intervalo', ts: now, hhmm: hh, localizacao: localizacao ?? 'Geolocalização indefinida' };
          set((state) => {
            const registros = [...state.registros];
            const idx = registros.findIndex((r) => r.data === dateKey);
            if (idx >= 0) {
              const registro = { ...registros[idx] };
              const punches = [...registro.punches, punch];
              // build intervals including open intervals (inicio without fim)
              const intervals: Intervalo[] = [];
              const stack: number[] = [];
              punches.forEach((p) => {
                if (p.type === 'inicio_intervalo') stack.push(p.ts);
                if (p.type === 'fim_intervalo' && stack.length) {
                  const inicioTs = stack.pop() as number;
                  const fimTs = p.ts;
                  intervals.push({ inicioTs, fimTs, duracaoMinutos: Math.max(0, Math.round((fimTs - inicioTs) / 60000)) });
                }
              });
              // any remaining in stack represent open intervals (no fim yet)
              while (stack.length) {
                const inicioTs = stack.shift() as number;
                intervals.push({ inicioTs });
              }

              registro.punches = punches;
              registro.intervals = intervals;
              registro.updatedAt = Date.now();
              registros[idx] = registro;
            } else {
              // shouldn't happen due to canRegister but be safe
              const punches = [punch];
              const intervals: Intervalo[] = [{ inicioTs: now }];
              registros.unshift({ data: dateKey, punches, intervals, updatedAt: Date.now() });
            }
            return { registros, statusHoje: `Intervalo iniciado às ${hh}` } as any;
          });
          return { success: true, message: `Intervalo iniciado às ${hh}` };
        } finally {
          set({ isProcessing: false });
        }
      },

      registrarFimIntervalo: async (localizacao) => {
        const processing = get().isProcessing;
        if (processing) return { success: false, message: 'Processando...' };
        set({ isProcessing: true });
        try {
          const can = get().canRegisterFimIntervalo();
          if (!can.ok) return { success: false, message: can.message || 'Não permitido' };
          const now = Date.now();
          const hh = hhmmFromTs(now);
          const dateKey = formatDateKey(new Date());
          set((state) => {
            const registros = [...state.registros];
            const idx = registros.findIndex((r) => r.data === dateKey);
            if (idx >= 0) {
              const registro = { ...registros[idx] };
              // find last open inicio
              const punches = [...registro.punches];
              const lastInicioIndex = [...punches].reverse().findIndex((p) => p.type === 'inicio_intervalo' && !punches.some((q) => q.type === 'fim_intervalo' && q.ts >= p.ts));
              const revIndex = lastInicioIndex >= 0 ? punches.length - 1 - lastInicioIndex : -1;
              if (revIndex >= 0) {
                const fimPunch: Punch = { type: 'fim_intervalo', ts: now, hhmm: hh, localizacao: localizacao ?? 'Geolocalização indefinida' };
                punches.push(fimPunch);
                // build intervals from punches
                const intervals: Intervalo[] = [];
                const stack: number[] = [];
                punches.forEach((p) => {
                  if (p.type === 'inicio_intervalo') stack.push(p.ts);
                  if (p.type === 'fim_intervalo' && stack.length) {
                    const inicioTs = stack.pop() as number;
                    const fimTs = p.ts;
                    intervals.push({ inicioTs, fimTs, duracaoMinutos: Math.max(0, Math.round((fimTs - inicioTs) / 60000)) });
                  }
                });
                registro.punches = punches;
                registro.intervals = intervals;
                registro.updatedAt = Date.now();
                registros[idx] = registro;
                // update status
                return { registros, statusHoje: `Intervalo finalizado às ${hh}` } as any;
              }
            }
            return { registros: state.registros } as any;
          });
          return { success: true, message: `Intervalo finalizado às ${hh}` };
        } finally {
          set({ isProcessing: false });
        }
      },

      registrarSaida: async (localizacao) => {
        const processing = get().isProcessing;
        if (processing) return { success: false, message: 'Processando...' };
        set({ isProcessing: true });
        try {
          const can = get().canRegisterSaida();
          if (!can.ok) return { success: false, message: can.message || 'Não permitido' };
          const now = Date.now();
          const hh = hhmmFromTs(now);
          const dateKey = formatDateKey(new Date());
          set((state) => {
            const registros = [...state.registros];
            const idx = registros.findIndex((r) => r.data === dateKey);
            if (idx >= 0) {
              const registro = { ...registros[idx] };
              // if there is any open interval, close it automatically at exit time
              const punches = [...registro.punches];
              const openInicio = punches.find((p) => p.type === 'inicio_intervalo' && !punches.some((q) => q.type === 'fim_intervalo' && q.ts >= p.ts));
              if (openInicio) {
                punches.push({ type: 'fim_intervalo', ts: now, hhmm: hh, localizacao: localizacao ?? 'Geolocalização indefinida' });
              }
              // add exit punch
              punches.push({ type: 'saida', ts: now, hhmm: hh, localizacao: localizacao ?? 'Geolocalização indefinida' });

              // derive intervals
              const intervals: Intervalo[] = [];
              const stack: number[] = [];
              punches.forEach((p) => {
                if (p.type === 'inicio_intervalo') stack.push(p.ts);
                if (p.type === 'fim_intervalo' && stack.length) {
                  const inicioTs = stack.pop() as number;
                  const fimTs = p.ts;
                  intervals.push({ inicioTs, fimTs, duracaoMinutos: Math.max(0, Math.round((fimTs - inicioTs) / 60000)) });
                }
              });

              // compute total: find first entrada and last saida
              const entradaPunch = punches.find((p) => p.type === 'entrada');
              const saidaPunch = [...punches].reverse().find((p) => p.type === 'saida');
              let totalMinutos: number | undefined = undefined;
              if (entradaPunch && saidaPunch) {
                const dur = Math.max(0, Math.round((saidaPunch.ts - entradaPunch.ts) / 60000));
                const intervalSum = intervals.reduce((s, it) => s + (it.duracaoMinutos || 0), 0);
                totalMinutos = Math.max(0, dur - intervalSum);
              }

              registro.punches = punches;
              registro.intervals = intervals;
              registro.totalMinutos = totalMinutos;
              // compute bancoHoras across all registros
              registros[idx] = registro;

              // recompute bank for all registros
              const expected = DEFAULT_EXPECTED_PER_DAY;
              const totals = registros.map((r) => r.totalMinutos ?? 0).filter((v) => v > 0);
              const sumTotals = totals.reduce((a, b) => a + b, 0);
              const bankMins = sumTotals - expected * (totals.length || 1);

              return { registros, statusHoje: 'Entrada e saída registrados!', bancoHoras: formatBankMinutes(bankMins) } as any;
            }
            return { registros: state.registros } as any;
          });
          return { success: true, message: 'Entrada e saída registrados!' };
        } finally {
          set({ isProcessing: false });
        }
      },

      aplicarAjusteAprovado: ({ data, alvo, horarioNovo }: { data: string; alvo?: 'entrada' | 'saida'; horarioNovo?: string }) => {
        if (!data || !horarioNovo) return;
        set((state) => {
          const registros = [...state.registros];
          const idx = registros.findIndex((r) => r.data === data);
          if (idx >= 0) {
            const registro = { ...registros[idx] };
            const punches = [...registro.punches];
            // find target punch
            const targetIdx = punches.findIndex((p) => p.type === (alvo || 'entrada'));
            if (targetIdx >= 0) {
              // parse horarioNovo HH:MM and build new ts based on date
              const parts = horarioNovo.split(':');
              const [hh, mm] = parts.map((x) => Number(x));
              const [dd, mmBR, yyyy] = registro.data.split('/').map((s) => Number(s));
              const dateObj = new Date(yyyy, mmBR - 1, dd, hh, mm);
              const newTs = dateObj.getTime();
              punches[targetIdx] = { ...punches[targetIdx], ts: newTs, hhmm: horarioNovo };
            }

            // rebuild intervals and totals
            const intervals: Intervalo[] = [];
            const stack: number[] = [];
            punches.forEach((p) => {
              if (p.type === 'inicio_intervalo') stack.push(p.ts);
              if (p.type === 'fim_intervalo' && stack.length) {
                const inicioTs = stack.pop() as number;
                const fimTs = p.ts;
                intervals.push({ inicioTs, fimTs, duracaoMinutos: Math.max(0, Math.round((fimTs - inicioTs) / 60000)) });
              }
            });

            // recompute total based on first entrada and last saida
            const entradaPunch = punches.find((p) => p.type === 'entrada');
            const saidaPunch = ([...punches].reverse() as any[]).find((p) => p.type === 'saida');
            let totalMinutos: number | undefined = undefined;
            if (entradaPunch && saidaPunch) {
              const dur = Math.max(0, Math.round((saidaPunch.ts - entradaPunch.ts) / 60000));
              const intervalSum = intervals.reduce((s, it) => s + (it.duracaoMinutos || 0), 0);
              totalMinutos = Math.max(0, dur - intervalSum);
            }

            registro.punches = punches;
            registro.intervals = intervals;
            registro.totalMinutos = totalMinutos;
            registro.updatedAt = Date.now();
            registros[idx] = registro;

            // recompute bancoHoras for all registros
            const expected = DEFAULT_EXPECTED_PER_DAY;
            const totals = registros.map((r) => r.totalMinutos ?? 0).filter((v) => v > 0);
            const sumTotals = totals.reduce((a, b) => a + b, 0);
            const bankMins = sumTotals - expected * (totals.length || 1);

            return { registros, bancoHoras: formatBankMinutes(bankMins) } as any;
          }
          return { registros: state.registros } as any;
        });
      },

      reset: () => set({ registros: [], feriadosISO: [], isProcessing: false, statusHoje: 'Registre sua entrada!' }),
    }),
    { name: 'cfo:ponto:v2' }
  )
);

export default usePontoStore;
import { create } from 'zustand';
