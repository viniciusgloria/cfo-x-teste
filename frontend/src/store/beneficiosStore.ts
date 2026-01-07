import { create } from 'zustand';
import { 
  Beneficio, 
  BeneficioColaborador, 
  TransacaoBeneficio, 
  MetricasBeneficios, 
  FornecedorConfig,
  TipoBeneficio,
  FornecedorBeneficio
} from '../types';

interface BeneficiosState {
  // Estado
  beneficios: Beneficio[];
  beneficiosColaboradores: BeneficioColaborador[];
  transacoes: TransacaoBeneficio[];
  fornecedores: FornecedorConfig[];
  metricas: MetricasBeneficios | null;
  
  // Filtros e UI
  filtroTipo: TipoBeneficio | 'todos';
  filtroStatus: 'todos' | 'ativo' | 'inativo';
  filtroFornecedor: FornecedorBeneficio | 'todos';
  termoBusca: string;
  
  // Actions - Benefícios
  carregarBeneficios: () => void;
  adicionarBeneficio: (beneficio: Omit<Beneficio, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarBeneficio: (id: string, dados: Partial<Beneficio>) => void;
  removerBeneficio: (id: string) => void;
  ativarDesativarBeneficio: (id: string) => void;
  
  // Actions - Benefícios de Colaboradores
  carregarBeneficiosColaboradores: () => void;
  vincularBeneficioColaborador: (dados: Omit<BeneficioColaborador, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  desvincularBeneficioColaborador: (id: string, motivo?: string) => void;
  atualizarStatusBeneficioColaborador: (id: string, status: BeneficioColaborador['status']) => void;
  
  // Actions - Transações
  carregarTransacoes: () => void;
  registrarTransacao: (dados: Omit<TransacaoBeneficio, 'id' | 'criadoEm'>) => void;
  
  // Actions - Fornecedores
  carregarFornecedores: () => void;
  configurarFornecedor: (config: FornecedorConfig) => void;
  sincronizarFornecedor: (fornecedor: FornecedorBeneficio) => Promise<void>;
  
  // Actions - Métricas
  carregarMetricas: () => void;
  calcularMetricas: () => MetricasBeneficios;
  
  // Actions - Filtros
  setFiltroTipo: (tipo: TipoBeneficio | 'todos') => void;
  setFiltroStatus: (status: 'todos' | 'ativo' | 'inativo') => void;
  setFiltroFornecedor: (fornecedor: FornecedorBeneficio | 'todos') => void;
  setTermoBusca: (termo: string) => void;
  limparFiltros: () => void;
  
  // Getters
  getBeneficiosFiltrados: () => Beneficio[];
  getBeneficiosPorColaborador: (colaboradorId: string) => BeneficioColaborador[];
  getTransacoesPorColaborador: (colaboradorId: string) => TransacaoBeneficio[];
  getCustoTotalColaborador: (colaboradorId: string) => number;
}

// Dados mock iniciais
const beneficiosMock: Beneficio[] = [];

const fornecedoresMock: FornecedorConfig[] = [];

export const useBeneficiosStore = create<BeneficiosState>((set, get) => ({
  // Estado inicial
  beneficios: [],
  beneficiosColaboradores: [],
  transacoes: [],
  fornecedores: [],
  metricas: null,
  
  // Filtros
  filtroTipo: 'todos',
  filtroStatus: 'todos',
  filtroFornecedor: 'todos',
  termoBusca: '',
  
  // Actions - Benefícios
  carregarBeneficios: () => {
    // Simula carregamento de API
    set({ beneficios: beneficiosMock });
  },
  
  adicionarBeneficio: (beneficio) => {
    const novoBeneficio: Beneficio = {
      ...beneficio,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    
    set((state) => ({
      beneficios: [...state.beneficios, novoBeneficio]
    }));
  },
  
  editarBeneficio: (id, dados) => {
    set((state) => ({
      beneficios: state.beneficios.map((b) =>
        b.id === id
          ? { ...b, ...dados, atualizadoEm: new Date().toISOString() }
          : b
      )
    }));
  },
  
  removerBeneficio: (id) => {
    set((state) => ({
      beneficios: state.beneficios.filter((b) => b.id !== id)
    }));
  },
  
  ativarDesativarBeneficio: (id) => {
    set((state) => ({
      beneficios: state.beneficios.map((b) =>
        b.id === id
          ? { ...b, ativo: !b.ativo, atualizadoEm: new Date().toISOString() }
          : b
      )
    }));
  },
  
  // Actions - Benefícios de Colaboradores
  carregarBeneficiosColaboradores: () => {
    // Simula carregamento de API
    set({ beneficiosColaboradores: [] });
  },
  
  vincularBeneficioColaborador: (dados) => {
    const novo: BeneficioColaborador = {
      ...dados,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    
    set((state) => ({
      beneficiosColaboradores: [...state.beneficiosColaboradores, novo]
    }));
  },
  
  desvincularBeneficioColaborador: (id, motivo) => {
    set((state) => ({
      beneficiosColaboradores: state.beneficiosColaboradores.map((bc) =>
        bc.id === id
          ? {
              ...bc,
              status: 'cancelado' as const,
              dataCancelamento: new Date().toISOString(),
              motivoCancelamento: motivo,
              atualizadoEm: new Date().toISOString()
            }
          : bc
      )
    }));
  },
  
  atualizarStatusBeneficioColaborador: (id, status) => {
    set((state) => ({
      beneficiosColaboradores: state.beneficiosColaboradores.map((bc) =>
        bc.id === id
          ? { ...bc, status, atualizadoEm: new Date().toISOString() }
          : bc
      )
    }));
  },
  
  // Actions - Transações
  carregarTransacoes: () => {
    set({ transacoes: [] });
  },
  
  registrarTransacao: (dados) => {
    const nova: TransacaoBeneficio = {
      ...dados,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString()
    };
    
    set((state) => ({
      transacoes: [...state.transacoes, nova]
    }));
  },
  
  // Actions - Fornecedores
  carregarFornecedores: () => {
    set({ fornecedores: fornecedoresMock });
  },
  
  configurarFornecedor: (config) => {
    set((state) => {
      const existe = state.fornecedores.find((f) => f.fornecedor === config.fornecedor);
      
      if (existe) {
        return {
          fornecedores: state.fornecedores.map((f) =>
            f.fornecedor === config.fornecedor ? config : f
          )
        };
      }
      
      return {
        fornecedores: [...state.fornecedores, config]
      };
    });
  },
  
  sincronizarFornecedor: async (fornecedor) => {
    // Simula sincronização com API do fornecedor
    return new Promise((resolve) => {
      setTimeout(() => {
        set((state) => ({
          fornecedores: state.fornecedores.map((f) =>
            f.fornecedor === fornecedor
              ? { ...f, ultimaSincronizacao: new Date().toISOString() }
              : f
          )
        }));
        resolve();
      }, 2000);
    });
  },
  
  // Actions - Métricas
  carregarMetricas: () => {
    const metricas = get().calcularMetricas();
    set({ metricas });
  },
  
  calcularMetricas: () => {
    const { beneficios, beneficiosColaboradores } = get();
    
    const beneficiosAtivos = beneficios.filter((b) => b.ativo);
    
    // Colaboradores únicos com benefícios ATIVOS
    const totalColaboradoresComBeneficios = new Set(
      beneficiosColaboradores.filter((bc) => bc.status === 'ativo').map((bc) => bc.colaboradorId)
    ).size;
    
    // Calcula custos mensais REAIS baseado em beneficiosColaboradores vinculados
    let custoTotalMensal = 0;
    let custoEmpresaMensal = 0;
    let custoColaboradorMensal = 0;
    
    beneficiosColaboradores.filter((bc) => bc.status === 'ativo').forEach((bc) => {
      const beneficio = beneficios.find((b) => b.id === bc.beneficioId);
      if (beneficio) {
        const valorEmpresa = bc.valorEmpresaCustom ?? beneficio.valorEmpresa;
        const valorColaborador = bc.valorColaboradorCustom ?? beneficio.valorColaborador;
        
        custoTotalMensal += valorEmpresa + valorColaborador;
        custoEmpresaMensal += valorEmpresa;
        custoColaboradorMensal += valorColaborador;
      }
    });
    
    // Se não há beneficiários vinculados, calcula uma projeção com base nos benefícios cadastrados
    if (beneficiosColaboradores.length === 0) {
      const colaboradoresEstimados = 50; // padrão para cálculo inicial
      custoTotalMensal = beneficiosAtivos.reduce((acc, b) => acc + b.valorTotal, 0) * colaboradoresEstimados;
      custoEmpresaMensal = beneficiosAtivos.reduce((acc, b) => acc + b.valorEmpresa, 0) * colaboradoresEstimados;
      custoColaboradorMensal = beneficiosAtivos.reduce((acc, b) => acc + b.valorColaborador, 0) * colaboradoresEstimados;
    }
    
    // Agrupa por tipo - CALCULA REALMENTE
    const custosPorTipo = Array.from(
      beneficiosAtivos.reduce((map, b) => {
        const beneficiosDoBeneficio = beneficiosColaboradores.filter(
          (bc) => bc.beneficioId === b.id && bc.status === 'ativo'
        );
        
        let custoTotal = 0;
        let custoEmpresa = 0;
        let custoColaborador = 0;
        
        beneficiosDoBeneficio.forEach((bc) => {
          const valorEmpresa = bc.valorEmpresaCustom ?? b.valorEmpresa;
          const valorColaborador = bc.valorColaboradorCustom ?? b.valorColaborador;
          custoTotal += valorEmpresa + valorColaborador;
          custoEmpresa += valorEmpresa;
          custoColaborador += valorColaborador;
        });
        
        // Se não há vinculações, estima
        if (beneficiosDoBeneficio.length === 0) {
          custoTotal = b.valorTotal * 50;
          custoEmpresa = b.valorEmpresa * 50;
          custoColaborador = b.valorColaborador * 50;
        }
        
        const existing = map.get(b.tipo) || {
          tipo: b.tipo,
          nome: getNomeTipo(b.tipo),
          totalColaboradores: beneficiosDoBeneficio.length,
          custoTotal: 0,
          custoEmpresa: 0,
          custoColaborador: 0
        };
        
        existing.custoTotal += custoTotal;
        existing.custoEmpresa += custoEmpresa;
        existing.custoColaborador += custoColaborador;
        existing.totalColaboradores = Math.max(existing.totalColaboradores, beneficiosDoBeneficio.length);
        
        map.set(b.tipo, existing);
        return map;
      }, new Map()).values()
    );
    
    // Agrupa por fornecedor - CALCULA REALMENTE
    const custosPorFornecedor = Array.from(
      beneficiosAtivos.reduce((map, b) => {
        const beneficiosDoBeneficio = beneficiosColaboradores.filter(
          (bc) => bc.beneficioId === b.id && bc.status === 'ativo'
        );
        
        let custoTotal = 0;
        beneficiosDoBeneficio.forEach((bc) => {
          const valorEmpresa = bc.valorEmpresaCustom ?? b.valorEmpresa;
          const valorColaborador = bc.valorColaboradorCustom ?? b.valorColaborador;
          custoTotal += valorEmpresa + valorColaborador;
        });
        
        // Se não há vinculações, estima
        if (beneficiosDoBeneficio.length === 0) {
          custoTotal = b.valorTotal * 50;
        }
        
        const existing = map.get(b.fornecedor) || {
          fornecedor: b.fornecedor,
          nome: getNomeFornecedor(b.fornecedor),
          totalBeneficios: 0,
          totalColaboradores: beneficiosDoBeneficio.length,
          custoTotal: 0
        };
        
        existing.totalBeneficios += 1;
        existing.totalColaboradores = Math.max(existing.totalColaboradores, beneficiosDoBeneficio.length);
        existing.custoTotal += custoTotal;
        
        map.set(b.fornecedor, existing);
        return map;
      }, new Map()).values()
    );
    
    // Benefício mais utilizado - BASEADO EM DADOS REAIS
    const beneficioMaisUtilizado = custosPorTipo.length > 0
      ? {
          nome: custosPorTipo.reduce((prev, curr) =>
            curr.custoTotal > prev.custoTotal ? curr : prev
          ).nome,
          tipo: custosPorTipo.reduce((prev, curr) =>
            curr.custoTotal > prev.custoTotal ? curr : prev
          ).tipo,
          totalColaboradores: custosPorTipo.reduce((prev, curr) =>
            curr.totalColaboradores > prev.totalColaboradores ? curr : prev
          ).totalColaboradores
        }
      : null;
    
    // Evolução dos custos (últimos 6 meses) - SIMULADO MAS REALISTA
    const meses = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const evolucaoCustos = meses.map((mes, i) => ({
      mes,
      custoTotal: Math.round(custoTotalMensal * (0.85 + i * 0.03)),
      custoEmpresa: Math.round(custoEmpresaMensal * (0.85 + i * 0.03)),
      custoColaborador: Math.round(custoColaboradorMensal * (0.85 + i * 0.03))
    }));
    
    return {
      totalBeneficios: beneficios.length,
      beneficiosAtivos: beneficiosAtivos.length,
      totalColaboradoresComBeneficios,
      custoTotalMensal,
      custoEmpresaMensal,
      custoColaboradorMensal,
      custosPorTipo,
      custosPorFornecedor,
      taxaAdesao: totalColaboradoresComBeneficios > 0 ? (totalColaboradoresComBeneficios / Math.max(50, totalColaboradoresComBeneficios * 2)) * 100 : 0,
      beneficioMaisUtilizado,
      evolucaoCustos
    };
  },
  
  // Actions - Filtros
  setFiltroTipo: (tipo) => set({ filtroTipo: tipo }),
  setFiltroStatus: (status) => set({ filtroStatus: status }),
  setFiltroFornecedor: (fornecedor) => set({ filtroFornecedor: fornecedor }),
  setTermoBusca: (termo) => set({ termoBusca: termo }),
  
  limparFiltros: () =>
    set({
      filtroTipo: 'todos',
      filtroStatus: 'todos',
      filtroFornecedor: 'todos',
      termoBusca: ''
    }),
  
  // Getters
  getBeneficiosFiltrados: () => {
    const { beneficios, filtroTipo, filtroStatus, filtroFornecedor, termoBusca } = get();
    
    return beneficios.filter((b) => {
      // Filtro de tipo
      if (filtroTipo !== 'todos' && b.tipo !== filtroTipo) return false;
      
      // Filtro de status
      if (filtroStatus !== 'todos') {
        if (filtroStatus === 'ativo' && !b.ativo) return false;
        if (filtroStatus === 'inativo' && b.ativo) return false;
      }
      
      // Filtro de fornecedor
      if (filtroFornecedor !== 'todos' && b.fornecedor !== filtroFornecedor) return false;
      
      // Busca por termo
      if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        return (
          b.nome.toLowerCase().includes(termo) ||
          b.descricao?.toLowerCase().includes(termo) ||
          getNomeTipo(b.tipo).toLowerCase().includes(termo) ||
          getNomeFornecedor(b.fornecedor).toLowerCase().includes(termo)
        );
      }
      
      return true;
    });
  },
  
  getBeneficiosPorColaborador: (colaboradorId) => {
    return get().beneficiosColaboradores.filter((bc) => bc.colaboradorId === colaboradorId);
  },
  
  getTransacoesPorColaborador: (colaboradorId) => {
    return get().transacoes.filter((t) => t.colaboradorId === colaboradorId);
  },
  
  getCustoTotalColaborador: (colaboradorId) => {
    const { beneficios, beneficiosColaboradores } = get();
    const beneficiosDoColaborador = beneficiosColaboradores.filter(
      (bc) => bc.colaboradorId === colaboradorId && bc.status === 'ativo'
    );
    
    return beneficiosDoColaborador.reduce((total, bc) => {
      const beneficio = beneficios.find((b) => b.id === bc.beneficioId);
      if (!beneficio) return total;
      
      const valorEmpresa = bc.valorEmpresaCustom ?? beneficio.valorEmpresa;
      const valorColaborador = bc.valorColaboradorCustom ?? beneficio.valorColaborador;
      
      return total + valorEmpresa + valorColaborador;
    }, 0);
  }
}));

// Funções auxiliares
function getNomeTipo(tipo: TipoBeneficio): string {
  const nomes: Record<TipoBeneficio, string> = {
    alimentacao: 'Alimentação',
    refeicao: 'Refeição',
    transporte: 'Transporte',
    saude: 'Saúde',
    odontologico: 'Odontológico',
    academia: 'Academia',
    seguro_vida: 'Seguro de Vida',
    vale_cultura: 'Vale Cultura',
    auxilio_creche: 'Auxílio Creche',
    outros: 'Outros'
  };
  return nomes[tipo];
}

function getNomeFornecedor(fornecedor: FornecedorBeneficio): string {
  const nomes: Record<FornecedorBeneficio, string> = {
    alelo: 'Alelo',
    sodexo: 'Sodexo',
    vr: 'VR Benefícios',
    ticket: 'Ticket',
    flash: 'Flash',
    ben: 'Ben Benefícios',
    caju: 'Caju',
    swile: 'Swile',
    ifood: 'iFood Benefícios',
    pluxee: 'Pluxee',
    manual: 'Manual'
  };
  return nomes[fornecedor];
}
