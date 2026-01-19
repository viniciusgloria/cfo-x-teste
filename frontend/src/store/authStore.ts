import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuth: boolean;
  accessToken: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
  reset: () => void;
}

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type ApiUser = {
  id: number;
  email: string;
  nome: string;
  role: string;
  avatar?: string | null;
  tipo?: 'CLT' | 'PJ' | null;
  primeiro_acesso?: boolean;
};

const normalizeRole = (role: string): UserRole => {
  const normalized = typeof role === 'string' ? role.toLowerCase() : '';
  if (normalized === 'admin' || normalized === 'gestor' || normalized === 'colaborador' || normalized === 'cliente') {
    return normalized as UserRole;
  }
  return 'colaborador';
};

const mapApiUserToUser = (apiUser: ApiUser): User => {
  const name = apiUser.nome || apiUser.email;
  return {
    id: String(apiUser.id),
    name,
    email: apiUser.email,
    role: normalizeRole(apiUser.role),
    avatar: apiUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    primeiro_acesso: apiUser.primeiro_acesso,
    regime: apiUser.tipo ?? undefined,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuth: false,
      accessToken: null,
      login: async (email: string, pass: string) => {
        try {
          const loginResponse = await api.post<LoginResponse>('/api/auth/login', { email, senha: pass });
          const accessToken = loginResponse.access_token;
          const apiUser = await api.get<ApiUser>('/api/auth/me', undefined, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const user = mapApiUserToUser(apiUser);
          set({ user, isAuth: true, accessToken });
        } catch (error) {
          set({ user: null, isAuth: false, accessToken: null });
          throw error;
        }
      },
      logout: async () => {
        const { accessToken } = get();
        if (accessToken) {
          try {
            await api.post('/api/auth/logout', {}, { 
              headers: { Authorization: `Bearer ${accessToken}` } 
            });
          } catch {
            // ignore logout failures and clear local state anyway
          }
        }
        set({ user: null, isAuth: false, accessToken: null });
      },
      updateAvatar: (avatarUrl: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        }));
      },
      reset: () => set({ user: null, isAuth: false, accessToken: null }),
    }),
    {
      name: 'cfo:auth',
      partialize: (s) => ({
        user: s.user,
        isAuth: s.isAuth,
        accessToken: s.accessToken,
      }),
    }
  )
);
