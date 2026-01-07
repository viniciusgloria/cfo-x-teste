import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useColaboradoresStore } from './colaboradoresStore';
import { useNotificacoesStore } from './notificacoesStore';

export type TipoLembrete = 
  | 'contrato_experiencia' 
  | 'ferias_vencendo' 
  | 'ferias_periodo' 
  | 'documento_vencendo'
  | 'aniversario'
  | 'avaliacao_desempenho'
  | 'contrato_vencendo'
  | 'outro';

export type PrioridadeLembrete = 'alta' | 'media' | 'baixa';

export type StatusLembrete = 'pendente' | 'visualizado' | 'concluido' | 'dispensado';

export interface Lembrete {
  id: string;
  tipo: TipoLembrete;
  prioridade: PrioridadeLembrete;
  status: StatusLembrete;
  titulo: string;
  descricao: string;
  colaboradorId?: string;
  colaboradorNome?: string;
  dataEvento: string; // Data do evento (ex: vencimento)
  dataLembrete: string; // Data que o lembrete foi criado
  dataVisualizacao?: string;
  dataConclusao?: string;
  acoes?: AcaoLembrete[];
  metadados?: Record<string, any>;
}

export interface AcaoLembrete {
  label: string;
  tipo: 'link' | 'acao';
  destino?: string; // Para links
  callback?: string; // Nome da ação
}

interface LembretesState {
  lembretes: Lembrete[];
  configuracoes: {
    diasAntesContratoExperiencia: number;
    diasAntesFerias: number;
    diasAntesDocumento: number;
    diasAntesAniversario: number;
    notificarAniversarios: boolean;
    notificarFerias: boolean;
  };
  gerarLembretesAutomaticos: () => void;
  adicionarLembrete: (lembrete: Omit<Lembrete, 'id' | 'dataLembrete'>) => void;
  marcarComoVisualizado: (id: string) => void;
  marcarComoConcluido: (id: string) => void;
  dispensarLembrete: (id: string) => void;
  getLembretesPendentes: () => Lembrete[];
  getLembretesPorPrioridade: (prioridade: PrioridadeLembrete) => Lembrete[];
  getLembretesPorTipo: (tipo: TipoLembrete) => Lembrete[];
  getLembretesHoje: () => Lembrete[];
  atualizarConfiguracoes: (config: Partial<LembretesState['configuracoes']>) => void;
  limparLembretesAntigos: (diasRetencao: number) => void;
  reset: () => void;
}

const configuracoesDefault = {
  diasAntesContratoExperiencia: 15, // Alertar 15 dias antes do vencimento
  diasAntesFerias: 30, // Alertar 30 dias antes
  diasAntesDocumento: 30,
  diasAntesAniversario: 3,
  notificarAniversarios: true,
  notificarFerias: true,
};

