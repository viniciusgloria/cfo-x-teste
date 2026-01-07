import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'material' | 'sala' | 'reembolso' | 'ferias' | 'homeoffice' | 'empresa' | 'time' | 'pessoal' | 'positivo' | 'construtivo' | 'avaliacao' | 'pendente' | 'aprovada' | 'rejeitada' | 'urgencia-baixa' | 'urgencia-media' | 'urgencia-alta' | 'no-prazo' | 'atencao' | 'atrasado';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  material: 'bg-blue-100 text-blue-800',
  sala: 'bg-purple-100 text-purple-800',
  reembolso: 'bg-orange-100 text-orange-800',
  ferias: 'bg-green-100 text-green-800',
  homeoffice: 'bg-cyan-100 text-cyan-800',
  empresa: 'bg-green-100 text-green-800',
  time: 'bg-blue-100 text-blue-800',
  pessoal: 'bg-orange-100 text-orange-800',
  positivo: 'bg-green-100 text-green-800',
  construtivo: 'bg-yellow-100 text-yellow-800',
  avaliacao: 'bg-blue-100 text-blue-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  aprovada: 'bg-green-100 text-green-800',
  rejeitada: 'bg-red-100 text-red-800',
  'urgencia-baixa': 'bg-gray-100 text-gray-800',
  'urgencia-media': 'bg-yellow-100 text-yellow-800',
  'urgencia-alta': 'bg-red-100 text-red-800',
  'no-prazo': 'bg-green-100 text-green-800',
  atencao: 'bg-yellow-100 text-yellow-800',
  atrasado: 'bg-red-100 text-red-800'
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
