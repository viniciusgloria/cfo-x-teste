import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';
import { sendEmail, generateDevolutionEmail } from '../utils/emailUtils';
import clientesService, { ClienteAPI, ClienteCreateDTO } from '../services/clientesService';
import toast from 'react-hot-toast';

// Seção 1: Dados Gerais
export interface DadosGerais {
  logoUrl?: string;
  logo?: Attachment;
  cnpj: string;
  cnpjAdicionais?: string[];
  nome: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  uf?: string;
  site?: string;
  segmentoAtuacao?: string;
  tempoMercado?: '<1' | '1' | '2' | '3' | '4' | '5' | '>5';
  observacao?: string;
  cartoesCNPJ?: Attachment[];
  contratosSociais?: Attachment[];
}

// Seção 2: Contatos Principais
export interface ContatosPrincipais {
  nomeSocio: string;
  cpfSocio?: string;
  emailPrincipal: string;
  emailFinanceiro?: string;
  telefone: string;
  whatsapp?: string;
}

// Seção 3: Outros Contatos
export interface OutroContato {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  participaImplantacao: boolean;
}

// Seção 4: Comunicação
export interface ComunicacaoFluxo {
  canalPreferencial: 'whatsapp' | 'email' | 'outro';
  canalOutro?: string;
  horarioPreferencial: 'comercial' | 'outro';
  horarioOutro?: string;
  pessoaContatoPrincipal: string;
}

// Seção 5: Serviços Contratados
export interface ServicosContratados {
  bpoFinanceiro: boolean;
  assessoriaFinanceira: boolean;
  contabilidade: boolean;
  juridicoContratual: boolean;
  juridicoTributario: boolean;
  trading: boolean;
  outro?: string;
  observacoes?: string;
  previsaoInicio: string;
  dataContratoFechado?: string; // Data em que o contrato foi fechado
  planosHistorico?: PlanHistorico[]; // Histórico de planos/upsells do cliente
}

// Histórico de Planos/Upsell
export interface PlanHistorico {
  id: string; // UUID ou timestamp
  nomePlano: string; // Ex: "CFO X 1", "CFO C 5"
  mrr: number; // MRR deste plano
  dataInicio: string; // Data de início deste plano
  dataFim?: string; // Data de término/upgrade para próximo plano
  observacoes?: string; // Observações sobre este plano
}

type AuthFieldKey =
  | 'appKey'
  | 'appSecret'
  | 'clientId'
  | 'clientSecret'
  | 'apiToken'
  | 'partnerId'
  | 'partnerKey'
  | 'accessToken'
  | 'refreshToken'
  | 'awsAccessKey'
  | 'awsSecretKey'
  | 'roleArn'
  | 'appId'
  | 'appToken'
  | 'encryptionKey';

type IntegrationCredentials = Partial<Record<AuthFieldKey, string>>;
type IntegrationCategory = 'erp' | 'marketplace' | 'ads' | 'gateway';

const ERP_KEYS = ['omie', 'bling', 'tiny', 'conta_azul', 'linx', 'totvs'] as const;
const MARKETPLACE_KEYS = ['mercado_livre', 'tiktok_shop', 'shopee', 'amazon_br', 'magalu', 'aliexpress', 'shein'] as const;
const ADS_KEYS = ['google_ads', 'meta_ads', 'mercado_livre_ads', 'tiktok_ads', 'kwai_ads', 'amazon_ads', 'shopee_ads', 'pinterest_ads'] as const;
const GATEWAY_KEYS = ['yampi', 'shopify', 'mercado_pago', 'nuvemshop', 'cartpanda', 'appmax', 'pagarme', 'pagseguro', 'paypal', 'vtex'] as const;

type IntegrationMap = Record<string, IntegrationCredentials>;

const emptyCreds = (): IntegrationCredentials => ({
  appKey: '',
  appSecret: '',
  clientId: '',
  clientSecret: '',
  apiToken: '',
  partnerId: '',
  partnerKey: '',
  accessToken: '',
  refreshToken: '',
  awsAccessKey: '',
  awsSecretKey: '',
  roleArn: '',
  appId: '',
  appToken: '',
  encryptionKey: '',
});

const createDefaultIntegrations = () => ({
  erp: ERP_KEYS.reduce<IntegrationMap>((acc, key) => ({ ...acc, [key]: emptyCreds() }), {}),
  marketplace: MARKETPLACE_KEYS.reduce<IntegrationMap>((acc, key) => ({ ...acc, [key]: emptyCreds() }), {}),
  ads: ADS_KEYS.reduce<IntegrationMap>((acc, key) => ({ ...acc, [key]: emptyCreds() }), {}),
  gateway: GATEWAY_KEYS.reduce<IntegrationMap>((acc, key) => ({ ...acc, [key]: emptyCreds() }), {}),
});

