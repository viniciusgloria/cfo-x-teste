import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmpresaState {
  logo: string;
  miniLogo: string;
  nomeEmpresa: string;
  setLogo: (logo: string) => void;
  setMiniLogo: (logo: string) => void;
  setNomeEmpresa: (nome: string) => void;
  reset: () => void;
}

const defaultLogo = '';
const defaultMiniLogo = '';
const defaultNome = 'CFO Hub';

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set) => ({
      logo: defaultLogo,
      miniLogo: defaultMiniLogo,
      nomeEmpresa: defaultNome,
      setLogo: (logo) => set({ logo }),
      setMiniLogo: (logo) => set({ miniLogo: logo }),
      setNomeEmpresa: (nome) => set({ nomeEmpresa: nome }),
      reset: () => set({ logo: defaultLogo, miniLogo: defaultMiniLogo, nomeEmpresa: defaultNome }),
    }),
    { name: 'cfo:empresa', partialize: (s) => ({ logo: s.logo, miniLogo: s.miniLogo, nomeEmpresa: s.nomeEmpresa }) }
  )
);
