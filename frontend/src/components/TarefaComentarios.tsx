import React, { useState } from 'react';
import { MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';
import { ComentarioTarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { useAuthStore } from '../store/authStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';

interface TarefaComentariosProps {
  tarefaId: string;
  comentarios: ComentarioTarefa[];
}

const TarefaComentarios: React.FC<TarefaComentariosProps> = ({ tarefaId, comentarios }) => {
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const user = useAuthStore((s) => s.user);
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const adicionarComentario = useTarefasStore((s) => s.adicionarComentario);
  const editarComentario = useTarefasStore((s) => s.editarComentario);
  const deletarComentario = useTarefasStore((s) => s.deletarComentario);

  const handleSubmit = () => {
    if (!novoComentario.trim() || !user) return;
    
    adicionarComentario(tarefaId, novoComentario.trim(), user.id, user.name);
    setNovoComentario('');
  };

  const handleEditar = (comentario: ComentarioTarefa) => {
    setEditandoId(comentario.id);
    setTextoEdicao(comentario.texto);
  };

  const handleSalvarEdicao = (comentarioId: string) => {
    if (!textoEdicao.trim()) return;
    
    editarComentario(tarefaId, comentarioId, textoEdicao.trim());
    setEditandoId(null);
    setTextoEdicao('');
  };

  const handleDeletar = (comentarioId: string) => {
    if (confirm('Deseja realmente deletar este comentário?')) {
      deletarComentario(tarefaId, comentarioId);
    }
  };

  const handleInputChange = (texto: string) => {
    setNovoComentario(texto);
    
    // Detectar @ para mostrar sugestões de mentions
    const lastAtIndex = texto.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === texto.length - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1 && texto[lastAtIndex] === '@') {
      const searchTerm = texto.substring(lastAtIndex + 1);
      if (!searchTerm.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchTerm);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (colab: any) => {
    const lastAtIndex = novoComentario.lastIndexOf('@');
    const beforeAt = novoComentario.substring(0, lastAtIndex);
    const mention = `@[${colab.name}](${colab.id}) `;
    setNovoComentario(beforeAt + mention);
    setShowMentions(false);
  };

  const formatarTextoComMentions = (texto: string) => {
    // Converter @[Nome](id) em links visuais
    return texto.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, '<span class="bg-blue-100 text-blue-700 px-1 rounded">@$1</span>');
  };

  const filteredColaboradores = showMentions
    ? colaboradores.filter((c) =>
        c.name.toLowerCase().includes(mentionSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
        <MessageSquare size={18} />
        <h3>Comentários ({comentarios.length})</h3>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-3">
        {comentarios.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400 italic">Nenhum comentário ainda</p>
        ) : (
          comentarios.map((comentario) => (
            <div key={comentario.id} className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded border border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {comentario.usuarioNome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{comentario.usuarioNome}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comentario.criadoEm).toLocaleString('pt-BR')}
                      {comentario.atualizadoEm && ' (editado)'}
                    </p>
                  </div>
                </div>
                
                {user && user.id === comentario.usuarioId && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditar(comentario)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Editar"
                    >
                      <Edit2 size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeletar(comentario.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Deletar"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {editandoId === comentario.id ? (
                <div className="space-y-2">
                  <textarea
                    value={textoEdicao}
                    onChange={(e) => setTextoEdicao(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none transition-colors"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSalvarEdicao(comentario.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditandoId(null);
                        setTextoEdicao('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: formatarTextoComMentions(comentario.texto) }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Novo comentário */}
      {user && (
        <div className="relative">
          <div className="flex gap-2">
            <textarea
              value={novoComentario}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Escreva um comentário... (use @ para mencionar)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded text-sm resize-none bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none transition-colors"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!novoComentario.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 h-fit transition-colors"
              title="Ctrl+Enter para enviar"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Dropdown de mentions */}
          {showMentions && filteredColaboradores.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto w-64 z-10">
              {filteredColaboradores.slice(0, 5).map((colab) => (
                <button
                  key={colab.id}
                  onClick={() => handleMentionSelect(colab)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    {colab.name.charAt(0).toUpperCase()}
                  </div>
                  {colab.name}
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Dica: Use @ para mencionar colaboradores. Pressione Ctrl+Enter para enviar.
          </p>
        </div>
      )}
    </div>
  );
};

export default TarefaComentarios;