// Seção 8: Integração / API
export interface OmieConfig {
  pertenceGrupo: boolean;
  grupoId?: string;
  appKey?: string;
  appSecret?: string;
  integracoes?: Partial<Record<IntegrationCategory, IntegrationMap>>;
}

// Seção 6: Pontos de Atenção (Admin/Gestor)
export interface PontosAtencao {
  pendencias?: string;
  exigenciasEspecificas?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
}

// Seção 7: Contexto Geral (Admin/Gestor)
export interface ContextoGeral {
  oQueEmpreendimento?: string;
  perfilCliente?: string;
  objetivos?: string;
  situacao?: string;
  expectativas?: string;
  observacao?: string;
}

export type StatusCadastro = 'rascunho' | 'pendente' | 'rejeitado' | 'aprovado' | 'ativo' | 'inativo' | 'pausado' | 'encerrado' | 'devolvido';

export interface Cliente {
  id: number;
  // Seções 1-5 (cliente preenche)
  dadosGerais: DadosGerais;
  contatosPrincipais: ContatosPrincipais;
  outrosContatos: OutroContato[];
  comunicacaoFluxo: ComunicacaoFluxo;
  servicosContratados: ServicosContratados;
  omieConfig?: OmieConfig;
  
  // Seções 6-7 (admin/gestor preenchem)
  pontosAtencao?: PontosAtencao;
  contextoGeral?: ContextoGeral;
  
  // Metadados
  status: StatusCadastro;
  mrr?: number;
  responsavel?: string; // Admin/Gestor responsável
  dataSubmissao?: string; // Quando cliente submeteu
  dataAprovacao?: string; // Quando admin aprovou
  motivoRejeicao?: string; // Se rejeitado
  comentariosDevolucao?: string; // Comentários quando devolvido para correção
  dataDevolucao?: string; // Quando foi devolvido para correção
  criadoEm: string;
  atualizadoEm: string;
}

interface Notificacao {
  id: string;
  tipo: 'cliente_submeteu' | 'admin_aprovou' | 'admin_rejeitou' | 'dados_faltantes' | 'admin_devolveu' | 'cliente_devolucao';
  clienteId: number;
  clienteNome: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
  // Para notificações de devolução ao cliente
  comentariosDevolucao?: string;
}

interface ClientesState {
  clientes: Cliente[];
  filtroStatus: string;
  busca: string;
  notificacoes: Notificacao[];
  isLoading: boolean;
  error: string | null;
  fetchClientes: () => Promise<void>;
  createClienteAPI: (dados: ClienteCreateDTO) => Promise<void>;
  deleteClienteAPI: (id: number) => Promise<void>;
  setFiltroStatus: (status: string) => void;
  setBusca: (busca: string) => void;
  criarCadastro: (dados: Partial<Cliente>) => number;
  atualizarCadastro: (id: number, dados: Partial<Cliente>) => void;
  submeterCadastro: (id: number) => void;
  aprovarCadastro: (id: number, responsavelId: string) => void;
  rejeitarCadastro: (id: number, motivo: string) => void;
  devolverCadastro: (id: number, comentarios: string) => void;
  removerCliente: (id: number) => void;
  editarCliente: (cliente: Cliente) => void;
  addNotificacao: (notif: Omit<Notificacao, 'id' | 'criadoEm'>) => void;
  marcarNotificacaoComoLida: (id: string) => void;
  syncOMIE: () => void;
  reset: () => void;
}

const mockClientes: Cliente[] = [];

// Helper para converter ClienteAPI para Cliente (formato interno)
function apiToCliente(apiCliente: ClienteAPI): Cliente {
  return {
    id: apiCliente.id,
    dadosGerais: {
      nome: apiCliente.nome,
      cnpj: apiCliente.cnpj || '',
      endereco: apiCliente.endereco || '',
      telefone: apiCliente.telefone || '',
      email: apiCliente.email || '',
    },
    contatosPrincipais: {
      nomeSocio: '',
      emailPrincipal: apiCliente.email || '',
      telefone: apiCliente.telefone || '',
    },
    outrosContatos: [],
    comunicacaoFluxo: {
      canalPreferencial: 'email',
      horarioPreferencial: 'comercial',
      pessoaContatoPrincipal: '',
    },
    servicosContratados: {
      previsaoInicio: apiCliente.data_inicio || '',
      bpoFinanceiro: false,
      assessoriaFinanceira: false,
      contabilidade: false,
      juridicoContratual: false,
      juridicoTributario: false,
      trading: false,
      planosHistorico: [],
    },
    omieConfig: {
      pertenceGrupo: false,
      appKey: '',
      appSecret: '',
      integracoes: createDefaultIntegrations(),
    },
    status: apiCliente.status.toLowerCase() as StatusCadastro,
    mrr: apiCliente.mrr,
    criadoEm: apiCliente.created_at,
    atualizadoEm: apiCliente.updated_at || apiCliente.created_at,
  };
}

