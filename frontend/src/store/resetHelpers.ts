import { useAuthStore } from './authStore';
import { usePontoStore } from './pontoStore';
import { useSolicitacoesStore } from './solicitacoesStore';
import { useAjustesPontoStore } from './ajustesPontoStore';
import { useOKRsStore } from './okrsStore';
import { useFeedbacksStore } from './feedbacksStore';
import { useMuralStore } from './muralStore';
import { useColaboradoresStore } from './colaboradoresStore';
import { useClientesStore } from './clientesStore';
import { useDashboardStore } from './dashboardStore';
import { useEmpresaStore } from './empresaStore';
import { useReservasStore } from './reservasStore';
import { useNotificacoesStore } from './notificacoesStore';

export type PersistKey =
  | 'auth'
  | 'ponto'
  | 'solicitacoes'
  | 'ajustes-ponto'
  | 'okrs'
  | 'feedbacks'
  | 'mural'
  | 'colaboradores'
  | 'clientes'
  | 'dashboard'
  | 'empresa'
  | 'reservas'
  | 'notificacoes';

export const persistKeyMap: Record<PersistKey, string> = {
  auth: 'cfo:auth',
  ponto: 'cfo:ponto',
  solicitacoes: 'cfo:solicitacoes',
  'ajustes-ponto': 'cfo:ajustes-ponto',
  okrs: 'cfo:okrs',
  feedbacks: 'cfo:feedbacks',
  mural: 'cfo:mural',
  colaboradores: 'cfo:colaboradores',
  clientes: 'cfo:clientes',
  dashboard: 'cfo:dashboard',
  empresa: 'cfo:empresa',
  reservas: 'cfo:reservas',
  notificacoes: 'cfo:notificacoes',
};

export function resetStores(keys: PersistKey[]) {
  if (keys.length === 0) return;
  keys.forEach((k) => {
    try {
      switch (k) {
        case 'auth':
          useAuthStore.getState().reset?.();
          break;
        case 'ponto':
          usePontoStore.getState().reset?.();
          break;
        case 'solicitacoes':
          useSolicitacoesStore.getState().reset?.();
          break;
        case 'ajustes-ponto':
          useAjustesPontoStore.getState().reset?.();
          break;
        case 'okrs':
          useOKRsStore.getState().reset?.();
          break;
        case 'feedbacks':
          useFeedbacksStore.getState().reset?.();
          break;
        case 'mural':
          useMuralStore.getState().reset?.();
          break;
        case 'colaboradores':
          useColaboradoresStore.getState().reset?.();
          break;
        case 'clientes':
          useClientesStore.getState().reset?.();
          break;
        case 'dashboard':
          useDashboardStore.getState().reset?.();
          break;
        case 'empresa':
          useEmpresaStore.getState().reset?.();
          break;
        case 'reservas':
          useReservasStore.getState().reset?.();
          break;
        case 'notificacoes':
          useNotificacoesStore.getState().reset?.();
          break;
      }
    } catch (e) {
      // swallow - caller should handle reporting
      // console.error('resetStores error for', k, e);
    }
    // remove persisted key so hydrate doesn't bring old data back
    const storageKey = persistKeyMap[k];
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      /* ignore */
    }
  });
}

export function resetAll() {
  resetStores(Object.keys(persistKeyMap) as PersistKey[]);
}
