import { Bell, X, Check, Calendar, FileText, Cake, ChevronRight, Users } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useLembretesStore, Lembrete, TipoLembrete, PrioridadeLembrete } from '../store/lembretesStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LembretesPanelProps {
  mostrarTodos?: boolean;
  limite?: number;
  compacto?: boolean;
}

const iconesPorTipo: Record<TipoLembrete, React.ReactNode> = {
  contrato_experiencia: <FileText size={18} className="text-orange-600" />,
  ferias_vencendo: <Calendar size={18} className="text-blue-600" />,
  ferias_periodo: <Calendar size={18} className="text-blue-600" />,
  documento_vencendo: <FileText size={18} className="text-red-600" />,
  aniversario: <Cake size={18} className="text-pink-600" />,
  avaliacao_desempenho: <Users size={18} className="text-purple-600" />,
  contrato_vencendo: <FileText size={18} className="text-red-600" />,
  outro: <Bell size={18} className="text-gray-600" />,
};

const coresPorPrioridade: Record<PrioridadeLembrete, { bg: string; text: string; border: string }> = {
  alta: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  media: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  baixa: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
};

const labelsPorTipo: Record<TipoLembrete, string> = {
  contrato_experiencia: 'Contrato Experiência',
  ferias_vencendo: 'Férias Vencendo',
  ferias_periodo: 'Período de Férias',
  documento_vencendo: 'Documento Vencendo',
  aniversario: 'Aniversário',
  avaliacao_desempenho: 'Avaliação Desempenho',
  contrato_vencendo: 'Contrato Vencendo',
  outro: 'Outro',
};

export function LembretesPanel({ mostrarTodos = false, limite = 5, compacto = false }: LembretesPanelProps) {
  const { 
    marcarComoVisualizado, 
    marcarComoConcluido, 
    dispensarLembrete,
    getLembretesPendentes,
    gerarLembretesAutomaticos
  } = useLembretesStore();
  
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState<TipoLembrete | 'todos'>('todos');

  // Gerar lembretes automaticamente ao montar
  useEffect(() => {
    gerarLembretesAutomaticos();
    
    // Atualizar a cada 1 hora
    const interval = setInterval(() => {
      gerarLembretesAutomaticos();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [gerarLembretesAutomaticos]);

  const lembretesPendentes = getLembretesPendentes();
  
  let lembretesFiltrados = mostrarTodos ? lembretesPendentes : lembretesPendentes;
  
  if (filtroTipo !== 'todos') {
    lembretesFiltrados = lembretesFiltrados.filter(l => l.tipo === filtroTipo);
  }

  // Ordenar por prioridade e data
  lembretesFiltrados.sort((a, b) => {
    const prioridadeOrdem = { alta: 0, media: 1, baixa: 2 };
    if (a.prioridade !== b.prioridade) {
      return prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade];
    }
    return new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime();
  });

  const lembretesExibir = limite > 0 ? lembretesFiltrados.slice(0, limite) : lembretesFiltrados;

  const handleAcao = (lembrete: Lembrete, acao: any) => {
    if (acao.tipo === 'link' && acao.destino) {
      navigate(acao.destino);
      marcarComoVisualizado(lembrete.id);
    } else if (acao.tipo === 'acao') {
      // Aqui pode implementar callbacks específicas
      console.log('Ação:', acao.callback, 'para lembrete:', lembrete.id);
    }
  };

  const calcularDiasRestantes = (dataEvento: string): number => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento);
    evento.setHours(0, 0, 0, 0);
    const diff = evento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (lembretesExibir.length === 0 && !mostrarTodos) {
    return compacto ? null : (
      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <Bell size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum lembrete pendente</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!compacto && mostrarTodos && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filtroTipo === 'todos' ? 'primary' : 'outline'}
            onClick={() => setFiltroTipo('todos')}
          >
            Todos ({lembretesPendentes.length})
          </Button>
          {Object.entries(labelsPorTipo).map(([tipo, label]) => {
            const count = lembretesPendentes.filter(l => l.tipo === tipo).length;
            if (count === 0) return null;
            return (
              <Button
                key={tipo}
                variant={filtroTipo === tipo ? 'primary' : 'outline'}
                onClick={() => setFiltroTipo(tipo as TipoLembrete)}
              >
                {label} ({count})
              </Button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {lembretesExibir.map((lembrete) => {
          const cores = coresPorPrioridade[lembrete.prioridade];
          const diasRestantes = calcularDiasRestantes(lembrete.dataEvento);
          const icone = iconesPorTipo[lembrete.tipo];

          return (
            <Card
              key={lembrete.id}
              className={`p-4 border-l-4 ${cores.border} ${lembrete.status === 'visualizado' ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icone}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                        {lembrete.titulo}
                      </h4>
                      {lembrete.colaboradorNome && !compacto && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {lembrete.colaboradorNome}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">
                        {diasRestantes === 0
                          ? 'Hoje'
                          : diasRestantes === 1
                          ? 'Amanhã'
                          : diasRestantes < 0
                          ? `${Math.abs(diasRestantes)}d atrás`
                          : `${diasRestantes} dias`}
                      </Badge>
                    </div>
                  </div>

                  {!compacto && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {lembrete.descricao}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {lembrete.acoes && !compacto && lembrete.acoes.slice(0, 2).map((acao, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => handleAcao(lembrete, acao)}
                          className="text-xs"
                        >
                          {acao.label}
                          {acao.tipo === 'link' && <ChevronRight size={14} />}
                        </Button>
                      ))}
                      
                      {compacto && lembrete.status === 'pendente' && (
                        <Button
                          variant="outline"
                          onClick={() => marcarComoVisualizado(lembrete.id)}
                          className="text-xs"
                        >
                          Visualizar
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {lembrete.status === 'pendente' && (
                        <button
                          onClick={() => marcarComoConcluido(lembrete.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                          title="Marcar como concluído"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => dispensarLembrete(lembrete.id)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Dispensar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!mostrarTodos && lembretesFiltrados.length > limite && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/lembretes')}
        >
          Ver todos os {lembretesFiltrados.length} lembretes
          <ChevronRight size={18} />
        </Button>
      )}
    </div>
  );
}