export const useClientesStore = create<ClientesState>()(
  persist(
    (set, get) => ({
      clientes: mockClientes,
      notificacoes: [],
      filtroStatus: 'Todos',
      busca: '',
      isLoading: false,
      error: null,

      // Buscar clientes da API
      fetchClientes: async () => {
        console.log('🔄 fetchClientes INICIADO');
        set({ isLoading: true, error: null });
        try {
          console.log('📡 Chamando clientesService.list()...');
          const apiClientes = await clientesService.list();
          console.log('✅ Resposta da API:', apiClientes, 'tipo:', typeof apiClientes, 'isArray:', Array.isArray(apiClientes));
          
          if (!Array.isArray(apiClientes)) {
            console.error('❌ ERRO: API não retornou array! Recebeu:', apiClientes);
            throw new Error('API retornou resposta inválida (não é array)');
          }
          
          const clientes = apiClientes.map(apiToCliente);
          console.log('✅ Clientes transformados:', clientes.length);
          set({ clientes, isLoading: false });
          console.log('✅ Store atualizado com', clientes.length, 'clientes');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro ao carregar clientes';
          console.error('❌ fetchClientes ERRO:', error, 'mensagem:', errorMsg);
          set({ error: errorMsg, isLoading: false });
          toast.error(errorMsg);
        }
      },

      // Criar cliente via API
      createClienteAPI: async (dados) => {
        set({ isLoading: true, error: null });
        try {
          const novoCliente = await clientesService.create(dados);
          const cliente = apiToCliente(novoCliente);
          set((state) => ({
            clientes: [...state.clientes, cliente],
            isLoading: false,
          }));
          toast.success('Cliente criado com sucesso!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro ao criar cliente';
          set({ error: errorMsg, isLoading: false });
          toast.error(errorMsg);
          throw error;
        }
      },

      // Deletar cliente via API
      deleteClienteAPI: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await clientesService.delete(id);
          set((state) => ({
            clientes: state.clientes.filter((c) => c.id !== id),
            isLoading: false,
          }));
          toast.success('Cliente removido com sucesso!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro ao remover cliente';
          set({ error: errorMsg, isLoading: false });
          toast.error(errorMsg);
          throw error;
        }
      },
      
      setFiltroStatus: (status) => set({ filtroStatus: status }),
      setBusca: (busca) => set({ busca }),
      
      criarCadastro: (dados) => {
        const novoId = Math.max(...get().clientes.map(c => c.id), 0) + 1;
        const agora = new Date().toISOString();
        const novoCliente: Cliente = {
          id: novoId,
          dadosGerais: dados.dadosGerais || { cnpj: '', nome: '', endereco: '', telefone: '', email: '' },
          contatosPrincipais: dados.contatosPrincipais || { nomeSocio: '', emailPrincipal: '', telefone: '' },
          outrosContatos: dados.outrosContatos || [],
          comunicacaoFluxo: dados.comunicacaoFluxo || { canalPreferencial: 'email', horarioPreferencial: 'comercial', pessoaContatoPrincipal: '' },
          servicosContratados: dados.servicosContratados || { previsaoInicio: '', bpoFinanceiro: false, assessoriaFinanceira: false, contabilidade: false, juridicoContratual: false, juridicoTributario: false, trading: false, planosHistorico: [] },
          omieConfig: dados.omieConfig || { pertenceGrupo: false, appKey: '', appSecret: '', integracoes: createDefaultIntegrations() },
          status: 'rascunho',
          criadoEm: agora,
          atualizadoEm: agora,
        };
        set((state) => ({ clientes: [...state.clientes, novoCliente] }));
        return novoId;
      },
      
      atualizarCadastro: (id, dados) => {
        const agora = new Date().toISOString();
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...dados, atualizadoEm: agora } : c
          ),
        }));
      },
      
      submeterCadastro: (id) => {
        const agora = new Date().toISOString();
        set((state) => {
          const cliente = state.clientes.find(c => c.id === id);
          if (!cliente) return state;
          
          return {
            clientes: state.clientes.map((c) =>
              c.id === id ? { ...c, status: 'pendente' as StatusCadastro, dataSubmissao: agora, atualizadoEm: agora } : c
            ),
            notificacoes: [...state.notificacoes, {
              id: `notif-${Date.now()}`,
              tipo: 'cliente_submeteu',
              clienteId: id,
              clienteNome: cliente.dadosGerais.nome,
              mensagem: `${cliente.dadosGerais.nome} enviou cadastro para análise`,
              lida: false,
              criadoEm: agora,
            }]
          };
        });
      },
      
      aprovarCadastro: (id, responsavelId) => {
        const agora = new Date().toISOString();
        set((state) => {
          const cliente = state.clientes.find(c => c.id === id);
          if (!cliente) return state;
          
          return {
            clientes: state.clientes.map((c) =>
              c.id === id ? { ...c, status: 'aprovado' as StatusCadastro, responsavel: responsavelId, dataAprovacao: agora, atualizadoEm: agora } : c
            ),
            notificacoes: [...state.notificacoes, {
              id: `notif-${Date.now()}`,
              tipo: 'admin_aprovou',
              clienteId: id,
              clienteNome: cliente.dadosGerais.nome,
              mensagem: `Cadastro de ${cliente.dadosGerais.nome} foi aprovado!`,
              lida: false,
              criadoEm: agora,
            }]
          };
        });
      },
      
      rejeitarCadastro: (id, motivo) => {
        const agora = new Date().toISOString();
        set((state) => {
          const cliente = state.clientes.find(c => c.id === id);
          if (!cliente) return state;
          
          return {
            clientes: state.clientes.map((c) =>
              c.id === id ? { ...c, status: 'rejeitado' as StatusCadastro, motivoRejeicao: motivo, atualizadoEm: agora } : c
            ),
            notificacoes: [...state.notificacoes, {
              id: `notif-${Date.now()}`,
              tipo: 'admin_rejeitou',
              clienteId: id,
              clienteNome: cliente.dadosGerais.nome,
              mensagem: `Cadastro de ${cliente.dadosGerais.nome} foi rejeitado: ${motivo}`,
              lida: false,
              criadoEm: agora,
            }]
          };
        });
      },
      
      devolverCadastro: async (id, comentarios) => {
        const agora = new Date().toISOString();
        const cliente = get().clientes.find(c => c.id === id);
        if (!cliente) return;

        // Enviar e-mail para o cliente
        const emailData = generateDevolutionEmail(cliente.dadosGerais.nome, comentarios);
        emailData.to = cliente.contatosPrincipais.emailPrincipal;

        try {
          const emailSent = await sendEmail(emailData);
          if (!emailSent) {
            console.warn('⚠️ E-mail não foi enviado, mas cadastro foi devolvido');
          }
        } catch (error) {
          console.error('❌ Erro ao enviar e-mail:', error);
        }

        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, status: 'devolvido' as StatusCadastro, comentariosDevolucao: comentarios, dataDevolucao: agora, atualizadoEm: agora } : c
          ),
          notificacoes: [...state.notificacoes,
            // Notificação para admin/gestor
            {
              id: `notif-admin-${Date.now()}`,
              tipo: 'admin_devolveu',
              clienteId: id,
              clienteNome: cliente.dadosGerais.nome,
              mensagem: `Cadastro de ${cliente.dadosGerais.nome} foi devolvido para correção`,
              lida: false,
              criadoEm: agora,
            },
            // Notificação para cliente
            {
              id: `notif-cliente-${Date.now()}`,
              tipo: 'cliente_devolucao',
              clienteId: id,
              clienteNome: cliente.dadosGerais.nome,
              mensagem: 'Seu cadastro precisa de ajustes. Verifique seu e-mail.',
              lida: false,
              criadoEm: agora,
              comentariosDevolucao: comentarios,
            }
          ]
        }));
      },
      
      addNotificacao: (notif) => {
        set((state) => ({
          notificacoes: [...state.notificacoes, {
            id: `notif-${Date.now()}`,
            criadoEm: new Date().toISOString(),
            ...notif,
          }]
        }));
      },
      
      removerCliente: (id) => set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) })),
      
      editarCliente: (cliente) => set((state) => ({
        clientes: state.clientes.map((c) => c.id === cliente.id ? cliente : c)
      })),
      
      marcarNotificacaoComoLida: (id) => set((state) => ({
        notificacoes: state.notificacoes.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        )
      })),
      
      syncOMIE: () => {
        console.log('Sincronizando OMIE...');
      },
      
      reset: () => set({ clientes: mockClientes, filtroStatus: 'Todos', busca: '', notificacoes: [] }),
    }),
    { name: 'cfo:clientes', partialize: (s) => ({ clientes: s.clientes, notificacoes: s.notificacoes }) }
  )
);
