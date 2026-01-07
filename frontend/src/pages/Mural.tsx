import { useEffect, useState, useRef, ChangeEvent, useMemo } from 'react';
import { Plus, ImageIcon, Filter, MessageSquare, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Dropzone } from '../components/ui/Dropzone';
import FilterPill from '../components/ui/FilterPill';
import { Card } from '../components/ui/Card';
import { PageBanner } from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
// Input removed (not used)
import { useMuralStore } from '../store/muralStore';
import { PostCard } from '../components/PostCard';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useNotificacoesStore } from '../store/notificacoesStore';
import type { PostType } from '../store/muralStore';

export function Mural() {
  const { posts, filter, setFilter, addPost } = useMuralStore();
  const { colaboradores } = useColaboradoresStore();
  const { adicionarNotificacao } = useNotificacoesStore();

  const {
    attachments,
    readyAttachments,
    handleFiles,
    removeAttachment,
    reset: resetAttachments,
    isUploading,
    hasError,
  } = useAttachmentUploader();

  const filtered = filter === 'Todos' ? posts : posts.filter((p) => p.type === filter as PostType);
  const POSTS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  // UI states for creating a post
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('anuncio');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionListOpen, setMentionListOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const emojis = ['😀', '🎉', '👍', '❤️', '🚀'];

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setContent(value);
    const cursor = e.target.selectionStart;
    const before = value.slice(0, cursor);
    const match = /@([\w\u00C0-\u017F]*)$/.exec(before);
    if (match) {
      setMentionQuery(match[1]);
      setMentionListOpen(true);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionListOpen(false);
      setMentionQuery('');
      setMentionStart(null);
    }
  }

  function handleMentionSelect(colab: { nome: string }) {
    if (mentionStart !== null && textareaRef.current) {
      const before = content.slice(0, mentionStart);
      const after = content.slice(textareaRef.current.selectionStart);
      const mentionText = `@${colab.nome} `;
      setContent(before + mentionText + after);
      setMentionListOpen(false);
      setMentionQuery('');
      setMentionStart(null);
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.focus();
      }, 0);
    }
  }

  function getMentions(text: string) {
    const regex = /@([\w\u00C0-\u017F]+)/g;
    const found: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      found.push(m[1]);
    }
    return found;
  }

  function handlePublish() {
    if (isUploading) {
      toast.error('Aguarde o envio dos anexos terminar antes de publicar.');
      return;
    }
    if (hasError) {
      toast.error('Remova ou tente enviar novamente os anexos com erro.');
      return;
    }
    if (!content.trim() && readyAttachments.length === 0) {
      toast.error('Escreva algo ou adicione um anexo antes de publicar.');
      return;
    }

    addPost({
      author: 'Voce',
      content: content.trim(),
      type,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Voce',
      attachments: readyAttachments,
    });

    const mencionados = getMentions(content);
    colaboradores.forEach((c) => {
      if (mencionados.includes(c.nome)) {
        adicionarNotificacao({
          tipo: 'nova_mensagem_mural',
          titulo: 'Você foi mencionado no Mural',
          mensagem: `Você foi mencionado por Voce em uma publicação: "${content.trim()}"`,
          link: '/mural',
          icone: 'AtSign',
          cor: 'text-blue-600',
        });
      }
    });

    setContent('');
    resetAttachments();
    setOpen(false);
    toast.success('Publicacao criada');
  }

  // Early-return guard: if posts is undefined/null due to store migration/corruption, render fallback
  if (!Array.isArray(posts)) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-slate-400">
        <p>Erro ao carregar o mural. Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBanner
        title="Mural"
        icon={<MessageSquare size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <>
            <FilterPill
              icon={<Filter size={16} />}
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              options={[
                { value: 'Todos', label: 'Todos' },
                { value: 'anuncio', label: 'Anúncios' },
                { value: 'feedback', label: 'Feedbacks' },
                { value: 'atualizacao', label: 'Atualizações' },
                { value: 'comemoracao', label: 'Comemorações' },
              ]}
            />
            <Button onClick={() => setOpen(true)} className="flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} />
              Novo Post
            </Button>
          </>
        )}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          paginated.map((p) => (
            <PostCard key={p.id} postId={p.id} />
          ))
        )}
      </div>

      {filtered.length > POSTS_PER_PAGE && (
        <div className="flex items-center justify-center mt-4 gap-3">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}>Anterior</Button>
          <div className="text-sm text-gray-600 dark:text-slate-300">Página {currentPage} de {totalPages}</div>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}>Próxima</Button>
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nova Postagem">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-emerald-600 font-medium mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
            >
              <option value="anuncio">Anúncio</option>
              <option value="feedback">Feedback</option>
              <option value="atualizacao">Atualização</option>
              <option value="comemoracao">Comemoração</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-emerald-600 font-medium mb-1">Conteúdo</label>
            <div className="mb-2 flex flex-wrap gap-2 items-center relative">
              <button
                type="button"
                className="px-2 py-1 text-lg border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-100"
                onClick={() => setEmojiPickerOpen((v) => !v)}
              >
                😀 Emojis
              </button>
              {emojiPickerOpen && (
                <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-2 shadow absolute z-10">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-slate-700 bg-transparent dark:bg-transparent rounded"
                      onClick={() => {
                        setContent((c) => c + emoji);
                        setEmojiPickerOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {mentionListOpen && (
                <div className="absolute top-10 left-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded shadow z-20 w-64 max-h-48 overflow-auto">
                  {colaboradores.filter((c) => c.nome.toLowerCase().includes(mentionQuery.toLowerCase())).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="block w-full text-left px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 bg-transparent dark:bg-transparent"
                      onClick={() => handleMentionSelect(c)}
                    >
                      <span className="font-medium">@{c.nome}</span> <span className="text-xs text-gray-500 dark:text-slate-400">{c.cargo}</span>
                    </button>
                  ))}
                  {colaboradores.filter((c) => c.nome.toLowerCase().includes(mentionQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400 dark:text-slate-500">Nenhum usuário encontrado</div>
                  )}
                </div>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
            />
          </div>


          <div>
            <div className="flex-1">
              <label className="flex items-center gap-2 text-emerald-600">
                <ImageIcon className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Anexos (imagens ou arquivos)</span>
              </label>
              <div className="mt-2">
                <Dropzone onFiles={handleFiles} />
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 border border-gray-200 dark:border-slate-700 rounded-md p-2 bg-gray-50 dark:bg-slate-900/60">
                      <div className="flex items-center gap-3">
                        {a.mimeType.startsWith('image/') ? (
                          <img src={a.dataUrl} alt={a.name} className="w-16 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-sm">PDF</div>
                        )}
                        <div className="text-sm w-full">
                          <div className="truncate max-w-[240px] text-gray-800 dark:text-slate-100">{a.name}</div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                            <span>{(a.size / 1024 / 1024).toFixed(2)} MB {a.status === 'error' ? `· Erro: ${a.error}` : ''}</span>
                            <span className="ml-2">{a.status === 'uploading' ? 'Enviando…' : a.status === 'done' ? 'Pronto' : ''}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-1" style={{ width: `${a.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-red-600 text-xs" onClick={() => removeAttachment(a.id)}>Remover</button>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">Total: {(attachments.reduce((s, a) => s + (a.size || 0), 0) / 1024 / 1024).toFixed(2)} MB</div>
                  {attachments.some((a) => a.status === 'error') && <div className="text-xs text-red-600">Remova anexos inválidos antes de prosseguir.</div>}
                  {isUploading && <div className="text-xs text-emerald-600 dark:text-emerald-300">Enviando anexos...</div>}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-emerald-200 text-emerald-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">Cancelar</Button>
              <Button
                onClick={handlePublish}
                disabled={isUploading}
                title={isUploading ? 'Aguardando upload dos anexos' : undefined}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}









