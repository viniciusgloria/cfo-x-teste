import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuncionarioCliente } from '../types';

interface FuncionariosClienteState {
  funcionarios: FuncionarioCliente[];
  busca: string;
  filtroStatus: string;
  
  // Setters
  setBusca: (busca: string) => void;
  setFiltroStatus: (status: string) => void;
  
  // CRUD
  adicionarFuncionario: (funcionario: Omit<FuncionarioCliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFuncionario: (id: string, dados: Partial<FuncionarioCliente>) => void;
  removerFuncionario: (id: string) => void;
  
  // Queries
  getFuncionariosPorCliente: (clienteId: number) => FuncionarioCliente[];
  getFuncionariosFiltrados: (clienteId: number) => FuncionarioCliente[];
  getFuncionarioPorId: (id: string) => FuncionarioCliente | undefined;
  
  reset: () => void;
}

// Dados mockados
const mockFuncionarios: FuncionarioCliente[] = [];
export const useFuncionariosClienteStore = create<FuncionariosClienteState>()(
  persist(
    (set, get) => ({
      funcionarios: mockFuncionarios,
      busca: '',
      filtroStatus: 'todos',
      
      setBusca: (busca) => set({ busca }),
      setFiltroStatus: (status) => set({ filtroStatus: status }),
      
      adicionarFuncionario: (funcionario) => {
        const novoFuncionario: FuncionarioCliente = {
          ...funcionario,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        set((state) => ({
          funcionarios: [...state.funcionarios, novoFuncionario]
        }));
      },
      
      atualizarFuncionario: (id, dados) => {
        set((state) => ({
          funcionarios: state.funcionarios.map((f) =>
            f.id === id
              ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
              : f
          )
        }));
      },
      
      removerFuncionario: (id) => {
        set((state) => ({
          funcionarios: state.funcionarios.filter((f) => f.id !== id)
        }));
      },
      
      getFuncionariosPorCliente: (clienteId) => {
        return get().funcionarios.filter((f) => f.clienteId === clienteId);
      },
      
      getFuncionariosFiltrados: (clienteId) => {
        const { funcionarios, busca, filtroStatus } = get();
        
        return funcionarios.filter((f) => {
          const matchCliente = f.clienteId === clienteId;
          const matchStatus =
            filtroStatus === 'todos' ||
            f.status === filtroStatus;
          const matchBusca =
            !busca ||
            f.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
            f.funcao.toLowerCase().includes(busca.toLowerCase()) ||
            f.cpf.includes(busca);
          
          return matchCliente && matchStatus && matchBusca;
        });
      },
      
      getFuncionarioPorId: (id) => {
        return get().funcionarios.find((f) => f.id === id);
      },
      
      reset: () => {
        set({
          funcionarios: mockFuncionarios,
          busca: '',
          filtroStatus: 'todos'
        });
      }
    }),
    {
      name: 'funcionarios-cliente-storage',
      version: 1
    }
  )
);
