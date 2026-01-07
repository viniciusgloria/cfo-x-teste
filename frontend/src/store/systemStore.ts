import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemConfig {
  // Configurações de E-mail
  emailConfig: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName: string;
    useTLS?: boolean;
    useSSL?: boolean;
  };

  // Configurações de Integrações (Omie)
  omieConfig: {
    grupos: OmieGrupo[];
  };

  // Configurações Gerais do Sistema
  systemConfig: {
    companyName: string;
    supportEmail?: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };

  // Configurações de Notificações
  notificationConfig: {
    emailNotifications: boolean;
    systemNotifications: boolean;
    devolutionNotifications: boolean;
    approvalNotifications: boolean;
  };

  // Contas de acesso de clientes ao portal
  clientesAccess: ClienteAcesso[];
}

export interface OmieGrupo {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ClienteAcesso {
  id: string;
  nome: string;
  email: string;
  empresa?: string;
  ativo: boolean;
}

interface SystemStore {
  config: SystemConfig;
  updateEmailConfig: (config: Partial<SystemConfig['emailConfig']>) => void;
  addOmieGrupo: (grupo: Omit<OmieGrupo, 'id'>) => void;
  removeOmieGrupo: (id: string) => void;
  updateOmieGrupo: (id: string, data: Partial<OmieGrupo>) => void;
  updateSystemConfig: (config: Partial<SystemConfig['systemConfig']>) => void;
  updateNotificationConfig: (config: Partial<SystemConfig['notificationConfig']>) => void;
  addClienteAcesso: (data: Omit<ClienteAcesso, 'id' | 'ativo'> & { ativo?: boolean }) => void;
  toggleClienteAcesso: (id: string) => void;
  removeClienteAcesso: (id: string) => void;
  reset: () => void;
}

const defaultConfig: SystemConfig = {
  emailConfig: {
    fromEmail: 'sistema@cfocompany.com',
    fromName: 'CFO Hub',
    smtpHost: '',
    smtpPort: 587,
    useTLS: true,
    useSSL: false,
  },
  omieConfig: {
    grupos: [],
  },
  systemConfig: {
    companyName: 'CFO Hub',
    supportEmail: 'suporte@cfocompany.com',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
  },
  notificationConfig: {
    emailNotifications: true,
    systemNotifications: true,
    devolutionNotifications: true,
    approvalNotifications: true,
  },
  clientesAccess: [],
};

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      config: defaultConfig,

      updateEmailConfig: (updates) => set((state) => ({
        config: {
          ...state.config,
          emailConfig: { ...state.config.emailConfig, ...updates }
        }
      })),

      addOmieGrupo: (grupo) => set((state) => ({
        config: {
          ...state.config,
          omieConfig: {
            ...state.config.omieConfig,
            grupos: [...state.config.omieConfig.grupos, { id: `grp-${Date.now()}`, ...grupo }]
          }
        }
      })),

      updateOmieGrupo: (id, data) => set((state) => ({
        config: {
          ...state.config,
          omieConfig: {
            ...state.config.omieConfig,
            grupos: state.config.omieConfig.grupos.map((g) => g.id === id ? { ...g, ...data } : g)
          }
        }
      })),

      removeOmieGrupo: (id) => set((state) => ({
        config: {
          ...state.config,
          omieConfig: {
            ...state.config.omieConfig,
            grupos: state.config.omieConfig.grupos.filter((g) => g.id !== id)
          }
        }
      })),

      updateSystemConfig: (updates) => set((state) => ({
        config: {
          ...state.config,
          systemConfig: { ...state.config.systemConfig, ...updates }
        }
      })),

      updateNotificationConfig: (updates) => set((state) => ({
        config: {
          ...state.config,
          notificationConfig: { ...state.config.notificationConfig, ...updates }
        }
      })),

      addClienteAcesso: (data) => set((state) => ({
        config: {
          ...state.config,
          clientesAccess: [
            ...state.config.clientesAccess,
            { id: `cliacc-${Date.now()}`, ativo: data.ativo ?? true, ...data }
          ]
        }
      })),

      toggleClienteAcesso: (id) => set((state) => ({
        config: {
          ...state.config,
          clientesAccess: state.config.clientesAccess.map((c) => c.id === id ? { ...c, ativo: !c.ativo } : c)
        }
      })),

      removeClienteAcesso: (id) => set((state) => ({
        config: {
          ...state.config,
          clientesAccess: state.config.clientesAccess.filter((c) => c.id !== id)
        }
      })),

      reset: () => set({ config: defaultConfig }),
    }),
    {
      name: 'system-config',
    }
  )
);