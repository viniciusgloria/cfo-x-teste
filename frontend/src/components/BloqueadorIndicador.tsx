import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Tarefa } from '../types';

interface BloqueadorIndicadorProps {
  bloqueadores: Tarefa[];
  dependenciasAtendidas: boolean;
}

export function BloqueadorIndicador({ bloqueadores, dependenciasAtendidas }: BloqueadorIndicadorProps) {
  if (bloqueadores.length === 0 || dependenciasAtendidas) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-medium">
      <AlertCircle className="w-3 h-3" />
      <span>Bloqueada</span>
      <span className="ml-1">({bloqueadores.length})</span>
    </div>
  );
}
