import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';

export type PostType = 'anuncio' | 'feedback' | 'atualizacao' | 'comemoracao';

export interface Comment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  type: PostType;
  createdAt: string;
  attachments?: Attachment[];
  reactions: { like: number; heart: number; party: number };
  myReactions?: { like?: boolean; heart?: boolean; party?: boolean };
  comments: Comment[];
}

interface MuralState {
  posts: Post[];
  filter: 'Todos' | PostType;
  setFilter: (f: MuralState['filter']) => void;
  addPost: (p: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'myReactions'>) => void;
  toggleReaction: (postId: number, reaction: 'like' | 'heart' | 'party') => void;
  addComment: (postId: number, author: string, text: string) => void;
  reset: () => void;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Sistema',
    avatar: undefined,
    content: 'Bem-vindo ao CFO X - Demonstração do Sistema para Evento',
    type: 'anuncio',
    createdAt: new Date().toISOString(),
    attachments: undefined,
    reactions: { like: 10, heart: 5, party: 2 },
    myReactions: undefined,
    comments: [
      { id: 1, author: 'João', text: 'Muito bom!', createdAt: new Date().toISOString() }
    ],
  },
  {
    id: 2,
    author: 'Admin',
    avatar: undefined,
    content: 'Parabéns a todos pelo trabalho excelente neste trimestre! 🎉',
    type: 'comemoracao',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    attachments: undefined,
    reactions: { like: 25, heart: 15, party: 8 },
    myReactions: undefined,
    comments: [],
  },
];
const initialMural = {
  posts: mockPosts,
  filter: 'Todos' as MuralState['filter'],
};

export const useMuralStore = create<MuralState>()(
  persist(
    (set, get) => ({
      ...initialMural,
      setFilter: (f) => set({ filter: f }),
      addPost: (p) => {
        const posts = get().posts;
        const next: Post = {
          id: Math.max(0, ...posts.map((x) => x.id)) + 1,
          author: p.author,
          avatar: p.avatar,
          content: p.content,
          type: p.type,
          createdAt: new Date().toLocaleString(),
          attachments: p.attachments ? [...p.attachments] : [],
          reactions: { like: 0, heart: 0, party: 0 },
          myReactions: {},
          comments: [],
        };
        const newPosts = [next, ...posts];
        // Mantém no máximo 30 publicações: remove as mais antigas quando exceder
        if (newPosts.length > 30) {
          newPosts.length = 30;
        }
        set({ posts: newPosts });
      },
      toggleReaction: (postId, reaction) => {
        set(({ posts }) => ({
          posts: posts.map((post) => {
            if (post.id !== postId) return post;
            const has = post.myReactions?.[reaction];
            const delta = has ? -1 : 1;
            return {
              ...post,
              reactions: { ...post.reactions, [reaction]: post.reactions[reaction] + delta },
              myReactions: { ...post.myReactions, [reaction]: !has },
            };
          }),
        }));
      },
      addComment: (postId, author, text) => {
        set(({ posts }) => ({
          posts: posts.map((post) => {
            if (post.id !== postId) return post;
            const nextId = Math.max(0, ...post.comments.map((c) => c.id)) + 1;
            return { ...post, comments: [...post.comments, { id: nextId, author, text, createdAt: new Date().toLocaleString() }] };
          }),
        }));
      },
      reset: () => set(initialMural),
    }),
    {
      name: 'cfo:mural', // localStorage key
      partialize: (state) => ({ posts: state.posts }),
    }
  )
);

