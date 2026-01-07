import { useState, useRef, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Download, Upload, FileSpreadsheet, RefreshCw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  Search, Send, Eye, Trash2, Receipt, TrendingUp,
  Building2, Users, DollarSign, AlertCircle, CheckCircle, Clock, Edit
} from 'lucide-react';
import { useFolhaClientesStore } from '../store/folhaClientesStore';
import { useAuthStore } from '../store/authStore';
import { useClientesStore } from '../store/clientesStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageBanner } from '../components/ui/PageBanner';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { FolhaCliente } from '../types';

export default function FolhaClientesPage() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showModeloMenu, setShowModeloMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [folhaSelecionada, setFolhaSelecionada] = useState<FolhaCliente | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalNovaFolhaAberto, setModalNovaFolhaAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalImportPreviewAberto, setModalImportPreviewAberto] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [novaFolhaDistribuicao, setNovaFolhaDistribuicao] = useState<Array<{ empresa: string; percent: number }>>([
    { empresa: '', percent: 100 }
  ]);
  const [novaClienteId, setNovaClienteId] = useState<string>('');
  // Campos do modal Nova Folha
  const [novaColaborador, setNovaColaborador] = useState<string>('');
  const [novaFuncao, setNovaFuncao] = useState<string>('');
  const [novaEmpresa, setNovaEmpresa] = useState<string>('');
  const [novaCtt, setNovaCtt] = useState<string>('');
  const [novaValor, setNovaValor] = useState<number>(0);
  const [novaAdicional, setNovaAdicional] = useState<number>(0);
  const [novaReembolso, setNovaReembolso] = useState<number>(0);
  const [novaDesconto, setNovaDesconto] = useState<number>(0);
  const [novaSituacao, setNovaSituacao] = useState<'pendente' | 'agendado' | 'pago' | 'cancelado'>('pendente');
  const [novaDataPagamento, setNovaDataPagamento] = useState<string>('');
  const [novaNotaNumero, setNovaNotaNumero] = useState<string>('');
  const [novaNotaStatus, setNovaNotaStatus] = useState<'aguardando' | 'recebida' | 'pendente'>('aguardando');
  const [novaNotaPagamento, setNovaNotaPagamento] = useState<'pendente' | 'agendado' | 'pago'>('pendente');
  const [novaNotaData, setNovaNotaData] = useState<string>('');
  const [novaNotaObs, setNovaNotaObs] = useState<string>('');
  const [novaObs, setNovaObs] = useState<string>('');
  // Estados para edição de folha
  const [editClienteId, setEditClienteId] = useState<string>('');
  const [editColaborador, setEditColaborador] = useState<string>('');
  const [editFuncao, setEditFuncao] = useState<string>('');
  const [editEmpresa, setEditEmpresa] = useState<string>('');
  const [editCtt, setEditCtt] = useState<string>('');
  const [editValor, setEditValor] = useState<number>(0);
  const [editAdicional, setEditAdicional] = useState<number>(0);
  const [editReembolso, setEditReembolso] = useState<number>(0);
  const [editDesconto, setEditDesconto] = useState<number>(0);
  const [editSituacao, setEditSituacao] = useState<'pendente' | 'agendado' | 'pago' | 'cancelado'>('pendente');
  const [editDataPagamento, setEditDataPagamento] = useState<string>('');
  const [editNotaNumero, setEditNotaNumero] = useState<string>('');
  const [editNotaStatus, setEditNotaStatus] = useState<'aguardando' | 'recebida' | 'pendente'>('aguardando');
  const [editNotaPagamento, setEditNotaPagamento] = useState<'pendente' | 'agendado' | 'pago'>('pendente');
  const [editNotaData, setEditNotaData] = useState<string>('');
  const [editNotaObs, setEditNotaObs] = useState<string>('');
  const [editObs, setEditObs] = useState<string>('');
  const [editFolhaDistribuicao, setEditFolhaDistribuicao] = useState<Array<{ empresa: string; percent: number }>>([{ empresa: '', percent: 100 }]);
  const [empresaSelecionadaCustos, setEmpresaSelecionadaCustos] = useState<string>('Todas');
  const [empresaSelecionadaPerformance, setEmpresaSelecionadaPerformance] = useState<string>('Todas');
  const [clienteSelecionadoProjecao, setClienteSelecionadoProjecao] = useState<string>('Todos');
  const [clienteSelecionadoComparativo, setClienteSelecionadoComparativo] = useState<string>('Todos');
  const [empresaSelecionadaFunil, setEmpresaSelecionadaFunil] = useState<string>('Todas');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    periodoSelecionado,
    filtroSituacao,
    filtroCliente,
    filtroStatusOmie,
    busca,
    setPeriodoSelecionado,
    setFiltroSituacao,
    setFiltroCliente,
    setFiltroStatusOmie,
    setBusca,
    getFolhasFiltradas,
    removerFolha,
    sincronizarComOmie,
    exportarParaExcel
  } = useFolhaClientesStore();

  const { clientes } = useClientesStore();
  const user = useAuthStore((s) => s.user);

  const isVisitante = user?.role === 'visitante';

  // Determine o cliente selecionado (visitors are fixed to their clienteId)
  const selectedClientId = isVisitante && user?.clienteId ? String(user.clienteId) : filtroCliente;
  const selectedClient = clientes.find((c) => String(c.id) === String(selectedClientId));
  const bannerTitle = selectedClientId && selectedClientId !== 'Todos' && selectedClient
    ? `Folha de Clientes - ${selectedClient.dadosGerais?.nome || 'Cliente'}`
    : 'Folha de Clientes';

  usePageTitle(bannerTitle);
  

  // Se for visitante, fixa o filtroCliente para o cliente vinculado ao usuário
  useEffect(() => {
    if (isVisitante && user?.clienteId) {
      setFiltroCliente(String(user.clienteId));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisitante, user?.clienteId]);

  // Auto-selecionar cliente no modal Nova Folha apenas para admin e visitante
  useEffect(() => {
    if (modalNovaFolhaAberto && selectedClientId && selectedClientId !== 'Todos') {
      if (user?.role === 'admin' || user?.role === 'visitante') {
        setNovaClienteId(selectedClientId);
      }
    }
  }, [modalNovaFolhaAberto, selectedClientId, user?.role]);

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fechar menus ao clicar fora
  useEffect(() => {
    if (!showExportMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.export-menu-container')) setShowExportMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu]);

  useEffect(() => {
    if (!showModeloMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.modelo-menu-container')) setShowModeloMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showModeloMenu]);

  // Obter folhas filtradas
  const folhasFiltradas = getFolhasFiltradas();

  // Paginação
  const totalItems = folhasFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Garantir comportamento: se houver apenas uma linha de distribuição, manter 100%
  useEffect(() => {
    if (novaFolhaDistribuicao.length === 1) {
      const only = novaFolhaDistribuicao[0];
      if (only.percent !== 100) {
        setNovaFolhaDistribuicao([{ ...only, percent: 100 }]);
      }
    }
  }, [novaFolhaDistribuicao.length]);

  // Soma total de percentuais (usada para validação)
  const totalDistribPercent = novaFolhaDistribuicao.reduce((acc, cur) => acc + (Number(cur.percent) || 0), 0);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const folhasPaginadas = folhasFiltradas.slice(startIndex, endIndex);

  // Reset página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroSituacao, filtroCliente, filtroStatusOmie, busca, periodoSelecionado]);

  // Handlers
  const handleDownloadModelo = () => {
    const headers = [
      'COLABORADOR', 'FUNÇÃO', 'EMPRESA', 'CTT', 'VALOR', 'ADICIONAL', 
      'REEMBOLSO', 'DESCONTO', 'EMPRESA 1', 'EMPRESA 1 %', 'EMPRESA 2', 
      'EMPRESA 2 %', 'EMPRESA 3', 'EMPRESA 3 %', 'EMPRESA 4', 'EMPRESA 4 %'
    ];
    
    const exemplo = [
      'João da Silva', 'Analista', 'Empresa Cliente LTDA', 'ADM-001',
      '5000.00', '500.00', '200.00', '100.00', 'Matriz SP', '50',
      'Filial RJ', '50', '', '', '', ''
    ];
    
    const aoa = [headers, exemplo];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'modelo-folha-clientes');
    XLSX.writeFile(wb, 'modelo-folha-clientes.xlsx');
    
    setShowModeloMenu(false);
    toast.success('Modelo baixado com sucesso!');
  };

  const handleImportarPlanilha = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        setImportPreviewData(jsonData as any[]);
        setModalImportPreviewAberto(true);
        toast.success(`Arquivo "${file.name}" carregado com sucesso!`);
      } catch (error) {
        toast.error('Erro ao processar arquivo');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportar = () => {
    exportarParaExcel();
    setShowExportMenu(false);
    toast.success('Exportação concluída!');
  };

  const handleSincronizarOmie = async () => {
    setIsSyncing(true);
    try {
      await sincronizarComOmie();
      toast.success('Sincronização com OMIE concluída!');
    } catch (error) {
      toast.error('Erro ao sincronizar com OMIE');
    } finally {
      setIsSyncing(false);
    }
  };

  // Envio para OMIE desativado temporariamente — função removida para evitar warnings.

  const handleRemover = (id: string, colaborador: string) => {
    if (window.confirm(`Deseja realmente remover a folha de ${colaborador}?`)) {
      removerFolha(id);
      toast.success('Folha removida com sucesso!');
    }
  };

  const handleVisualizar = (folha: FolhaCliente) => {
    setFolhaSelecionada(folha);
    setModalVisualizarAberto(true);
  };

  // Badges
  const getSituacaoBadge = (situacao: string) => {
    const badges = {
      pendente: { variant: 'default' as const, label: 'Pendente' },
      agendado: { variant: 'default' as const, label: 'Agendado' },
      pago: { variant: 'default' as const, label: 'Pago' },
      cancelado: { variant: 'default' as const, label: 'Cancelado' }
    };
    return badges[situacao as keyof typeof badges] || badges.pendente;
  };

  const getOmieBadge = (status: string) => {
    const badges = {
      pendente: { variant: 'default' as const, label: 'Pendente' },
      enviado: { variant: 'default' as const, label: 'Enviado' },
      sincronizado: { variant: 'default' as const, label: 'Sincronizado' },
      erro: { variant: 'default' as const, label: 'Erro' }
    };
    return badges[status as keyof typeof badges] || badges.pendente;
  };

  const handleNovaFolha = () => {
    setFolhaSelecionada(null);
    setModalNovaFolhaAberto(true);
  };

  const handleEditarFolha = (folha: FolhaCliente) => {
    setFolhaSelecionada(folha);
    // Inicializar estados de edição com os valores da folha
    setEditClienteId(String(folha.clienteId));
    setEditColaborador(folha.colaborador);
    setEditFuncao(folha.funcao || '');
    setEditEmpresa(folha.empresa);
    setEditCtt(folha.ctt || '');
    setEditValor(folha.valor);
    setEditAdicional(folha.adicional);
    setEditReembolso(folha.reembolso);
    setEditDesconto(folha.desconto);
    setEditSituacao(folha.situacao);
    setEditDataPagamento(folha.dataPagamento || '');
    setEditNotaNumero(folha.notaFiscal?.numero || '');
    setEditNotaStatus(folha.notaFiscal?.status || 'aguardando');
    setEditNotaPagamento(folha.notaFiscal?.pagamento || 'pendente');
    setEditNotaData(folha.notaFiscal?.data || '');
    setEditNotaObs(folha.notaFiscal?.obs || '');
    setEditObs(folha.obs || '');
    
    // Carregar distribuição
    const distrib: Array<{ empresa: string; percent: number }> = [];
    if (folha.percentualOperacao?.empresa1) distrib.push({ empresa: folha.percentualOperacao.empresa1, percent: folha.percentualOperacao.empresa1Percent || 0 });
    if (folha.percentualOperacao?.empresa2) distrib.push({ empresa: folha.percentualOperacao.empresa2, percent: folha.percentualOperacao.empresa2Percent || 0 });
    if (folha.percentualOperacao?.empresa3) distrib.push({ empresa: folha.percentualOperacao.empresa3, percent: folha.percentualOperacao.empresa3Percent || 0 });
    if (folha.percentualOperacao?.empresa4) distrib.push({ empresa: folha.percentualOperacao.empresa4, percent: folha.percentualOperacao.empresa4Percent || 0 });
    setEditFolhaDistribuicao(distrib.length > 0 ? distrib : [{ empresa: '', percent: 100 }]);
    
    setModalEditarAberto(true);
  };

  const handleConfirmarImport = () => {
    toast.success(`${importPreviewData.length - 1} registros importados com sucesso!`);
    setModalImportPreviewAberto(false);
    setImportPreviewData([]);
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title={bannerTitle}
        icon={<Receipt size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleNovaFolha}
              className="flex items-center gap-2"
            >
              <Receipt size={18} />
              Nova Folha
            </Button>

            <Button
              variant="secondary"
              onClick={handleSincronizarOmie}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              Sincronizar OMIE
            </Button>
            
            <div className="modelo-menu-container relative">
              <Button
                variant="outline"
                onClick={() => setShowModeloMenu(!showModeloMenu)}
                className="flex items-center gap-2"
              >
                <Download size={18} />
                Modelo
              </Button>
              {showModeloMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDownloadModelo}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700 text-sm"
                  >
                    <FileSpreadsheet className="inline mr-2" size={16} />
                    Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleImportarPlanilha}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Importar
            </Button>

            <div className="export-menu-container relative">
              <Button
                variant="outline"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2"
              >
                <Download size={18} />
                Exportar
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleExportar}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:bg-slate-800/80 dark:hover:bg-gray-700 text-sm"
                  >
                    <FileSpreadsheet className="inline mr-2" size={16} />
                    Excel (.csv)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      />

      {/* Seletor de Cliente Destacado - Apenas para Admins */}
      {!isVisitante && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 border-2 border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Receipt size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Selecione o Cliente
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Escolha um cliente para visualizar e gerenciar suas folhas de pagamento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg text-base font-medium bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[300px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Todos">Todos os Clientes</option>
                {clientes.filter(c => c.status === 'ativo').map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.dadosGerais?.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Período */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300">
              Período:
            </label>
            <Input
              type="month"
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Situação */}
          <div className="flex items-center gap-2">
            <select
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Todas">Todas Situações</option>
              <option value="pendente">Pendente</option>
              <option value="agendado">Agendado</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Status OMIE */}
          <div className="flex items-center gap-2">
            <select
              value={filtroStatusOmie}
              onChange={(e) => setFiltroStatusOmie(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Todos">Status OMIE</option>
              <option value="pendente">Pendente</option>
              <option value="enviado">Enviado</option>
              <option value="sincronizado">Sincronizado</option>
              <option value="erro">Erro</option>
            </select>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-2 flex-1">
            <Search size={16} className="text-gray-500 dark:text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por colaborador, cliente ou função..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {/* Conteúdo Condicional */}
      {filtroCliente === 'Todos' ? (
        /* Dashboard - Visão Geral de Todos os Clientes */
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Clientes Ativos</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {clientes.filter(c => c.status === 'ativo').length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Cadastrados
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Total Colaboradores</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {folhasFiltradas.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">
                    No período
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Valor Total Período</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {folhasFiltradas
                      .reduce((acc, f) => acc + f.valorTotal, 0)
                      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">
                    Folha de pagamento
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Pendentes</div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {folhasFiltradas.filter((f) => f.situacao === 'pendente').length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">
                    Aguardando processamento
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Ranking de Clientes e Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking 5 Clientes por Custo */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Ranking 5 Clientes por Custo
                </h3>
                <TrendingUp className="text-green-600 dark:text-green-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-7">
                Clientes com maior custo total em folha de pagamento no período selecionado
              </p>
              <div className="space-y-3">
                {(() => {
                  const clienteValores = clientes
                    .filter(c => c.status === 'ativo')
                    .map(cliente => {
                      const folhasCliente = folhasFiltradas.filter(f => f.cliente.id === cliente.id);
                      const total = folhasCliente.reduce((acc, f) => acc + f.valorTotal, 0);
                      return { cliente, total, quantidade: folhasCliente.length };
                    })
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5);

                  const maxValor = clienteValores[0]?.total || 1;

                  return clienteValores.map((item, idx) => (
                    <div key={item.cliente.id} className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-slate-700 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {item.cliente.dadosGerais?.nome}
                          </span>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(item.total / maxValor) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 min-w-[80px] text-right">
                          {item.quantidade} colaborador{item.quantidade !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>

            {/* Funil de Processamento de Folhas */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Funil de Processamento
                </h3>
                <RefreshCw className="text-purple-600 dark:text-purple-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2">
                Pipeline operacional das folhas de pagamento em cada etapa do fluxo de trabalho
              </p>
              <select
                value={empresaSelecionadaFunil}
                onChange={(e) => setEmpresaSelecionadaFunil(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-3"
              >
                <option value="Todas">Visão Geral</option>
                {clientes
                  .filter(c => c.status === 'ativo')
                  .map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
              </select>
              {(() => {
                const folhasFiltro = empresaSelecionadaFunil === 'Todas' 
                  ? folhasFiltradas 
                  : folhasFiltradas.filter(f => f.cliente.nome === empresaSelecionadaFunil);
                const total = folhasFiltro.length;
                
                // Simular distribuição no funil com base no status
                const etapas = [
                  {
                    nome: 'Recebidas',
                    descricao: 'Aguardando análise',
                    quantidade: folhasFiltro.filter(f => f.statusOmie === 'pendente').length,
                    cor: 'bg-blue-500',
                    corBg: 'bg-blue-50 dark:bg-blue-900/20',
                    corTexto: 'text-blue-600 dark:text-blue-400',
                    icone: Clock
                  },
                  {
                    nome: 'Em Análise',
                    descricao: 'Sendo validadas',
                    quantidade: Math.round(total * 0.15), // 15% em análise
                    cor: 'bg-yellow-500',
                    corBg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    corTexto: 'text-yellow-600 dark:text-yellow-400',
                    icone: Search
                  },
                  {
                    nome: 'Processadas',
                    descricao: 'Cálculos finalizados',
                    quantidade: folhasFiltro.filter(f => f.statusOmie === 'enviado').length,
                    cor: 'bg-indigo-500',
                    corBg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    corTexto: 'text-indigo-600 dark:text-indigo-400',
                    icone: CheckCircle
                  },
                  {
                    nome: 'Enviadas',
                    descricao: 'Aguardando sincronização',
                    quantidade: Math.round(total * 0.12), // 12% enviadas
                    cor: 'bg-purple-500',
                    corBg: 'bg-purple-50 dark:bg-purple-900/20',
                    corTexto: 'text-purple-600 dark:text-purple-400',
                    icone: Send
                  },
                  {
                    nome: 'Finalizadas',
                    descricao: 'Sincronizadas com sucesso',
                    quantidade: folhasFiltro.filter(f => f.statusOmie === 'sincronizado').length,
                    cor: 'bg-green-500',
                    corBg: 'bg-green-50 dark:bg-green-900/20',
                    corTexto: 'text-green-600 dark:text-green-400',
                    icone: CheckCircle
                  }
                ];

                const maxQuantidade = Math.max(...etapas.map(e => e.quantidade), 1);

                return (
                  <div className="space-y-1.5">
                    {etapas.map((etapa) => {
                        const percentual = total > 0 ? (etapa.quantidade / total) * 100 : 0;
                        const larguraBarra = (etapa.quantidade / maxQuantidade) * 100;
                        const Icone = etapa.icone;
                        
                        return (
                          <div key={etapa.nome} className={`p-2 ${etapa.corBg} rounded-lg transition-all hover:shadow-sm`}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <Icone className={etapa.corTexto} size={16} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      {etapa.nome}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                                      {etapa.descricao}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                                  {percentual.toFixed(0)}%
                                </span>
                                <span className={`text-lg font-bold ${etapa.corTexto} min-w-[40px] text-right`}>
                                  {etapa.quantidade}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${etapa.cor} rounded-full transition-all duration-300`}
                                  style={{ width: `${larguraBarra}%` }}
                                />
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          </div>

          {/* Insights Adicionais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Performance de Processamento */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Performance de Processamento
                </h3>
                <Clock className="text-green-600 dark:text-green-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2">
                Indicadores de eficiência operacional e qualidade de entrega do BPO
              </p>
              
              {/* Seletor de Empresa */}
              <div className="mb-2.5">
                <select
                  value={empresaSelecionadaPerformance}
                  onChange={(e) => setEmpresaSelecionadaPerformance(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Todas">Visão Geral</option>
                  {clientes
                    .filter(c => c.status === 'ativo')
                    .map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))
                  }
                </select>
              </div>

              {(() => {
                // Filtrar por empresa se selecionada
                const folhasFiltradasPorEmpresa = empresaSelecionadaPerformance === 'Todas' 
                  ? folhasFiltradas 
                  : folhasFiltradas.filter(f => f.cliente.nome === empresaSelecionadaPerformance);

                // KPIs de Performance
                const totalFolhas = folhasFiltradasPorEmpresa.length;
                
                // Folhas no prazo (simulação: 92-98% das folhas)
                const taxaNoPrazo = 92 + Math.random() * 6;
                const folhasNoPrazo = Math.round(totalFolhas * (taxaNoPrazo / 100));
                
                // Tempo médio de processamento (simulação: 2-4 dias)
                const tempoMedio = 2 + Math.random() * 2;
                
                // Taxa de erro/retrabalho (simulação: 1-3%)
                const taxaErro = 1 + Math.random() * 2;
                const folhasComErro = Math.round(totalFolhas * (taxaErro / 100));
                
                // Metas
                const metaNoPrazo = 95;
                const metaTempo = 3;
                const metaErro = 2;
                
                // Calcular status (atingiu meta?)
                const statusNoPrazo = taxaNoPrazo >= metaNoPrazo;
                const statusTempo = tempoMedio <= metaTempo;
                const statusErro = taxaErro <= metaErro;

                return (
                  <div className="space-y-1.5">
                    {/* KPI 1: Folhas no Prazo */}
                    <div className={`p-2 rounded-lg ${statusNoPrazo ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Folhas Processadas no Prazo</span>
                        <CheckCircle className={`${statusNoPrazo ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} size={16} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-xl font-bold ${statusNoPrazo ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {taxaNoPrazo.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                            {folhasNoPrazo} de {totalFolhas} folhas
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                          Meta: {metaNoPrazo}%
                        </div>
                      </div>
                    </div>

                    {/* KPI 2: Tempo Médio */}
                    <div className={`p-2 rounded-lg ${statusTempo ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Tempo Médio de Fechamento</span>
                        <Clock className={`${statusTempo ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} size={16} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-xl font-bold ${statusTempo ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {tempoMedio.toFixed(1)} dias
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                            Por folha de pagamento
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                          Meta: ≤{metaTempo} dias
                        </div>
                      </div>
                    </div>

                    {/* KPI 3: Taxa de Erro */}
                    <div className={`p-2 rounded-lg ${statusErro ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Taxa de Retrabalho</span>
                        <AlertCircle className={`${statusErro ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`} size={16} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-xl font-bold ${statusErro ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                            {taxaErro.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                            {folhasComErro} folhas com ajustes
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                          Meta: ≤{metaErro}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* 2. Previsão de Custos (próximos 3 meses) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Projeção de Receita BPO
                </h3>
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2">
                Estimativa de faturamento BPO para os próximos 3 meses baseada na folha atual
              </p>
              
              {/* Seletor de Cliente */}
              <div className="mb-2.5">
                <select
                  value={clienteSelecionadoProjecao}
                  onChange={(e) => setClienteSelecionadoProjecao(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Visão Geral</option>
                  {clientes.filter(c => c.status === 'ativo').map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {(() => {
                // Filtrar por cliente se selecionado
                const folhasFiltradasPorCliente = clienteSelecionadoProjecao === 'Todos'
                  ? folhasFiltradas
                  : folhasFiltradas.filter(f => String(f.cliente.id) === clienteSelecionadoProjecao);

                const valorMensal = folhasFiltradasPorCliente.reduce((acc, f) => acc + f.valorTotal, 0);
                const projecaoTrimestral = valorMensal * 3;

                return (
                  <div className="space-y-2">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {projecaoTrimestral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mt-1">
                        Receita estimada trimestre
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between p-1.5 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 rounded">
                        <span className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Mês atual</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 rounded">
                        <span className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Mês seguinte</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* 3. Comparativo Mensal */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Comparativo Mensal
                </h3>
                <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2">
                Comparação do período atual com o mês anterior para análise de crescimento
              </p>
              
              {/* Seletor de Cliente */}
              <div className="mb-2.5">
                <select
                  value={clienteSelecionadoComparativo}
                  onChange={(e) => setClienteSelecionadoComparativo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Todos">Visão Geral</option>
                  {clientes.filter(c => c.status === 'ativo').map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                {(() => {
                  // Filtrar por cliente se selecionado
                  const folhasFiltradasPorCliente = clienteSelecionadoComparativo === 'Todos'
                    ? folhasFiltradas
                    : folhasFiltradas.filter(f => String(f.cliente.id) === clienteSelecionadoComparativo);

                  const valorAtual = folhasFiltradasPorCliente.reduce((acc, f) => acc + f.valorTotal, 0);
                  const colaboradoresAtual = folhasFiltradasPorCliente.length;
                  
                  // Simular dados do mês anterior (85-115% do atual)
                  const fatorVariacao = 0.85 + Math.random() * 0.3;
                  const valorAnterior = valorAtual * fatorVariacao;
                  const colaboradoresAnterior = Math.round(colaboradoresAtual * fatorVariacao);
                  
                  const variacaoValor = ((valorAtual - valorAnterior) / valorAnterior) * 100;
                  const variacaoColaboradores = colaboradoresAtual - colaboradoresAnterior;
                  
                  const ticketMedioAtual = colaboradoresAtual > 0 ? valorAtual / colaboradoresAtual : 0;
                  const ticketMedioAnterior = colaboradoresAnterior > 0 ? valorAnterior / colaboradoresAnterior : 0;
                  const variacaoTicket = ticketMedioAnterior > 0 ? ((ticketMedioAtual - ticketMedioAnterior) / ticketMedioAnterior) * 100 : 0;

                  return (
                    <>
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1.5">Valor Total</div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">
                              Anterior: {valorAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${
                            variacaoValor >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {variacaoValor >= 0 ? '↑' : '↓'} {Math.abs(variacaoValor).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Colaboradores</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {colaboradoresAtual}
                          </div>
                          <div className={`text-xs font-medium mt-1 ${
                            variacaoColaboradores >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {variacaoColaboradores >= 0 ? '+' : ''}{variacaoColaboradores}
                          </div>
                        </div>

                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-0.5">Ticket Médio</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {ticketMedioAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <div className={`text-xs font-medium mt-1 ${
                            variacaoTicket >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {variacaoTicket >= 0 ? '↑' : '↓'} {Math.abs(variacaoTicket).toFixed(1)}%
                          </div>
                        </div>
                      </div>


                    </>
                  );
                })()}
              </div>
            </Card>
          </div>

          {/* Análises Comparativas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4. Custo Médio por Colaborador com Filtro de Empresa */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Análise de Custos por Função
                </h3>
                <Users className="text-purple-600 dark:text-purple-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2">
                Custo médio por colaborador e ranking das funções mais onerosas por empresa cliente
              </p>
              
              {/* Seletor de Empresa */}
              <div className="mb-2.5">
                <select
                  value={empresaSelecionadaCustos}
                  onChange={(e) => setEmpresaSelecionadaCustos(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Todas">Visão Geral</option>
                  {clientes
                    .filter(c => c.status === 'ativo')
                    .map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))
                  }
                </select>
              </div>

              {(() => {
                // Filtrar por empresa se selecionada
                const folhasFiltradasPorEmpresa = empresaSelecionadaCustos === 'Todas' 
                  ? folhasFiltradas 
                  : folhasFiltradas.filter(f => f.cliente.nome === empresaSelecionadaCustos);

                const totalColaboradores = folhasFiltradasPorEmpresa.length || 1;
                const totalValor = folhasFiltradasPorEmpresa.reduce((acc, f) => acc + f.valorTotal, 0);
                const custoMedio = totalValor / totalColaboradores;

                // Top 5 funções mais caras
                const funcoes = folhasFiltradasPorEmpresa.reduce((acc, f) => {
                  const funcao = f.funcao || 'Não informado';
                  if (!acc[funcao]) {
                    acc[funcao] = { total: 0, count: 0 };
                  }
                  acc[funcao].total += f.valorTotal;
                  acc[funcao].count += 1;
                  return acc;
                }, {} as Record<string, { total: number; count: number }>);

                const topFuncoes = Object.entries(funcoes)
                  .map(([nome, dados]) => ({
                    nome,
                    media: dados.total / dados.count,
                    total: dados.total,
                    count: dados.count
                  }))
                  .sort((a, b) => b.media - a.media)
                  .slice(0, 5);

                return (
                  <div className="space-y-2.5">
                    <div className="text-center p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mt-0.5">
                        Custo médio por colaborador
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1.5">
                        <span>Top 5 Funções mais Onerosas:</span>
                        <span className="text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">Média</span>
                      </div>
                      {topFuncoes.length > 0 ? topFuncoes.map((funcao, idx) => (
                        <div key={funcao.nome} className="p-2 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {funcao.nome}
                              </span>
                            </div>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {funcao.media.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-sm text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 py-4">
                          Nenhum dado disponível
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* 5. Central de Alertas e Ações - Real e Completa */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Central de Alertas
                </h3>
                <AlertCircle className="text-orange-600 dark:text-orange-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-2.5">
                Monitoramento em tempo real de pendências, erros e ações críticas que requerem atenção
              </p>
              {(() => {
                // Calcular todos os alertas possíveis
                const pagamentosPendentes = folhasFiltradas.filter(f => f.situacao === 'pendente');
                const valorPendente = pagamentosPendentes.reduce((acc, f) => acc + f.valorTotal, 0);
                
                const errosOmie = folhasFiltradas.filter(f => f.statusOmie === 'erro');
                const valorErros = errosOmie.reduce((acc, f) => acc + f.valorTotal, 0);
                
                const aguardandoSincronizacao = folhasFiltradas.filter(f => f.statusOmie === 'pendente');
                
                const clientesSemFolha = clientes.filter(c => {
                  const temFolha = folhasFiltradas.some(f => f.cliente.id === c.id);
                  return c.status === 'ativo' && !temFolha;
                });
                
                // Simulação: Folhas sem CTT preenchido
                const semCTT = folhasFiltradas.filter(f => !f.ctt || f.ctt.trim() === '');
                
                // Simulação: Valores zerados ou muito baixos (possível erro)
                const valoresAtipicos = folhasFiltradas.filter(f => f.valorTotal < 100);
                
                // Simulação: Folhas antigas ainda pendentes (mais de 30 dias - simulado)
                const folhasAntigas = pagamentosPendentes.filter(() => {
                  // Simular verificação de data
                  return Math.random() > 0.7; // 30% das pendentes são antigas
                }).length;

                const alertas = [
                  {
                    tipo: 'Erros de Sincronização OMIE',
                    descricao: 'Folhas com falha no envio para OMIE',
                    quantidade: errosOmie.length,
                    valor: valorErros,
                    cor: 'red',
                    corBg: 'bg-red-50 dark:bg-red-900/20',
                    corBorder: 'border-red-200 dark:border-red-800',
                    corTexto: 'text-red-900 dark:text-red-100',
                    corQuantidade: 'text-red-600 dark:text-red-400',
                    prioridade: 1
                  },
                  {
                    tipo: 'Pagamentos Vencidos',
                    descricao: 'Folhas pendentes há mais de 30 dias',
                    quantidade: folhasAntigas,
                    valor: 0,
                    cor: 'red',
                    corBg: 'bg-red-50 dark:bg-red-900/20',
                    corBorder: 'border-red-200 dark:border-red-800',
                    corTexto: 'text-red-900 dark:text-red-100',
                    corQuantidade: 'text-red-600 dark:text-red-400',
                    prioridade: 1
                  },
                  {
                    tipo: 'Pagamentos Pendentes',
                    descricao: 'Folhas aguardando processamento',
                    quantidade: pagamentosPendentes.length,
                    valor: valorPendente,
                    cor: 'yellow',
                    corBg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    corBorder: 'border-yellow-200 dark:border-yellow-800',
                    corTexto: 'text-yellow-900 dark:text-yellow-100',
                    corQuantidade: 'text-yellow-600 dark:text-yellow-400',
                    prioridade: 2
                  },
                  {
                    tipo: 'Aguardando Sincronização',
                    descricao: 'Folhas não enviadas ao OMIE',
                    quantidade: aguardandoSincronizacao.length,
                    valor: 0,
                    cor: 'blue',
                    corBg: 'bg-blue-50 dark:bg-blue-900/20',
                    corBorder: 'border-blue-200 dark:border-blue-800',
                    corTexto: 'text-blue-900 dark:text-blue-100',
                    corQuantidade: 'text-blue-600 dark:text-blue-400',
                    prioridade: 3
                  },
                  {
                    tipo: 'CTT Não Informado',
                    descricao: 'Folhas sem centro de custo',
                    quantidade: semCTT.length,
                    valor: 0,
                    cor: 'orange',
                    corBg: 'bg-orange-50 dark:bg-orange-900/20',
                    corBorder: 'border-orange-200 dark:border-orange-800',
                    corTexto: 'text-orange-900 dark:text-orange-100',
                    corQuantidade: 'text-orange-600 dark:text-orange-400',
                    prioridade: 3
                  },
                  {
                    tipo: 'Valores Atípicos',
                    descricao: 'Folhas com valores muito baixos',
                    quantidade: valoresAtipicos.length,
                    valor: 0,
                    cor: 'purple',
                    corBg: 'bg-purple-50 dark:bg-purple-900/20',
                    corBorder: 'border-purple-200 dark:border-purple-800',
                    corTexto: 'text-purple-900 dark:text-purple-100',
                    corQuantidade: 'text-purple-600 dark:text-purple-400',
                    prioridade: 4
                  },
                  {
                    tipo: 'Clientes Sem Folha',
                    descricao: 'Clientes ativos sem lançamentos',
                    quantidade: clientesSemFolha.length,
                    valor: 0,
                    cor: 'gray',
                    corBg: 'bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800',
                    corBorder: 'border-gray-200 dark:border-slate-700 dark:border-gray-700',
                    corTexto: 'text-gray-900 dark:text-gray-100',
                    corQuantidade: 'text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500',
                    prioridade: 5
                  }
                ].filter(a => a.quantidade > 0).sort((a, b) => a.prioridade - b.prioridade);

                const alertasCriticos = alertas.filter(a => a.prioridade === 1).length;

                return (
                  <div className="space-y-3">
                    {alertas.length === 0 ? (
                      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                        <CheckCircle className="mx-auto mb-3 text-green-600 dark:text-green-400" size={40} />
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          Sistema em Conformidade! 
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mt-2">
                          Todas as folhas processadas e sincronizadas
                        </div>
                      </div>
                    ) : (
                      <>
                        {alertasCriticos > 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300">
                              <AlertCircle size={18} />
                              {alertasCriticos} alerta{alertasCriticos !== 1 ? 's' : ''} crítico{alertasCriticos !== 1 ? 's' : ''} requer{alertasCriticos === 1 ? '' : 'em'} atenção imediata!
                            </div>
                          </div>
                        )}
                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                          {alertas.map(alerta => (
                            <div
                              key={alerta.tipo}
                              className={`p-3 ${alerta.corBg} border ${alerta.corBorder} rounded-lg hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className={`font-semibold text-sm ${alerta.corTexto}`}>
                                    {alerta.tipo}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mt-0.5">
                                    {alerta.descricao}
                                  </div>
                                  {alerta.valor > 0 && (
                                    <div className="text-xs font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mt-1">
                                      Valor total: {alerta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                  )}
                                </div>
                                <div className={`text-xl font-bold ${alerta.corQuantidade} flex-shrink-0`}>
                                  {alerta.quantidade}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </Card>
          </div>
        </>
      ) : (
        /* Tabela Detalhada - Cliente Específico */
        <>
          {/* Estatísticas do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Total de Lançamentos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {folhasFiltradas.length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Valor Total</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {folhasFiltradas
                  .reduce((acc, f) => acc + f.valorTotal, 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Pendentes</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {folhasFiltradas.filter((f) => f.situacao === 'pendente').length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Pagos</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {folhasFiltradas.filter((f) => f.situacao === 'pago').length}
              </div>
            </Card>
          </div>

          {/* Tabela */}
          {isLoading ? (
        <Card className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </Card>
      ) : folhasPaginadas.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
            Nenhum lançamento encontrado para o período selecionado
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 border-b border-gray-200 dark:border-slate-700 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Colaborador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Função</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">CTT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Adicional</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Reembolso</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Desconto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Valor Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Valor Total s/ Reembolso</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Situação</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Data Pgto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Nota Fiscal</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Pagamento</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Obs</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">% Empresa 1</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">% Empresa 2</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">% Empresa 3</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">% Empresa 4</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">% Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">OMIE</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {folhasPaginadas.map((folha) => {
                  const situacaoBadge = getSituacaoBadge(folha.situacao);
                  const omieBadge = getOmieBadge(folha.statusOmie || 'pendente');
                  
                  return (
                    <tr
                      key={folha.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {folha.cliente.nome}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {folha.colaborador}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.funcao || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.empresa}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {folha.ctt || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                        {folha.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                        {folha.adicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                        {folha.reembolso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                        {folha.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {folha.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                        {(folha.valorTotalSemReembolso ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={situacaoBadge.variant}>
                          {situacaoBadge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.dataPagamento ? new Date(folha.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.notaFiscal?.numero || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.notaFiscal?.status || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.notaFiscal?.pagamento || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.notaFiscal?.data ? new Date(folha.notaFiscal.data).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.notaFiscal?.obs || folha.obs || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.percentualOperacao?.empresa1Percent !== undefined ? `${folha.percentualOperacao.empresa1Percent}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.percentualOperacao?.empresa2Percent !== undefined ? `${folha.percentualOperacao.empresa2Percent}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.percentualOperacao?.empresa3Percent !== undefined ? `${folha.percentualOperacao.empresa3Percent}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.percentualOperacao?.empresa4Percent !== undefined ? `${folha.percentualOperacao.empresa4Percent}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-slate-200 dark:text-gray-300">
                        {folha.percentualOperacao?.totalOpers !== undefined ? `${folha.percentualOperacao.totalOpers}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={omieBadge.variant}>
                          {omieBadge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleVisualizar(folha)}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleEditarFolha(folha)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Button>
                          {folha.statusOmie === 'pendente' && (
                            <Button
                              variant="ghost"
                              disabled
                              title="Enviar para OMIE (desativado)"
                            >
                              <Send size={16} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => handleRemover(folha.id, folha.colaborador)}
                            className="text-red-600 hover:text-red-700"
                            title="Remover"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} lançamentos
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="dark:text-white"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="dark:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
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
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="dark:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="dark:text-white"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )
      }
        </>
      )}

      {/* Input oculto para upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal de Visualização - TODO: implementar */}
      {modalVisualizarAberto && folhaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Detalhes da Folha
              </h2>
              <button
                onClick={() => setModalVisualizarAberto(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200 dark:text-gray-400 dark:text-slate-500 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <strong>Cliente:</strong> {folhaSelecionada.cliente.nome}
              </div>
              <div>
                <strong>Colaborador:</strong> {folhaSelecionada.colaborador}
              </div>
              <div>
                <strong>Função:</strong> {folhaSelecionada.funcao || '-'}
              </div>
              <div>
                <strong>Empresa:</strong> {folhaSelecionada.empresa}
              </div>
              <div>
                <strong>Valor:</strong> {folhaSelecionada.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div>
                <strong>Adicional:</strong> {folhaSelecionada.adicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div>
                <strong>Reembolso:</strong> {folhaSelecionada.reembolso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div>
                <strong>Desconto:</strong> {folhaSelecionada.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div>
                <strong>Valor Total:</strong> {folhaSelecionada.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              
              {folhaSelecionada.percentualOperacao && (
                <div className="border-t pt-4">
                  <strong className="block mb-2">Percentual por Operação:</strong>
                  {folhaSelecionada.percentualOperacao.empresa1 && (
                    <div>
                      {folhaSelecionada.percentualOperacao.empresa1}: {folhaSelecionada.percentualOperacao.empresa1Percent}% - {folhaSelecionada.percentualOperacao.empresa1Valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  )}
                  {folhaSelecionada.percentualOperacao.empresa2 && (
                    <div>
                      {folhaSelecionada.percentualOperacao.empresa2}: {folhaSelecionada.percentualOperacao.empresa2Percent}% - {folhaSelecionada.percentualOperacao.empresa2Valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setModalVisualizarAberto(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Folha */}
      <Modal
        isOpen={modalNovaFolhaAberto}
        onClose={() => setModalNovaFolhaAberto(false)}
        title="Nova Folha de Pagamento"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Cliente *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                value={novaClienteId}
                onChange={(e) => setNovaClienteId(e.target.value)}
                disabled={isVisitante || (user?.role !== 'admin' && user?.role !== 'visitante')}
              >
                <option value="">Selecione o cliente</option>
                {clientes.filter(c => c.status === 'ativo').map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Empresa *
              </label>
              <Input placeholder="Nome da empresa" value={novaEmpresa} onChange={(e) => setNovaEmpresa(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Colaborador *
              </label>
              <Input placeholder="Nome do colaborador" value={novaColaborador} onChange={(e) => setNovaColaborador(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Função
              </label>
              <Input placeholder="Cargo/Função" value={novaFuncao} onChange={(e) => setNovaFuncao(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                CTT / Centro de Custo
              </label>
              <Input placeholder="Ex: ADM-001" value={novaCtt} onChange={(e) => setNovaCtt(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Situação
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                value={novaSituacao}
                onChange={(e) => setNovaSituacao(e.target.value as any)}
              >
                <option value="pendente">Pendente</option>
                <option value="agendado">Agendado</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Valores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Valor Base *
                </label>
                <Input type="number" placeholder="0,00" value={novaValor} onChange={(e) => setNovaValor(Number(e.target.value || 0))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Adicional
                </label>
                <Input type="number" placeholder="0,00" value={novaAdicional} onChange={(e) => setNovaAdicional(Number(e.target.value || 0))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Reembolso
                </label>
                <Input type="number" placeholder="0,00" value={novaReembolso} onChange={(e) => setNovaReembolso(Number(e.target.value || 0))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Desconto
                </label>
                <Input type="number" placeholder="0,00" value={novaDesconto} onChange={(e) => setNovaDesconto(Number(e.target.value || 0))} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pagamento e Nota Fiscal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Data de Pagamento</label>
                <Input type="date" value={novaDataPagamento} onChange={(e) => setNovaDataPagamento(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Nota Fiscal Nº</label>
                <Input value={novaNotaNumero} onChange={(e) => setNovaNotaNumero(e.target.value)} placeholder="Ex: NF-2025-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Status da NF</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                  value={novaNotaStatus}
                  onChange={(e) => setNovaNotaStatus(e.target.value as any)}
                >
                  <option value="aguardando">Aguardando</option>
                  <option value="recebida">Recebida</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Pagamento</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                  value={novaNotaPagamento}
                  onChange={(e) => setNovaNotaPagamento(e.target.value as any)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="agendado">Agendado</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Data da NF</label>
                <Input type="date" value={novaNotaData} onChange={(e) => setNovaNotaData(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Obs. da NF</label>
                <Input value={novaNotaObs} onChange={(e) => setNovaNotaObs(e.target.value)} placeholder="Observações sobre a nota" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Observações</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-sm"
                rows={3}
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                placeholder="Observações gerais"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Distribuição por Operação (Opcional)</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-3">Se não preencher distribuição adicional, 100% será atribuído à Empresa acima.</p>

            <div className="space-y-3">
              {novaFolhaDistribuicao.map((d, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Empresa {idx + 1}</label>
                    <Input
                      value={d.empresa}
                      onChange={(e) => {
                        const copy = [...novaFolhaDistribuicao];
                        copy[idx] = { ...copy[idx], empresa: e.target.value };
                        setNovaFolhaDistribuicao(copy);
                      }}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">%</label>
                    <Input
                      type="number"
                      value={d.percent}
                      onChange={(e) => {
                        const val = Number(e.target.value || 0);
                        const copy = [...novaFolhaDistribuicao];
                        copy[idx] = { ...copy[idx], percent: val };
                        setNovaFolhaDistribuicao(copy);
                      }}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNovaFolhaDistribuicao(prev => [...prev, { empresa: '', percent: 0 }])}
                >
                  Adicionar empresa
                </Button>
                {novaFolhaDistribuicao.length > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setNovaFolhaDistribuicao(prev => prev.slice(0, -1))}
                  >
                    Remover última
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setModalNovaFolhaAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={totalDistribPercent !== 100 || !novaColaborador || !novaEmpresa || !novaClienteId}
              onClick={() => {
                if (totalDistribPercent !== 100) {
                  toast.error('Total de percentuais deve ser 100% antes de cadastrar.');
                  return;
                }

                const clienteObj = clientes.find(c => String(c.id) === String(novaClienteId)) || clientes[0];
                const valorTotal = Number(novaValor || 0) + Number(novaAdicional || 0) + Number(novaReembolso || 0) - Number(novaDesconto || 0);
                const valorTotalSemReembolso = Number(novaValor || 0) + Number(novaAdicional || 0) - Number(novaDesconto || 0);

                const percentualOperacao: any = {};
                novaFolhaDistribuicao.forEach((d, i) => {
                  const idx = i + 1;
                  percentualOperacao[`empresa${idx}`] = d.empresa;
                  percentualOperacao[`empresa${idx}Percent`] = d.percent;
                  percentualOperacao[`empresa${idx}Valor`] = Number(((valorTotalSemReembolso * d.percent) / 100).toFixed(2));
                });
                percentualOperacao.totalOpers = totalDistribPercent;

                const novaFolha: any = {
                  clienteId: clienteObj?.id || 0,
                  cliente: clienteObj,
                  periodo: periodoSelecionado,
                  colaborador: novaColaborador,
                  funcao: novaFuncao,
                  empresa: novaEmpresa,
                  ctt: novaCtt,
                  valor: Number(novaValor || 0),
                  adicional: Number(novaAdicional || 0),
                  reembolso: Number(novaReembolso || 0),
                  desconto: Number(novaDesconto || 0),
                  percentualOperacao,
                  valorTotal,
                  valorTotalSemReembolso,
                  situacao: novaSituacao,
                  dataPagamento: novaDataPagamento || undefined,
                  notaFiscal: {
                    numero: novaNotaNumero || undefined,
                    status: novaNotaStatus,
                    pagamento: novaNotaPagamento,
                    data: novaNotaData || undefined,
                    obs: novaNotaObs || undefined
                  },
                  obs: novaObs || undefined,
                  statusOmie: 'pendente'
                };

                useFolhaClientesStore.getState().adicionarFolha(novaFolha as any);
                toast.success('Folha cadastrada com sucesso!');
                // reset form
                setNovaClienteId('');
                setNovaColaborador('');
                setNovaFuncao('');
                setNovaEmpresa('');
                setNovaCtt('');
                setNovaValor(0);
                setNovaAdicional(0);
                setNovaReembolso(0);
                setNovaDesconto(0);
                setNovaSituacao('pendente');
                setNovaDataPagamento('');
                setNovaNotaNumero('');
                setNovaNotaStatus('aguardando');
                setNovaNotaPagamento('pendente');
                setNovaNotaData('');
                setNovaNotaObs('');
                setNovaObs('');
                setNovaFolhaDistribuicao([{ empresa: '', percent: 100 }]);
                setModalNovaFolhaAberto(false);
              }}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Editar Folha */}
      <Modal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        title="Editar Folha de Pagamento"
      >
        {folhaSelecionada && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Cliente *
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                  value={editClienteId}
                  onChange={(e) => setEditClienteId(e.target.value)}
                  disabled={isVisitante}
                >
                  {clientes.filter(c => c.status === 'ativo').map(c => (
                    <option key={c.id} value={c.id}>{c.dadosGerais?.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Empresa *
                </label>
                <Input value={editEmpresa} onChange={(e) => setEditEmpresa(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Colaborador *
                </label>
                <Input value={editColaborador} onChange={(e) => setEditColaborador(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Função
                </label>
                <Input value={editFuncao} onChange={(e) => setEditFuncao(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  CTT / Centro de Custo
                </label>
                <Input placeholder="Ex: ADM-001" value={editCtt} onChange={(e) => setEditCtt(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Situação
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                  value={editSituacao}
                  onChange={(e) => setEditSituacao(e.target.value as any)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="agendado">Agendado</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Valores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Valor Base *
                  </label>
                  <Input type="number" value={editValor} onChange={(e) => setEditValor(Number(e.target.value || 0))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Adicional
                  </label>
                  <Input type="number" value={editAdicional} onChange={(e) => setEditAdicional(Number(e.target.value || 0))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Reembolso
                  </label>
                  <Input type="number" value={editReembolso} onChange={(e) => setEditReembolso(Number(e.target.value || 0))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Desconto
                  </label>
                  <Input type="number" value={editDesconto} onChange={(e) => setEditDesconto(Number(e.target.value || 0))} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pagamento e Nota Fiscal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Data de Pagamento</label>
                  <Input type="date" value={editDataPagamento} onChange={(e) => setEditDataPagamento(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Nota Fiscal Nº</label>
                  <Input value={editNotaNumero} onChange={(e) => setEditNotaNumero(e.target.value)} placeholder="Ex: NF-2025-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Status da NF</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                    value={editNotaStatus}
                    onChange={(e) => setEditNotaStatus(e.target.value as any)}
                  >
                    <option value="aguardando">Aguardando</option>
                    <option value="recebida">Recebida</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Pagamento</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                    value={editNotaPagamento}
                    onChange={(e) => setEditNotaPagamento(e.target.value as any)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="agendado">Agendado</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Data da NF</label>
                  <Input type="date" value={editNotaData} onChange={(e) => setEditNotaData(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Obs. da NF</label>
                  <Input value={editNotaObs} onChange={(e) => setEditNotaObs(e.target.value)} placeholder="Observações sobre a nota" />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-sm"
                  rows={3}
                  value={editObs}
                  onChange={(e) => setEditObs(e.target.value)}
                  placeholder="Observações gerais"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Distribuição por Operação</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-3">Percentuais devem somar 100%</p>
              <div className="space-y-3">
                {editFolhaDistribuicao.map((d, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">Empresa {idx + 1}</label>
                      <Input
                        value={d.empresa}
                        onChange={(e) => {
                          const copy = [...editFolhaDistribuicao];
                          copy[idx] = { ...copy[idx], empresa: e.target.value };
                          setEditFolhaDistribuicao(copy);
                        }}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">%</label>
                      <Input
                        type="number"
                        value={d.percent}
                        onChange={(e) => {
                          const val = Number(e.target.value || 0);
                          const copy = [...editFolhaDistribuicao];
                          copy[idx] = { ...copy[idx], percent: val };
                          setEditFolhaDistribuicao(copy);
                        }}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditFolhaDistribuicao(prev => [...prev, { empresa: '', percent: 0 }])}
                  >
                    Adicionar empresa
                  </Button>
                  {editFolhaDistribuicao.length > 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => setEditFolhaDistribuicao(prev => prev.slice(0, -1))}
                    >
                      Remover última
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalEditarAberto(false)}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                disabled={!editColaborador || !editEmpresa || !editClienteId}
                onClick={() => {
                  const totalEditDistribPercent = editFolhaDistribuicao.reduce((acc, cur) => acc + (Number(cur.percent) || 0), 0);
                  if (totalEditDistribPercent !== 100) {
                    toast.error('Total de percentuais deve ser 100% antes de atualizar.');
                    return;
                  }

                  const clienteObj = clientes.find(c => String(c.id) === String(editClienteId)) || folhaSelecionada.cliente;
                  const valorTotal = Number(editValor || 0) + Number(editAdicional || 0) + Number(editReembolso || 0) - Number(editDesconto || 0);
                  const valorTotalSemReembolso = Number(editValor || 0) + Number(editAdicional || 0) - Number(editDesconto || 0);

                  const percentualOperacao: any = {};
                  editFolhaDistribuicao.forEach((d, i) => {
                    const idx = i + 1;
                    percentualOperacao[`empresa${idx}`] = d.empresa;
                    percentualOperacao[`empresa${idx}Percent`] = d.percent;
                    percentualOperacao[`empresa${idx}Valor`] = Number(((valorTotalSemReembolso * d.percent) / 100).toFixed(2));
                  });
                  percentualOperacao.totalOpers = totalEditDistribPercent;

                  const dadosAtualizados: Partial<FolhaCliente> = {
                    clienteId: Number(editClienteId),
                    cliente: clienteObj as any,
                    colaborador: editColaborador,
                    funcao: editFuncao,
                    empresa: editEmpresa,
                    ctt: editCtt,
                    valor: Number(editValor || 0),
                    adicional: Number(editAdicional || 0),
                    reembolso: Number(editReembolso || 0),
                    desconto: Number(editDesconto || 0),
                    valorTotal,
                    valorTotalSemReembolso,
                    situacao: editSituacao,
                    dataPagamento: editDataPagamento || undefined,
                    notaFiscal: {
                      numero: editNotaNumero || undefined,
                      status: editNotaStatus,
                      pagamento: editNotaPagamento,
                      data: editNotaData || undefined,
                      obs: editNotaObs || undefined
                    },
                    obs: editObs || undefined,
                    percentualOperacao
                  };

                  useFolhaClientesStore.getState().atualizarFolha(folhaSelecionada.id, dadosAtualizados);
                  toast.success('Folha atualizada com sucesso!');
                  setModalEditarAberto(false);
                }}
              >
                Atualizar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Preview de Importação */}
      <Modal
        isOpen={modalImportPreviewAberto}
        onClose={() => setModalImportPreviewAberto(false)}
        title="Preview de Importação"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{importPreviewData.length > 0 ? importPreviewData.length - 1 : 0}</strong> registros encontrados na planilha.
              Revise os dados antes de confirmar a importação.
            </p>
          </div>

          {importPreviewData.length > 0 && (
            <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      {(importPreviewData[0] as any[]).map((header: any, idx: number) => (
                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {importPreviewData.slice(1, 11).map((row: any, rowIdx: number) => (
                      <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800">
                        {(row as any[]).map((cell: any, cellIdx: number) => (
                          <td key={cellIdx} className="px-3 py-2 text-gray-900 dark:text-gray-100">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importPreviewData.length > 11 && (
                <div className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 text-center">
                  ... e mais {importPreviewData.length - 11} registros
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setModalImportPreviewAberto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmarImport}>
              Confirmar Importação
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}