function calcularDiasAte(dataFutura: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataEvento = new Date(dataFutura);
  dataEvento.setHours(0, 0, 0, 0);
  const diff = dataEvento.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function adicionarDias(data: Date, dias: number): Date {
  const result = new Date(data);
  result.setDate(result.getDate() + dias);
  return result;
}

function formatarData(data: Date): string {
  return data.toISOString().split('T')[0];
}

export const useLembretesStore = create<LembretesState>()(
  persist(
    (set, get) => ({
      lembretes: [],
      configuracoes: configuracoesDefault,

      gerarLembretesAutomaticos: () => {
        const { colaboradores } = useColaboradoresStore.getState();
        const config = get().configuracoes;
        const hoje = new Date();
        const novosLembretes: Lembrete[] = [];
        const lembretesExistentes = get().lembretes;

        // Função para verificar se já existe lembrete similar
        const jaExiste = (tipo: TipoLembrete, colaboradorId: string, dataEvento: string) => {
          return lembretesExistentes.some(
            (l) =>
              l.tipo === tipo &&
              l.colaboradorId === colaboradorId &&
              l.dataEvento === dataEvento &&
              l.status !== 'dispensado'
          );
        };

        colaboradores.forEach((colab: any) => {
          // 1. Contratos de Experiência
          if (colab.dataAdmissao && colab.regime === 'CLT') {
            const dataAdmissao = new Date(colab.dataAdmissao);
            // Contrato de experiência padrão: 45 dias + 45 dias = 90 dias
            const fimExperiencia45 = adicionarDias(dataAdmissao, 45);
            const fimExperiencia90 = adicionarDias(dataAdmissao, 90);

            const diasAte45 = calcularDiasAte(formatarData(fimExperiencia45));
            const diasAte90 = calcularDiasAte(formatarData(fimExperiencia90));

            // Alerta para primeira fase (45 dias)
            if (
              diasAte45 > 0 &&
              diasAte45 <= config.diasAntesContratoExperiencia &&
              !jaExiste('contrato_experiencia', colab.id.toString(), formatarData(fimExperiencia45))
            ) {
              novosLembretes.push({
                id: `exp45-${colab.id}-${Date.now()}`,
                tipo: 'contrato_experiencia',
                prioridade: diasAte45 <= 7 ? 'alta' : 'media',
                status: 'pendente',
                titulo: `Fim do 1º período de experiência - ${colab.nome}`,
                descricao: `O primeiro período de experiência de 45 dias termina em ${diasAte45} dias (${fimExperiencia45.toLocaleDateString('pt-BR')}). Avalie se deseja prorrogar ou efetivar.`,
                colaboradorId: colab.id.toString(),
                colaboradorNome: colab.nome,
                dataEvento: formatarData(fimExperiencia45),
                dataLembrete: formatarData(hoje),
                acoes: [
                  { label: 'Ver Colaborador', tipo: 'link', destino: '/colaboradores' },
                  { label: 'Agendar Avaliação', tipo: 'acao', callback: 'agendar_avaliacao' },
                ],
                metadados: { fase: '45dias', diasRestantes: diasAte45 },
              });
              useNotificacoesStore.getState().adicionarNotificacaoDeLembrete({
                id: `exp45-${colab.id}-${Date.now()}`,
                titulo: `Fim do 1º período de experiência - ${colab.nome}`,
                descricao: `Termina em ${diasAte45} dias (${fimExperiencia45.toLocaleDateString('pt-BR')}). Avalie prorrogação/efetivação.`,
                prioridade: diasAte45 <= 7 ? 'alta' : 'media',
                link: '/lembretes',
              });
            }

            // Alerta para segunda fase (90 dias)
            if (
              diasAte90 > 0 &&
              diasAte90 <= config.diasAntesContratoExperiencia &&
              !jaExiste('contrato_experiencia', colab.id.toString(), formatarData(fimExperiencia90))
            ) {
              novosLembretes.push({
                id: `exp90-${colab.id}-${Date.now()}`,
                tipo: 'contrato_experiencia',
                prioridade: diasAte90 <= 7 ? 'alta' : 'media',
                status: 'pendente',
                titulo: `Fim do contrato de experiência - ${colab.nome}`,
                descricao: `O contrato de experiência de 90 dias termina em ${diasAte90} dias (${fimExperiencia90.toLocaleDateString('pt-BR')}). Necessário formalizar a efetivação ou desligamento.`,
                colaboradorId: colab.id.toString(),
                colaboradorNome: colab.nome,
                dataEvento: formatarData(fimExperiencia90),
                dataLembrete: formatarData(hoje),
                acoes: [
                  { label: 'Ver Colaborador', tipo: 'link', destino: '/colaboradores' },
                  { label: 'Processar Efetivação', tipo: 'acao', callback: 'processar_efetivacao' },
                ],
                metadados: { fase: '90dias', diasRestantes: diasAte90 },
              });
              useNotificacoesStore.getState().adicionarNotificacaoDeLembrete({
                id: `exp90-${colab.id}-${Date.now()}`,
                titulo: `Fim do contrato de experiência - ${colab.nome}`,
                descricao: `Termina em ${diasAte90} dias (${fimExperiencia90.toLocaleDateString('pt-BR')}). Formalize efetivação ou desligamento.`,
                prioridade: diasAte90 <= 7 ? 'alta' : 'media',
                link: '/lembretes',
              });
            }
          }

          // 2. Férias
          if (config.notificarFerias && colab.dataAdmissao) {
            const dataAdmissao = new Date(colab.dataAdmissao);
            const anosEmpresa = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24 * 365));

            if (anosEmpresa >= 1) {
              // Calcular aniversário de trabalho (direito a férias)
              const proximoAniversario = new Date(hoje.getFullYear(), dataAdmissao.getMonth(), dataAdmissao.getDate());
              
              // Se já passou este ano, considerar o próximo
              if (proximoAniversario < hoje) {
                proximoAniversario.setFullYear(hoje.getFullYear() + 1);
              }

              const diasAteFerias = calcularDiasAte(formatarData(proximoAniversario));

              if (
                diasAteFerias > 0 &&
                diasAteFerias <= config.diasAntesFerias &&
                !jaExiste('ferias_periodo', colab.id.toString(), formatarData(proximoAniversario))
              ) {
                novosLembretes.push({
                  id: `ferias-${colab.id}-${Date.now()}`,
                  tipo: 'ferias_periodo',
                  prioridade: diasAteFerias <= 15 ? 'alta' : 'media',
                  status: 'pendente',
                  titulo: `Período de férias - ${colab.nome}`,
                  descricao: `${colab.nome} completa ${anosEmpresa + 1} ano(s) de empresa em ${diasAteFerias} dias e tem direito a férias. Planeje o período com o colaborador.`,
                  colaboradorId: colab.id.toString(),
                  colaboradorNome: colab.nome,
                  dataEvento: formatarData(proximoAniversario),
                  dataLembrete: formatarData(hoje),
                  acoes: [
                    { label: 'Ver Colaborador', tipo: 'link', destino: '/colaboradores' },
                    { label: 'Agendar Férias', tipo: 'acao', callback: 'agendar_ferias' },
                  ],
                  metadados: { anosEmpresa: anosEmpresa + 1, diasRestantes: diasAteFerias },
                });
                useNotificacoesStore.getState().adicionarNotificacaoDeLembrete({
                  id: `ferias-${colab.id}-${Date.now()}`,
                  titulo: `Período de férias - ${colab.nome}`,
                  descricao: `${colab.nome} completa ${anosEmpresa + 1} ano(s) em ${diasAteFerias} dias. Planeje férias.`,
                  prioridade: diasAteFerias <= 15 ? 'alta' : 'media',
                  link: '/lembretes',
                });
              }
            }
          }

          // 3. Aniversários
          if (config.notificarAniversarios && colab.dataNascimento) {
            const dataNasc = new Date(colab.dataNascimento);
            const aniversarioEsteAno = new Date(hoje.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
            
            // Se já passou, considerar próximo ano
            if (aniversarioEsteAno < hoje) {
              aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
            }

            const diasAteAniversario = calcularDiasAte(formatarData(aniversarioEsteAno));

            if (
              diasAteAniversario >= 0 &&
              diasAteAniversario <= config.diasAntesAniversario &&
              !jaExiste('aniversario', colab.id.toString(), formatarData(aniversarioEsteAno))
            ) {
              const idade = hoje.getFullYear() - dataNasc.getFullYear();
              novosLembretes.push({
                id: `aniv-${colab.id}-${Date.now()}`,
                tipo: 'aniversario',
                prioridade: 'baixa',
                status: 'pendente',
                titulo: `Aniversário - ${colab.nome}`,
                descricao: `${colab.nome} fará ${idade} anos ${diasAteAniversario === 0 ? 'hoje' : `em ${diasAteAniversario} dia(s)`}. Não esqueça de parabenizar!`,
                colaboradorId: colab.id.toString(),
                colaboradorNome: colab.nome,
                dataEvento: formatarData(aniversarioEsteAno),
                dataLembrete: formatarData(hoje),
                metadados: { idade, diasRestantes: diasAteAniversario },
              });
              useNotificacoesStore.getState().adicionarNotificacaoDeLembrete({
                id: `aniv-${colab.id}-${Date.now()}`,
                titulo: `Aniversário - ${colab.nome}`,
                descricao: `${colab.nome} faz ${idade} anos ${diasAteAniversario === 0 ? 'hoje' : `em ${diasAteAniversario} dia(s)`}.`,
                prioridade: 'baixa',
                link: '/lembretes',
              });
            }
          }

          // 4. Documentos (se tiver campo de validade no futuro)
          // Pode ser expandido quando adicionar gestão de documentos
        });

        // Adicionar novos lembretes ao estado
        if (novosLembretes.length > 0) {
          set((state) => ({
            lembretes: [...state.lembretes, ...novosLembretes],
          }));
        }
      },

      adicionarLembrete: (lembrete) => {
        const novoLembrete: Lembrete = {
          ...lembrete,
          id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataLembrete: formatarData(new Date()),
        };
        set((state) => ({
          lembretes: [...state.lembretes, novoLembrete],
        }));
        useNotificacoesStore.getState().adicionarNotificacaoDeLembrete({
          id: novoLembrete.id,
          titulo: novoLembrete.titulo,
          descricao: novoLembrete.descricao,
          prioridade: novoLembrete.prioridade,
          link: '/lembretes',
        });
      },

      marcarComoVisualizado: (id) => {
        set((state) => ({
          lembretes: state.lembretes.map((l) =>
            l.id === id && l.status === 'pendente'
              ? { ...l, status: 'visualizado', dataVisualizacao: formatarData(new Date()) }
              : l
          ),
        }));
      },

      marcarComoConcluido: (id) => {
        set((state) => ({
          lembretes: state.lembretes.map((l) =>
            l.id === id
              ? { ...l, status: 'concluido', dataConclusao: formatarData(new Date()) }
              : l
          ),
        }));
      },

      dispensarLembrete: (id) => {
        set((state) => ({
          lembretes: state.lembretes.map((l) =>
            l.id === id ? { ...l, status: 'dispensado' } : l
          ),
        }));
      },

      getLembretesPendentes: () => {
        return get().lembretes.filter((l) => l.status === 'pendente' || l.status === 'visualizado');
      },

      getLembretesPorPrioridade: (prioridade) => {
        return get()
          .lembretes.filter((l) => l.prioridade === prioridade && (l.status === 'pendente' || l.status === 'visualizado'))
          .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
      },

      getLembretesPorTipo: (tipo) => {
        return get()
          .lembretes.filter((l) => l.tipo === tipo && (l.status === 'pendente' || l.status === 'visualizado'))
          .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
      },

      getLembretesHoje: () => {
        const hoje = formatarData(new Date());
        return get().lembretes.filter(
          (l) => l.dataEvento === hoje && (l.status === 'pendente' || l.status === 'visualizado')
        );
      },

      atualizarConfiguracoes: (config) => {
        set((state) => ({
          configuracoes: { ...state.configuracoes, ...config },
        }));
      },

      limparLembretesAntigos: (diasRetencao) => {
        const dataLimite = adicionarDias(new Date(), -diasRetencao);
        set((state) => ({
          lembretes: state.lembretes.filter((l) => {
            const dataEvento = new Date(l.dataEvento);
            return dataEvento >= dataLimite || l.status === 'pendente' || l.status === 'visualizado';
          }),
        }));
      },

      reset: () => set({ lembretes: [], configuracoes: configuracoesDefault }),
    }),
    {
      name: 'cfo:lembretes',
    }
  )
);
