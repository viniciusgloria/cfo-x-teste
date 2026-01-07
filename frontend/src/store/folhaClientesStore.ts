import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FolhaCliente, ClienteCompleto } from '../types';

interface FolhaClientesState {
  folhas: FolhaCliente[];
  periodoSelecionado: string;
  filtroSituacao: string;
  filtroCliente: string;
  filtroStatusOmie: string;
  busca: string;
  
  // Setters
  setPeriodoSelecionado: (periodo: string) => void;
  setFiltroSituacao: (situacao: string) => void;
  setFiltroCliente: (cliente: string) => void;
  setFiltroStatusOmie: (status: string) => void;
  setBusca: (busca: string) => void;
  
  // CRUD
  adicionarFolha: (folha: Omit<FolhaCliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFolha: (id: string, dados: Partial<FolhaCliente>) => void;
  removerFolha: (id: string) => void;
  
  // Operações específicas
  calcularValorTotal: (id: string) => void;
  calcularPercentuais: (id: string) => void;
  enviarParaOmie: (id: string) => Promise<boolean>;
  sincronizarComOmie: () => Promise<void>;
  
  // Filtros computados
  getFolhasFiltradas: () => FolhaCliente[];
  getFolhasPorCliente: (clienteId: number) => FolhaCliente[];
  
  // Exportação e importação
  exportarParaCSV: () => string;
  exportarParaExcel: () => void;
  importarDePlanilha: (dados: any[]) => void;
  gerarPlanilhaModelo: () => string;
  
  reset: () => void;
}

// Dados mockados de clientes
const mockClientes: ClienteCompleto[] = [];
const hoje = new Date();
const periodoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

const mockFolhas: FolhaCliente[] = [];
export const useFolhaClientesStore = create<FolhaClientesState>()(
  persist(
    (set, get) => ({
      folhas: mockFolhas,
      periodoSelecionado: periodoAtual,
      filtroSituacao: 'Todas',
      filtroCliente: 'Todos',
      filtroStatusOmie: 'Todos',
      busca: '',
      
      setPeriodoSelecionado: (periodo) => set({ periodoSelecionado: periodo }),
      setFiltroSituacao: (situacao) => set({ filtroSituacao: situacao }),
      setFiltroCliente: (cliente) => set({ filtroCliente: cliente }),
      setFiltroStatusOmie: (status) => set({ filtroStatusOmie: status }),
      setBusca: (busca) => set({ busca: busca }),
      
      adicionarFolha: (folha) => {
        const novaFolha: FolhaCliente = {
          ...folha,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        set((state) => ({ folhas: [...state.folhas, novaFolha] }));
      },
      
      atualizarFolha: (id, dados) => {
        set((state) => ({
          folhas: state.folhas.map((f) =>
            f.id === id
              ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
              : f
          )
        }));
      },
      
      removerFolha: (id) => {
        set((state) => ({
          folhas: state.folhas.filter((f) => f.id !== id)
        }));
      },
      
      calcularValorTotal: (id) => {
        const folha = get().folhas.find((f) => f.id === id);
        if (!folha) return;
        
        const valorTotal = folha.valor + folha.adicional + folha.reembolso - folha.desconto;
        const valorTotalSemReembolso = folha.valor + folha.adicional - folha.desconto;
        
        get().atualizarFolha(id, { valorTotal, valorTotalSemReembolso });
      },
      
      calcularPercentuais: (id) => {
        const folha = get().folhas.find((f) => f.id === id);
        if (!folha || !folha.percentualOperacao) return;
        
        const base = folha.valorTotalSemReembolso;
        const po = folha.percentualOperacao;
        
        const updated: any = {};
        if (po.empresa1Percent) {
          updated['percentualOperacao.empresa1Valor'] = (base * po.empresa1Percent) / 100;
        }
        if (po.empresa2Percent) {
          updated['percentualOperacao.empresa2Valor'] = (base * po.empresa2Percent) / 100;
        }
        if (po.empresa3Percent) {
          updated['percentualOperacao.empresa3Valor'] = (base * po.empresa3Percent) / 100;
        }
        if (po.empresa4Percent) {
          updated['percentualOperacao.empresa4Valor'] = (base * po.empresa4Percent) / 100;
        }
        
        get().atualizarFolha(id, { percentualOperacao: { ...po, ...updated } });
      },
      
      enviarParaOmie: async (id) => {
        // Simula envio para API OMIE
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const codigoOmie = `OMIE-${Date.now()}`;
        get().atualizarFolha(id, {
          statusOmie: 'sincronizado',
          codigoOmie,
          dataEnvioOmie: new Date().toISOString()
        });
        
        return true;
      },
      
      sincronizarComOmie: async () => {
        // Simula sincronização em lote
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const folhasPendentes = get().folhas.filter(
          (f) => f.statusOmie === 'pendente' && f.situacao !== 'cancelado'
        );
        
        for (const folha of folhasPendentes) {
          await get().enviarParaOmie(folha.id);
        }
      },
      
      getFolhasFiltradas: () => {
        const {
          folhas,
          periodoSelecionado,
          filtroSituacao,
          filtroCliente,
          filtroStatusOmie,
          busca
        } = get();
        
        return folhas.filter((f) => {
          const matchPeriodo = f.periodo === periodoSelecionado;
          const matchSituacao =
            filtroSituacao === 'Todas' ||
            f.situacao === filtroSituacao.toLowerCase();
          const matchCliente =
            filtroCliente === 'Todos' ||
            String(f.clienteId) === filtroCliente;
          const matchStatusOmie =
            filtroStatusOmie === 'Todos' ||
            f.statusOmie === filtroStatusOmie.toLowerCase();
          const matchBusca =
            !busca ||
            f.colaborador.toLowerCase().includes(busca.toLowerCase()) ||
            f.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
            f.funcao?.toLowerCase().includes(busca.toLowerCase());
          
          return (
            matchPeriodo &&
            matchSituacao &&
            matchCliente &&
            matchStatusOmie &&
            matchBusca
          );
        });
      },
      
      getFolhasPorCliente: (clienteId) => {
        return get().folhas.filter((f) => f.clienteId === clienteId);
      },
      
      exportarParaCSV: () => {
        const folhas = get().getFolhasFiltradas();
        
        const headers = [
          'ID',
          'Cliente',
          'Colaborador',
          'Função',
          'Empresa',
          'CTT',
          'Valor',
          'Adicional',
          'Reembolso',
          'Desconto',
          'Valor Total',
          'Valor Total s/ Reembolso',
          'Situação',
          'Data Pgto',
          'NF Número',
          'NF Status',
          'NF Pagamento',
          'NF Data',
          'NF Obs',
          '% Empresa 1',
          '% Empresa 2',
          '% Empresa 3',
          '% Empresa 4',
          '% Total',
          'Status OMIE',
          'Código OMIE'
        ];
        
        const rows = folhas.map((f) => [
          f.id,
          f.cliente.nome,
          f.colaborador,
          f.funcao || '',
          f.empresa,
          f.ctt || '',
          f.valor.toFixed(2),
          f.adicional.toFixed(2),
          f.reembolso.toFixed(2),
          f.desconto.toFixed(2),
          (f.valorTotal ?? 0).toFixed(2),
          (f.valorTotalSemReembolso ?? 0).toFixed(2),
          f.situacao,
          f.dataPagamento || '',
          f.notaFiscal?.numero || '',
          f.notaFiscal?.status || '',
          f.notaFiscal?.pagamento || '',
          f.notaFiscal?.data || '',
          f.notaFiscal?.obs || f.obs || '',
          f.percentualOperacao?.empresa1Percent ?? '',
          f.percentualOperacao?.empresa2Percent ?? '',
          f.percentualOperacao?.empresa3Percent ?? '',
          f.percentualOperacao?.empresa4Percent ?? '',
          f.percentualOperacao?.totalOpers ?? '',
          f.statusOmie || '',
          f.codigoOmie || ''
        ]);
        
        const csv = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');
        
        return csv;
      },
      
      exportarParaExcel: () => {
        const csv = get().exportarParaCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `folha-clientes-${get().periodoSelecionado}.csv`;
        link.click();
      },
      
      importarDePlanilha: (dados) => {
        // Lógica de importação de planilha
        // Será implementada nos modais
      },
      
      gerarPlanilhaModelo: () => {
        const headers = [
          'COLABORADOR',
          'FUNÇÃO',
          'EMPRESA',
          'CTT',
          'VALOR',
          'ADICIONAL',
          'REEMBOLSO',
          'DESCONTO',
          'VALOR TOTAL',
          'VALOR TOTAL S/ REEMBOLSO',
          'SITUAÇÃO',
          'DATA PGTO',
          'NOTA FISCAL',
          'STATUS',
          'PAGAMENTO',
          'DATA NF',
          'OBS',
          'EMPRESA 1 %',
          'EMPRESA 2 %',
          'EMPRESA 3 %',
          'EMPRESA 4 %',
          '%TOTAL'
        ];
        
        const exemplo = [
          'João da Silva',
          'Analista',
          'Empresa Cliente LTDA',
          'ADM-001',
          '5000.00',
          '500.00',
          '200.00',
          '100.00',
          '5600.00',
          '5400.00',
          'pendente',
          '2025-12-05',
          'NF-2025-001',
          'aguardando',
          'pendente',
          '2025-12-01',
          'Sem observações',
          '50',
          '50',
          '0',
          '0',
          '100'
        ];
        
        const csv = [headers, exemplo]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');
        
        return csv;
      },
      
      reset: () => {
        set({
          folhas: mockFolhas,
          periodoSelecionado: periodoAtual,
          filtroSituacao: 'Todas',
          filtroCliente: 'Todos',
          filtroStatusOmie: 'Todos',
          busca: ''
        });
      }
    }),
    {
      name: 'folha-clientes-storage',
      version: 1
    }
  )
);
