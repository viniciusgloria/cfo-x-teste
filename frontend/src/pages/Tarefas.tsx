import React, { useState } from 'react';
import { Plus, Download, Grid3x3, List, Calendar, BarChart3, CheckSquare, Zap, BarChart2, Columns, Target, X } from 'lucide-react';

// Componentes de páginas/modais
import TarefaModal from '../components/TarefaModal';
import TarefaCard from '../components/TarefaCard';
import TarefasFilterPanel from '../components/TarefasFilterPanel';
import TarefasTimesheet from '../components/TarefasTimesheet';
import TarefasStats from '../components/TarefasStats';
import TarefasDashboard from '../components/TarefasDashboard';
import MetasPanel from '../components/MetasPanel';
import AutomationBuilder from '../components/AutomationBuilder';
import { RelatorioProductividade } from '../components/RelatorioProductividade';
import { CalendarView } from '../components/CalendarView';
import { GanttView } from '../components/GanttView';
import BulkActions from '../components/BulkActions';
import { KanbanColumnsManager } from '../components/KanbanColumnsManager';

// Componentes UI
import { PageBanner } from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';

// Context e Stores
import { useToast } from '../contexts/ToastContext';
import { useTarefasStore } from '../store/tarefasStore';
import { useAuthStore } from '../store/authStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';

// Types
import { KanbanStatus, Tarefa } from '../types';

