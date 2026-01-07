import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuth: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => void;
  reset: () => void;
}

const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@cfocompany.com',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
  cargoId: '3', // Gerente de Projetos
  setorId: '1', // Tecnologia
  regime: 'CLT',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      login: (email: string, pass: string) => {
        if (email && pass) {
          set({ user: mockUser, isAuth: true });
        }
      },
      logout: () => {
        set({ user: null, isAuth: false });
      },
      updateAvatar: (avatarUrl: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        }));
      },
      reset: () => set({ user: null, isAuth: false }),
    }),
    { name: 'cfo:auth', partialize: (s) => ({ user: s.user, isAuth: s.isAuth }) }
  )
);
