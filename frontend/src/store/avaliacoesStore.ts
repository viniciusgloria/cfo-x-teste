import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificacoesStore } from './notificacoesStore';

export interface Avaliacao {
  id: number;
  avaliadorId: string;
  avaliadoId: string;
  periodo: string; // Ex: "2025-12" (YYYY-MM)
  status: 'pendente' | 'concluida';
  dataLimite: string;
  dataConclusao?: string;
  notas: {
    comunicacao: number;
    trabalhoEmEquipe: number;
    qualidadeTecnica: number;
    pontualidade: number;
    proatividade: number;
  };
  pontosFortes?: string;
  pontosDesenvolvimento?: string;
  comentarios?: string;
  projetos?: ProjetoRegistro[];
  cursos?: CursoRegistro[];
}

export interface ProjetoRegistro {
  id: string;
  nome: string;
  descricao?: string;
  data: string; // YYYY-MM-DD
}

export interface CursoRegistro {
  id: string;
  titulo: string;
  cargaHoraria?: number; // horas
  certificacao?: string;
  data: string; // YYYY-MM-DD
}

interface AvaliacoesState {
  avaliacoes: Avaliacao[];
  adicionarAvaliacao: (avaliacao: Omit<Avaliacao, 'id'>) => void;
  concluirAvaliacao: (id: number, dados: Partial<Avaliacao>) => void;
  getAvaliacoesPendentes: (userId: string) => Avaliacao[];
  getAvaliacoesRecebidas: (userId: string) => Avaliacao[];
  registrarProjeto: (avaliacaoId: number, projeto: ProjetoRegistro) => void;
  registrarCurso: (avaliacaoId: number, curso: CursoRegistro) => void;
  getResumoMensalEquipe: (mes: string, equipeUsuarioIds: string[]) => ResumoMensal;
  getMetricasParaRelatorios: (inicioMes: string, fimMes: string, equipeUsuarioIds: string[]) => MetricasRelatorio;
  reset: () => void;
}

export interface ResumoMensal {
  mes: string; // YYYY-MM
  totalAvaliacoes: number;
  concluidas: number;
  pendentes: number;
  mediaGeral: number; // 0-5
  mediasPorCompetencia: {
    comunicacao: number;
    trabalhoEmEquipe: number;
    qualidadeTecnica: number;
    pontualidade: number;
    proatividade: number;
  };
  projetosRealizados: number;
  cursosConcluidos: number;
}

export interface MetricasRelatorio {
  periodo: { inicioMes: string; fimMes: string };
  meses: ResumoMensal[];
  acumulados: {
    avaliacoes: number;
    concluidas: number;
    pendentes: number;
    mediaGeral: number;
    projetos: number;
    cursos: number;
  };
}

