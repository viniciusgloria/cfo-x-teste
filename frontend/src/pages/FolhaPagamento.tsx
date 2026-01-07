import { useState, useRef, useEffect } from 'react';
import { PersonalizarColunasModal } from '../components/PersonalizarColunasModal.tsx';
// Removido import duplicado de ícones
import { FileText, Plus, Download, Upload, DollarSign, FileSpreadsheet, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle } from 'lucide-react';
import { useFolhaPagamentoStore } from '../store/folhaPagamentoStore.ts';
import { useColaboradoresStore } from '../store/colaboradoresStore.ts';
import { isValidCPF, isValidCNPJ } from '../utils/validation.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Avatar } from '../components/Avatar.tsx';
import { SkeletonCard } from '../components/ui/SkeletonCard.tsx';
import { PageBanner } from '../components/ui/PageBanner.tsx';
import { EditarFolhaModal } from '../components/EditarFolhaModal.tsx';
import { NovaFolhaModal } from '../components/NovaFolhaModal.tsx';
import { ImportPreviewModal } from '../components/ImportPreviewModal.tsx';
import useImportMappingsStore from '../store/importMappingsStore.ts';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { headersSimilarity } from '../utils/importMappings.ts';
import { FolhaPagamento } from '../types/index.ts';
import { Tooltip } from '../components/ui/Tooltip.tsx';

