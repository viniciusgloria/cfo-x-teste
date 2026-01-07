import { Heart, ThumbsUp, PartyPopper, MessageCircle, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useMuralStore } from '../store/muralStore';
import { useState } from 'react';
import { Avatar } from './Avatar';

interface Props {
  postId: number;
}

export function PostCard({ postId }: Props) {
  const post = useMuralStore((s) => s.posts.find((p) => p.id === postId));
  const toggle = useMuralStore((s) => s.toggleReaction);
  const addComment = useMuralStore((s) => s.addComment);
  const [comment, setComment] = useState('');
        const [previewId, setPreviewId] = useState<string | null>(null);

  if (!post) return null;
        const previewAttachment = post.attachments?.find((a) => a.id === previewId) ?? null;

  return (
    <>
      <Card className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <Avatar src={post.avatar} alt={post.author} size="md" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-100">{post.author}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{post.createdAt} - {post.type}</p>
              </div>
            </div>

            <p className="mt-3 text-gray-700 dark:text-slate-100 whitespace-pre-wrap">{post.content}</p>

            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {post.attachments.map((a) => {
                  const isImage = a.mimeType.startsWith('image/');
                  return (
                    <div key={a.id} className="relative overflow-hidden rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      {isImage ? (
                        <button
                          type="button"
                          onClick={() => setPreviewId(a.id)}
                          className="block w-full"
                        >
                          <img src={a.dataUrl} alt={a.name} className="w-full h-28 object-cover rounded" />
                        </button>
                      ) : (
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-slate-100 truncate" title={a.name}>{a.name}</p>
                          <a href={a.dataUrl} download={a.name} className="text-xs text-blue-600 dark:text-blue-300 underline mt-1 inline-block">
                            baixar
                          </a>
                        </div>
                      )}
                      <div className="px-3 pb-2">
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 break-words">{a.remoteUrl}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-200" onClick={() => toggle(post.id, 'like')}>
                <ThumbsUp size={16} /> <span>{post.reactions.like}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-200" onClick={() => toggle(post.id, 'heart')}>
                <Heart size={16} /> <span>{post.reactions.heart}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-200" onClick={() => toggle(post.id, 'party')}>
                <PartyPopper size={16} /> <span>{post.reactions.party}</span>
              </button>
              <div className="flex-1" />
              <div className="text-xs text-gray-500 dark:text-slate-400">{post.comments.length} comentarios</div>
            </div>

            <div className="mt-3">
              {post.comments.map((c) => (
                <div key={c.id} className="mt-2 text-sm">
                  <span className="font-medium text-gray-800 dark:text-slate-100">{c.author}</span>
                  <span className="text-gray-500 dark:text-slate-400 ml-2 text-xs">{c.createdAt}</span>
                  <div className="text-gray-700 dark:text-slate-100">{c.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (comment.trim()) {
                      addComment(post.id, 'Voce', comment.trim());
                      setComment('');
                    }
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg resize-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                rows={1}
                aria-label="Escrever comentário"
              />
              <Button
                variant="ghost"
                onClick={() => {
                  if (comment.trim()) {
                    addComment(post.id, 'Voce', comment.trim());
                    setComment('');
                  }
                }}
              >
                <MessageCircle size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-12 right-0 rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setPreviewId(null)}
              aria-label="Fechar visualizacao"
            >
              <X size={18} />
            </button>
            <img
              src={previewAttachment.dataUrl}
              alt={previewAttachment.name}
              className="max-h-[80vh] w-auto max-w-full rounded shadow-lg"
            />
            <p className="mt-3 text-sm text-gray-200">{previewAttachment.name}</p>
            <a
              href={previewAttachment.dataUrl}
              download={previewAttachment.name}
              className="mt-2 text-xs text-blue-200 underline"
            >
              Baixar
            </a>
          </div>
        </div>
      )}
    </>
  );
}