const mockAvaliacoes: Avaliacao[] = [];
export const useAvaliacoesStore = create<AvaliacoesState>()(
  persist(
    (set, get) => ({
      avaliacoes: mockAvaliacoes,

      adicionarAvaliacao: (avaliacao) => {
        const novaAvaliacao: Avaliacao = {
          ...avaliacao,
          id: Date.now(),
        };
        
        // Emitir notificação para o avaliado sobre nova avaliação pendente
        useNotificacoesStore.getState().adicionarNotificacao({
          tipo: 'avaliacao_pendente',
          titulo: 'Nova avaliação pendente',
          mensagem: `Você tem uma nova avaliação a ser realizada para o período ${avaliacao.periodo}. Prazo: ${avaliacao.dataLimite}`,
          link: '/avaliacoes',
          prioridade: 'media',
          categoria: 'desenvolvimento',
        });
        
        set((state) => ({
          avaliacoes: [...state.avaliacoes, novaAvaliacao],
        }));
      },

      concluirAvaliacao: (id, dados) => {
        set((state) => {
          const avaliacao = state.avaliacoes.find(a => a.id === id);
          
          if (avaliacao) {
            // Calcular média das notas
            const notas = dados.notas || avaliacao.notas;
            const media = (
              notas.comunicacao + 
              notas.trabalhoEmEquipe + 
              notas.qualidadeTecnica + 
              notas.pontualidade + 
              notas.proatividade
            ) / 5;
            
            // Emitir notificação para o avaliado sobre conclusão da avaliação
            useNotificacoesStore.getState().adicionarNotificacao({
              tipo: 'avaliacao_concluida',
              titulo: 'Avaliação concluída',
              mensagem: `Sua avaliação do período ${avaliacao.periodo} foi concluída. Média: ${media.toFixed(1)}/5.0`,
              link: '/avaliacoes',
              prioridade: 'media',
              categoria: 'desenvolvimento',
            });
          }
          
          return {
            avaliacoes: state.avaliacoes.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...dados,
                    status: 'concluida',
                    dataConclusao: new Date().toISOString().split('T')[0],
                  }
                : a
            ),
          };
        });
      },

      getAvaliacoesPendentes: (userId) => {
        return get().avaliacoes.filter(
          (a) => a.avaliadorId === userId && a.status === 'pendente'
        );
      },

      getAvaliacoesRecebidas: (userId) => {
        return get().avaliacoes.filter((a) => a.avaliadoId === userId);
      },

      registrarProjeto: (avaliacaoId, projeto) => {
        set((state) => ({
          avaliacoes: state.avaliacoes.map((a) =>
            a.id === avaliacaoId
              ? { ...a, projetos: [...(a.projetos || []), projeto] }
              : a
          ),
        }));
      },

      registrarCurso: (avaliacaoId, curso) => {
        set((state) => ({
          avaliacoes: state.avaliacoes.map((a) =>
            a.id === avaliacaoId
              ? { ...a, cursos: [...(a.cursos || []), curso] }
              : a
          ),
        }));
      },

      getResumoMensalEquipe: (mes, equipeUsuarioIds) => {
        const doMes = get().avaliacoes.filter(
          (a) => a.periodo === mes && equipeUsuarioIds.includes(a.avaliadoId)
        );

        const concluidas = doMes.filter((a) => a.status === 'concluida');
        const pendentes = doMes.filter((a) => a.status === 'pendente');

        const total = doMes.length;
        const somaNotas = concluidas.reduce(
          (acc, a) => ({
            comunicacao: acc.comunicacao + a.notas.comunicacao,
            trabalhoEmEquipe: acc.trabalhoEmEquipe + a.notas.trabalhoEmEquipe,
            qualidadeTecnica: acc.qualidadeTecnica + a.notas.qualidadeTecnica,
            pontualidade: acc.pontualidade + a.notas.pontualidade,
            proatividade: acc.proatividade + a.notas.proatividade,
          }),
          { comunicacao: 0, trabalhoEmEquipe: 0, qualidadeTecnica: 0, pontualidade: 0, proatividade: 0 }
        );

        const countConcluidas = concluidas.length || 1; // evitar divisão por zero
        const mediasPorCompetencia = {
          comunicacao: Number((somaNotas.comunicacao / countConcluidas).toFixed(2)),
          trabalhoEmEquipe: Number((somaNotas.trabalhoEmEquipe / countConcluidas).toFixed(2)),
          qualidadeTecnica: Number((somaNotas.qualidadeTecnica / countConcluidas).toFixed(2)),
          pontualidade: Number((somaNotas.pontualidade / countConcluidas).toFixed(2)),
          proatividade: Number((somaNotas.proatividade / countConcluidas).toFixed(2)),
        };

        const mediaGeral = Number(
          (
            (mediasPorCompetencia.comunicacao +
              mediasPorCompetencia.trabalhoEmEquipe +
              mediasPorCompetencia.qualidadeTecnica +
              mediasPorCompetencia.pontualidade +
              mediasPorCompetencia.proatividade) /
            5
          ).toFixed(2)
        );

        const projetosRealizados = doMes.reduce((acc, a) => acc + (a.projetos?.length || 0), 0);
        const cursosConcluidos = doMes.reduce((acc, a) => acc + (a.cursos?.length || 0), 0);

        return {
          mes,
          totalAvaliacoes: total,
          concluidas: concluidas.length,
          pendentes: pendentes.length,
          mediaGeral,
          mediasPorCompetencia,
          projetosRealizados,
          cursosConcluidos,
        };
      },

      getMetricasParaRelatorios: (inicioMes, fimMes, equipeUsuarioIds) => {
        // gera lista de meses entre início e fim
        const listarMeses = (inicio: string, fim: string) => {
          const [ai, mi] = inicio.split('-').map(Number);
          const [af, mf] = fim.split('-').map(Number);
          const meses: string[] = [];
          let a = ai;
          let m = mi;
          while (a < af || (a === af && m <= mf)) {
            const mm = String(m).padStart(2, '0');
            meses.push(`${a}-${mm}`);
            m++;
            if (m > 12) {
              m = 1;
              a++;
            }
          }
          return meses;
        };

        const meses = listarMeses(inicioMes, fimMes);
        const resumos = meses.map((mes) => get().getResumoMensalEquipe(mes, equipeUsuarioIds));

        const acumulados = resumos.reduce(
          (acc, r) => ({
            avaliacoes: acc.avaliacoes + r.totalAvaliacoes,
            concluidas: acc.concluidas + r.concluidas,
            pendentes: acc.pendentes + r.pendentes,
            mediaGeral: acc.mediaGeral + r.mediaGeral,
            projetos: acc.projetos + r.projetosRealizados,
            cursos: acc.cursos + r.cursosConcluidos,
          }),
          { avaliacoes: 0, concluidas: 0, pendentes: 0, mediaGeral: 0, projetos: 0, cursos: 0 }
        );

        const mediaGeralPeriodo = resumos.length
          ? Number((acumulados.mediaGeral / resumos.length).toFixed(2))
          : 0;

        return {
          periodo: { inicioMes, fimMes },
          meses: resumos,
          acumulados: {
            avaliacoes: acumulados.avaliacoes,
            concluidas: acumulados.concluidas,
            pendentes: acumulados.pendentes,
            mediaGeral: mediaGeralPeriodo,
            projetos: acumulados.projetos,
            cursos: acumulados.cursos,
          },
        };
      },

      reset: () => set({ avaliacoes: [] }),
    }),
    {
      name: 'cfo:avaliacoes',
    }
  )
);
