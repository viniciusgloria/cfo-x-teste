import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tarefa, TemplateTarefa, TagTarefa, KanbanStatus, KanbanColumn, TempoTarefa, LogTarefa, ComentarioTarefa, AnexoTarefa, ChecklistItem, Milestone } from '../types';
import { useNotificacoesStore } from './notificacoesStore';

interface TarefasStore {
  // State
  tarefas: Tarefa[];
  templates: TemplateTarefa[];
  tags: TagTarefa[];
  milestones: Milestone[];
  kanbanColumns: KanbanColumn[];
  filtroStatus?: KanbanStatus;
  filtroSetorId?: string;
  filtroColaboradorId?: string;

  // Actions - Kanban Columns
  criarColuna: (coluna: Omit<KanbanColumn, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarColuna: (id: string, coluna: Partial<KanbanColumn>) => void;
  deletarColuna: (id: string) => void;
  reordenarColunas: (colunaId: string, novaOrdem: number) => void;
  resetarColunasKanban: () => void;

  // Actions - Tarefas
  criarTarefa: (tarefa: Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm' | 'logs' | 'watcherIds'>) => void;
  atualizarTarefa: (id: string, tarefa: Partial<Tarefa>, usuarioNome?: string) => void;
  duplicarTarefa: (id: string) => void;
  deletarTarefa: (id: string, motivoDelecao?: string) => void;
  moverTarefa: (id: string, novoStatus: KanbanStatus, usuarioNome?: string) => void;
  obterTarefasPoEstado: () => Map<KanbanStatus, Tarefa[]>;
  
  // Actions - Colaboradores em Tarefas
  adicionarColaboradorTarefa: (tarefaId: string, colaboradorId: string, usuarioNome?: string) => void;
  removerColaboradorTarefa: (tarefaId: string, colaboradorId: string, usuarioNome?: string) => void;
  
  // Actions - Watchers
  adicionarWatcher: (tarefaId: string, userId: string, usuarioNome?: string) => void;
  removerWatcher: (tarefaId: string, userId: string, usuarioNome?: string) => void;
  toggleWatcher: (tarefaId: string, userId: string, usuarioNome?: string) => void;
  
  // Actions - Timesheet
  adicionarTempoTarefa: (tarefaId: string, tempo: Omit<TempoTarefa, 'id' | 'criadoEm'>, usuarioNome?: string) => void;
  removerTempoTarefa: (tarefaId: string, tempoId: string, usuarioNome?: string) => void;
  
  // Actions - Tags
  criarTag: (tag: Omit<TagTarefa, 'id' | 'criadoEm'>) => void;
  adicionarTagTarefa: (tarefaId: string, tag: TagTarefa) => void;
  removerTagTarefa: (tarefaId: string, tagId: string) => void;
  
  // Actions - Comentários
  adicionarComentario: (tarefaId: string, texto: string, usuarioId: string, usuarioNome: string) => void;
  editarComentario: (tarefaId: string, comentarioId: string, texto: string) => void;
  deletarComentario: (tarefaId: string, comentarioId: string) => void;
  
  // Actions - Anexos
  adicionarAnexo: (tarefaId: string, anexo: Omit<AnexoTarefa, 'id' | 'tarefaId' | 'criadoEm'>) => void;
  removerAnexo: (tarefaId: string, anexoId: string) => void;
  
  // Actions - Checklist
  adicionarChecklistItem: (tarefaId: string, texto: string) => void;
  toggleChecklistItem: (tarefaId: string, itemId: string) => void;
  editarChecklistItem: (tarefaId: string, itemId: string, texto: string) => void;
  deletarChecklistItem: (tarefaId: string, itemId: string) => void;
  reordenarChecklist: (tarefaId: string, itemId: string, novaOrdem: number) => void;
  
  // Actions - Subtasks
  adicionarSubtask: (tarefaId: string, titulo: string, tarefaPaiId?: string) => void;
  editarSubtask: (tarefaId: string, subtaskId: string, titulo: string, tarefaPaiId?: string) => void;
  deletarSubtask: (tarefaId: string, subtaskId: string, tarefaPaiId?: string) => void;
  toggleSubtask: (tarefaId: string, subtaskId: string, tarefaPaiId?: string) => void;
  reordenarSubtasks: (tarefaId: string, subtaskId: string, novaOrdem: number, tarefaPaiId?: string) => void;
  obterProgressoSubtasks: (tarefaId: string) => { total: number; completas: number; percentual: number };
  
  // Actions - Dependências
  adicionarDependencia: (tarefaId: string, dependsOnId: string) => { sucesso: boolean; erro?: string };
  removerDependencia: (tarefaId: string, dependsOnId: string) => void;
  obterBloqueadoresUIState: (tarefaId: string) => Tarefa[];
  obterTarefasBloqueadasUIState: (tarefaId: string) => Tarefa[];
  validarDependenciasUI: (tarefaId: string) => boolean;
  
  // Actions - Templates
  criarTemplate: (template: Omit<TemplateTarefa, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarTemplate: (id: string, template: Partial<TemplateTarefa>) => void;
  deletarTemplate: (id: string) => void;
  executarTemplate: (templateId: string) => void; // Cria tarefa a partir do template
  processarTemplatesRepetitivos: () => void; // Verifica e cria tarefas de templates vencidos
  
  // Actions - Filtros
  setFiltroStatus: (status?: KanbanStatus) => void;
  setFiltroSetorId: (setorId?: string) => void;
  setFiltroColaboradorId: (colaboradorId?: string) => void;
  resetFiltros: () => void;
  
  // Actions - Sorting
  ordenarTarefasPor: (campo: 'prioridade' | 'dataVencimento' | 'titulo', direcao: 'asc' | 'desc') => Tarefa[];
  
  // Actions - Milestones
  criarMilestone: (milestone: Omit<Milestone, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarMilestone: (id: string, milestone: Partial<Milestone>) => void;
  deletarMilestone: (id: string) => void;
  vincularTarefaAMilestone: (tarefaId: string, milestoneId: string) => void;
  desvincularTarefaDeMilestone: (tarefaId: string) => void;
  
  // Getters
  getTarefasFiltradas: () => Tarefa[];
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const calcularProximaExecucao = (template: TemplateTarefa): string => {
  const hoje = new Date();
  
  switch (template.frequencia) {
    case 'diaria':
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      return amanha.toISOString();
      
    case 'semanal': {
      const proxSemana = new Date(hoje);
      const diasAfrente = template.dia ? template.dia - hoje.getDay() : 1;
      proxSemana.setDate(proxSemana.getDate() + (diasAfrente <= 0 ? diasAfrente + 7 : diasAfrente));
      return proxSemana.toISOString();
    }
    
    case 'quinzenal': {
      const proxQuinzena = new Date(hoje);
      proxQuinzena.setDate(proxQuinzena.getDate() + 15);
      return proxQuinzena.toISOString();
    }
    
    case 'mensal': {
      const proxMes = new Date(hoje);
      proxMes.setMonth(proxMes.getMonth() + 1);
      if (template.dia) proxMes.setDate(template.dia);
      return proxMes.toISOString();
    }
    
    case 'trimestral': {
      const proxTrimestre = new Date(hoje);
      proxTrimestre.setMonth(proxTrimestre.getMonth() + 3);
      return proxTrimestre.toISOString();
    }
    
    case 'anual': {
      const proxAno = new Date(hoje);
      proxAno.setFullYear(proxAno.getFullYear() + 1);
      return proxAno.toISOString();
    }
    
    default:
      return '';
  }
};

// Funções para gerenciar dependências entre tarefas
const detectarCicloDependencia = (tarefaId: string, dependsOnId: string, todasAsTarefas: Tarefa[]): boolean => {
  // Se tentar criar dependência da tarefa consigo mesma
  if (tarefaId === dependsOnId) return true;
  
  const tarefa = todasAsTarefas.find(t => t.id === dependsOnId);
  if (!tarefa || !tarefa.dependsOn || tarefa.dependsOn.length === 0) return false;
  
  // DFS para detectar ciclos
  const visitados = new Set<string>();
  const pilha = [...tarefa.dependsOn];
  
  while (pilha.length > 0) {
    const atual = pilha.pop()!;
    
    if (atual === tarefaId) return true; // Ciclo detectado
    if (visitados.has(atual)) continue;
    
    visitados.add(atual);
    const tarefaAtual = todasAsTarefas.find(t => t.id === atual);
    if (tarefaAtual?.dependsOn) {
      pilha.push(...tarefaAtual.dependsOn);
    }
  }
  
  return false;
};

const obterBloqueadores = (tarefaId: string, todasAsTarefas: Tarefa[]): Tarefa[] => {
  const tarefa = todasAsTarefas.find(t => t.id === tarefaId);
  if (!tarefa || !tarefa.dependsOn) return [];
  
  return todasAsTarefas.filter(t => tarefa.dependsOn?.includes(t.id) || []);
};

const obterTarefasQueBloqueia = (tarefaId: string, todasAsTarefas: Tarefa[]): Tarefa[] => {
  return todasAsTarefas.filter(t => t.blocks?.includes(tarefaId) || []);
};

const obterTarefasBloqueiadas = (tarefaId: string, todasAsTarefas: Tarefa[]): Tarefa[] => {
  const tarefa = todasAsTarefas.find(t => t.id === tarefaId);
  if (!tarefa || !tarefa.blocks) return [];
  
  return todasAsTarefas.filter(t => tarefa.blocks?.includes(t.id) || []);
};

// Valida se todos os bloqueadores foram completados
const validarDependenciasAtendidas = (tarefaId: string, todasAsTarefas: Tarefa[]): boolean => {
  const tarefa = todasAsTarefas.find(t => t.id === tarefaId);
  if (!tarefa || !tarefa.dependsOn || tarefa.dependsOn.length === 0) return true;
  
  return tarefa.dependsOn.every(depId => {
    const depTarefa = todasAsTarefas.find(t => t.id === depId);
    return depTarefa?.status === 'feito';
  });
};

// Funções para Subtasks
const calcularProgressoSubtasks = (subtasks?: Subtask[]): { total: number; completas: number; percentual: number } => {
  if (!subtasks || subtasks.length === 0) {
    return { total: 0, completas: 0, percentual: 0 };
  }
  
  let total = 0;
  let completas = 0;
  
  const contar = (items: Subtask[]) => {
    items.forEach(item => {
      total++;
      if (item.concluido) completas++;
      if (item.subtasks) contar(item.subtasks);
    });
  };
  
  contar(subtasks);
  
  return {
    total,
    completas,
    percentual: total > 0 ? Math.round((completas / total) * 100) : 0
  };
};

const encontrarEAtualizarSubtask = (
  subtasks: Subtask[],
  subtaskId: string,
  atualizacao: (s: Subtask) => Subtask,
  tarefaPaiId?: string
): Subtask[] => {
  return subtasks.map(sub => {
    if (sub.id === subtaskId) {
      return atualizacao(sub);
    }
    if (sub.subtasks) {
      return {
        ...sub,
        subtasks: encontrarEAtualizarSubtask(sub.subtasks, subtaskId, atualizacao, tarefaPaiId)
      };
    }
    return sub;
  });
};

const encontrarEDeletarSubtask = (
  subtasks: Subtask[],
  subtaskId: string,
  tarefaPaiId?: string
): Subtask[] => {
  return subtasks
    .filter(sub => sub.id !== subtaskId)
    .map(sub => {
      if (sub.subtasks) {
        return {
          ...sub,
          subtasks: encontrarEDeletarSubtask(sub.subtasks, subtaskId, tarefaPaiId)
        };
      }
      return sub;
    });
};

export const useTarefasStore = create<TarefasStore>()(
  persist(
    (set, get) => ({
  tarefas: [],
  templates: [],
  milestones: [],
  kanbanColumns: [
    {
      id: 'a_fazer',
      nome: 'A Fazer',
      cor: '#EF4444',
      ordem: 0,
      isPadrao: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: 'fazendo',
      nome: 'Fazendo',
      cor: '#F59E0B',
      ordem: 1,
      isPadrao: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: 'feito',
      nome: 'Feito',
      cor: '#10B981',
      ordem: 2,
      isPadrao: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
  ],
  tags: [
    {
      id: '1',
      nome: 'Financeiro',
      cor: '#8B5CF6',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'RH',
      cor: '#EC4899',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Desenvolvimento',
      cor: '#3B82F6',
      criadoEm: new Date().toISOString(),
    },
  ],
  filtroStatus: undefined,
  filtroSetorId: undefined,
  filtroColaboradorId: undefined,

  // Tarefas
  criarTarefa: (tarefa) => set((state) => {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: randomId(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      watcherIds: [],
      comentarios: [],
      anexos: [],
      checklist: [],
      subtasks: [],
      logs: [{
        id: randomId(),
        tarefaId: '',
        acao: 'criacao',
        descricao: 'Tarefa criada',
        usuarioId: '',
        usuarioNome: 'Sistema',
        criadoEm: new Date().toISOString(),
      }],
    } as Tarefa;
    novaTarefa.logs[0].tarefaId = novaTarefa.id;
    
    return { tarefas: [...state.tarefas, novaTarefa] };
  }),

  atualizarTarefa: (id, updates, usuarioNome = 'Sistema') => set((state) => {
    const tarefaAnterior = state.tarefas.find(t => t.id === id);
    if (!tarefaAnterior) return state;
    
    const logs: LogTarefa[] = [];
    let mudancasSignificativas: string[] = [];
    
    Object.keys(updates).forEach(campo => {
      if (campo !== 'logs' && campo !== 'atualizadoEm') {
        const valorAnterior = (tarefaAnterior as any)[campo];
        const valorNovo = (updates as any)[campo];
        
        if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNovo)) {
          logs.push({
            id: randomId(),
            tarefaId: id,
            acao: 'edicao',
            campo,
            valorAnterior: typeof valorAnterior === 'object' ? JSON.stringify(valorAnterior) : String(valorAnterior || ''),
            valorNovo: typeof valorNovo === 'object' ? JSON.stringify(valorNovo) : String(valorNovo || ''),
            descricao: `Campo "${campo}" alterado`,
            usuarioId: '',
            usuarioNome,
            criadoEm: new Date().toISOString(),
          });
          
          // Registrar mudanças significativas
          if (['titulo', 'descricao', 'prioridade', 'dataVencimento'].includes(campo)) {
            mudancasSignificativas.push(campo);
          }
        }
      }
    });
    
    // Notificar watchers sobre atualizações significativas
    if (tarefaAnterior.watcherIds && tarefaAnterior.watcherIds.length > 0 && mudancasSignificativas.length > 0) {
      try {
        const descricao = mudancasSignificativas.map(c => {
          if (c === 'titulo') return 'Título';
          if (c === 'descricao') return 'Descrição';
          if (c === 'prioridade') return 'Prioridade';
          if (c === 'dataVencimento') return 'Data de vencimento';
          return c;
        }).join(', ');
        
        useNotificacoesStore.getState().notificarWatchersTarefa(
          tarefaAnterior.watcherIds,
          tarefaAnterior.titulo,
          'atualizada',
          `Campos alterados: ${descricao}`,
          `/tarefas?id=${id}`
        );
      } catch (e) {
        console.error('Erro ao notificar watchers:', e);
      }
    }
    
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === id
          ? { 
              ...t, 
              ...updates, 
              atualizadoEm: new Date().toISOString(),
              logs: [...(t.logs || []), ...logs]
            }
          : t
      ),
    };
  }),

  deletarTarefa: (id, motivoDelecao) => set((state) => {
    const tarefaDeletada = state.tarefas.find(t => t.id === id);
    if (tarefaDeletada) {
      // Registrar no log antes de deletar
      const logDelecao: LogTarefa = {
        id: randomId(),
        tarefaId: id,
        acao: 'delecao',
        descricao: `Tarefa deletada${motivoDelecao ? ` - Motivo: ${motivoDelecao}` : ''}`,
        campo: motivoDelecao ? 'motivo_delecao' : undefined,
        valorAnterior: tarefaDeletada.titulo,
        valorNovo: undefined,
        usuarioId: 'sistema',
        usuarioNome: 'Sistema',
        criadoEm: new Date().toISOString(),
      };
    }
    return {
      tarefas: state.tarefas.filter((t) => t.id !== id),
    };
  }),

  duplicarTarefa: (id) => set((state) => {
    const tarefaOriginal = state.tarefas.find(t => t.id === id);
    if (!tarefaOriginal) return state;
    
    const novaTarefa: Tarefa = {
      ...tarefaOriginal,
      id: randomId(),
      titulo: `${tarefaOriginal.titulo} (cópia)`,
      status: 'a_fazer',
      tempos: [],
      tempoTotalHoras: 0,
      dataFinalizacao: undefined,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      watcherIds: [],
      logs: [{
        id: randomId(),
        tarefaId: '',
        acao: 'criacao',
        descricao: `Duplicada a partir da tarefa "${tarefaOriginal.titulo}"`,
        usuarioId: '',
        usuarioNome: 'Sistema',
        criadoEm: new Date().toISOString(),
      }],
    };
    novaTarefa.logs[0].tarefaId = novaTarefa.id;
    
    return { tarefas: [...state.tarefas, novaTarefa] };
  }),

  moverTarefa: (id, novoStatus, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === id);
    if (!tarefa) return state;
    
    // Validar se a tarefa tem dependências não atendidas ao tentar mover para "feito"
    if (novoStatus === 'feito' && !validarDependenciasAtendidas(id, state.tarefas)) {
      console.warn(`Não é possível marcar tarefa como completa. Existem dependências não atendidas.`);
      return state;
    }
    
    const statusLabels = {
      a_fazer: 'A Fazer',
      fazendo: 'Fazendo',
      feito: 'Feito'
    };
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId: id,
      acao: 'movimentacao',
      campo: 'status',
      valorAnterior: tarefa.status,
      valorNovo: novoStatus,
      descricao: `Status alterado de "${tarefa.status}" para "${novoStatus}"`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    // Notificar watchers sobre mudança de status
    if (tarefa.watcherIds && tarefa.watcherIds.length > 0 && tarefa.status !== novoStatus) {
      try {
        useNotificacoesStore.getState().notificarWatchersTarefa(
          tarefa.watcherIds,
          tarefa.titulo,
          'status_mudou',
          `${statusLabels[tarefa.status]} → ${statusLabels[novoStatus]}`,
          `/tarefas?id=${id}`
        );
      } catch (e) {
        console.error('Erro ao notificar watchers:', e);
      }
    }
    
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === id
          ? {
              ...t,
              status: novoStatus,
              dataFinalizacao: novoStatus === 'feito' ? new Date().toISOString() : t.dataFinalizacao,
              atualizadoEm: new Date().toISOString(),
              logs: [...(t.logs || []), log],
            }
          : t
      ),
    };
  }),

  obterTarefasPoEstado: () => {
    const tarefas = get().tarefas;
    const map = new Map<KanbanStatus, Tarefa[]>();
    map.set('a_fazer', []);
    map.set('fazendo', []);
    map.set('feito', []);

    tarefas.forEach((t) => {
      const lista = map.get(t.status) || [];
      map.set(t.status, [...lista, t]);
    });

    return map;
  },

  // Colaboradores
  adicionarColaboradorTarefa: (tarefaId, colaboradorId, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'atribuicao',
      descricao: `Colaborador adicionado`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              colaboradorIds: [...new Set([...t.colaboradorIds, colaboradorId])],
              atualizadoEm: new Date().toISOString(),
              logs: [...(t.logs || []), log],
            }
          : t
      ),
    };
  }),

  removerColaboradorTarefa: (tarefaId, colaboradorId, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'atribuicao',
      descricao: `Colaborador removido`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            colaboradorIds: t.colaboradorIds.filter((c) => c !== colaboradorId),
            atualizadoEm: new Date().toISOString(),
            logs: [...(t.logs || []), log],
          }
        : t
    ),
    };
  }),

  // Watchers
  adicionarWatcher: (tarefaId, userId, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'edicao',
      descricao: `Seguidor adicionado`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              watcherIds: [...new Set([...(t.watcherIds || []), userId])],
              atualizadoEm: new Date().toISOString(),
              logs: [...(t.logs || []), log],
            }
          : t
      ),
    };
  }),

  removerWatcher: (tarefaId, userId, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'edicao',
      descricao: `Seguidor removido`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              watcherIds: (t.watcherIds || []).filter(id => id !== userId),
              atualizadoEm: new Date().toISOString(),
              logs: [...(t.logs || []), log],
            }
          : t
      ),
    };
  }),

  toggleWatcher: (tarefaId, userId, usuarioNome = 'Sistema') => {
    const tarefa = get().tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    
    const isWatching = (tarefa.watcherIds || []).includes(userId);
    if (isWatching) {
      get().removerWatcher(tarefaId, userId, usuarioNome);
    } else {
      get().adicionarWatcher(tarefaId, userId, usuarioNome);
    }
  },

  // Timesheet
  adicionarTempoTarefa: (tarefaId, tempo, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'edicao',
      descricao: `Tempo adicionado: ${tempo.horasRegistradas}h`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            tempos: [...t.tempos, { ...tempo, id: randomId(), criadoEm: new Date().toISOString() }],
            tempoTotalHoras: t.tempoTotalHoras + tempo.horasRegistradas,
            atualizadoEm: new Date().toISOString(),
            logs: [...(t.logs || []), log],
          }
        : t
    ),
    };
  }),

  removerTempoTarefa: (tarefaId, tempoId, usuarioNome = 'Sistema') => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const tempoRemovido = tarefa.tempos.find(tp => tp.id === tempoId);
    
    const log: LogTarefa = {
      id: randomId(),
      tarefaId,
      acao: 'edicao',
      descricao: `Tempo removido: ${tempoRemovido?.horasRegistradas || 0}h`,
      usuarioId: '',
      usuarioNome,
      criadoEm: new Date().toISOString(),
    };
    
    return {
      tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            tempos: t.tempos.filter((tp) => tp.id !== tempoId),
            tempoTotalHoras: t.tempos.reduce((sum, tp) => (tp.id === tempoId ? sum : sum + tp.horasRegistradas), t.tempoTotalHoras),
            atualizadoEm: new Date().toISOString(),
            logs: [...(t.logs || []), log],
          }
        : t
    ),
    };
  }),

  // Tags
  criarTag: (tag) => set((state) => ({
    tags: [
      ...state.tags,
      {
        ...tag,
        id: randomId(),
        criadoEm: new Date().toISOString(),
      },
    ],
  })),

  adicionarTagTarefa: (tarefaId, tag) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            tags: [...new Set([...t.tags, tag])],
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  removerTagTarefa: (tarefaId, tagId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            tags: t.tags.filter((tg) => tg.id !== tagId),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  // Comentários
  adicionarComentario: (tarefaId, texto, usuarioId, usuarioNome) => set((state) => {
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return state;
    
    const comentario: ComentarioTarefa = {
      id: randomId(),
      tarefaId,
      texto,
      usuarioId,
      usuarioNome,
      criadoEm: new Date().toISOString(),
      mentions: texto.match(/@\[([^\]]+)\]\(([^)]+)\)/g)?.map(m => m.match(/\(([^)]+)\)/)?.[1] || '') || [],
    };

    // Notificar watchers sobre novo comentário (exceto o próprio comentador)
    if (tarefa.watcherIds && tarefa.watcherIds.length > 0) {
      try {
        const watchersParaNotificar = tarefa.watcherIds.filter(wId => wId !== usuarioId);
        if (watchersParaNotificar.length > 0) {
          useNotificacoesStore.getState().notificarWatchersTarefa(
            watchersParaNotificar,
            tarefa.titulo,
            'comentada',
            `${usuarioNome} comentou`,
            `/tarefas?id=${tarefaId}`
          );
        }
      } catch (e) {
        console.error('Erro ao notificar watchers:', e);
      }
    }

    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              comentarios: [...(t.comentarios || []), comentario],
              atualizadoEm: new Date().toISOString(),
            }
          : t
      ),
    };
  }),

  editarComentario: (tarefaId, comentarioId, texto) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            comentarios: t.comentarios.map((c) =>
              c.id === comentarioId
                ? { ...c, texto, atualizadoEm: new Date().toISOString() }
                : c
            ),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  deletarComentario: (tarefaId, comentarioId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            comentarios: t.comentarios.filter((c) => c.id !== comentarioId),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  // Anexos
  adicionarAnexo: (tarefaId, anexoData) => set((state) => {
    const anexo: AnexoTarefa = {
      ...anexoData,
      id: randomId(),
      tarefaId,
      criadoEm: new Date().toISOString(),
    };

    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              anexos: [...(t.anexos || []), anexo],
              atualizadoEm: new Date().toISOString(),
            }
          : t
      ),
    };
  }),

  removerAnexo: (tarefaId, anexoId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            anexos: t.anexos.filter((a) => a.id !== anexoId),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  // Checklist
  adicionarChecklistItem: (tarefaId, texto) => set((state) => {
    const tarefa = state.tarefas.find((t) => t.id === tarefaId);
    const novaOrdem = (tarefa?.checklist || []).length;
    
    const item: ChecklistItem = {
      id: randomId(),
      texto,
      concluido: false,
      ordem: novaOrdem,
    };

    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              checklist: [...(t.checklist || []), item],
              atualizadoEm: new Date().toISOString(),
            }
          : t
      ),
    };
  }),

  toggleChecklistItem: (tarefaId, itemId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            checklist: t.checklist.map((item) =>
              item.id === itemId ? { ...item, concluido: !item.concluido } : item
            ),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  editarChecklistItem: (tarefaId, itemId, texto) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            checklist: t.checklist.map((item) =>
              item.id === itemId ? { ...item, texto } : item
            ),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  deletarChecklistItem: (tarefaId, itemId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId
        ? {
            ...t,
            checklist: t.checklist.filter((item) => item.id !== itemId),
            atualizadoEm: new Date().toISOString(),
          }
        : t
    ),
  })),

  reordenarChecklist: (tarefaId, itemId, novaOrdem) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      const checklist = [...t.checklist];
      const itemIndex = checklist.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return t;

      const [movedItem] = checklist.splice(itemIndex, 1);
      checklist.splice(novaOrdem, 0, movedItem);

      return {
        ...t,
        checklist: checklist.map((item, index) => ({ ...item, ordem: index })),
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  // Subtasks
  adicionarSubtask: (tarefaId, titulo, tarefaPaiId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      const novaSubtask: Subtask = {
        id: randomId(),
        titulo,
        status: 'a_fazer',
        concluido: false,
        ordem: (t.subtasks?.length || 0),
        subtasks: [],
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (tarefaPaiId) {
        // Adicionar a uma subtask aninhada
        return {
          ...t,
          subtasks: encontrarEAtualizarSubtask(t.subtasks || [], tarefaPaiId, (pai) => ({
            ...pai,
            subtasks: [...(pai.subtasks || []), novaSubtask],
          })),
          atualizadoEm: new Date().toISOString(),
        };
      }

      return {
        ...t,
        subtasks: [...(t.subtasks || []), novaSubtask],
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  editarSubtask: (tarefaId, subtaskId, titulo, tarefaPaiId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      if (tarefaPaiId) {
        return {
          ...t,
          subtasks: encontrarEAtualizarSubtask(t.subtasks || [], tarefaPaiId, (pai) => ({
            ...pai,
            subtasks: encontrarEAtualizarSubtask(pai.subtasks || [], subtaskId, (s) => ({
              ...s,
              titulo,
              atualizadoEm: new Date().toISOString(),
            })),
          })),
          atualizadoEm: new Date().toISOString(),
        };
      }

      return {
        ...t,
        subtasks: encontrarEAtualizarSubtask(t.subtasks || [], subtaskId, (s) => ({
          ...s,
          titulo,
          atualizadoEm: new Date().toISOString(),
        })),
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  deletarSubtask: (tarefaId, subtaskId, tarefaPaiId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      if (tarefaPaiId) {
        return {
          ...t,
          subtasks: encontrarEAtualizarSubtask(t.subtasks || [], tarefaPaiId, (pai) => ({
            ...pai,
            subtasks: encontrarEDeletarSubtask(pai.subtasks || [], subtaskId),
          })),
          atualizadoEm: new Date().toISOString(),
        };
      }

      return {
        ...t,
        subtasks: encontrarEDeletarSubtask(t.subtasks || [], subtaskId),
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  toggleSubtask: (tarefaId, subtaskId, tarefaPaiId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      if (tarefaPaiId) {
        return {
          ...t,
          subtasks: encontrarEAtualizarSubtask(t.subtasks || [], tarefaPaiId, (pai) => ({
            ...pai,
            subtasks: encontrarEAtualizarSubtask(pai.subtasks || [], subtaskId, (s) => ({
              ...s,
              concluido: !s.concluido,
              status: !s.concluido ? 'feito' : 'a_fazer',
              atualizadoEm: new Date().toISOString(),
            })),
          })),
          atualizadoEm: new Date().toISOString(),
        };
      }

      return {
        ...t,
        subtasks: encontrarEAtualizarSubtask(t.subtasks || [], subtaskId, (s) => ({
          ...s,
          concluido: !s.concluido,
          status: !s.concluido ? 'feito' : 'a_fazer',
          atualizadoEm: new Date().toISOString(),
        })),
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  reordenarSubtasks: (tarefaId, subtaskId, novaOrdem, tarefaPaiId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id !== tarefaId) return t;

      const atualizarOrdenacao = (subtasks: Subtask[]): Subtask[] => {
        const index = subtasks.findIndex(s => s.id === subtaskId);
        if (index === -1) return subtasks;

        const novaLista = [...subtasks];
        const [item] = novaLista.splice(index, 1);
        novaLista.splice(novaOrdem, 0, item);
        return novaLista.map((s, i) => ({ ...s, ordem: i }));
      };

      if (tarefaPaiId) {
        return {
          ...t,
          subtasks: encontrarEAtualizarSubtask(t.subtasks || [], tarefaPaiId, (pai) => ({
            ...pai,
            subtasks: atualizarOrdenacao(pai.subtasks || []),
          })),
          atualizadoEm: new Date().toISOString(),
        };
      }

      return {
        ...t,
        subtasks: atualizarOrdenacao(t.subtasks || []),
        atualizadoEm: new Date().toISOString(),
      };
    }),
  })),

  obterProgressoSubtasks: (tarefaId) => {
    const state = get();
    const tarefa = state.tarefas.find(t => t.id === tarefaId);
    if (!tarefa || !tarefa.subtasks) {
      return { total: 0, completas: 0, percentual: 0 };
    }
    return calcularProgressoSubtasks(tarefa.subtasks);
  },

  // Dependências
  adicionarDependencia: (tarefaId, dependsOnId) => {
    const state = get();
    
    // Validar ciclo
    if (detectarCicloDependencia(tarefaId, dependsOnId, state.tarefas)) {
      return { sucesso: false, erro: 'Não é possível criar uma dependência circular' };
    }
    
    // Validar que a tarefa existe
    if (!state.tarefas.find(t => t.id === dependsOnId)) {
      return { sucesso: false, erro: 'Tarefa dependência não encontrada' };
    }
    
    set((state) => ({
      tarefas: state.tarefas.map((t) => {
        if (t.id === tarefaId && !t.dependsOn?.includes(dependsOnId)) {
          // Adicionar dependência
          const depTarefa = state.tarefas.find(dt => dt.id === dependsOnId);
          return {
            ...t,
            dependsOn: [...(t.dependsOn || []), dependsOnId],
            atualizadoEm: new Date().toISOString(),
          };
        }
        if (t.id === dependsOnId) {
          // Adicionar à lista de bloqueadores
          return {
            ...t,
            blocks: [...(t.blocks || []), tarefaId],
            atualizadoEm: new Date().toISOString(),
          };
        }
        return t;
      }),
    }));
    
    return { sucesso: true };
  },

  removerDependencia: (tarefaId, dependsOnId) => set((state) => ({
    tarefas: state.tarefas.map((t) => {
      if (t.id === tarefaId) {
        return {
          ...t,
          dependsOn: t.dependsOn?.filter(id => id !== dependsOnId) || [],
          atualizadoEm: new Date().toISOString(),
        };
      }
      if (t.id === dependsOnId) {
        return {
          ...t,
          blocks: t.blocks?.filter(id => id !== tarefaId) || [],
          atualizadoEm: new Date().toISOString(),
        };
      }
      return t;
    }),
  })),

  obterBloqueadoresUIState: (tarefaId) => {
    const state = get();
    return obterBloqueadores(tarefaId, state.tarefas);
  },

  obterTarefasBloqueadasUIState: (tarefaId) => {
    const state = get();
    return obterTarefasBloqueiadas(tarefaId, state.tarefas);
  },

  validarDependenciasUI: (tarefaId) => {
    const state = get();
    return validarDependenciasAtendidas(tarefaId, state.tarefas);
  },

  // Templates
  criarTemplate: (template) => set((state) => ({
    templates: [
      ...state.templates,
      {
        ...template,
        id: randomId(),
        proximaExecucao: calcularProximaExecucao(template as TemplateTarefa),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      } as TemplateTarefa,
    ],
  })),

  atualizarTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id
        ? { ...t, ...updates, atualizadoEm: new Date().toISOString() }
        : t
    ),
  })),

  deletarTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id),
  })),

  executarTemplate: (templateId) => set((state) => {
    const template = state.templates.find((t) => t.id === templateId);
    if (!template) return state;

    const novaTarefa: Tarefa = {
      id: randomId(),
      titulo: template.titulo,
      descricao: template.descricao,
      status: 'a_fazer',
      colaboradorIds: template.colaboradorIds,
      tags: template.tags,
      tempos: [],
      tempoTotalHoras: 0,
      dataCriacao: new Date().toISOString(),
      dataVencimento: template.dataFim,
      prioridade: template.prioridade,
      templateTarefaId: templateId,
      okrId: template.okrId,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      watcherIds: [],
      logs: [],
      comentarios: [],
      anexos: [],
      checklist: [],
      dependsOn: [],
      blocks: [],
    };

    return {
      tarefas: [...state.tarefas, novaTarefa],
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              ultimaExecucao: new Date().toISOString(),
              proximaExecucao: calcularProximaExecucao(t),
              atualizadoEm: new Date().toISOString(),
            }
          : t
      ),
    };
  }),

  processarTemplatesRepetitivos: () => set((state) => {
    const agora = new Date();
    let tarefasAdicionar: Tarefa[] = [];
    let templatesAtualizar: TemplateTarefa[] = [];

    state.templates.forEach((template) => {
      if (!template.ativa) return;

      const proximaExecucao = template.proximaExecucao ? new Date(template.proximaExecucao) : null;
      const dataFim = template.dataFim ? new Date(template.dataFim) : null;

      // Verificar se é hora de executar e se ainda está dentro do período
      if (proximaExecucao && proximaExecucao <= agora && (!dataFim || dataFim > agora)) {
        const novaTarefa: Tarefa = {
          id: randomId(),
          titulo: template.titulo,
          descricao: template.descricao,
          status: 'a_fazer',
          colaboradorIds: template.colaboradorIds,
          tags: template.tags,
          tempos: [],
          tempoTotalHoras: 0,
          dataCriacao: agora.toISOString(),
          dataVencimento: template.dataFim,
          prioridade: template.prioridade,
          templateTarefaId: template.id,
          okrId: template.okrId,
          criadoEm: agora.toISOString(),
          atualizadoEm: agora.toISOString(),
          watcherIds: [],
          logs: [],
          comentarios: [],
          anexos: [],
          checklist: [],
          dependsOn: [],
          blocks: [],
        };

        tarefasAdicionar.push(novaTarefa);

        templatesAtualizar.push({
          ...template,
          ultimaExecucao: agora.toISOString(),
          proximaExecucao: calcularProximaExecucao(template),
          atualizadoEm: agora.toISOString(),
        });
      }
    });

    const templatesMap = new Map(templatesAtualizar.map((t) => [t.id, t]));

    return {
      tarefas: [...state.tarefas, ...tarefasAdicionar],
      templates: state.templates.map((t) => templatesMap.get(t.id) || t),
    };
  }),

  // Filtros
  setFiltroStatus: (status) => set({ filtroStatus: status }),
  setFiltroSetorId: (setorId) => set({ filtroSetorId: setorId }),
  setFiltroColaboradorId: (colaboradorId) => set({ filtroColaboradorId: colaboradorId }),
  resetFiltros: () => set({
    filtroStatus: undefined,
    filtroSetorId: undefined,
    filtroColaboradorId: undefined,
  }),

  getTarefasFiltradas: () => {
    const state = get();
    return state.tarefas.filter((tarefa) => {
      if (state.filtroStatus && tarefa.status !== state.filtroStatus) return false;
      if (
        state.filtroColaboradorId &&
        !tarefa.colaboradorIds.includes(state.filtroColaboradorId)
      ) {
        return false;
      }
      return true;
    });
  },

  // Sorting
  ordenarTarefasPor: (campo, direcao) => {
    const tarefas = [...get().tarefas];
    
    tarefas.sort((a, b) => {
      let valorA: any;
      let valorB: any;
      
      switch (campo) {
        case 'prioridade': {
          const prioridadeOrdem: Record<string, number> = { alta: 3, media: 2, baixa: 1, urgente: 4 };
          valorA = prioridadeOrdem[a.prioridade] || 0;
          valorB = prioridadeOrdem[b.prioridade] || 0;
          break;
        }
        case 'dataVencimento':
          valorA = a.dataVencimento ? new Date(a.dataVencimento).getTime() : Infinity;
          valorB = b.dataVencimento ? new Date(b.dataVencimento).getTime() : Infinity;
          break;
        case 'titulo':
          valorA = a.titulo.toLowerCase();
          valorB = b.titulo.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
      return 0;
    });
    
    return tarefas;
  },

  // Milestones
  criarMilestone: (milestoneData) => set((state) => ({
    milestones: [
      ...state.milestones,
      {
        ...milestoneData,
        id: randomId(),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
    ],
  })),

  atualizarMilestone: (id, updates) => set((state) => ({
    milestones: state.milestones.map((m) =>
      m.id === id
        ? { ...m, ...updates, atualizadoEm: new Date().toISOString() }
        : m
    ),
  })),

  deletarMilestone: (id) => set((state) => ({
    milestones: state.milestones.filter((m) => m.id !== id),
    tarefas: state.tarefas.map((t) =>
      t.milestoneId === id ? { ...t, milestoneId: undefined } : t
    ),
  })),

  vincularTarefaAMilestone: (tarefaId, milestoneId) => set((state) => ({
    tarefas: state.tarefas.map((t) =>
      t.id === tarefaId ? { ...t, milestoneId } : t
    ),
    milestones: state.milestones.map((m) =>
      m.id === milestoneId && !m.tarefaIds.includes(tarefaId)
        ? { ...m, tarefaIds: [...m.tarefaIds, tarefaId] }
        : m
    ),
  })),

  desvincularTarefaDeMilestone: (tarefaId) => set((state) => {
    const tarefa = state.tarefas.find((t) => t.id === tarefaId);
    return {
      tarefas: state.tarefas.map((t) =>
        t.id === tarefaId ? { ...t, milestoneId: undefined } : t
      ),
      milestones: state.milestones.map((m) =>
        tarefa?.milestoneId === m.id
          ? { ...m, tarefaIds: m.tarefaIds.filter((id) => id !== tarefaId) }
          : m
      ),
    };
  }),

  // Kanban Columns
  criarColuna: (coluna) => set((state) => {
    const novaColuna: KanbanColumn = {
      ...coluna,
      id: randomId(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    return {
      kanbanColumns: [...state.kanbanColumns, novaColuna],
    };
  }),

  atualizarColuna: (id, updates) => set((state) => ({
    kanbanColumns: state.kanbanColumns.map((col) =>
      col.id === id
        ? { ...col, ...updates, atualizadoEm: new Date().toISOString() }
        : col
    ),
  })),

  deletarColuna: (id) => set((state) => {
    const coluna = state.kanbanColumns.find((c) => c.id === id);
    if (coluna?.isPadrao) {
      console.warn('Não é possível deletar colunas padrão');
      return state;
    }
    
    // Move tarefas da coluna deletada para "A Fazer"
    const tarefasAtualizadas = state.tarefas.map((t) =>
      t.status === id ? { ...t, status: 'a_fazer' } : t
    );
    
    return {
      kanbanColumns: state.kanbanColumns.filter((col) => col.id !== id),
      tarefas: tarefasAtualizadas,
    };
  }),

  reordenarColunas: (colunaId, novaOrdem) => set((state) => {
    const colunaAtual = state.kanbanColumns.find((c) => c.id === colunaId);
    if (!colunaAtual) return state;
    
    const ordemAtual = colunaAtual.ordem;
    
    const colunasAtualizadas = state.kanbanColumns.map((col) => {
      if (col.id === colunaId) {
        return { ...col, ordem: novaOrdem };
      }
      if (novaOrdem < ordemAtual && col.ordem >= novaOrdem && col.ordem < ordemAtual) {
        return { ...col, ordem: col.ordem + 1 };
      }
      if (novaOrdem > ordemAtual && col.ordem <= novaOrdem && col.ordem > ordemAtual) {
        return { ...col, ordem: col.ordem - 1 };
      }
      return col;
    });
    
    return { kanbanColumns: colunasAtualizadas.sort((a, b) => a.ordem - b.ordem) };
  }),

  resetarColunasKanban: () => set({
    kanbanColumns: [
      {
        id: 'a_fazer',
        nome: 'A Fazer',
        cor: '#EF4444',
        ordem: 0,
        isPadrao: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 'fazendo',
        nome: 'Fazendo',
        cor: '#F59E0B',
        ordem: 1,
        isPadrao: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 'feito',
        nome: 'Feito',
        cor: '#10B981',
        ordem: 2,
        isPadrao: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
    ],
  }),
}),
  {
    name: 'tarefas-storage',
    partialize: (state) => ({
      tarefas: state.tarefas,
      templates: state.templates,
      tags: state.tags,
      milestones: state.milestones,
      kanbanColumns: state.kanbanColumns,
    }),
  }
)
);
