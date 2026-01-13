import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmpresaState {
  logo: string;
  miniLogo: string;
  favicon: string;
  nomeEmpresa: string;
  aplicarInversaoLogo: boolean;
  setLogo: (logo: string) => void;
  setMiniLogo: (logo: string) => void;
  setFavicon: (favicon: string) => void;
  setNomeEmpresa: (nome: string) => void;
  setAplicarInversaoLogo: (aplicar: boolean) => void;
  reset: () => void;
}

const defaultLogo = '';
const defaultMiniLogo = '';
const defaultFavicon = '';
const defaultNome = 'CFO Hub';
const defaultAplicarInversao = false;

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set) => ({
      logo: defaultLogo,
      miniLogo: defaultMiniLogo,
      favicon: defaultFavicon,
      nomeEmpresa: defaultNome,
      aplicarInversaoLogo: defaultAplicarInversao,
      setLogo: (logo) => set({ logo }),
      setMiniLogo: (logo) => set({ miniLogo: logo }),
      setFavicon: (favicon) => set({ favicon }),
      setNomeEmpresa: (nome) => set({ nomeEmpresa: nome }),
      setAplicarInversaoLogo: (aplicar) => set({ aplicarInversaoLogo: aplicar }),
      reset: () => set({ logo: defaultLogo, miniLogo: defaultMiniLogo, favicon: defaultFavicon, nomeEmpresa: defaultNome, aplicarInversaoLogo: defaultAplicarInversao }),
    }),
    { name: 'cfo:empresa', partialize: (s) => ({ logo: s.logo, miniLogo: s.miniLogo, favicon: s.favicon, nomeEmpresa: s.nomeEmpresa, aplicarInversaoLogo: s.aplicarInversaoLogo }) }
  )
);
