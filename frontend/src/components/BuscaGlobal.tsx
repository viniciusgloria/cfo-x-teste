import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Users, Target, MessageSquare, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useClientesStore } from '../store/clientesStore';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { useOKRsStore } from '../store/okrsStore';
import { useMuralStore } from '../store/muralStore';

interface BuscaGlobalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuscaGlobal({ isOpen, onClose }: BuscaGlobalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { colaboradores } = useColaboradoresStore();
  const { clientes } = useClientesStore();
  const { solicitacoes } = useSolicitacoesStore();
  const { okrs } = useOKRsStore();
  const { posts } = useMuralStore();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase();

  const resultadosColaboradores = colaboradores
    .filter(c => c.nome.toLowerCase().includes(lowerQuery) || c.cargo.toLowerCase().includes(lowerQuery))
    .slice(0, 3);

  const resultadosClientes = clientes
    .filter(c => c.nome.toLowerCase().includes(lowerQuery))
    .slice(0, 3);

  const resultadosSolicitacoes = solicitacoes
    .filter(s => s.titulo.toLowerCase().includes(lowerQuery) || s.descricao.toLowerCase().includes(lowerQuery))
    .slice(0, 3);

  const resultadosOKRs = okrs
    .filter(o => o.objetivo.toLowerCase().includes(lowerQuery))
    .slice(0, 3);

  const resultadosPosts = posts
    .filter(p => p.content.toLowerCase().includes(lowerQuery))
    .slice(0, 3);

  const temResultados =
    resultadosColaboradores.length > 0 ||
    resultadosClientes.length > 0 ||
    resultadosSolicitacoes.length > 0 ||
    resultadosOKRs.length > 0 ||
    resultadosPosts.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[600px] overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
          <Search className="text-gray-400 dark:text-gray-300" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em todo o sistema..."
            className="flex-1 outline-none text-lg bg-transparent text-gray-900 dark:text-gray-100"
          />
          <button onClick={onClose} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[500px] text-gray-800 dark:text-gray-100">
          {!query ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Digite para buscar colaboradores, clientes, solicitações e mais...</p>
            </div>
          ) : !temResultados ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p>Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Colaboradores */}
              {resultadosColaboradores.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <Users size={16} /> Colaboradores
                  </h3>
                  <div className="space-y-2">
                    {resultadosColaboradores.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate('/colaboradores')}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <UserCog size={18} className="text-gray-400 dark:text-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{c.nome}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{c.cargo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes */}
              {resultadosClientes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <Users size={16} /> Clientes
                  </h3>
                  <div className="space-y-2">
                    {resultadosClientes.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate('/clientes')}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">{c.nome}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {c.servicos.slice(0, 2).join(', ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Solicitações */}
              {resultadosSolicitacoes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <FileText size={16} /> Solicitações
                  </h3>
                  <div className="space-y-2">
                    {resultadosSolicitacoes.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleNavigate('/solicitacoes')}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">{s.titulo}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{s.descricao}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* OKRs */}
              {resultadosOKRs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <Target size={16} /> OKRs
                  </h3>
                  <div className="space-y-2">
                    {resultadosOKRs.map(o => (
                      <button
                        key={o.id}
                        onClick={() => handleNavigate('/okrs')}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">{o.objetivo}</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{o.progresso}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mural */}
              {resultadosPosts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={16} /> Mural
                  </h3>
                  <div className="space-y-2">
                    {resultadosPosts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate('/mural')}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{p.author}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{p.content}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Use ↑↓ para navegar, Enter para selecionar</span>
          <span>ESC para fechar</span>
        </div>
      </div>
    </div>
  );
}
