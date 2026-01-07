import React, { useState } from 'react';
import { Clock, User, ArrowRight, MessageSquare, CheckCircle, Edit3, Move, ChevronDown, ChevronUp } from 'lucide-react';
import { LogTarefa } from '../types';

interface TarefaHistoricoProps {
  logs: LogTarefa[];
}

const iconMap: Record<string, any> = {
  criacao: CheckCircle,
  edicao: Edit3,
  movimentacao: Move,
  atribuicao: User,
  comentario: MessageSquare,
  conclusao: CheckCircle,
};

const TarefaHistorico: React.FC<TarefaHistoricoProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <Clock size={48} className="mx-auto mb-2 opacity-20" />
        <p>Nenhuma alteração registrada</p>
      </div>
    );
  }

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  return (
    <div>
      {/* Header com botão de expandir/ocultar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 mb-3 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gray-600 dark:text-slate-400" />
          <span className="font-semibold text-gray-900 dark:text-slate-100">
            Histórico ({logs.length} {logs.length === 1 ? 'alteração' : 'alterações'})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-600 dark:text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-600 dark:text-slate-400" />
        )}
      </button>

      {/* Conteúdo do histórico */}
      {isExpanded && (
        <div className="space-y-3">{sortedLogs.map((log) => {
        const Icon = iconMap[log.acao] || Clock;
        const dataFormatada = new Date(log.criadoEm).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div 
            key={log.id} 
            className="flex gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
              <Icon size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{log.descricao}</p>
                  
                  {log.campo && (log.valorAnterior || log.valorNovo) && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Campo alterado: <span className="font-bold text-blue-600 dark:text-emerald-400">{log.campo}</span>
                      </p>
                      <div className="flex items-start gap-3 text-xs">
                        {log.valorAnterior && (
                          <div className="flex-1">
                            <span className="text-gray-600 dark:text-slate-400 font-semibold block mb-1.5">Antes:</span>
                            <div className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border-2 border-red-200 dark:border-red-800 font-medium">
                              {log.valorAnterior}
                            </div>
                          </div>
                        )}
                        {log.valorAnterior && log.valorNovo && (
                          <ArrowRight size={18} className="text-gray-400 dark:text-slate-500 mt-7 flex-shrink-0" />
                        )}
                        {log.valorNovo && (
                          <div className="flex-1">
                            <span className="text-gray-600 dark:text-slate-400 font-semibold block mb-1.5">Depois:</span>
                            <div className="px-3 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md border-2 border-green-200 dark:border-green-800 font-medium">
                              {log.valorNovo}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <time className="text-xs font-medium text-gray-600 dark:text-slate-400 whitespace-nowrap">
                  {dataFormatada}
                </time>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                por <span className="font-semibold text-gray-700 dark:text-slate-300">{log.usuarioNome}</span>
              </p>
            </div>
          </div>
        );
      })}
      </div>
      )}
    </div>
  );
};

export default TarefaHistorico;
