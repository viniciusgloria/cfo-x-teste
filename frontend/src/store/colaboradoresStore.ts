import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColaboradorCompleto } from '../types';
import { getWelcomeEmailData } from '../utils/emailTemplates';

export interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone?: string;
  avatar?: string;
  status: 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo';
  metaHorasMensais?: number; // Meta de horas por mês (padrão 176h)
  dispensaDocumentacao?: boolean; // Permite ativar sem documentos (casos atípicos)
  
  // Configuração de jornada personalizada
  jornadaInicio?: string; // Horário de início (ex: '09:00')
  jornadaFim?: string; // Horário de fim (ex: '18:00')
  jornadaIntervalo?: string; // Duração do intervalo (ex: '01:00')
  
  // Campos extras para integração com folha de pagamento
  nomeCompleto?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  setor?: string;
  funcao?: string;
  empresa?: string;
  grupoId?: string; // Grupo Omie associado ao usuário
  grupoNome?: string; // Nome do grupo Omie
  regime?: 'CLT' | 'PJ';
  contrato?: 'CLT' | 'PJ';
  chavePix?: string;
  banco?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  tipoConta?: 'corrente' | 'poupanca';
  cnpj?: string;
  razaoSocial?: string;
  obs?: string;
}

interface ColaboradoresState {
  colaboradores: Colaborador[];
  busca: string;
  filtroStatus: string;
  setBusca: (b: string) => void;
  setFiltroStatus: (s: string) => void;
  adicionarColaborador: (dados: Omit<Colaborador, 'id'>) => void;
  atualizarColaborador: (id: number, dados: Partial<Colaborador>) => void;
  updateAvatarByEmail: (email: string, avatarUrl: string) => void;
  podeAtivarColaborador: (id: number) => { pode: boolean; motivo?: string };
  enviarEmailBoasVindas: (id: number) => void;
  reset: () => void;
}

const mock: Colaborador[] = [
  {
    id: 1,
    nome: 'Administrador',
    cargo: 'Administrador',
    departamento: 'TI',
    email: 'admin@cfohub.com',
    status: 'ativo',
    contrato: 'CLT',
    regime: 'CLT',
    dispensaDocumentacao: true, // Administrador não precisa de documentação
  }
];

export const useColaboradoresStore = create<ColaboradoresState>()(
  persist(
    (set) => ({
      colaboradores: mock,
      busca: '',
      filtroStatus: 'Todos',
      setBusca: (b) => set({ busca: b }),
      setFiltroStatus: (s) => set({ filtroStatus: s }),
      adicionarColaborador: (dados) =>
        set((state) => {
          const newId = Math.max(...state.colaboradores.map((c) => c.id)) + 1;
          const newColaborador: Colaborador = { id: newId, ...dados };
          return { colaboradores: [...state.colaboradores, newColaborador] };
        }),
      atualizarColaborador: (id, dados) =>
        set((state) => ({
          colaboradores: state.colaboradores.map((c) =>
            c.id === id ? { ...c, ...dados } : c
          ),
        })),
      updateAvatarByEmail: (email, avatarUrl) =>
        set((state) => ({
          colaboradores: state.colaboradores.map((c) =>
            c.email === email ? { ...c, avatar: avatarUrl } : c
          ),
        })),
      
      podeAtivarColaborador: (id) => {
        // Importar dinamicamente o documentosStore para evitar dependência circular
        const { useDocumentosStore } = require('./documentosStore');
        const store = useDocumentosStore.getState();
        
        const state = useColaboradoresStore.getState();
        const colaborador = state.colaboradores.find(c => c.id === id);
        
        // Se colaborador tem dispensa de documentação, pode ativar
        if (colaborador?.dispensaDocumentacao) {
          return { pode: true };
        }
        
        const progresso = store.getProgressoDocumentos(id);
        const docsObrigatorios = store.getDocumentosObrigatorios(colaborador?.cargo || 'default');
        
        if (progresso.aprovados < docsObrigatorios.length) {
          return {
            pode: false,
            motivo: `Faltam ${docsObrigatorios.length - progresso.aprovados} documento(s) obrigatório(s) aprovado(s)`
          };
        }
        
        if (progresso.pendentes > 0) {
          return {
            pode: false,
            motivo: `Existem ${progresso.pendentes} documento(s) pendente(s) de aprovação`
          };
        }
        
        return { pode: true };
      },

      enviarEmailBoasVindas: (id) => {
        const { toast } = require('react-hot-toast');
        const { useDocumentosStore } = require('./documentosStore');
        
        set((state) => {
          const colaborador = state.colaboradores.find(c => c.id === id);
          
          if (!colaborador) {
            toast.error('Colaborador não encontrado');
            return state;
          }

          // Preparar dados do email usando template
          const docsStore = useDocumentosStore.getState();
          const docsObrigatorios = docsStore.getDocumentosObrigatorios(colaborador.cargo);
          
          const { subject, body } = getWelcomeEmailData(
            colaborador.nome,
            colaborador.email,
            'Cfo@2024', // Senha temporária
            docsObrigatorios
          );
          
          console.log(`📧 ${subject}\n\nPara: ${colaborador.email}\n\n${body}`);
          
          toast.success(`E-mail de boas-vindas enviado para ${colaborador.email}!`);
          
          return state;
        });
      },

      reset: () => set({ colaboradores: mock, busca: '', filtroStatus: 'Todos' }),
    }),
    { name: 'cfo:colaboradores', partialize: (s) => ({ colaboradores: s.colaboradores }) }
  )
);