const Tarefas: React.FC = () => {
  const { addToast } = useToast();
  const [showTarefaModal, setShowTarefaModal] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<KanbanStatus | undefined>();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<KanbanStatus | undefined>();
  const [filterColaborador, setFilterColaborador] = useState<string | undefined>();
  const [filterSetor, setFilterSetor] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<string | undefined>();
  const [selectedForTimesheet, setSelectedForTimesheet] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'gantt'>('board');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMetas, setShowMetas] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [showKanbanManager, setShowKanbanManager] = useState(false);

  const tarefas = useTarefasStore((s) => s.tarefas);
  const kanbanColumns = useTarefasStore((s) => s.kanbanColumns);
  const criarTarefa = useTarefasStore((s) => s.criarTarefa);
  const atualizarTarefa = useTarefasStore((s) => s.atualizarTarefa);
  const moverTarefa = useTarefasStore((s) => s.moverTarefa);
  const deletarTarefa = useTarefasStore((s) => s.deletarTarefa);
  const duplicarTarefa = useTarefasStore((s) => s.duplicarTarefa);
  const toggleWatcher = useTarefasStore((s) => s.toggleWatcher);
  const adicionarTagTarefa = useTarefasStore((s) => s.adicionarTagTarefa);
  const tags = useTarefasStore((s) => s.tags);
  const colaboradoresStore = useColaboradoresStore((s) => s.colaboradores);
  const colaboradores = colaboradoresStore.map((c) => ({ id: String(c.id), nome: c.nome }));
  const user = useAuthStore((s) => s.user);

  // Executar templates repetitivos periodicamente
  // useEffect(() => {
  //   processarTemplatesRepetitivos();
  //   const interval = setInterval(() => {
  //     processarTemplatesRepetitivos();
  //   }, 1000 * 60 * 60); // A cada hora

  //   return () => clearInterval(interval);
  // }, [processarTemplatesRepetitivos]);

  // Função para filtrar tarefas (com busca aprimorada)
  const filtrarTarefas = (tarefasLista: Tarefa[]) => {
    return tarefasLista.filter((t) => {
      // Filtro de busca - busca em título, descrição e comentários
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const buscaEmTitulo = t.titulo.toLowerCase().includes(searchLower);
        const buscaEmDescricao = t.descricao?.toLowerCase().includes(searchLower) || false;
        const buscaEmComentarios = (t.comentarios || []).some((c) =>
          c.texto.toLowerCase().includes(searchLower)
        );

        if (!buscaEmTitulo && !buscaEmDescricao && !buscaEmComentarios) {
          return false;
        }
      }

      // Filtro de status
      if (filterStatus && t.status !== filterStatus) {
        return false;
      }

      // Filtro de prioridade
      if (filterPriority && t.prioridade !== filterPriority) {
        return false;
      }

      // Filtro de colaborador
      if (filterColaborador && !t.colaboradorIds.includes(filterColaborador)) {
        return false;
      }

      // Filtro de setor
      if (filterSetor && !t.tags?.some((tag) => tag.setorId === filterSetor)) {
        return false;
      }

      return true;
    });
  };
  // Lista filtrada para renderização
  const tarefasFiltradas = filtrarTarefas(tarefas || []);

  // Ordenação por coluna (inicializa com as colunas padrão, mas suporta colunas dinâmicas)
  const [sortOptions, setSortOptions] = useState<Record<string, { campo: 'prioridade' | 'dataVencimento' | 'titulo'; direcao: 'asc' | 'desc' }>>({
    a_fazer: { campo: 'prioridade', direcao: 'desc' },
    fazendo: { campo: 'prioridade', direcao: 'desc' },
    feito: { campo: 'prioridade', direcao: 'desc' },
  });

  const sortList = (list: Tarefa[], campo: 'prioridade' | 'dataVencimento' | 'titulo', direcao: 'asc' | 'desc') => {
    const prioridadeOrdem: Record<string, number> = { urgente: 4, alta: 3, media: 2, baixa: 1 };
    return [...list].sort((a, b) => {
      let A: any = 0;
      let B: any = 0;
      if (campo === 'prioridade') {
        A = prioridadeOrdem[a.prioridade] || 0;
        B = prioridadeOrdem[b.prioridade] || 0;
      } else if (campo === 'dataVencimento') {
        const missingValue = direcao === 'asc' ? Infinity : -Infinity;
        A = a.dataVencimento ? new Date(a.dataVencimento).getTime() : missingValue;
        B = b.dataVencimento ? new Date(b.dataVencimento).getTime() : missingValue;
      } else {
        A = a.titulo.toLowerCase();
        B = b.titulo.toLowerCase();
      }
      if (A < B) return direcao === 'asc' ? -1 : 1;
      if (A > B) return direcao === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const hasPendingDependencies = (tarefaId: string, status: KanbanStatus) => {
    if (status !== 'feito') {
      return { blocked: false, pendingCount: 0 };
    }

    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa || !tarefa.dependsOn || tarefa.dependsOn.length === 0) {
      return { blocked: false, pendingCount: 0 };
    }

    const bloqueadores = tarefa.dependsOn
      .map((depId) => tarefas.find((t) => t.id === depId))
      .filter(Boolean) as Tarefa[];

    const naoCompletas = bloqueadores.filter((b) => b.status !== 'feito');
    return { blocked: naoCompletas.length > 0, pendingCount: naoCompletas.length };
  };

  // Ações de modal/tarefa
  const handleAbrirTarefa = (t: Tarefa) => {
    setSelectedTarefa(t);
    setSelectedStatus(t.status);
    setShowTarefaModal(true);
  };

  const handleAdicionarTarefa = (status: KanbanStatus) => {
    setSelectedTarefa(undefined);
    setSelectedStatus(status);
    setShowTarefaModal(true);
  };

  const handleSaveTarefa = (tarefaData: Partial<Tarefa>) => {
    if (!tarefaData.titulo || !tarefaData.titulo.trim()) {
      addToast('Por favor, preencha o título da tarefa', 'error');
      return;
    }

    try {
      if (selectedTarefa) {
        atualizarTarefa(selectedTarefa.id, tarefaData);
        addToast('Tarefa atualizada com sucesso!', 'success');
      } else {
        criarTarefa({
          ...tarefaData,
          status: selectedStatus || 'a_fazer',
          colaboradorIds: tarefaData.colaboradorIds || [],
          tags: tarefaData.tags || [],
          tempos: [],
          tempoTotalHoras: 0,
        } as Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm' | 'logs' | 'watcherIds'>);
        addToast('Tarefa criada com sucesso!', 'success');
      }
    } catch (error) {
      addToast('Erro ao salvar tarefa', 'error');
      console.error(error);
    }
    setShowTarefaModal(false);
    setSelectedTarefa(undefined);
    setSelectedStatus(undefined);
  };

  const exportCSV = (tarefasParaExportar: Tarefa[], nomeArquivo = 'tarefas') => {
    if (!tarefasParaExportar.length) {
      addToast('Nenhuma tarefa para exportar', 'info');
      return;
    }
    const quote = (val: any) => '"' + String(val ?? '').replace(/"/g, '""') + '"';
    const header = ['ID', 'Título', 'Status', 'Prioridade', 'Vencimento'];
    const rows = tarefasParaExportar.map((t) => [
      quote(t.id),
      quote(t.titulo),
      quote(t.status),
      quote(t.prioridade),
      quote(t.dataVencimento ? new Date(t.dataVencimento).toLocaleDateString('pt-BR') : '')
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeArquivo}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => exportCSV(tarefasFiltradas, 'tarefas');

  const handleDuplicateTarefa = (id: string) => {
    try {
      duplicarTarefa(id);
      addToast('Tarefa duplicada com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao duplicar tarefa', 'error');
      console.error(error);
    }
  };

  const handleRepeatTarefa = (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    // Abrir modal de edição para configurar recorrência
    setSelectedTarefa(tarefa);
    setShowTarefaModal(true);
    addToast('Configure a recorrência desta tarefa nas opções do modal', 'info');
  };

  const handleToggleWatcher = (id: string) => {
    if (!user) {
      addToast('Usuário não autenticado', 'error');
      return;
    }
    try {
      toggleWatcher(id, user.id);
      addToast('Status de acompanhamento atualizado!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar acompanhamento', 'error');
      console.error(error);
    }
  };

  // Handlers para Bulk Actions
  const handleToggleSelect = (tarefaId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(tarefaId)) {
      newSelected.delete(tarefaId);
    } else {
      newSelected.add(tarefaId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMove = (ids: string[], status: KanbanStatus) => {
    const blockedIds = status === 'feito' ? ids.filter((id) => hasPendingDependencies(id, status).blocked) : [];
    const allowedIds = ids.filter((id) => !blockedIds.includes(id));

    if (blockedIds.length > 0) {
      addToast(`Não foi possível mover ${blockedIds.length} tarefa(s) para Feito por dependências pendentes.`, 'error');
    }

    allowedIds.forEach((id) => moverTarefa(id, status, user?.name));

    if (allowedIds.length > 0) {
      addToast(
        `Movidas ${allowedIds.length} tarefa(s) para ${status === 'a_fazer' ? 'A Fazer' : status === 'fazendo' ? 'Fazendo' : 'Feito'}`,
        'success'
      );
    }

    setSelectedIds(new Set());
  };

  const handleBulkDelete = (ids: string[]) => {
    if (!ids.length) return;

    const confirmar = window.confirm(`Confirmar exclusão de ${ids.length} tarefa(s)?`);
    if (!confirmar) return;

    ids.forEach((id) => deletarTarefa(id));
    addToast(`Deletadas ${ids.length} tarefa(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleBulkAssign = (ids: string[], colaboradorId: string) => {
    ids.forEach((id) => {
      const tarefa = tarefas.find((t) => t.id === id);
      if (tarefa) {
        const novoSet = new Set([...(tarefa.colaboradorIds || []), String(colaboradorId)]);
        atualizarTarefa(id, { colaboradorIds: Array.from(novoSet) });
      }
    });
    addToast(`Atribuídas ${ids.length} tarefa(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleBulkPriority = (ids: string[], prioridade: 'baixa' | 'media' | 'alta' | 'urgente') => {
    ids.forEach((id) => atualizarTarefa(id, { prioridade }));
    addToast(`Prioridade atualizada em ${ids.length} tarefa(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleBulkAddTag = (ids: string[], tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) {
      addToast('Tag não encontrada', 'error');
      return;
    }
    ids.forEach((id) => adicionarTagTarefa(id, tag));
    addToast(`Tag aplicada em ${ids.length} tarefa(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleBulkDuplicate = (ids: string[]) => {
    ids.forEach((id) => duplicarTarefa(id));
    addToast(`Duplicadas ${ids.length} tarefa(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleBulkExport = (ids: string[]) => {
    const selecionadas = tarefasFiltradas.filter((t) => ids.includes(t.id));
    exportCSV(selecionadas, 'tarefas-selecionadas');
    setSelectedIds(new Set());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-100');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-100');
  };

  const handleDrop = (e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100');
    if (draggedTaskId) {
      const { blocked, pendingCount } = hasPendingDependencies(draggedTaskId, status);
      if (blocked) {
        addToast(`Tarefa bloqueada! Complete as ${pendingCount} dependência(s) primeiro.`, 'error');
        setDraggedTaskId(null);
        return;
      }
      
      moverTarefa(draggedTaskId, status, user?.name);
      setDraggedTaskId(null);
    }
  };

  const selectedTimesheetTask = selectedForTimesheet ? tarefas?.find((t) => t.id === selectedForTimesheet) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 text-gray-900 transition-colors" style={{ backgroundColor: 'var(--tw-dark-bg, #f9fafb)' }}>
      <style>{`
        .dark .min-h-screen { background-color: #111827 !important; }
      `}</style>
      <div className="space-y-6">
        <PageBanner
          title="Tarefas"
          icon={<CheckSquare size={32} />}
          style={{ minHeight: '64px' }}
          right={(
            <div className="flex items-center gap-3">
              {/* Visualizações */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-emerald-200'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                  title="Quadro Kanban"
                >
                  <Grid3x3 size={16} />
                  <span className="text-sm font-medium">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-emerald-200'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                  title="Calendário"
                >
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Agenda</span>
                </button>
                <button
                  onClick={() => setViewMode('gantt')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'gantt'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-emerald-200'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                  title="Timeline Gantt"
                >
                  <BarChart3 size={16} />
                  <span className="text-sm font-medium">Timeline</span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              {/* Ferramentas */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowKanbanManager(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-slate-700 transition-all"
                  title="Personalizar Colunas"
                >
                  <Columns size={16} />
                  Colunas
                </button>
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showDashboard
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-600'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-purple-500 dark:hover:bg-slate-700'
                  }`}
                  title="Dashboard de Métricas"
                >
                  <BarChart2 size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => setShowMetas(!showMetas)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showMetas
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-600'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-emerald-500 dark:hover:bg-slate-700'
                  }`}
                  title="Painel de Metas"
                >
                  <Target size={16} />
                  Metas
                </button>
                <button
                  onClick={() => setShowRelatorio(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-indigo-400 dark:hover:bg-slate-700 transition-all"
                  title="Relatório de Produtividade"
                >
                  <BarChart3 size={16} />
                  Relatório
                </button>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              {/* Configurações */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedTarefa(undefined);
                    setSelectedStatus(undefined);
                    setShowTarefaModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Nova Tarefa
                </Button>
                <button
                  onClick={() => setShowAutomations(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                  title="Automações Inteligentes"
                >
                  <Zap size={16} />
                  Automações
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 transition-all"
                  title="Exportar para CSV"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}
        />

        {/* Metas Panel */}
        {showMetas && <MetasPanel />}

        {/* Métricas Dashboard */}
        {showDashboard && <TarefasDashboard tarefas={tarefasFiltradas || []} />}

        {/* Estatísticas - Sempre Visível */}
        <TarefasStats tarefas={tarefasFiltradas} />

        {/* Filter Panel */}
        <TarefasFilterPanel
          onSearchChange={setSearchValue}
          onStatusChange={setFilterStatus}
          onColaboradorChange={setFilterColaborador}
          onSetorChange={setFilterSetor}
          onPriorityChange={setFilterPriority}
          searchValue={searchValue}
          statusValue={filterStatus}
          colaboradorValue={filterColaborador}
          setorValue={filterSetor}
          priorityValue={filterPriority}
        />

        {/* Timesheet Panel (if task selected) */}
        {selectedTimesheetTask && (
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow border border-transparent dark:border-slate-800">
            <button
              onClick={() => setSelectedForTimesheet(undefined)}
              className="absolute right-3 top-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200"
              title="Fechar painel de timesheet"
            >
              <X size={18} />
            </button>
            <TarefasTimesheet
              tarefaId={selectedTimesheetTask.id}
              tempos={selectedTimesheetTask.tempos || []}
              tempoTotal={selectedTimesheetTask.tempoTotalHoras || 0}
            />
          </div>
        )}


        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-transparent dark:border-slate-800">
            <CalendarView 
              tarefas={tarefasFiltradas || []}
              onTarefaClick={handleAbrirTarefa}
            />
          </div>
        )}

        {/* Gantt View */}
        {viewMode === 'gantt' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-transparent dark:border-slate-800">
            <GanttView 
              tarefas={tarefasFiltradas || []}
              onTarefaClick={handleAbrirTarefa}
            />
          </div>
        )}

        {/* Kanban Board */}
        {viewMode === 'board' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${kanbanColumns.length}, minmax(300px, 1fr))` }}>
            {[...kanbanColumns].sort((a, b) => a.ordem - b.ordem).map((coluna) => (
              <div 
                key={coluna.id}
                className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 min-h-[500px] transition-colors"
                style={{ backgroundColor: `${coluna.cor}10` }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, coluna.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: coluna.cor }}
                    />
                    {coluna.nome} 
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      ({tarefasFiltradas?.filter(t => t.status === coluna.id).length || 0})
                    </span>
                  </h3>
                  <select
                    className="px-2 py-1 text-sm border rounded bg-white dark:bg-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    value={`${sortOptions[coluna.id]?.campo || 'prioridade'}:${sortOptions[coluna.id]?.direcao || 'desc'}`}
                    onChange={(e) => {
                      const [campo, direcao] = e.target.value.split(':') as any;
                      setSortOptions((prev) => ({ ...prev, [coluna.id]: { campo, direcao } }));
                    }}
                  >
                    <option value="prioridade:desc">Prioridade (Alta→Baixa)</option>
                    <option value="prioridade:asc">Prioridade (Baixa→Alta)</option>
                    <option value="dataVencimento:asc">Vencimento (Mais cedo)</option>
                    <option value="dataVencimento:desc">Vencimento (Mais tarde)</option>
                    <option value="titulo:asc">Título (A→Z)</option>
                    <option value="titulo:desc">Título (Z→A)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {sortList(
                    tarefasFiltradas?.filter(t => t.status === coluna.id) || [], 
                    sortOptions[coluna.id]?.campo || 'prioridade', 
                    sortOptions[coluna.id]?.direcao || 'desc'
                  ).map((t) => (
                    <TarefaCard
                      key={t.id}
                      tarefa={t}
                      onEdit={handleAbrirTarefa}
                      onDelete={deletarTarefa}
                      onDragStart={() => setDraggedTaskId(t.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      isSelected={selectedIds.has(t.id)}
                      onSelect={handleToggleSelect}
                      onDuplicate={handleDuplicateTarefa}
                      onToggleWatcher={handleToggleWatcher}
                      onRepeat={handleRepeatTarefa}
                      onOpenTimesheet={(id) => setSelectedForTimesheet((current) => (current === id ? undefined : id))}
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleAdicionarTarefa(coluna.id)}
                  className="text-blue-600 hover:text-blue-800 dark:text-emerald-300 dark:hover:text-emerald-200 p-1 mt-4 flex items-center gap-1"
                >
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            ))}
          </div>
        )}

        <BulkActions
        selectedIds={[...selectedIds]}
        onMove={handleBulkMove}
        onDelete={handleBulkDelete}
        onAssign={handleBulkAssign}
        onSetPriority={handleBulkPriority}
        onAddTag={handleBulkAddTag}
        onDuplicate={handleBulkDuplicate}
        onExport={handleBulkExport}
        onClearSelection={() => setSelectedIds(new Set())}
        tags={tags}
      />

      {/* Modals */}
      <TarefaModal
          isOpen={showTarefaModal}
          tarefa={selectedTarefa}
          onClose={() => {
            setShowTarefaModal(false);
            setSelectedTarefa(undefined);
            setSelectedStatus(undefined);
          }}
          onSave={handleSaveTarefa}
        />

        {/* Modal de Automações */}
        {showAutomations && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
                    <Zap size={24} />
                    Automações Inteligentes
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">Automatize processos e fluxos de trabalho</p>
                </div>
                <button
                  onClick={() => {
                    setShowAutomations(false);
                  }}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <AutomationBuilder />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-slate-900/50 dark:bg-slate-900/80 border-gray-200 dark:border-slate-700 dark:border-slate-800">
                <button
                  onClick={() => setShowAutomations(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Relatório de Produtividade */}
        <RelatorioProductividade
          isOpen={showRelatorio}
          onClose={() => setShowRelatorio(false)}
          tarefas={tarefasFiltradas}
        />

        {/* Modal de Gerenciamento de Colunas Kanban */}
        <KanbanColumnsManager
          isOpen={showKanbanManager}
          onClose={() => setShowKanbanManager(false)}
        />
      </div>
    </div>
  );
};

export default Tarefas;




