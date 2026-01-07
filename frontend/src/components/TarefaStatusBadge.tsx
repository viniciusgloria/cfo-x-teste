import React from 'react';
import { AlertCircle, Calendar, Clock } from 'lucide-react';

interface TarefaStatusBadgeProps {
  dataVencimento?: string;
  status: string;
}

const TarefaStatusBadge: React.FC<TarefaStatusBadgeProps> = ({ dataVencimento, status }) => {
  if (!dataVencimento || status === 'feito') return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  
  const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  // Atrasado
  if (diffDias < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <AlertCircle size={12} />
        Atrasado {Math.abs(diffDias)}d
      </span>
    );
  }

  // Vence hoje
  if (diffDias === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        <Clock size={12} />
        Vence hoje
      </span>
    );
  }

  // Vence amanhã
  if (diffDias === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <Calendar size={12} />
        Vence amanhã
      </span>
    );
  }

  // Vence esta semana (próximos 7 dias)
  if (diffDias <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <Calendar size={12} />
        {diffDias}d restantes
      </span>
    );
  }

  return null;
};

export default TarefaStatusBadge;
