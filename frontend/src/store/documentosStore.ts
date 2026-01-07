import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificacoesStore } from './notificacoesStore';

export type TipoDocumento = 
  | 'RG' 
  | 'CPF' 
  | 'Comprovante Residência' 
  | 'Contrato' 
  | 'Carteira Trabalho'
  | 'Certidão Nascimento'
  | 'Diploma'
  | 'Certificado'
  | 'Atestado'
  | 'Outro';

export type StatusDocumento = 'pendente' | 'aprovado' | 'rejeitado';

export type AcaoHistorico = 
  | 'upload'
  | 'aprovacao'
  | 'rejeicao'
  | 'substituicao'
  | 'exclusao'
  | 'download';

export interface HistoricoDocumento {
  id: string;
  documentoId: string;
  acao: AcaoHistorico;
  usuarioId: string;
  usuarioNome: string;
  data: string; // ISO string
  observacoes?: string;
  detalhes?: Record<string, any>; // dados adicionais da ação
}

export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  tamanho: number; // bytes
  dataUpload: string; // ISO string
  uploadPor: string; // userId
  uploadPorNome: string;
  colaboradorId: number; // dono do documento
  colaboradorNome: string;
  pastaId?: string; // null = raiz
  url?: string; // mock URL ou base64
  mimetype?: string;
  status: StatusDocumento;
  statusAlteradoPor?: string;
  statusAlteradoEm?: string;
  observacoes?: string;
  historico: HistoricoDocumento[];
  versaoAnteriorId?: string; // ID do documento que este substituiu
}

export interface Pasta {
  id: string;
  nome: string;
  descricao?: string;
  pastaIdPai?: string; // null = raiz
  criadoPor: string;
  criadoPorNome: string;
  criadoEm: string; // ISO string
  colaboradorId?: number; // null = pasta compartilhada/organizacional
  cor?: string; // para visualização
  compartilhadoCom?: number[]; // IDs dos colaboradores que têm acesso
}

interface DocumentosState {
  documentos: Documento[];
  pastas: Pasta[];
  
  // Pastas
  adicionarPasta: (pasta: Omit<Pasta, 'id' | 'criadoEm'>) => void;
  atualizarPasta: (id: string, dados: Partial<Pasta>) => void;
  removerPasta: (id: string) => void;
  getPastasByColaborador: (colaboradorId: number) => Pasta[];
  getPastasByPai: (pastaIdPai?: string) => Pasta[];
  compartilharPasta: (pastaId: string, colaboradoresIds: number[]) => void;
  removerCompartilhamento: (pastaId: string, colaboradorId: number) => void;
  
  // Documentos
  adicionarDocumento: (doc: Omit<Documento, 'id' | 'dataUpload' | 'historico'>) => void;
  atualizarDocumento: (id: string, dados: Partial<Documento>) => void;
  removerDocumento: (id: string) => void;
  substituirDocumento: (documentoAntigoId: string, novoDoc: Omit<Documento, 'id' | 'dataUpload' | 'historico' | 'versaoAnteriorId'>) => void;
  getDocumentosByColaborador: (colaboradorId: number) => Documento[];
  getDocumentosByPasta: (pastaId?: string) => Documento[];
  aprovarDocumento: (id: string, userId: string, userName: string, observacoes?: string) => void;
  rejeitarDocumento: (id: string, userId: string, userName: string, observacoes: string) => void;
  
  // Histórico
  adicionarHistorico: (documentoId: string, acao: AcaoHistorico, usuarioId: string, usuarioNome: string, observacoes?: string, detalhes?: Record<string, any>) => void;
  getHistoricoDocumento: (documentoId: string) => HistoricoDocumento[];
  
  // Templates e Documentos Obrigatórios
  criarPastasDeTemplate: (colaboradorId: number, cargo: string, criadoPor: string, criadoPorNome: string) => void;
  getDocumentosObrigatorios: (cargo: string) => TipoDocumento[];
  getProgressoDocumentos: (colaboradorId: number) => { total: number; enviados: number; aprovados: number; rejeitados: number; pendentes: number };
  
  reset: () => void;
}

