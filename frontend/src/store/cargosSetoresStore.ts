import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cargo, Setor, HistoricoAlteracao } from '../types';

interface CargosSetoresState {
  cargos: Cargo[];
  setores: Setor[];
  historico: HistoricoAlteracao[];
  
  // Cargos
  addCargo: (cargo: Omit<Cargo, 'id' | 'criadoEm' | 'atualizadoEm'>, userId?: string, userName?: string) => void;
  updateCargo: (id: string, cargo: Partial<Cargo>, userId?: string, userName?: string) => void;
  removeCargo: (id: string, userId?: string, userName?: string) => void;
  
  // Setores
  addSetor: (setor: Omit<Setor, 'id' | 'criadoEm' | 'atualizadoEm'>, userId?: string, userName?: string) => void;
  updateSetor: (id: string, setor: Partial<Setor>, userId?: string, userName?: string) => void;
  removeSetor: (id: string, userId?: string, userName?: string) => void;
  
  // Histórico
  getHistorico: (tipo?: 'cargo' | 'setor', itemId?: string) => HistoricoAlteracao[];
  
  // Busca/Filtro
  searchCargos: (query: string) => Cargo[];
  searchSetores: (query: string) => Setor[];
  
  // Reset
  reset: () => void;
}

// Dados mock iniciais
const mockCargos: Cargo[] = [];
const mockSetores: Setor[] = [];
export const useCargosSetoresStore = create<CargosSetoresState>()(
  persist(
    (set, get) => ({
      cargos: mockCargos,
      setores: mockSetores,
      historico: [],

      addCargo: (cargoData, userId = '1', userName = 'Sistema') => {
        const novoCargo: Cargo = {
          ...cargoData,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: userName,
          atualizadoPor: userName,
        };
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'cargo',
          itemId: novoCargo.id,
          itemNome: cargoData.nome,
          acao: 'criacao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Cargo "${cargoData.nome}" criado`,
        };
        
        set((state) => ({ 
          cargos: [...state.cargos, novoCargo],
          historico: [...state.historico, novoHistorico],
        }));
      },

      updateCargo: (id, cargoData, userId = '1', userName = 'Sistema') => {
        const cargoAntigo = get().cargos.find(c => c.id === id);
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'cargo',
          itemId: id,
          itemNome: cargoData.nome || cargoAntigo?.nome || 'Desconhecido',
          acao: 'edicao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Cargo "${cargoAntigo?.nome}" atualizado`,
        };
        
        set((state) => ({
          cargos: state.cargos.map((cargo) =>
            cargo.id === id
              ? { ...cargo, ...cargoData, atualizadoEm: new Date().toISOString(), atualizadoPor: userName }
              : cargo
          ),
          historico: [...state.historico, novoHistorico],
        }));
      },

      removeCargo: (id, userId = '1', userName = 'Sistema') => {
        const cargo = get().cargos.find(c => c.id === id);
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'cargo',
          itemId: id,
          itemNome: cargo?.nome || 'Desconhecido',
          acao: 'remocao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Cargo "${cargo?.nome}" removido`,
        };
        
        set((state) => ({ 
          cargos: state.cargos.filter((cargo) => cargo.id !== id),
          historico: [...state.historico, novoHistorico],
        }));
      },

      addSetor: (setorData, userId = '1', userName = 'Sistema') => {
        const novoSetor: Setor = {
          ...setorData,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: userName,
          atualizadoPor: userName,
        };
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'setor',
          itemId: novoSetor.id,
          itemNome: setorData.nome,
          acao: 'criacao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Setor "${setorData.nome}" criado`,
        };
        
        set((state) => ({ 
          setores: [...state.setores, novoSetor],
          historico: [...state.historico, novoHistorico],
        }));
      },

      updateSetor: (id, setorData, userId = '1', userName = 'Sistema') => {
        const setorAntigo = get().setores.find(s => s.id === id);
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'setor',
          itemId: id,
          itemNome: setorData.nome || setorAntigo?.nome || 'Desconhecido',
          acao: 'edicao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Setor "${setorAntigo?.nome}" atualizado`,
        };
        
        set((state) => ({
          setores: state.setores.map((setor) =>
            setor.id === id
              ? { ...setor, ...setorData, atualizadoEm: new Date().toISOString(), atualizadoPor: userName }
              : setor
          ),
          historico: [...state.historico, novoHistorico],
        }));
      },

      removeSetor: (id, userId = '1', userName = 'Sistema') => {
        const setor = get().setores.find(s => s.id === id);
        
        const novoHistorico: HistoricoAlteracao = {
          id: `hist-${Date.now()}`,
          tipo: 'setor',
          itemId: id,
          itemNome: setor?.nome || 'Desconhecido',
          acao: 'remocao',
          alteradoPor: userName,
          alteradoPorId: userId,
          alteradoEm: new Date().toISOString(),
          detalhes: `Setor "${setor?.nome}" removido`,
        };
        
        set((state) => ({ 
          setores: state.setores.filter((setor) => setor.id !== id),
          historico: [...state.historico, novoHistorico],
        }));
      },

      getHistorico: (tipo, itemId) => {
        const historico = get().historico;
        let filtered = historico;
        
        if (tipo) {
          filtered = filtered.filter(h => h.tipo === tipo);
        }
        
        if (itemId) {
          filtered = filtered.filter(h => h.itemId === itemId);
        }
        
        return filtered.sort((a, b) => new Date(b.alteradoEm).getTime() - new Date(a.alteradoEm).getTime());
      },

      searchCargos: (query) => {
        const cargos = get().cargos;
        if (!query.trim()) return cargos;
        
        const lowerQuery = query.toLowerCase();
        return cargos.filter(cargo => 
          cargo.nome.toLowerCase().includes(lowerQuery) ||
          cargo.descricao?.toLowerCase().includes(lowerQuery)
        );
      },

      searchSetores: (query) => {
        const setores = get().setores;
        if (!query.trim()) return setores;
        
        const lowerQuery = query.toLowerCase();
        return setores.filter(setor => 
          setor.nome.toLowerCase().includes(lowerQuery) ||
          setor.descricao?.toLowerCase().includes(lowerQuery)
        );
      },

      reset: () => set({ cargos: mockCargos, setores: mockSetores, historico: [] }),
    }),
    { name: 'cfo:cargos-setores' }
  )
);