export default function FolhaPagamentoPage() {
      const [sortCol, setSortCol] = useState<string | null>(null);
      const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
      const sortableCols = ['colaborador', 'empresa', 'contrato', 'valor'];
    // Estado para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    // Estado para menu de exportação
    const [showExportMenu, setShowExportMenu] = useState(false);
    // Estado para menu de download de modelo
    const [showModeloMenu, setShowModeloMenu] = useState(false);
    // Removido estado não utilizado: clickedRow

    // Fechar menu de exportação ao clicar fora
    useEffect(() => {
      if (!showExportMenu) return;
      function handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.export-menu-container')) setShowExportMenu(false);
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [showExportMenu]);

    // Fechar menu de modelo ao clicar fora
    useEffect(() => {
      if (!showModeloMenu) return;
      function handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.modelo-menu-container')) setShowModeloMenu(false);
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [showModeloMenu]);

    // Guardar referência original
    const exportarParaExcelOriginal = useFolhaPagamentoStore.getState().exportarParaExcel;

    // Adaptar exportarParaExcel para aceitar tipo
    function handleExportarArquivo(_tipo: 'csv' | 'xls') {
      // Por enquanto ambos chamam a mesma função, mas pode ser expandido no futuro
      exportarParaExcelOriginal();
    }
  const {
    periodoSelecionado,
    filtroSituacao,
    filtroContrato,
    busca,
    setPeriodoSelecionado,
    setFiltroSituacao,
    setFiltroContrato,
    setBusca,
    getFolhasFiltradas,
    atualizarFolha,
    calcularValorTotal,
    importarDePlanilha,
    gerarPlanilhaModelo,
  } = useFolhaPagamentoStore();
  const removerFolha = useFolhaPagamentoStore((s) => s.removerFolha);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [folhaSelecionada, setFolhaSelecionada] = useState<FolhaPagamento | null>(null);
  const [colunas, setColunas] = useState<string[]>(() => {
    const saved = localStorage.getItem('folha_colunas');
    return saved ? JSON.parse(saved) : [
      'funcao', 'empresa', 'contrato', 'valor', 'adicional', 'reembolso', 'desconto', 'beneficios', 'total', 'valorTotalSemReembolso', 'situacao', 'dataPagamento'
    ];
  });
  const [modalPersonalizar, setModalPersonalizar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvalid, setPreviewInvalid] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewPeriodo, setPreviewPeriodo] = useState<string | null>(null);
  const [previewOriginalRows, setPreviewOriginalRows] = useState<any[] | null>(null);
  const [appliedMappingName, setAppliedMappingName] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLocal, setSearchLocal] = useState<string>(busca || '');
  const searchDebounceRef = useRef<any>(null);

  const { colaboradores } = useColaboradoresStore();
  let folhasFiltradas = getFolhasFiltradas();
  if (sortCol && sortableCols.includes(sortCol)) {
    const colMap: Record<string, (f: any) => any> = {
      colaborador: f => f.colaborador?.nomeCompleto?.toLowerCase?.() ?? '',
      empresa: f => f.colaborador?.empresa?.toLowerCase?.() ?? '',
      contrato: f => f.colaborador?.contrato?.toLowerCase?.() ?? '',
      valor: f => f.valor ?? 0,
    };
    const getVal = colMap[sortCol];
    if (getVal) {
      folhasFiltradas = [...folhasFiltradas].sort((a, b) => {
        const aVal = getVal(a);
        const bVal = getVal(b);
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }
  }

  // Cálculos de paginação
  const totalItems = folhasFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const folhasPaginadas = folhasFiltradas.slice(startIndex, endIndex);

  // Reset para página 1 quando filtros ou ordenação mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroSituacao, filtroContrato, busca, sortCol, sortDir, periodoSelecionado]);

  const handleNovaFolha = () => {
    setModalNovoAberto(true);
  };

  const handleSalvarNovaFolha = (dados: any) => {
    const colaborador = colaboradores.find((c: any) => String(c.id) === dados.colaboradorId);
    if (!colaborador) return;

    const colaboradorCompleto = {
      id: colaborador.id,
      nomeCompleto: colaborador.nomeCompleto || colaborador.nome,
      cpf: colaborador.cpf || '',
      telefone: colaborador.telefone,
      email: colaborador.email,
      setor: colaborador.setor || colaborador.departamento,
      funcao: colaborador.funcao || colaborador.cargo,
      empresa: colaborador.empresa || 'CFO Consultoria',
      regime: colaborador.regime || ('CLT' as const),
      contrato: colaborador.contrato || ('CLT' as const),
      situacao: 'ativo' as const,
      chavePix: colaborador.chavePix,
      banco: colaborador.banco,
      codigoBanco: colaborador.codigoBanco,
      agencia: colaborador.agencia,
      conta: colaborador.conta,
    };

    const novaFolha = {
      colaborador: colaboradorCompleto,
      periodo: dados.periodo,
      valor: dados.valor,
      adicional: dados.adicional,
      reembolso: dados.reembolso,
      desconto: dados.desconto,
      valorTotal: dados.valorTotal,
      valorTotalSemReembolso: dados.valorTotalSemReembolso,
      situacao: dados.situacao,
      dataPagamento: dados.dataPagamento,
      percentualOperacao: dados.percentualOperacao,
      notaFiscal: dados.notaFiscal,
    };

    // Usar a função adicionarFolha da store
    useFolhaPagamentoStore.getState().adicionarFolha(novaFolha as any);
  };

  // Debounced search to reduce re-renders
  useEffect(() => {
    setSearchLocal(busca || '');
  }, [busca]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setBusca(searchLocal);
    }, 250);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchLocal]);

  // Show skeleton loader briefly when period changes to improve perceived performance
  const handlePeriodoChange = (value: string) => {
    setIsLoading(true);
    setPeriodoSelecionado(value);
    window.setTimeout(() => setIsLoading(false), 300);
  };



  const handleBaixarModeloCSV = () => {
    const csv = gerarPlanilhaModelo();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo-folha-pagamento.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowModeloMenu(false);
  };

  const handleBaixarModeloXLS = () => {
    // Generate a real .xlsx file using SheetJS (xlsx) and file-saver
    try {
      const headers = [
        'CPF', 'COLABORADOR', 'FUNÇÃO', 'EMPRESA', 'CTT', 'VALOR',
        'ADICIONAL', 'REEMBOLSO', 'DESCONTO', 'VALOR TOTAL', 'SITUAÇÃO',
        'DATA PGTO', 'NOTA FISCAL', 'STATUS', 'PAGAMENTO', 'DATA', 'OBS',
        'V. TOTAL/ S REEMB', 'EMPRESA 1 NOME', 'EMPRESA 1 %', 'EMPRESA 1 VALOR',
        'EMPRESA 2 NOME', 'EMPRESA 2 %', 'EMPRESA 2 VALOR', 'EMPRESA 3 NOME',
        'EMPRESA 3 %', 'EMPRESA 3 VALOR', 'EMPRESA 4 NOME', 'EMPRESA 4 %',
        'EMPRESA 4 VALOR', '%TOTAL OPERS'
      ];
      const exemplo = [
        '12345678900', 'João da Silva', 'Analista', 'CFO Consultoria', 'CLT',
        '5000.00', '500.00', '200.00', '800.00', '4900.00', 'Pendente',
        '2025-11-30', '', '', '', '', '', '4700.00', 'Empresa A', '25',
        '1175.00', 'Empresa B', '25', '1175.00', 'Empresa C', '25',
        '1175.00', 'Empresa D', '25', '1175.00', '100'
      ];

      const aoa = [headers, exemplo];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'modelo-folha-pagamento');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'modelo-folha-pagamento.xlsx');
    } catch (err) {
      console.error('Erro ao gerar XLSX', err);
      toast.error('Não foi possível gerar o arquivo .xlsx. Abra o CSV em seu editor.');
    }
    setShowModeloMenu(false);
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
      const fr = new FileReader();
      fr.onload = (ev) => {
        try {
          const data = ev.target?.result as ArrayBuffer;
          const wb = XLSX.read(data, { type: 'array' });
          const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
          processImportedAOA(aoa as any);
        } catch (err) {
          console.error('Erro ao ler XLSX', err);
          toast.error('Não foi possível ler o arquivo Excel. Tente usar CSV.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      fr.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processImportedText(text);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
    }
  };

  

  // helper to normalize headers to our expected keys
  const normalizeHeaderKey = (h = '') => {
    const s = h.toString().toLowerCase().trim();
    
    // Exact matches first (more specific)
    if (s === 'cpf') return 'cpf';
    if (s === 'colaborador' || s === 'nome colaborador' || s === 'nome completo') return 'colaborador';
    if (s === 'função' || s === 'funcao' || s === 'cargo') return 'funcao';
    if (s === 'empresa') return 'empresa';
    if (s === 'contrato' || s === 'ctt') return 'contrato';
    if (s === 'adicional') return 'adicional';
    if (s === 'reembolso' || s === 'reemb') return 'reembolso';
    if (s === 'desconto') return 'desconto';
    if (s === 'valor total' || s === 'total') return 'valorTotal';
    if (s === 'valor') return 'valor';
    if (s === 'nota fiscal' || s === 'nota') return 'notaFiscal';
    
    // Partial matches (avoid company-split columns like "EMPRESA 1 NOME", "EMPRESA 4 VALOR")
    // Only match if it's a simple column name without numbers/splits
    if (s.includes('cpf') && !s.match(/\d/)) return 'cpf';
    if ((s.includes('colaborador') || (s.includes('nome') && !s.match(/empresa \d/))) && !s.match(/empresa \d/)) return 'colaborador';
    if ((s.includes('função') || s.includes('funcao') || s.includes('cargo')) && !s.match(/\d/)) return 'funcao';
    if (s.includes('empresa') && !s.match(/empresa \d/)) return 'empresa';
    if ((s.includes('contrato') || s === 'ctt') && !s.match(/\d/)) return 'contrato';
    if (s.includes('adicional') && !s.match(/\d/)) return 'adicional';
    if (s.includes('reemb') && !s.includes('total') && !s.match(/\d/)) return 'reembolso';
    if (s.includes('desconto') && !s.match(/\d/)) return 'desconto';
    if ((s.includes('valor total') || s.includes('total')) && !s.includes('reemb') && !s.match(/empresa/)) return 'valorTotal';
    if (s.includes('valor') && !s.includes('total') && !s.match(/empresa \d/)) return 'valor';
    if (s.includes('nota')) return 'notaFiscal';
    
    // Return original if no match
    return h.trim();
  };

  // process an Array-Of-Arrays (AOA) parsed from CSV/TSV or XLSX
  const processImportedAOA = (aoa: any[][]) => {
    // Get fresh list of colaboradores from store (in case new ones were added)
    const colaboradoresAtualizados = useColaboradoresStore.getState().colaboradores;
    console.log('🔍 INÍCIO DO PROCESSAMENTO - Colaboradores disponíveis:', colaboradoresAtualizados.length);
    console.log('📋 Lista:', colaboradoresAtualizados.map((c: any) => ({ id: c.id, nome: c.nomeCompleto || c.nome, cpf: c.cpf })));
    
    if (!aoa || aoa.length === 0) {
      toast.error('Arquivo vazio ou inválido');
      return;
    }
    const headersRaw = aoa[0].map((h: any) => String(h || '').trim());

    // Validate that ALL required columns are present
    const requiredKeys = ['cpf', 'colaborador', 'funcao', 'empresa', 'valor', 'contrato'];
    const normalizedHeaders = headersRaw.map(h => normalizeHeaderKey(h));
    const missingColumns = requiredKeys.filter(key => !normalizedHeaders.includes(key));

    if (missingColumns.length > 0) {
      // arquivo inválido — falta(m) coluna(s) obrigatória(s)
      toast.error(`Arquivo inválido. Faltam as colunas: ${missingColumns.join(', ')}`);
      setPreviewInvalid(true);
      setPreviewRows([]);
      setPreviewOpen(true);
      return;
    }

    // Try to find saved mapping
    const mappings = useImportMappingsStore.getState().mappings || [];
    const best = mappings
      .map(m => ({ m, score: headersSimilarity(headersRaw, m.headerSignature.split('|')) }))
      .sort((a, b) => b.score - a.score)[0];

    const willApplyMapping = best && best.score > 0.7;
    const mappingToUse = willApplyMapping ? best.m.mapping : undefined;
    const mappingNameApplied = willApplyMapping ? best.m.name : null;

    // parse values rows
    // build a mapping of normalized key -> original header text
    const headerMap: Record<string, string> = {};
    headersRaw.forEach(h => { headerMap[normalizeHeaderKey(h)] = h; });

    // parse rows from aoa (skip header)
    const rowsValues: any[][] = aoa.slice(1);
    const dadosRaw = rowsValues.map((rowArr: any[]) => {
      const obj: any = {};
      headersRaw.forEach((h, i) => {
        const key = normalizeHeaderKey(h);
        obj[key] = (rowArr && typeof rowArr[i] !== 'undefined') ? String(rowArr[i]).trim() : '';
      });
      obj.__originalHeaders = headerMap;
      return obj;
    });

    // Ensure canonical keys exist and map correctly regardless of column order
    const canonicalKeys = ['colaborador', 'cpf', 'empresa', 'funcao', 'valor', 'adicional', 'reembolso', 'desconto', 'valorTotal', 'contrato', 'notaFiscal'];
    const dadosCanonical = dadosRaw.map((rowArrObj, rowIndex) => {
      const canonical: any = {};
      // find by scanning headersRaw to ensure correct column -> canonical mapping
      headersRaw.forEach((h, i) => {
        const norm = normalizeHeaderKey(h);
        if (canonicalKeys.includes(norm)) {
          canonical[norm] = (rowsValues[rowIndex] && typeof rowsValues[rowIndex][i] !== 'undefined') ? String(rowsValues[rowIndex][i]).trim() : '';
        }
      });
      // fallback: if canonical missing, try existing keys on rowArrObj
      canonicalKeys.forEach(k => {
        if (typeof canonical[k] === 'undefined' || canonical[k] === '') {
          if (typeof rowArrObj[k] !== 'undefined' && rowArrObj[k] !== '') canonical[k] = rowArrObj[k];
        }
      });
      return { ...rowArrObj, ...canonical };
    });

    // create mapped version if mapping exists
    const dados = mappingToUse ? dadosCanonical.map(row => {
      const mapped: any = {};
      // copy all values including __originalHeaders
      Object.keys(row).forEach(k => { mapped[k] = row[k]; });

      // ensure there is an __originalHeaders map to update
      mapped.__originalHeaders = mapped.__originalHeaders ? { ...mapped.__originalHeaders } : {};

      // mappingToUse keys are original headers; map to target keys
      Object.keys(mappingToUse).forEach(origH => {
        const target = mappingToUse[origH];
        const normKey = normalizeHeaderKey(origH);
        // move value from normKey to target
        if (typeof mapped[normKey] !== 'undefined') {
          mapped[target] = mapped[normKey];
          // record that the target key now comes from this original header label
          mapped.__originalHeaders[target] = origH;
        }
      });
      return mapped;
    }) : dadosCanonical;

    if (dados.length === 0) {
      toast.error('Nenhum dado válido encontrado no arquivo.');
      return;
    }

    // Use current selected period as default; user can change in preview modal
    const mesCompetencia = periodoSelecionado;

    // Matching heuristics
    const strip = (s = '') => s.toString().normalize('NFD').replace(/[\u0000-\u036f]/g, '').toLowerCase().trim();
    const onlyDigits = (s = '') => s.toString().replace(/\D/g, '');

    const preview = dados.map((row, idx) => {
      let suggested: number | string | undefined;

      // Prioridade 1: Match por nome completo EXATO (case insensitive, sem acentos)
      if (row.colaborador) {
        const target = strip(row.colaborador);
        if (target.length >= 5) {  // Nome deve ter pelo menos 5 caracteres para ser confiável
          const exactByName = colaboradoresAtualizados.find((c: any) => {
            const colaboradorNome = strip(c.nomeCompleto || c.nome);
            return colaboradorNome === target;
          });
          if (exactByName) {
            suggested = exactByName.id;
          }
        }
      }

      // Prioridade 2: Match por CPF (apenas se não encontrou por nome e ambos têm CPF)
      if (!suggested) {
        const cpfInRow = (row as any).cpf;
        if (cpfInRow) {
          const cpfNormalized = onlyDigits(cpfInRow);
          if (cpfNormalized.length >= 11) {  // CPF deve ter pelo menos 11 dígitos
            const foundByCpf = colaboradoresAtualizados.find(c => {
              const colabCpf = onlyDigits(c.cpf || '');
              return colabCpf.length >= 11 && colabCpf === cpfNormalized;
            });
            if (foundByCpf) {
              suggested = foundByCpf.id;
            }
          }
        }
      }

      // attach periodo into raw so ImportPreviewModal can default it
      const rawWithPeriodo = { ...row, periodo: mesCompetencia };

      // Check for duplicate: same person + same period (value may change, that's why reimporting)
      const folhasExistentes = useFolhaPagamentoStore.getState().folhas;
      const duplicate = folhasExistentes.find(f => {
        const mesmoColaborador = suggested ? f.colaboradorId === suggested : 
          strip(f.colaborador.nomeCompleto) === strip(row.colaborador);
        const mesmoPeriodo = f.periodo === mesCompetencia;
        return mesmoColaborador && mesmoPeriodo;
      });

      // if no suggestion found, treat as a new collaborator by default
      // Auto-set selectedId to match suggestedId for automatic association
      return { 
        index: idx, 
        raw: rawWithPeriodo, 
        suggestedId: suggested, 
        selectedId: suggested ?? 'new',
        existingFolhaId: duplicate?.id
      };
    });

    // build original (unmapped) preview for undo
    const originalPreview = dadosRaw.map((row, idx) => {
      let suggested: number | string | undefined;

      // Prioridade 1: Match por nome
      if (row.colaborador) {
        const target = strip(row.colaborador);
        if (target.length >= 3) {
          const exactByName = colaboradoresAtualizados.find((c: any) => strip(c.nomeCompleto || c.nome) === target);
          if (exactByName) suggested = exactByName.id;
        }
      }

      // Prioridade 2: Match por CPF
      if (!suggested) {
        const cpfInRow = (row as any).cpf;
        if (cpfInRow) {
          const cpfNormalized = onlyDigits(cpfInRow);
          if (cpfNormalized.length >= 11) {
            const foundByCpf = colaboradoresAtualizados.find(c => {
              const colabCpf = onlyDigits(c.cpf || '');
              return colabCpf.length >= 11 && colabCpf === cpfNormalized;
            });
            if (foundByCpf) suggested = foundByCpf.id;
          }
        }
      }

      const rawWithPeriodo = { ...row, periodo: mesCompetencia };

      // original preview (unmapped) — default to 'new' when there's no suggested match
      return { index: idx, raw: rawWithPeriodo, suggestedId: suggested, selectedId: suggested ?? 'new' };
    });

    setPreviewInvalid(false);
    setPreviewRows(preview);
    setPreviewOriginalRows(originalPreview);
    setAppliedMappingName(mappingNameApplied);
    setPreviewPeriodo(mesCompetencia);
    setPreviewOpen(true);
  };

  // parse CSV/TSV text into AOA then delegate to processImportedAOA
  const processImportedText = (text: string) => {
    const parseTextToAOA = (txt: string): string[][] => {
      const rawLines = txt.split(/\r?\n/).filter(l => l.trim() !== '');
      if (rawLines.length === 0) return [];
      const first = rawLines[0];
      const delimiter = first.includes('\t') ? '\t' : ',';

      const splitLine = (line: string) => {
        if (delimiter === '\t') return line.split('\t').map(s => s.replace(/^"|"$/g, '').trim());
        const out: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue; }
            inQuotes = !inQuotes;
            continue;
          }
          if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue; }
          cur += ch;
        }
        out.push(cur.trim());
        return out.map(s => s.replace(/^"|"$/g, '').trim());
      };

      return rawLines.map(splitLine);
    };

    const aoa = parseTextToAOA(text);
    processImportedAOA(aoa);
  };

  const handleEditarFolha = (folha: FolhaPagamento) => {
    setFolhaSelecionada(folha);
    setModalEditarAberto(true);
  };

  const handleSalvarFolha = (id: string, dados: Partial<FolhaPagamento>) => {
    atualizarFolha(id, dados);
    calcularValorTotal(id);
    setModalEditarAberto(false);
    setFolhaSelecionada(null);
  };

  const getBadgeColor = (situacao: string) => {
    switch (situacao) {
      case 'pago':
        return 'green';
      case 'agendado':
        return 'blue';
      case 'pendente':
        return 'yellow';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularTotais = () => {
    const totais = folhasFiltradas.reduce(
      (acc, folha) => ({
        valor: acc.valor + folha.valor,
        adicional: acc.adicional + folha.adicional,
        reembolso: acc.reembolso + folha.reembolso,
        desconto: acc.desconto + folha.desconto,
        valorTotal: acc.valorTotal + folha.valorTotal,
      }),
      { valor: 0, adicional: 0, reembolso: 0, desconto: 0, valorTotal: 0 }
    );
    return totais;
  };

  const totais = calcularTotais();

  // Gerar períodos (últimos 12 meses)
  const gerarPeriodos = () => {
    const periodos: string[] = [];
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      periodos.push(data.toISOString().slice(0, 7));
    }
    return periodos;
  };

  const periodos = gerarPeriodos();

  return (
    <div className="space-y-6">
      <PageBanner
        title="Folha de Pagamento"
        icon={<DollarSign size={32} />}
        style={{ minHeight: '64px' }}
      />

      {/* Filtros e Ações */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por colaborador, função..."
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
            />
          </div>
          
          <select
            value={periodoSelecionado}
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {periodos.map((periodo) => {
              const [ano, mes] = periodo.split('-');
              const data = new Date(parseInt(ano), parseInt(mes) - 1);
              const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              return (
                <option key={periodo} value={periodo}>
                  {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                </option>
              );
            })}
          </select>

          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {['Todos', 'Pendente', 'Agendado', 'Pago', 'Cancelado'].map((opt) => (
              <option key={opt} value={opt}>{opt === 'Todos' ? 'Status' : opt}</option>
            ))}
          </select>

          <select
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {['Todos', 'CLT', 'PJ'].map((opt) => (
              <option key={opt} value={opt}>{opt === 'Todos' ? 'Contrato' : opt}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" onClick={handleNovaFolha}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Nova Folha
          </Button>
          <div className="relative export-menu-container">
            <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)} className="dark:text-white">
              <Download className="w-4 h-4 mr-2 inline dark:text-white" />
              Exportar
            </Button>
            {showExportMenu && (
              <div className="absolute top-full mt-1 bg-white dark:bg-slate-900 dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[140px]">
                <button
                  onClick={() => { setShowExportMenu(false); handleExportarArquivo('csv'); }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700"
                >
                  CSV
                </button>
                <button
                  onClick={() => { setShowExportMenu(false); handleExportarArquivo('xls'); }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700"
                >
                  XLSX
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => setImportModalOpen(true)} className="dark:text-white">
            <Upload className="w-4 h-4 mr-2 inline dark:text-white" />
            Importar
          </Button>
          <div className="relative modelo-menu-container">
            <Button variant="outline" onClick={() => setShowModeloMenu(!showModeloMenu)} className="dark:text-white">
              <FileSpreadsheet className="w-4 h-4 mr-2 inline dark:text-white" />
              Baixar Modelo
            </Button>
            {showModeloMenu && (
              <div className="absolute top-full mt-1 bg-white dark:bg-slate-900 dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[140px]">
                <button
                  onClick={handleBaixarModeloCSV}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700"
                >
                  CSV
                </button>
                <button
                  onClick={handleBaixarModeloXLS}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700"
                >
                  XLSX
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => setModalPersonalizar(true)} className="dark:text-white">
            <SlidersHorizontal className="w-4 h-4 mr-2 inline dark:text-white" />
            Personalizar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xls,.xlsx"
            className="hidden"
            onChange={handleImportar}
          />

          {/* Import modal with drag & drop to avoid native file picker popups */}
          {importModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-black/40 absolute inset-0" onClick={() => setImportModalOpen(false)} />
              <div className="bg-white dark:bg-slate-900 dark:bg-gray-900 rounded shadow-lg p-6 z-10 w-[720px]">
                <h3 className="text-lg font-semibold mb-3">Importar arquivo</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">Somente arquivos XSL/CSV são permitidos.</p>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const name = (file.name || '').toLowerCase();
                      if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
                        const fr = new FileReader();
                        fr.onload = (ev) => {
                          try {
                            const data = ev.target?.result as ArrayBuffer;
                            const wb = XLSX.read(data, { type: 'array' });
                            const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
                            processImportedAOA(aoa as any);
                          } catch (err) {
                            console.error('Erro ao ler XLSX arrastado', err);
                            toast.error('Não foi possível ler o arquivo Excel. Tente usar CSV.');
                          }
                          setImportModalOpen(false);
                        };
                        fr.readAsArrayBuffer(file);
                      } else {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target?.result as string;
                          processImportedText(text);
                          setImportModalOpen(false);
                        };
                        reader.readAsText(file);
                      }
                    }
                  }}
                        className="border-2 border-dashed rounded p-8 text-center text-gray-600 dark:text-slate-300 dark:text-gray-300 cursor-pointer"
                        onClick={() => {
                          // allow clicking to open the hidden file input
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                >
                  Arraste o arquivo ou clique aqui
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImportModalOpen(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoading ? (
          // Show skeleton boxes while loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`summary-skel-${i}`} className="animate-pulse rounded-lg p-4" style={{ backgroundColor: 'hsl(var(--card-bg))', border: `1px solid hsl(var(--card-border))` }}>
              <div className="h-4 w-20 mb-3" style={{ backgroundColor: 'hsl(var(--card-border))' }} />
              <div className="h-6 w-32" style={{ backgroundColor: 'hsl(var(--card-border))' }} />
            </div>
          ))
        ) : (
          <>
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Valor Base</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totais.valor)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Adicional</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totais.adicional)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Reembolso</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totais.reembolso)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Desconto</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totais.desconto)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totais.valorTotal)}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Tabela de Folhas */}
      {folhasFiltradas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma folha de pagamento encontrada
            </h3>
            <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
              Adicione colaboradores para gerar a folha de pagamento do período
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 dark:border-gray-700">
                  <th
                    className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky left-0 top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-30 cursor-pointer select-none min-w-[180px] focus-visible:ring-2 focus-visible:ring-emerald-500"
                    tabIndex={0}
                    aria-label="Ordenar por colaborador"
                    onClick={() => {
                      if (sortCol === 'colaborador') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      setSortCol('colaborador');
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { if (sortCol === 'colaborador') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortCol('colaborador'); } }}
                  >
                    <span className="inline-flex items-center" aria-hidden="true">
                      Colaborador
                      <span className="ml-1">
                        {sortCol === 'colaborador' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </span>
                  </th>
                  {colunas.includes('funcao') && <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 min-w-[140px]">Função</th>}
                  {colunas.includes('empresa') && (
                    <th
                      className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none min-w-[160px]"
                      onClick={() => {
                        if (sortCol === 'empresa') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        setSortCol('empresa');
                      }}
                    >
                      <span className="inline-flex items-center">
                        Empresa
                        <span className="ml-1">
                          {sortCol === 'empresa' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </span>
                    </th>
                  )}
                  {colunas.includes('contrato') && (
                    <th
                      className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none min-w-[110px]"
                      onClick={() => {
                        if (sortCol === 'contrato') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        setSortCol('contrato');
                      }}
                    >
                      <span className="inline-flex items-center">
                        Contrato
                        <span className="ml-1">
                          {sortCol === 'contrato' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </span>
                    </th>
                  )}
                  {colunas.includes('valor') && (
                    <Tooltip content="Valor base do pagamento">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none min-w-[110px]"
                        onClick={() => {
                          if (sortCol === 'valor') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('valor');
                        }}
                      >
                        <span className="inline-flex items-center">
                          Valor
                          <span className="ml-1">
                            {sortCol === 'valor' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                          </span>
                        </span>
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('adicional') && (
                    <Tooltip content="Adicional">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none"
                        onClick={() => {
                          if (sortCol === 'adicional') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('adicional');
                        }}
                      >
                        Adicional
                        {sortCol === 'adicional' && (
                          <span className="inline-block ml-1 align-middle">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('reembolso') && (
                    <Tooltip content="Reembolsos">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none"
                        onClick={() => {
                          if (sortCol === 'reembolso') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('reembolso');
                        }}
                      >
                        Reembolso
                        {sortCol === 'reembolso' && (
                          <span className="inline-block ml-1 align-middle">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('desconto') && (
                    <Tooltip content="Descontos">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none"
                        onClick={() => {
                          if (sortCol === 'desconto') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('desconto');
                        }}
                      >
                        Desconto
                        {sortCol === 'desconto' && (
                          <span className="inline-block ml-1 align-middle">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('beneficios') && (
                    <Tooltip content="Custo total de benefícios (calculado automaticamente)">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 min-w-[110px]"
                      >
                        Benefícios
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('total') && (
                    <Tooltip content="Valor Total">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none"
                        onClick={() => {
                          if (sortCol === 'valorTotal') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('valorTotal');
                        }}
                      >
                        Total
                        {sortCol === 'valorTotal' && (
                          <span className="inline-block ml-1 align-middle">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('valorTotalSemReembolso') && (
                    <Tooltip content="Valor total sem reembolso">
                      <th
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10 cursor-pointer select-none"
                        onClick={() => {
                          if (sortCol === 'valorTotalSemReembolso') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          setSortCol('valorTotalSemReembolso');
                        }}
                      >
                        V. Total s/ Reemb
                        {sortCol === 'valorTotalSemReembolso' && (
                          <span className="inline-block ml-1 align-middle">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </Tooltip>
                  )}
                  {colunas.includes('empresa1') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Empresa 1</th>}
                  {colunas.includes('empresa2') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Empresa 2</th>}
                  {colunas.includes('empresa3') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden lg:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Empresa 3</th>}
                  {colunas.includes('empresa4') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden lg:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Empresa 4</th>}
                  {colunas.includes('situacao') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Situação</th>}
                  {colunas.includes('dataPagamento') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Data Pgto</th>}
                  {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">NF</th>}
                  {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 hidden md:table-cell sticky top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-10">Status NF</th>}
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 dark:text-gray-300 sticky right-0 top-0 bg-white dark:bg-slate-900 dark:bg-gray-900 z-30">Ações</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-gray-100 dark:border-slate-700 dark:border-gray-800">
                      <td colSpan={20} className="py-3 px-4">
                        <SkeletonCard />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                {folhasPaginadas.map((folha) => (
                  <tr
                    key={folha.id}
                    className="border-b border-gray-100 dark:border-slate-700 dark:border-gray-800 odd:bg-white dark:bg-slate-900 even:bg-gray-50 dark:bg-slate-900/50 dark:odd:bg-gray-800 dark:even:bg-gray-900 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-xs sm:text-sm"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEditarFolha(folha); }}
                  >
                    <td className="py-3 px-4 sticky left-0 z-30 bg-inherit">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={folha.colaborador.avatar}
                          alt={folha.colaborador.nomeCompleto}
                          size="sm"
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-gray-700 text-gray-700 dark:text-slate-200 dark:text-gray-200 font-semibold flex items-center justify-center"
                        >
                          {!folha.colaborador.avatar && folha.colaborador.nomeCompleto
                            ? folha.colaborador.nomeCompleto.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
                            : null}
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            {folha.colaborador.nomeCompleto}
                            {(() => {
                              const cpfValido = folha.colaborador.cpf && isValidCPF(folha.colaborador.cpf.replace(/\D/g, ''));
                              const cnpjValido = folha.colaborador.contrato === 'PJ' ? (folha.colaborador.cnpj && isValidCNPJ(folha.colaborador.cnpj.replace(/\D/g, ''))) : true;
                              if (!cpfValido || !cnpjValido) {
                                return (
                                  <Tooltip content={`${!cpfValido ? 'CPF inválido' : ''} ${!cnpjValido ? 'CNPJ inválido' : ''}`}>
                                    <AlertCircle size={16} className="text-red-500" />
                                  </Tooltip>
                                );
                              }
                              return null;
                            })()}
                          </p>
                          {/* setor removed from list view - not needed */}
                        </div>
                      </div>
                    </td>
                    {colunas.includes('funcao') && <td className="py-3 px-4 text-gray-700 dark:text-slate-200 dark:text-gray-300">{folha.colaborador.funcao}</td>}
                    {colunas.includes('empresa') && <td className="py-3 px-4 text-gray-700 dark:text-slate-200 dark:text-gray-300">{folha.colaborador.empresa}</td>}
                    {colunas.includes('contrato') && (
                      <td className="py-3 px-4 text-center">
                        <Badge variant={folha.colaborador.contrato === 'CLT' ? 'info' : 'purple' as any}>
                          {folha.colaborador.contrato}
                        </Badge>
                      </td>
                    )}
                    {colunas.includes('valor') && <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-200 dark:text-gray-300 min-w-[120px]">{formatCurrency(folha.valor)}</td>}
                    {colunas.includes('adicional') && <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-200 dark:text-gray-300 min-w-[120px]">{formatCurrency(folha.adicional)}</td>}
                    {colunas.includes('reembolso') && <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-200 dark:text-gray-300 min-w-[120px]">{formatCurrency(folha.reembolso)}</td>}
                    {colunas.includes('desconto') && <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-200 dark:text-gray-300 min-w-[120px]">{formatCurrency(folha.desconto)}</td>}
                    {colunas.includes('beneficios') && <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 min-w-[120px]">{formatCurrency(folha.beneficios || 0)}</td>}
                    {colunas.includes('total') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[140px]">{formatCurrency(folha.valorTotal)}</td>}
                    {colunas.includes('valorTotalSemReembolso') && <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-200 dark:text-gray-300 min-w-[140px]">{formatCurrency(folha.valorTotalSemReembolso)}</td>}
                    {colunas.includes('empresa1') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.percentualOperacao?.empresa1 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa1Nome || 'Empresa 1'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa1}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa1Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa2') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.percentualOperacao?.empresa2 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa2Nome || 'Empresa 2'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa2}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa2Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa3') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.percentualOperacao?.empresa3 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa3Nome || 'Empresa 3'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa3}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa3Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa4') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.percentualOperacao?.empresa4 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa4Nome || 'Empresa 4'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa4}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa4Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('situacao') && (
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getBadgeColor(folha.situacao) as any}>
                          {folha.situacao.charAt(0).toUpperCase() + folha.situacao.slice(1)}
                        </Badge>
                      </td>
                    )}
                    {colunas.includes('dataPagamento') && (
                      <td className="py-3 px-4 text-center">
                        {folha.dataPagamento ? new Date(folha.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    )}
                    {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && (
                      <td className="py-3 px-4 text-center">{folha.notaFiscal?.numero || '-'}</td>
                    )}
                    {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && (
                      <td className="py-3 px-4 text-center">{folha.notaFiscal?.status || '-'}</td>
                    )}
                    <td className="py-3 px-4 text-center sticky right-0 z-30 bg-inherit">
                      <Tooltip content="Editar">
                        <span>
                          <Button
                            variant="outline"
                            aria-label={`Editar folha de ${folha.colaborador.nomeCompleto}`}
                            tabIndex={0}
                            onClick={e => { e.stopPropagation(); handleEditarFolha(folha); }}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleEditarFolha(folha); } }}
                            className="dark:text-white"
                          >
                            <FileText className="w-4 h-4 dark:text-white" />
                          </Button>
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
              <tfoot>
                <tr className="bg-[#f9fafb] dark:bg-gray-900">
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white sticky left-0 bg-[#f9fafb] dark:bg-gray-900 z-30">TOTAL</td>
                  {colunas.includes('funcao') && <td className="py-3 px-4 bg-[#f9fafb] dark:bg-gray-900"></td>}
                  {colunas.includes('empresa') && <td className="py-3 px-4 bg-[#f9fafb] dark:bg-gray-900"></td>}
                  {colunas.includes('contrato') && <td className="py-3 px-4 bg-[#f9fafb] dark:bg-gray-900"></td>}
                  {colunas.includes('valor') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[120px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.valor)}</td>}
                  {colunas.includes('adicional') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[120px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.adicional)}</td>}
                  {colunas.includes('reembolso') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[120px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.reembolso)}</td>}
                  {colunas.includes('desconto') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[120px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.desconto)}</td>}
                  {colunas.includes('total') && <td className="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 min-w-[140px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.valorTotal)}</td>}
                  {colunas.includes('valorTotalSemReembolso') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white min-w-[140px] bg-[#f9fafb] dark:bg-gray-900">{formatCurrency(totais.valorTotal - totais.reembolso)}</td>}
                  {colunas.includes('empresa1') && <td className="py-3 px-4 bg-[#f9fafb] dark:bg-gray-900"></td>}
                  {colunas.includes('empresa2') && <td className="py-3 px-4 bg-[#f9fafb] dark:bg-gray-900"></td>}
                  {colunas.includes('empresa3') && <td className="py-3 px-4"></td>}
                  {colunas.includes('empresa4') && <td className="py-3 px-4"></td>}
                  {colunas.includes('situacao') && <td className="py-3 px-4"></td>}
                  {colunas.includes('dataPagamento') && <td className="py-3 px-4"></td>}
                  {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <td className="py-3 px-4"></td>}
                  {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <td className="py-3 px-4"></td>}
                  <td className="py-3 px-4 sticky right-0 bg-[#f9fafb] dark:bg-gray-900 z-10"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pb-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} registros
              </div>
              
              <div className="flex items-center gap-2">
                {/* Primeira página */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="dark:text-white"
                  aria-label="Primeira página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Página anterior */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="dark:text-white"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Números das páginas */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostra: primeira, última, atual e adjacentes
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      // Adiciona "..." entre números não consecutivos
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex gap-1">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "primary" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "" : "dark:text-white"}
                            aria-label={`Página ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                {/* Próxima página */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="dark:text-white"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Última página */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="dark:text-white"
                  aria-label="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modal Personalizar Colunas */}
      <PersonalizarColunasModal
        isOpen={modalPersonalizar}
        onClose={() => setModalPersonalizar(false)}
        value={colunas}
        onChange={(cols: string[]) => {
          setColunas(cols);
          localStorage.setItem('folha_colunas', JSON.stringify(cols));
        }}
        temPJ={folhasFiltradas.some(f => f.colaborador.contrato === 'PJ')}
      />

      {/* Modal de Edição */}
      {modalEditarAberto && (
        <EditarFolhaModal
          folha={folhaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            setFolhaSelecionada(null);
          }}
          onSave={handleSalvarFolha}
          onDelete={(id) => {
            try { removerFolha(id); } catch {}
            setModalEditarAberto(false);
            setFolhaSelecionada(null);
          }}
        />
      )}

      {/* Modal de Nova Folha */}
      <NovaFolhaModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSave={handleSalvarNovaFolha}
        periodo={periodoSelecionado}
      />

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={previewOpen}
        invalid={previewInvalid}
        onDownloadModel={handleBaixarModeloCSV}
        onClose={() => { setPreviewOpen(false); setImportModalOpen(false); if (fileInputRef.current) fileInputRef.current.value = ''; }}
        rows={previewRows}
        colaboradores={colaboradores}
        periodo={previewPeriodo}
        onSetPeriodo={(p) => setPreviewPeriodo(p)}
        appliedMappingName={appliedMappingName}
        onUndoMapping={() => {
          if (previewOriginalRows) {
            setPreviewRows(previewOriginalRows);
            setAppliedMappingName(null);
          }
        }}
        onConfirm={(localRows) => {
            // Ensure periodo is set
            if (previewPeriodo) setPeriodoSelecionado(previewPeriodo);

            // Separate updates from new inserts
            const toUpdate: Array<{id: string, dados: any}> = [];
            const toInsert: any[] = [];

            localRows.forEach((r: any) => {
              const sel = r.selectedId;
              let rowData: any;
              
              if (sel && sel !== 'new') {
                const found = colaboradores.find((c: any) => String(c.id) === String(sel));
                if (found) {
                  rowData = {
                    ...r.raw,
                    colaboradorId: found.id,
                    colaboradorObject: {
                      id: found.id,
                      nomeCompleto: found.nomeCompleto || found.nome,
                      cpf: found.cpf || '',
                      setor: found.setor || '',
                      funcao: found.funcao || '',
                      empresa: found.empresa || '',
                      regime: found.regime || 'CLT',
                      contrato: found.contrato || 'CLT',
                      situacao: 'ativo'
                    }
                  };
                } else {
                  rowData = r.raw;
                }
              } else {
                rowData = r.raw;
              }

              // If duplicate detected, check user's action choice
              if (r.existingFolhaId && r.duplicateAction === 'update') {
                toUpdate.push({ id: r.existingFolhaId, dados: rowData });
              } else {
                toInsert.push(rowData);
              }
            });

            // Process updates
            toUpdate.forEach(({ id, dados }) => {
              atualizarFolha(id, dados);
            });

            // Process new inserts
            if (toInsert.length > 0) {
              importarDePlanilha(toInsert);
            }

            // Show toast
            if (toUpdate.length > 0 && toInsert.length > 0) {
              toast.success(`${toUpdate.length} atualizado(s), ${toInsert.length} novo(s) inserido(s)!`);
            } else if (toUpdate.length > 0) {
              toast.success(`${toUpdate.length} registro(s) atualizado(s)!`);
            } else {
              toast.success(`${toInsert.length} registro(s) importado(s) com sucesso!`);
            }

            setPreviewOpen(false);
            setImportModalOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
      />
    </div>
  );
}





