import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Tarefa } from '../types';

interface TarefaBlockedNoticeProps {
  bloqueadores: Tarefa[];
  canMove?: boolean;
}

export function TarefaBlockedNotice({ bloqueadores, canMove = false }: TarefaBlockedNoticeProps) {
  if (bloqueadores.length === 0 || canMove) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-red-900/10 rounded-lg border-2 border-red-400 pointer-events-none flex items-center justify-center">
      <div className="bg-white px-3 py-2 rounded shadow-md flex items-center gap-2 text-sm text-red-700 font-medium">
        <AlertCircle className="w-4 h-4" />
        <span>Bloqueada ({bloqueadores.length})</span>
      </div>
    </div>
  );
}
