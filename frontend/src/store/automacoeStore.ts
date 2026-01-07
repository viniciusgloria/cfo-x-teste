import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Automacao, AutomacaoTrigger, Tarefa, KanbanStatus } from '../types';

interface AutomacoesStore {
  automacoes: Automacao[];
  
  // CRUD
  criarAutomacao: (automacao: Omit<Automacao, 'id' | 'criadoEm' | 'atualizadoEm' | 'vezesExecutada'>) => void;
  atualizarAutomacao: (id: string, updates: Partial<Automacao>) => void;
  deletarAutomacao: (id: string) => void;
  obterAutomacao: (id: string) => Automacao | undefined;
  
  // Controle
  toggleAutomacao: (id: string) => void;
  
  // Execução
  executarAutomacoes: (trigger: AutomacaoTrigger, contexto: any) => { automatizadas: boolean; mensagem: string };
  obterAutomacoesPorTrigger: (trigger: AutomacaoTrigger) => Automacao[];
}

const criarAutomacaoStore = create<AutomacoesStore>()(
  persist(
    (set, get) => ({
      automacoes: [
        // Mock automação 1: Notificar quando tarefa criada com prioridade urgente
        {
          id: 'auto-1',
          nome: 'Notificar tarefas urgentes',
          descricao: 'Envia notificação quando uma tarefa urgente é criada',
          ativa: true,
          trigger: 'tarefa_criada',
          condicoes: [
            {
              tipo: 'prioridade',
              valor: 'urgente',
              operador: 'igual',
            },
          ],
          acoes: [
            {
              tipo: 'enviar_notificacao',
              parametros: {
                mensagem: '🚨 Nova tarefa urgente criada: {titulo}',
              },
            },
          ],
          ultimaExecucao: undefined,
          vezesExecutada: 0,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: 'admin',
        },
        // Mock automação 2: Mudar status para "fazendo" quando colaborador é atribuído
        {
          id: 'auto-2',
          nome: 'Iniciar tarefa ao atribuir',
          descricao: 'Muda status para Fazendo quando um colaborador é atribuído',
          ativa: true,
          trigger: 'colaborador_atribuido',
          condicoes: [],
          acoes: [
            {
              tipo: 'alterar_status',
              parametros: {
                status: 'fazendo' as KanbanStatus,
              },
            },
          ],
          ultimaExecucao: undefined,
          vezesExecutada: 0,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: 'admin',
        },
        // Mock automação 3: Alertar 3 dias antes do vencimento
        {
          id: 'auto-3',
          nome: 'Alerta de vencimento próximo',
          descricao: 'Notifica 3 dias antes do vencimento',
          ativa: true,
          trigger: 'vencimento_proximo',
          condicoes: [
            {
              tipo: 'dias_para_vencimento',
              valor: 3,
              operador: 'igual',
            },
          ],
          acoes: [
            {
              tipo: 'enviar_notificacao',
              parametros: {
                mensagem: '⏰ Tarefa {titulo} vence em 3 dias!',
              },
            },
          ],
          ultimaExecucao: undefined,
          vezesExecutada: 0,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: 'admin',
        },
      ],

      criarAutomacao: (automacao) => {
        const novaAutomacao: Automacao = {
          ...automacao,
          id: `auto-${Date.now()}`,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          vezesExecutada: 0,
        };

        set((state) => ({
          automacoes: [...state.automacoes, novaAutomacao],
        }));
      },

      atualizarAutomacao: (id, updates) => {
        set((state) => ({
          automacoes: state.automacoes.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...updates,
                  atualizadoEm: new Date().toISOString(),
                }
              : a
          ),
        }));
      },

      deletarAutomacao: (id) => {
        set((state) => ({
          automacoes: state.automacoes.filter((a) => a.id !== id),
        }));
      },

      obterAutomacao: (id) => {
        return get().automacoes.find((a) => a.id === id);
      },

      toggleAutomacao: (id) => {
        const automacao = get().obterAutomacao(id);
        if (automacao) {
          get().atualizarAutomacao(id, { ativa: !automacao.ativa });
        }
      },

      obterAutomacoesPorTrigger: (trigger) => {
        return get().automacoes.filter((a) => a.trigger === trigger && a.ativa);
      },

      executarAutomacoes: (trigger, contexto) => {
        const automacoes = get().obterAutomacoesPorTrigger(trigger);

        if (automacoes.length === 0) {
          return { automatizadas: false, mensagem: 'Nenhuma automação aplicável' };
        }

        // Simulação: executar todas as automações ativas para este trigger
        let executadas = 0;
        automacoes.forEach((automacao) => {
          // Validar condições
          const condicoesAtendidas = validarCondicoes(automacao.condicoes || [], contexto);

          if (condicoesAtendidas) {
            // Executar ações
            automacao.acoes.forEach((acao) => {
              executarAcao(acao, contexto);
            });

            // Registrar execução
            get().atualizarAutomacao(automacao.id, {
              ultimaExecucao: new Date().toISOString(),
              vezesExecutada: automacao.vezesExecutada + 1,
            });

            executadas++;
          }
        });

        return {
          automatizadas: executadas > 0,
          mensagem: `${executadas} automação(ões) executada(s)`,
        };
      },
    }),
    {
      name: 'automacoes-store',
    }
  )
);

// Helper functions
function validarCondicoes(condicoes: any[], contexto: any): boolean {
  if (condicoes.length === 0) return true;

  return condicoes.every((condicao) => {
    switch (condicao.tipo) {
      case 'prioridade':
        return contexto.prioridade === condicao.valor;
      case 'status':
        return contexto.status === condicao.valor;
      case 'dias_para_vencimento': {
        if (!contexto.dataVencimento) return false;
        const diasFaltando = Math.floor(
          (new Date(contexto.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return diasFaltando === condicao.valor;
      }
      case 'tag':
        return (contexto.tags || []).some((t: any) => t.nome === condicao.valor);
      default:
        return false;
    }
  });
}

function executarAcao(acao: any, contexto: any) {
  // As ações seriam executadas aqui
  // Por enquanto é simulado, no uso real integraríamos com o store de tarefas
  console.log('Executando ação:', acao.tipo, 'com parâmetros:', acao.parametros);
}

export const useAutomacoeStore = criarAutomacaoStore;
