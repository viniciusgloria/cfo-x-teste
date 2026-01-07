import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 
  | 'registrar-ponto'
  | 'nova-solicitacao'
  | 'agendar-sala'
  | 'ver-mural'
  | 'banco-horas'
  | 'grafico-horas'
  | 'solicitacoes-pendentes'
  | 'reunioes-hoje'
  | 'okrs'
  | 'feedbacks'
  | 'clientes'
  | 'colaboradores'
  | 'configuracoes'
  | 'ajustes-ponto'
  | 'relatorios'
  | 'card-banco-horas'
  | 'card-solicitacoes'
  | 'card-reunioes'
  | 'ultimos-registros'
  | 'mural-recente';

export type SectionType = 'indice' | 'acoes-rapidas' | 'cards';

export interface Widget {
  id: string;
  type: WidgetType;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
  section: SectionType;
  gridPosition?: {
    row: number;
    col: number;
    width: number; // largura em colunas (1-4)
    height: number; // altura em unidades
  };
}

interface DashboardState {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  updateWidgetPosition: (id: string, position: { row: number; col: number; width: number; height: number }) => void;
  reset: () => void;
}

const defaultWidgets: Widget[] = [
  // Seção: Índice
  { id: 'card-banco-horas', type: 'card-banco-horas', label: 'Banco de Horas', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 0, section: 'indice' },
  { id: 'card-solicitacoes', type: 'card-solicitacoes', label: 'Solicitações', icon: 'FileText', color: 'bg-[#F59E0B]', enabled: true, order: 1, section: 'indice' },
  { id: 'card-reunioes', type: 'card-reunioes', label: 'Reuniões Hoje', icon: 'Calendar', color: 'bg-[#3B82F6]', enabled: true, order: 2, section: 'indice' },
  
  // Seção: Ações Rápidas
  { id: 'registrar-ponto', type: 'registrar-ponto', label: 'Registrar Ponto', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 0, section: 'acoes-rapidas' },
  { id: 'nova-solicitacao', type: 'nova-solicitacao', label: 'Nova Solicitação', icon: 'Plus', color: 'bg-[#3B82F6]', enabled: true, order: 1, section: 'acoes-rapidas' },
  { id: 'agendar-sala', type: 'agendar-sala', label: 'Agendar Sala', icon: 'Calendar', color: 'bg-[#8B5CF6]', enabled: true, order: 2, section: 'acoes-rapidas' },
  { id: 'ver-mural', type: 'ver-mural', label: 'Ver Mural', icon: 'MessageSquare', color: 'bg-[#F59E0B]', enabled: true, order: 3, section: 'acoes-rapidas' },
  { id: 'banco-horas', type: 'banco-horas', label: 'Banco de Horas', icon: 'TrendingUp', color: 'bg-[#10B981]', enabled: false, order: 4, section: 'acoes-rapidas' },
  { id: 'solicitacoes-pendentes', type: 'solicitacoes-pendentes', label: 'Solicitações Pendentes', icon: 'FileText', color: 'bg-[#EF4444]', enabled: false, order: 5, section: 'acoes-rapidas' },
  { id: 'reunioes-hoje', type: 'reunioes-hoje', label: 'Reuniões Hoje', icon: 'Users', color: 'bg-[#3B82F6]', enabled: false, order: 6, section: 'acoes-rapidas' },
  { id: 'okrs', type: 'okrs', label: 'Meus OKRs', icon: 'Target', color: 'bg-[#8B5CF6]', enabled: false, order: 7, section: 'acoes-rapidas' },
  { id: 'feedbacks', type: 'feedbacks', label: 'Feedbacks', icon: 'MessageCircle', color: 'bg-[#F59E0B]', enabled: false, order: 8, section: 'acoes-rapidas' },
  { id: 'clientes', type: 'clientes', label: 'Clientes', icon: 'Briefcase', color: 'bg-[#6366F1]', enabled: false, order: 9, section: 'acoes-rapidas' },
  { id: 'colaboradores', type: 'colaboradores', label: 'Colaboradores', icon: 'UsersRound', color: 'bg-[#EC4899]', enabled: false, order: 10, section: 'acoes-rapidas' },
  { id: 'configuracoes', type: 'configuracoes', label: 'Configurações', icon: 'Settings', color: 'bg-[#64748B]', enabled: false, order: 11, section: 'acoes-rapidas' },
  { id: 'ajustes-ponto', type: 'ajustes-ponto', label: 'Ajustes de Ponto', icon: 'Edit3', color: 'bg-[#F97316]', enabled: false, order: 12, section: 'acoes-rapidas' },
  { id: 'relatorios', type: 'relatorios', label: 'Relatórios', icon: 'FileBarChart2', color: 'bg-[#14B8A6]', enabled: false, order: 13, section: 'acoes-rapidas' },
  
  // Seção: Cards
  { id: 'grafico-horas', type: 'grafico-horas', label: 'Gráfico de Horas', icon: 'BarChart', color: 'bg-[#6366F1]', enabled: true, order: 0, section: 'cards' },
  { id: 'ultimos-registros', type: 'ultimos-registros', label: 'Últimos Registros', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 1, section: 'cards' },
  { id: 'mural-recente', type: 'mural-recente', label: 'Mural Recente', icon: 'MessageSquare', color: 'bg-[#F59E0B]', enabled: true, order: 2, section: 'cards' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
        })),
      reorderWidgets: (widgets) => {
        set({ widgets });
      },
      updateWidgetPosition: (id, position) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, gridPosition: position } : w)),
        })),
      reset: () => set({ widgets: defaultWidgets }),
    }),
    { 
      name: 'cfo:dashboard', 
      partialize: (s) => ({ widgets: s.widgets }),
      // Validar e corrigir dados ao carregar do localStorage
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Validar se widgets existe e é um array válido
        if (!Array.isArray(state.widgets) || state.widgets.length === 0) {
          state.widgets = defaultWidgets;
          return;
        }

        // Criar mapa para rápida consulta do defaultWidgets
        const defaultWidgetsMap = new Map(defaultWidgets.map(w => [w.id, w]));
        
        // Processar cada widget: se existir no default, usar o default com apenas enabled preservado
        const processedWidgets = state.widgets
          .map(widget => {
            const defaultWidget = defaultWidgetsMap.get(widget.id);
            if (defaultWidget) {
              // Usar TUDO do defaultWidget e apenas preservar enabled do localStorage
              return {
                ...defaultWidget,
                enabled: widget.enabled ?? defaultWidget.enabled,
              };
            }
            // Se não está no default, remover (não é mais válido)
            return null;
          })
          .filter((w) => w !== null);

        // Adicionar widgets faltantes que estão no default mas não estavam no localStorage
        const existingIds = new Set(processedWidgets.map(w => w.id));
        const missingWidgets = defaultWidgets.filter(w => !existingIds.has(w.id));

        // Combinar e ordenar
        state.widgets = [...processedWidgets, ...missingWidgets].sort((a, b) => {
          const sectionOrder: Record<string, number> = {
            'indice': 0,
            'acoes-rapidas': 1,
            'cards': 2,
          };
          const sectionDiff = (sectionOrder[a.section] || 999) - (sectionOrder[b.section] || 999);
          if (sectionDiff !== 0) return sectionDiff;
          return a.order - b.order;
        });

        // Sobrescrever o localStorage com a versão normalizada
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const key = 'cfo:dashboard';
            const payload = JSON.stringify({ state: { widgets: state.widgets } });
            window.localStorage.setItem(key, payload);
          }
        } catch (e) {
          // falhar silenciosamente
        }
      }
    }
  )
);
