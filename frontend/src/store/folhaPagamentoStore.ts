import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FolhaPagamento, ColaboradorCompleto, NotaFiscal } from '../types';
import { useBeneficiosStore } from './beneficiosStore';
import { useNotificacoesStore } from './notificacoesStore';

interface FolhaPagamentoState {
  folhas: FolhaPagamento[];
  periodoSelecionado: string;
  filtroSituacao: string;
  filtroContrato: string;
  busca: string;
  
  // Setters
  setPeriodoSelecionado: (periodo: string) => void;
  setFiltroSituacao: (situacao: string) => void;
  setFiltroContrato: (contrato: string) => void;
  setBusca: (busca: string) => void;
  
  // CRUD
  adicionarFolha: (folha: Omit<FolhaPagamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFolha: (id: string, dados: Partial<FolhaPagamento>) => void;
  removerFolha: (id: string) => void;
  
  // Operações específicas
  calcularValorTotal: (id: string) => void;
  calcularPercentuais: (id: string) => void;
  atualizarNotaFiscal: (id: string, notaFiscal: NotaFiscal) => void;
  gerarFolhasPorPeriodo: (periodo: string, colaboradores: ColaboradorCompleto[]) => void;
  
  // Filtros computados
  getFolhasFiltradas: () => FolhaPagamento[];
  getFolhasPorColaborador: (colaboradorId: number) => FolhaPagamento[];
  
  // Exportação e importação
  exportarParaCSV: () => string;
  exportarParaExcel: () => void;
  importarDePlanilha: (dados: any[]) => void;
  gerarPlanilhaModelo: () => string;
  
  reset: () => void;
}

// Mock inicial
const mockColaboradores: ColaboradorCompleto[] = [];
const gerarFolhasMock = (): FolhaPagamento[] => {
  const periodo = new Date().toISOString().slice(0, 7); // "2025-11"
  return mockColaboradores.map((colab, idx) => {
    // Tentar obter custo de benefícios
    let beneficios = 0;
    try {
      const store = useBeneficiosStore.getState();
      beneficios = store.getCustoTotalColaborador(String(colab.id));
    } catch (e) {
      // Store de benefícios ainda não inicializado
    }
    
    const valor = colab.contrato === 'CLT' ? 5000 : 8000;
    const adicional = colab.contrato === 'CLT' ? 500 : 0;
    const reembolso = 200;
    const desconto = colab.contrato === 'CLT' ? 800 : 0;
    const valorTotal = valor + adicional + reembolso + beneficios - desconto;
    const valorTotalSemReembolso = valorTotal - reembolso;
    
    return {
      id: `fp-${idx + 1}`,
      colaboradorId: colab.id,
      colaborador: colab,
      periodo,
      valor,
      adicional,
      reembolso,
      desconto,
      beneficios,
      valorTotal,
      situacao: 'pendente',
      valorTotalSemReembolso,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  });
};

export const useFolhaPagamentoStore = create<FolhaPagamentoState>()(
  persist(
    (set, get) => ({
      folhas: gerarFolhasMock(),
      periodoSelecionado: new Date().toISOString().slice(0, 7),
      filtroSituacao: 'Todos',
      filtroContrato: 'Todos',
      busca: '',
      
      setPeriodoSelecionado: (periodo) => set({ periodoSelecionado: periodo }),
      setFiltroSituacao: (situacao) => set({ filtroSituacao: situacao }),
      setFiltroContrato: (contrato) => set({ filtroContrato: contrato }),
      setBusca: (busca) => set({ busca: busca }),
      
      adicionarFolha: (folha) =>
        set((state) => {
          const newId = `fp-${Date.now()}`;
          const now = new Date().toISOString();
          const novaFolha: FolhaPagamento = {
            ...folha,
            id: newId,
            criadoEm: now,
            atualizadoEm: now,
          };
          return { folhas: [...state.folhas, novaFolha] };
        }),
      
      atualizarFolha: (id, dados) =>
        set((state) => {
          const folhaAtual = state.folhas.find(f => f.id === id);
          
          // Se mudou status para 'pago', emitir notificação
          if (folhaAtual && dados.situacao === 'pago' && folhaAtual.situacao !== 'pago') {
            useNotificacoesStore.getState().adicionarNotificacao({
              tipo: 'folha_paga',
              titulo: `Pagamento realizado - ${folhaAtual.periodo}`,
              mensagem: `O pagamento de ${folhaAtual.colaborador.nomeCompleto} foi realizado. Valor: R$ ${folhaAtual.valorTotal.toFixed(2)}`,
              link: '/folha-pagamento',
              prioridade: 'media',
              categoria: 'folha',
            });
          }
          
          return {
            folhas: state.folhas.map((f) =>
              f.id === id
                ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
                : f
            ),
          };
        }),
      
      removerFolha: (id) =>
        set((state) => ({
          folhas: state.folhas.filter((f) => f.id !== id),
        })),
      
      calcularValorTotal: (id) =>
        set((state) => ({
          folhas: state.folhas.map((f) => {
            if (f.id === id) {
              // Obter custo de benefícios do store
              let beneficios = f.beneficios || 0;
              try {
                const store = useBeneficiosStore.getState();
                beneficios = store.getCustoTotalColaborador(String(f.colaboradorId));
              } catch (e) {
                console.warn('Não foi possível carregar benefícios:', e);
              }
              
              const valorTotal = f.valor + f.adicional + f.reembolso + beneficios - f.desconto;
              const valorTotalSemReembolso = valorTotal - f.reembolso;
              return {
                ...f,
                beneficios,
                valorTotal,
                valorTotalSemReembolso,
                atualizadoEm: new Date().toISOString(),
              };
            }
            return f;
          }),
        })),
      
      calcularPercentuais: (id) =>
        set((state) => ({
          folhas: state.folhas.map((f) => {
            if (f.id === id && f.percentualOperacao) {
              const total = f.valorTotalSemReembolso;
              const { empresa1, empresa2, empresa3, empresa4 } = f.percentualOperacao;
              
              return {
                ...f,
                empresa1Valor: (total * empresa1) / 100,
                empresa2Valor: (total * empresa2) / 100,
                empresa3Valor: (total * empresa3) / 100,
                empresa4Valor: (total * empresa4) / 100,
                percentualOperacao: {
                  ...f.percentualOperacao,
                  totalOpers: empresa1 + empresa2 + empresa3 + empresa4,
                },
                atualizadoEm: new Date().toISOString(),
              };
            }
            return f;
          }),
        })),
      
      atualizarNotaFiscal: (id, notaFiscal) =>
        set((state) => ({
          folhas: state.folhas.map((f) =>
            f.id === id
              ? { ...f, notaFiscal, atualizadoEm: new Date().toISOString() }
              : f
          ),
        })),
      
      gerarFolhasPorPeriodo: (periodo, colaboradores) =>
        set((state) => {
          // Verifica se já existem folhas para este período
          const folhasExistentes = state.folhas.filter((f) => f.periodo === periodo);
          
          if (folhasExistentes.length > 0) {
            console.warn(`Folhas já existem para o período ${periodo}`);
            return state;
          }
          
          const novasFolhas: FolhaPagamento[] = colaboradores
            .filter((c) => c.situacao === 'ativo')
            .map((colab) => {
              // Garantir que a folha receba empresa e setor a partir do cadastro
              const empresa = (colab as any).empresa || (colab as any).empresa || '';
              const setor = (colab as any).setor || (colab as any).departamento || '';

              const colaboradorMapped: ColaboradorCompleto = {
                // preserve as much as possible; coerce keys we rely on
                id: (colab as any).id,
                nomeCompleto: (colab as any).nomeCompleto || (colab as any).nome || '',
                cpf: (colab as any).cpf || '',
                telefone: (colab as any).telefone,
                email: (colab as any).email,
                dataNascimento: (colab as any).dataNascimento,
                endereco: (colab as any).endereco,
                numero: (colab as any).numero,
                complemento: (colab as any).complemento,
                bairro: (colab as any).bairro,
                cidade: (colab as any).cidade,
                cep: (colab as any).cep,
                setor: setor,
                funcao: (colab as any).funcao || (colab as any).cargo || '',
                empresa: empresa,
                regime: (colab as any).regime || 'CLT',
                contrato: (colab as any).contrato || 'CLT',
                situacao: (colab as any).situacao || 'ativo',
                chavePix: (colab as any).chavePix,
                banco: (colab as any).banco,
                codigoBanco: (colab as any).codigoBanco,
                agencia: (colab as any).agencia,
                conta: (colab as any).conta,
                operacao: (colab as any).operacao,
                cnpj: (colab as any).cnpj,
                razaoSocial: (colab as any).razaoSocial,
                tipo: (colab as any).tipo,
                enderecoEmpresa: (colab as any).enderecoEmpresa,
                numeroEmpresa: (colab as any).numeroEmpresa,
                complementoEmpresa: (colab as any).complementoEmpresa,
                cepEmpresa: (colab as any).cepEmpresa,
                bairroEmpresa: (colab as any).bairroEmpresa,
                cidadeEmpresa: (colab as any).cidadeEmpresa,
                avatar: (colab as any).avatar,
                obs: (colab as any).obs,
              };

              // Obter custo de benefícios para o colaborador
              let beneficios = 0;
              try {
                const store = useBeneficiosStore.getState();
                beneficios = store.getCustoTotalColaborador(String(colab.id));
              } catch (e) {
                console.warn('Não foi possível carregar benefícios:', e);
              }

              return {
                id: `fp-${periodo}-${colab.id}`,
                colaboradorId: colab.id,
                colaborador: colaboradorMapped,
                periodo,
                valor: 0,
                adicional: 0,
                reembolso: 0,
                desconto: 0,
                beneficios,
                valorTotal: beneficios, // Inicialmente só benefícios
                situacao: 'pendente',
                valorTotalSemReembolso: beneficios,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString(),
              };
            });
          
          // Emitir notificação para gestores sobre nova folha gerada
          if (novasFolhas.length > 0) {
            useNotificacoesStore.getState().adicionarNotificacao({
              tipo: 'folha_gerada',
              titulo: `Folha de pagamento gerada: ${periodo}`,
              mensagem: `Nova folha de pagamento gerada para ${novasFolhas.length} colaborador(es) no período ${periodo}.`,
              link: '/folha-pagamento',
              prioridade: 'alta',
              categoria: 'folha',
            });
          }
          
          return { folhas: [...state.folhas, ...novasFolhas] };
        }),
      
      getFolhasFiltradas: () => {
        const state = get();
        let filtradas = state.folhas.filter((f) => f.periodo === state.periodoSelecionado);
        
        if (state.filtroSituacao !== 'Todos') {
          filtradas = filtradas.filter((f) => f.situacao === state.filtroSituacao.toLowerCase());
        }
        
        if (state.filtroContrato !== 'Todos') {
          filtradas = filtradas.filter((f) => f.colaborador.contrato === state.filtroContrato);
        }
        
        if (state.busca) {
          const buscaLower = state.busca.toLowerCase();
          filtradas = filtradas.filter(
            (f) =>
              f.colaborador.nomeCompleto.toLowerCase().includes(buscaLower) ||
              f.colaborador.funcao.toLowerCase().includes(buscaLower) ||
              f.colaborador.setor.toLowerCase().includes(buscaLower)
          );
        }
        
        return filtradas;
      },
      
      getFolhasPorColaborador: (colaboradorId) => {
        return get().folhas.filter((f) => f.colaboradorId === colaboradorId);
      },
      
      exportarParaCSV: () => {
        const folhas = get().getFolhasFiltradas();
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
          'SITUAÇÃO',
          'DATA PGTO',
          'NOTA FISCAL',
          'STATUS',
          'PAGAMENTO',
          'DATA',
          'OBS',
          'V. TOTAL/ S REEMB',
          'EMPRESA 1 NOME',
          'EMPRESA 1 %',
          'EMPRESA 1 VALOR',
          'EMPRESA 2 NOME',
          'EMPRESA 2 %',
          'EMPRESA 2 VALOR',
          'EMPRESA 3 NOME',
          'EMPRESA 3 %',
          'EMPRESA 3 VALOR',
          'EMPRESA 4 NOME',
          'EMPRESA 4 %',
          'EMPRESA 4 VALOR',
          '%TOTAL OPERS'
        ];
        
        const rows = folhas.map(f => {
          // If there is no percentualOperacao or totalOpers is falsy, fallback to colaborador.empresa = 100%
          const po = f.percentualOperacao;
          const hasPerc = po && (po.totalOpers && po.totalOpers > 0);
          const empresa1Percent = hasPerc ? (po!.empresa1 || 0) : 100;
          const empresa1Valor = hasPerc ? (f.empresa1Valor || 0) : (f.valorTotalSemReembolso || 0);
          const empresa2Percent = hasPerc ? (po!.empresa2 || 0) : 0;
          const empresa2Valor = hasPerc ? (f.empresa2Valor || 0) : 0;
          const empresa3Percent = hasPerc ? (po!.empresa3 || 0) : 0;
          const empresa3Valor = hasPerc ? (f.empresa3Valor || 0) : 0;
          const empresa4Percent = hasPerc ? (po!.empresa4 || 0) : 0;
          const empresa4Valor = hasPerc ? (f.empresa4Valor || 0) : 0;

          return [
            f.colaborador.nomeCompleto,
            f.colaborador.funcao,
            f.colaborador.empresa,
            f.colaborador.contrato,
            f.valor.toFixed(2),
            f.adicional.toFixed(2),
            f.reembolso.toFixed(2),
            f.desconto.toFixed(2),
            f.valorTotal.toFixed(2),
            f.situacao,
            f.dataPagamento || '',
            f.notaFiscal?.numero || '',
            f.notaFiscal?.status || '',
            f.notaFiscal?.pagamento || '',
            f.notaFiscal?.data || '',
            f.notaFiscal?.obs || '',
            f.valorTotalSemReembolso.toFixed(2),
            // Empresa 1: nome, percent, valor
            (hasPerc ? (po!.empresa1Nome || '') : (f.colaborador.empresa || '')),
            empresa1Percent.toFixed(2),
            empresa1Valor.toFixed(2),
            // Empresa 2
            (hasPerc ? (po!.empresa2Nome || '') : ''),
            empresa2Percent.toFixed(2),
            empresa2Valor.toFixed(2),
            // Empresa 3
            (hasPerc ? (po!.empresa3Nome || '') : ''),
            empresa3Percent.toFixed(2),
            empresa3Valor.toFixed(2),
            // Empresa 4
            (hasPerc ? (po!.empresa4Nome || '') : ''),
            empresa4Percent.toFixed(2),
            empresa4Valor.toFixed(2),
            (po && po.totalOpers ? po.totalOpers : (hasPerc ? 0 : 100)).toFixed(2)
          ];
        });
        
        const csv = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join('\t'))
          .join('\n');
        
        return csv;
      },
      
      exportarParaExcel: () => {
        const csv = get().exportarParaCSV();
        const blob = new Blob(['\ufeff' + csv], { type: 'text/tab-separated-values;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const periodo = get().periodoSelecionado;
        link.setAttribute('href', url);
        link.setAttribute('download', `folha-pagamento-${periodo}.tsv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      
      importarDePlanilha: (dados: any[]) => {
        const periodo = get().periodoSelecionado;
        const novasFolhas: FolhaPagamento[] = dados.map((linha, idx) => {
          const valor = parseFloat(linha.valor) || 0;
          const adicional = parseFloat(linha.adicional) || 0;
          const reembolso = parseFloat(linha.reembolso) || 0;
          const desconto = parseFloat(linha.desconto) || 0;
          const valorTotal = valor + adicional + reembolso - desconto;
          const valorTotalSemReembolso = valorTotal - reembolso;

          // Parse empresas (se presentes)
          const e1p = parseFloat(linha.empresa1Percent) || 0;
          const e2p = parseFloat(linha.empresa2Percent) || 0;
          const e3p = parseFloat(linha.empresa3Percent) || 0;
          const e4p = parseFloat(linha.empresa4Percent) || 0;

          const po: any = {
            empresa1: e1p,
            empresa1Nome: linha.empresa1Nome || undefined,
            empresa2: e2p,
            empresa2Nome: linha.empresa2Nome || undefined,
            empresa3: e3p,
            empresa3Nome: linha.empresa3Nome || undefined,
            empresa4: e4p,
            empresa4Nome: linha.empresa4Nome || undefined,
            totalOpers: parseFloat(linha.percTotalOpers) || (e1p + e2p + e3p + e4p),
          };

          const folha: FolhaPagamento = {
            id: `fp-import-${Date.now()}-${idx}`,
            colaboradorId: linha.colaboradorId || (linha.colaboradorObject?.id) || 0,
            colaborador: linha.colaboradorObject
              ? {
                  id: linha.colaboradorObject.id,
                  nomeCompleto: linha.colaboradorObject.nomeCompleto || linha.colaborador || '',
                  cpf: linha.colaboradorObject.cpf || linha.cpf || '',
                  setor: linha.colaboradorObject.setor || linha.setor || '',
                  funcao: linha.colaboradorObject.funcao || linha.funcao || '',
                  empresa: linha.colaboradorObject.empresa || linha.empresa || '',
                  regime: (linha.colaboradorObject.regime as 'CLT' | 'PJ') || (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  contrato: (linha.colaboradorObject.contrato as 'CLT' | 'PJ') || (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  situacao: 'ativo' as const,
                }
              : {
                  id: 0,
                  nomeCompleto: linha.colaborador || '',
                  cpf: linha.cpf || '',
                  setor: linha.setor || '',
                  funcao: linha.funcao || '',
                  empresa: linha.empresa || '',
                  regime: (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  contrato: (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  situacao: 'ativo' as const,
                },
            periodo,
            valor,
            adicional,
            reembolso,
            desconto,
            beneficios: 0, // Será calculado posteriormente
            valorTotal,
            situacao: linha.situacao || 'pendente',
            valorTotalSemReembolso,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            percentualOperacao: (po.totalOpers && po.totalOpers > 0) ? po : undefined,
            empresa1Valor: parseFloat(linha.empresa1Valor) || (valorTotalSemReembolso * (e1p || 0) / 100) || undefined,
            empresa2Valor: parseFloat(linha.empresa2Valor) || (valorTotalSemReembolso * (e2p || 0) / 100) || undefined,
            empresa3Valor: parseFloat(linha.empresa3Valor) || (valorTotalSemReembolso * (e3p || 0) / 100) || undefined,
            empresa4Valor: parseFloat(linha.empresa4Valor) || (valorTotalSemReembolso * (e4p || 0) / 100) || undefined,
          };

          // Keep id=0 for standalone payments (external contractors, etc)
          // These are NOT added to colaboradoresStore - they only exist in the payment record

          return folha;
        });

        set(state => ({ folhas: [...state.folhas, ...novasFolhas] }));
      },
      
      gerarPlanilhaModelo: () => {
        const headers = [
          'CPF',
          'COLABORADOR',
          'FUNÇÃO',
          'EMPRESA',
          'CTT',
          'VALOR',
          'ADICIONAL',
          'REEMBOLSO',
          'DESCONTO',
          'VALOR TOTAL',
          'SITUAÇÃO',
          'DATA PGTO',
          'NOTA FISCAL',
          'STATUS',
          'PAGAMENTO',
          'DATA',
          'OBS',
          'V. TOTAL/ S REEMB',
          'EMPRESA 1 NOME',
          'EMPRESA 1 %',
          'EMPRESA 1 VALOR',
          'EMPRESA 2 NOME',
          'EMPRESA 2 %',
          'EMPRESA 2 VALOR',
          'EMPRESA 3 NOME',
          'EMPRESA 3 %',
          'EMPRESA 3 VALOR',
          'EMPRESA 4 NOME',
          'EMPRESA 4 %',
          'EMPRESA 4 VALOR',
          '%TOTAL OPERS'
        ];

        const exemplo = [
          '12345678900',
          'João da Silva',
          'Analista',
          'CFO Consultoria',
          'CLT',
          '5000.00',
          '500.00',
          '200.00',
          '800.00',
          '4900.00',
          'Pendente',
          '2025-11-30',
          '',
          '',
          '',
          '',
          '',
          '4700.00',
          'Empresa A',
          '25',
          '1175.00',
          'Empresa B',
          '25',
          '1175.00',
          'Empresa C',
          '25',
          '1175.00',
          'Empresa D',
          '25',
          '1175.00',
          '100'
        ];
        
        // Generate CSV (comma-separated) with proper quoting
        const csv = [headers, exemplo]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        return csv;
      },
      
      reset: () =>
        set({
          folhas: gerarFolhasMock(),
          periodoSelecionado: new Date().toISOString().slice(0, 7),
          filtroSituacao: 'Todos',
          filtroContrato: 'Todos',
          busca: '',
        }),
    }),
    {
      name: 'cfo:folha-pagamento',
      partialize: (s) => ({ folhas: s.folhas }),
    }
  )
);