// Documentos obrigatórios por cargo
const DOCUMENTOS_OBRIGATORIOS: Record<string, TipoDocumento[]> = {
  'Desenvolvedor': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho', 'Diploma'],
  'Designer': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho', 'Certificado'],
  'Gerente': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho', 'Diploma'],
  'Analista': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho'],
  'Assistente': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho'],
  'default': ['RG', 'CPF', 'Comprovante Residência', 'Carteira Trabalho'] // padrão
};

// Templates de pastas por cargo
const TEMPLATES_PASTAS = {
  onboarding: {
    nome: 'Onboarding',
    descricao: 'Documentos do processo de integração',
    cor: '#10B981'
  },
  pessoais: {
    nome: 'Documentos Pessoais',
    descricao: 'RG, CPF, comprovantes e documentos de identificação',
    cor: '#3B82F6'
  },
  contratuais: {
    nome: 'Contratuais',
    descricao: 'Contratos, termos e acordos',
    cor: '#8B5CF6'
  },
  formacao: {
    nome: 'Formação e Certificados',
    descricao: 'Diplomas, certificados e cursos',
    cor: '#F59E0B'
  }
};

// Mock de pastas iniciais
const mockPastas: Pasta[] = [];
const mockDocumentos: Documento[] = [];
export const useDocumentosStore = create<DocumentosState>()(
  persist(
    (set, get) => ({
      documentos: mockDocumentos,
      pastas: mockPastas,

      // Pastas
      adicionarPasta: (pasta) =>
        set((state) => {
          const newPasta: Pasta = {
            ...pasta,
            id: `pasta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            criadoEm: new Date().toISOString()
          };
          return { pastas: [...state.pastas, newPasta] };
        }),

      atualizarPasta: (id, dados) =>
        set((state) => ({
          pastas: state.pastas.map((p) => (p.id === id ? { ...p, ...dados } : p))
        })),

      removerPasta: (id) =>
        set((state) => {
          // Remove a pasta e todos os documentos dentro dela
          const pastasFilhas = state.pastas.filter((p) => p.pastaIdPai === id).map((p) => p.id);
          const todasPastasRemover = [id, ...pastasFilhas];
          
          return {
            pastas: state.pastas.filter((p) => !todasPastasRemover.includes(p.id) && p.pastaIdPai !== id),
            documentos: state.documentos.filter((d) => !todasPastasRemover.includes(d.pastaId || ''))
          };
        }),

      getPastasByColaborador: (colaboradorId) => {
        const state = get();
        return state.pastas.filter(
          (p) => 
            p.colaboradorId === colaboradorId || 
            p.compartilhadoCom?.includes(colaboradorId)
        );
      },

      getPastasByPai: (pastaIdPai) => {
        const state = get();
        return state.pastas.filter((p) => p.pastaIdPai === pastaIdPai);
      },

      compartilharPasta: (pastaId, colaboradoresIds) =>
        set((state) => ({
          pastas: state.pastas.map((p) =>
            p.id === pastaId
              ? { ...p, compartilhadoCom: [...(p.compartilhadoCom || []), ...colaboradoresIds] }
              : p
          )
        })),

      removerCompartilhamento: (pastaId, colaboradorId) =>
        set((state) => ({
          pastas: state.pastas.map((p) =>
            p.id === pastaId
              ? { ...p, compartilhadoCom: (p.compartilhadoCom || []).filter((id) => id !== colaboradorId) }
              : p
          )
        })),

      // Documentos
      adicionarDocumento: (doc) =>
        set((state) => {
          const newDoc: Documento = {
            ...doc,
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            dataUpload: new Date().toISOString(),
            historico: []
          };
          
          // Adiciona entrada no histórico
          const historico: HistoricoDocumento = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentoId: newDoc.id,
            acao: 'upload',
            usuarioId: doc.uploadPor,
            usuarioNome: doc.uploadPorNome,
            data: newDoc.dataUpload,
            observacoes: `Documento ${doc.tipo} enviado`
          };
          
          newDoc.historico = [historico];
          
          // Emitir notificação para gestores de RH sobre novo documento pendente
          useNotificacoesStore.getState().adicionarNotificacao({
            tipo: 'documento_pendente',
            titulo: `Novo documento para aprovação`,
            mensagem: `${doc.uploadPorNome} enviou "${doc.nome}" (${doc.tipo}) para aprovação.`,
            link: '/documentos',
            prioridade: 'media',
            categoria: 'documentos',
          });
          
          return { documentos: [...state.documentos, newDoc] };
        }),

      substituirDocumento: (documentoAntigoId, novoDoc) =>
        set((state) => {
          const docAntigo = state.documentos.find(d => d.id === documentoAntigoId);
          
          if (!docAntigo) {
            console.error('Documento antigo não encontrado');
            return state;
          }

          const newDoc: Documento = {
            ...novoDoc,
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            dataUpload: new Date().toISOString(),
            historico: [],
            versaoAnteriorId: documentoAntigoId
          };

          // Copia histórico do documento antigo e adiciona entrada de substituição
          const historicoSubstituicao: HistoricoDocumento = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentoId: newDoc.id,
            acao: 'substituicao',
            usuarioId: novoDoc.uploadPor,
            usuarioNome: novoDoc.uploadPorNome,
            data: newDoc.dataUpload,
            observacoes: `Documento reenviado após rejeição`,
            detalhes: { documentoAnteriorId: documentoAntigoId, motivoRejeicao: docAntigo.observacoes }
          };

          newDoc.historico = [...docAntigo.historico, historicoSubstituicao];

          return { documentos: [...state.documentos, newDoc] };
        }),

      atualizarDocumento: (id, dados) =>
        set((state) => ({
          documentos: state.documentos.map((d) => (d.id === id ? { ...d, ...dados } : d))
        })),

      removerDocumento: (id) =>
        set((state) => ({
          documentos: state.documentos.filter((d) => d.id !== id)
        })),

      getDocumentosByColaborador: (colaboradorId) => {
        const state = get();
        return state.documentos.filter((d) => d.colaboradorId === colaboradorId);
      },

      getDocumentosByPasta: (pastaId) => {
        const state = get();
        return state.documentos.filter((d) => d.pastaId === pastaId);
      },

      aprovarDocumento: (id, userId, userName, observacoes) =>
        set((state) => {
          const documento = state.documentos.find(d => d.id === id);
          
          const historico: HistoricoDocumento = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentoId: id,
            acao: 'aprovacao',
            usuarioId: userId,
            usuarioNome: userName,
            data: new Date().toISOString(),
            observacoes: observacoes || 'Documento aprovado'
          };
          
          if (documento) {
            // Emitir notificação para o colaborador dono do documento
            useNotificacoesStore.getState().adicionarNotificacao({
              tipo: 'documento_aprovado',
              titulo: `Documento aprovado: ${documento.nome}`,
              mensagem: `Seu documento "${documento.nome}" (${documento.tipo}) foi aprovado por ${userName}.`,
              link: '/documentos',
              prioridade: 'media',
              categoria: 'documentos',
            });
          }
          
          return {
            documentos: state.documentos.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: 'aprovado',
                    statusAlteradoPor: userId,
                    statusAlteradoEm: new Date().toISOString(),
                    observacoes,
                    historico: [...d.historico, historico]
                  }
                : d
            )
          };
        }),

      rejeitarDocumento: (id, userId, userName, observacoes) =>
        set((state) => {
          const documento = state.documentos.find(d => d.id === id);
          
          const historico: HistoricoDocumento = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentoId: id,
            acao: 'rejeicao',
            usuarioId: userId,
            usuarioNome: userName,
            data: new Date().toISOString(),
            observacoes
          };
          
          if (documento) {
            // Emitir notificação para o colaborador dono do documento
            useNotificacoesStore.getState().adicionarNotificacao({
              tipo: 'documento_rejeitado',
              titulo: `Documento rejeitado: ${documento.nome}`,
              mensagem: `Seu documento "${documento.nome}" (${documento.tipo}) foi rejeitado por ${userName}. Motivo: ${observacoes}`,
              link: '/documentos',
              prioridade: 'alta',
              categoria: 'documentos',
            });
          }
          
          return {
            documentos: state.documentos.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: 'rejeitado',
                    statusAlteradoPor: userId,
                    statusAlteradoEm: new Date().toISOString(),
                    observacoes,
                    historico: [...d.historico, historico]
                  }
                : d
            )
          };
        }),

      // Histórico
      adicionarHistorico: (documentoId, acao, usuarioId, usuarioNome, observacoes, detalhes) =>
        set((state) => {
          const historico: HistoricoDocumento = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentoId,
            acao,
            usuarioId,
            usuarioNome,
            data: new Date().toISOString(),
            observacoes,
            detalhes
          };
          
          return {
            documentos: state.documentos.map((d) =>
              d.id === documentoId
                ? { ...d, historico: [...d.historico, historico] }
                : d
            )
          };
        }),

      getHistoricoDocumento: (documentoId) => {
        const state = get();
        const doc = state.documentos.find((d) => d.id === documentoId);
        return doc?.historico || [];
      },

      // Templates e Documentos Obrigatórios
      criarPastasDeTemplate: (colaboradorId, cargo, criadoPor, criadoPorNome) => {
        const state = get();
        
        // Verifica se já existem pastas para este colaborador
        const pastasExistentes = state.pastas.filter(p => p.colaboradorId === colaboradorId);
        if (pastasExistentes.length > 0) {
          console.log('Pastas já existem para este colaborador');
          return;
        }

        const novasPastas: Pasta[] = [
          {
            id: `pasta-onb-${colaboradorId}-${Date.now()}`,
            ...TEMPLATES_PASTAS.onboarding,
            criadoPor,
            criadoPorNome,
            criadoEm: new Date().toISOString(),
            colaboradorId
          },
          {
            id: `pasta-pes-${colaboradorId}-${Date.now()}`,
            ...TEMPLATES_PASTAS.pessoais,
            criadoPor,
            criadoPorNome,
            criadoEm: new Date().toISOString(),
            colaboradorId
          },
          {
            id: `pasta-con-${colaboradorId}-${Date.now()}`,
            ...TEMPLATES_PASTAS.contratuais,
            criadoPor,
            criadoPorNome,
            criadoEm: new Date().toISOString(),
            colaboradorId
          }
        ];

        // Se o cargo exigir diploma/certificado, adiciona pasta de formação
        const docsObrigatorios = DOCUMENTOS_OBRIGATORIOS[cargo] || DOCUMENTOS_OBRIGATORIOS.default;
        if (docsObrigatorios.includes('Diploma') || docsObrigatorios.includes('Certificado')) {
          novasPastas.push({
            id: `pasta-for-${colaboradorId}-${Date.now()}`,
            ...TEMPLATES_PASTAS.formacao,
            criadoPor,
            criadoPorNome,
            criadoEm: new Date().toISOString(),
            colaboradorId
          });
        }

        set((state) => ({
          pastas: [...state.pastas, ...novasPastas]
        }));
      },

      getDocumentosObrigatorios: (cargo) => {
        return DOCUMENTOS_OBRIGATORIOS[cargo] || DOCUMENTOS_OBRIGATORIOS.default;
      },

      getProgressoDocumentos: (colaboradorId) => {
        const state = get();
        const colaborador = state.documentos.find(d => d.colaboradorId === colaboradorId);
        
        if (!colaborador) {
          return { total: 0, enviados: 0, aprovados: 0, rejeitados: 0, pendentes: 0 };
        }

        const docsColaborador = state.documentos.filter(d => d.colaboradorId === colaboradorId);
        
        // Pega os documentos obrigatórios baseado no cargo (precisa do cargo do colaborador)
        // Por ora, vamos usar o padrão
        const docsObrigatorios = DOCUMENTOS_OBRIGATORIOS.default;
        
        const total = docsObrigatorios.length;
        const enviados = docsColaborador.length;
        const aprovados = docsColaborador.filter(d => d.status === 'aprovado').length;
        const rejeitados = docsColaborador.filter(d => d.status === 'rejeitado').length;
        const pendentes = docsColaborador.filter(d => d.status === 'pendente').length;

        return { total, enviados, aprovados, rejeitados, pendentes };
      },

      reset: () => set({ documentos: mockDocumentos, pastas: mockPastas })
    }),
    {
      name: 'cfo:documentos',
      partialize: (s) => ({ documentos: s.documentos, pastas: s.pastas })
    }
  )
);
