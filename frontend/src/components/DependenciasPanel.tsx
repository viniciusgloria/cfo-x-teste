import React, { useState } from 'react';
import { Tarefa } from '../types';
import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useTarefasStore } from '../store/tarefasStore';
import { useToast } from '../contexts/ToastContext';

interface DependenciasPanelProps {
  tarefa: Tarefa;
  todasAsTarefas: Tarefa[];
}

export function DependenciasPanel({ tarefa, todasAsTarefas }: DependenciasPanelProps) {
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [busca, setBusca] = useState('');
  const { addToast } = useToast();
  
  const {
    adicionarDependencia,
    removerDependencia,
    obterBloqueadoresUIState,
    obterTarefasBloqueadasUIState,
    validarDependenciasUI,
  } = useTarefasStore();

  const bloqueadores = obterBloqueadoresUIState(tarefa.id);
  const tarefasBloqueadas = obterTarefasBloqueadasUIState(tarefa.id);
  const dependenciasAtendidas = validarDependenciasUI(tarefa.id);

  // Tarefas disponíveis para adicionar como dependência
  const tarefasDisponiveis = todasAsTarefas.filter(
    (t) =>
      t.id !== tarefa.id &&
      !tarefa.dependsOn?.includes(t.id) &&
      t.status !== 'feito' // Não sugerir tarefas já completas
  );

  const tarefasFiltradas = tarefasDisponiveis.filter((t) =>
    t.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleAdicionarDependencia = (dependsOnId: string) => {
    const resultado = adicionarDependencia(tarefa.id, dependsOnId);
    if (!resultado.sucesso) {
      addToast(resultado.erro || 'Erro ao adicionar dependência', 'error');
    } else {
      const depTarefa = todasAsTarefas.find(t => t.id === dependsOnId);
      addToast(`Dependência adicionada: "${depTarefa?.titulo}"`, 'success');
    }
    setBusca('');
    setMostrarOpcoes(false);
  };

  const handleRemoverDependencia = (dependsOnId: string) => {
    const depTarefa = todasAsTarefas.find(t => t.id === dependsOnId);
    removerDependencia(tarefa.id, dependsOnId);
    addToast(`Dependência removida: "${depTarefa?.titulo}"`, 'success');
  };

  const getStatusBadgeColor = (status: Tarefa['status']) => {
    switch (status) {
      case 'feito':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'fazendo':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: Tarefa['status']) => {
    switch (status) {
      case 'feito':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'fazendo':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Dependências
      </h3>

      {/* Aviso se tem dependências não atendidas */}
      {!dependenciasAtendidas && bloqueadores.length > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          ⚠️ Esta tarefa está bloqueada! Complete as dependências abaixo para prosseguir.
        </div>
      )}

      {/* Bloqueadores (Dependências) */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 uppercase mb-2">
          Depende de ({bloqueadores.length})
        </div>
        {bloqueadores.length > 0 ? (
          <div className="space-y-2">
            {bloqueadores.map((bloqueador) => (
              <div
                key={bloqueador.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  bloqueador.status === 'feito'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(bloqueador.status)}
                  <span className="text-sm text-gray-700 truncate">
                    {bloqueador.titulo}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${getStatusBadgeColor(
                      bloqueador.status
                    )}`}
                  >
                    {bloqueador.status === 'feito'
                      ? 'Completa'
                      : bloqueador.status === 'fazendo'
                      ? 'Em Andamento'
                      : 'A Fazer'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoverDependencia(bloqueador.id)}
                  className="p-1 hover:bg-gray-200 rounded transition"
                  title="Remover dependência"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Nenhuma dependência</p>
        )}
      </div>

      {/* Botão e dropdown para adicionar dependência */}
      <div className="mb-4 relative">
        <button
          onClick={() => setMostrarOpcoes(!mostrarOpcoes)}
          className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
        >
          + Adicionar Dependência
        </button>

        {mostrarOpcoes && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            <input
              type="text"
              placeholder="Buscar tarefa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
            />
            <div className="max-h-48 overflow-y-auto">
              {tarefasFiltradas.length > 0 ? (
                tarefasFiltradas.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAdicionarDependencia(t.id)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{t.titulo}</div>
                    <div className="text-xs text-gray-500">
                      {t.status === 'feito'
                        ? '✓ Completa'
                        : t.status === 'fazendo'
                        ? '→ Em Andamento'
                        : '○ A Fazer'}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  {todasAsTarefas.filter(t => t.id !== tarefa.id && !tarefa.dependsOn?.includes(t.id)).length === 0
                    ? 'Nenhuma tarefa disponível'
                    : 'Nenhuma tarefa encontrada'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tarefas que esta tarefa bloqueia */}
      {tarefasBloqueadas.length > 0 && (
        <div className="pt-4 border-t">
          <div className="text-xs font-medium text-gray-600 uppercase mb-2">
            Bloqueia ({tarefasBloqueadas.length})
          </div>
          <div className="space-y-2">
            {tarefasBloqueadas.map((bloqueada) => (
              <div
                key={bloqueada.id}
                className="flex items-center justify-between p-2 rounded border border-blue-200 bg-blue-50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-700 truncate">
                    {bloqueada.titulo}
                  </span>
                  <span className="text-xs px-2 py-1 rounded border border-blue-300 bg-blue-100 text-blue-700">
                    {bloqueada.status === 'feito'
                      ? 'Completa'
                      : bloqueada.status === 'fazendo'
                      ? 'Em Andamento'
                      : 'Aguardando'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
