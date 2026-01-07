import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { HistoricoAlteracao } from '../types';

interface HistoricoListProps {
  historico: HistoricoAlteracao[];
  tipo?: 'cargo' | 'setor';
}

export function HistoricoList({ historico, tipo }: HistoricoListProps) {
  const historicoFiltrado = tipo 
    ? historico.filter(h => h.tipo === tipo)
    : historico;

  const getIconeAcao = (acao: string) => {
    switch (acao) {
      case 'criacao':
        return <Plus size={16} className="text-green-600" />;
      case 'edicao':
        return <Pencil size={16} className="text-blue-600" />;
      case 'remocao':
        return <Trash2 size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getCorAcao = (acao: string) => {
    switch (acao) {
      case 'criacao':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'edicao':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'remocao':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const mesmoDia = date.toDateString() === hoje.toDateString();
    const foiOntem = date.toDateString() === ontem.toDateString();

    if (mesmoDia) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (foiOntem) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (historicoFiltrado.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock size={48} className="mx-auto mb-3 opacity-30" />
        <p>Nenhuma alteração registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {historicoFiltrado.map((item) => (
        <div
          key={item.id}
          className={`border rounded-lg p-3 ${getCorAcao(item.acao)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getIconeAcao(item.acao)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {item.detalhes}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                <span>{item.alteradoPor}</span>
                <span>•</span>
                <span>{formatarData(item.alteradoEm)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
