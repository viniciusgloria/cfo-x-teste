import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ImportMapping = {
  id: string;
  name: string;
  headerSignature: string; // joined headers
  mapping: Record<string, string>; // originalHeader -> targetField (freeform)
  createdAt: string;
};

interface ImportMappingsState {
  mappings: ImportMapping[];
  addMapping: (m: Omit<ImportMapping, 'id' | 'createdAt'>) => void;
  removeMapping: (id: string) => void;
  clear: () => void;
}

export const useImportMappingsStore = create<ImportMappingsState>()(
  persist(
    (set, get) => ({
      mappings: [],
      addMapping: (m) =>
        set((state) => {
          const id = `impmap-${Date.now()}`;
          const createdAt = new Date().toISOString();
          const newMap: ImportMapping = { id, createdAt, ...m } as ImportMapping;
          return { mappings: [newMap, ...state.mappings] };
        }),
      removeMapping: (id) => set((state) => ({ mappings: state.mappings.filter((x) => x.id !== id) })),
      clear: () => set({ mappings: [] }),
    }),
    {
      name: 'cfo:import-mappings',
      partialize: (s) => ({ mappings: s.mappings }),
    }
  )
);

export default useImportMappingsStore;
