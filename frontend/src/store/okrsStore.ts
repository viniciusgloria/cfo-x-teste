import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResultadoChave {
  id: string;
  descricao: string;
  meta: number;
  atual: number;
  unidade: string;
  progresso: number;
}

export interface OKR {
  id: string;
  objetivo: string;
  tipo: 'empresa' | 'time' | 'pessoal';
  trimestre: string;
  owner: { nome: string; avatar: string };
  progresso: number;
  resultadosChave: ResultadoChave[];
  status: 'no-prazo' | 'atencao' | 'atrasado';
}

interface OKRsState {
  okrs: OKR[];
  adicionarOKR: (okr: Omit<OKR, 'id' | 'progresso'>) => void;
  editarOKR: (okrId: string, okr: Omit<OKR, 'id' | 'progresso'>) => void;
  removerOKR: (okrId: string) => void;
  atualizarProgresso: (okrId: string, krId: string, atual: number) => void;
  reset: () => void;
}

const mockOKRs: OKR[] = [];
const calcularProgresso = (resultadosChave: ResultadoChave[]): number => {
  if (resultadosChave.length === 0) return 0;
  const soma = resultadosChave.reduce((acc, kr) => acc + kr.progresso, 0);
  return Math.round(soma / resultadosChave.length);
};

export const useOKRsStore = create<OKRsState>()(
  persist(
    (set) => ({
      okrs: mockOKRs,
      adicionarOKR: (okr) => set((state) => {
        const novoOKR: OKR = {
          ...okr,
          id: Date.now().toString(),
          progresso: calcularProgresso(okr.resultadosChave)
        };
        return { okrs: [...state.okrs, novoOKR] };
      }),
      editarOKR: (okrId, okr) => set((state) => ({
        okrs: state.okrs.map(o =>
          o.id === okrId
            ? { ...okr, id: okrId, progresso: calcularProgresso(okr.resultadosChave) }
            : o
        )
      })),
      removerOKR: (okrId) => set((state) => ({
        okrs: state.okrs.filter(o => o.id !== okrId)
      })),
      atualizarProgresso: (okrId, krId, atual) => set((state) => ({
        okrs: state.okrs.map(okr =>
          okr.id === okrId
            ? {
                ...okr,
                resultadosChave: okr.resultadosChave.map(kr =>
                  kr.id === krId
                    ? {
                        ...kr,
                        atual,
                        progresso: Math.round((atual / kr.meta) * 100)
                      }
                    : kr
                ),
                progresso: calcularProgresso(
                  okr.resultadosChave.map(kr =>
                    kr.id === krId
                      ? { ...kr, atual, progresso: Math.round((atual / kr.meta) * 100) }
                      : kr
                  )
                )
              }
            : okr
        )
      })),
      reset: () => set({ okrs: mockOKRs }),
    }),
    { name: 'cfo:okrs', partialize: (s) => ({ okrs: s.okrs }) }
  )
);
