import { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'gestor' | 'colaborador' | 'cliente';

export interface HistoricoAlteracao {
  id: string;
  tipo: 'cargo' | 'setor';
  itemId: string;
  itemNome: string;
  acao: 'criacao' | 'edicao' | 'remocao';
  alteradoPor: string; // nome do usuário
  alteradoPorId: string; // id do usuário
  alteradoEm: string;
  detalhes?: string; // descrição da alteração
}

export interface Cargo {
  id: string;
  nome: string;
  descricao?: string;
  // Hierarquia
  nivelHierarquico?: number; // 1=C-Level, 2=Gerencial, 3=Supervisão, 4=Operacional, 5=Estagiário
  cargosPai?: string[]; // IDs dos cargos superiores (pode ter múltiplos)
  // Dados financeiros
  salarioBase?: number;
  salarioMax?: number;
  // Setores vinculados
  setoresVinculados?: string[]; // IDs dos setores onde este cargo pode existir
  // Competências e responsabilidades
  competencias?: string[]; // Lista de skills/competências necessárias
  responsabilidades?: string[]; // Lista de responsabilidades do cargo
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface Setor {
  id: string;
  nome: string;
  descricao?: string;
  // Hierarquia
  setorPai?: string; // ID do setor pai (apenas um)
  // Gestor
  gestorId?: string; // ID do usuário gestor
  gestorNome?: string; // Nome do gestor (cache)
  // Dados adicionais
  orcamentoAnual?: number;
  localizacao?: string; // Filial/localização física
  email?: string; // Email do departamento
  ramal?: string;
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  cargoId?: string; // ID do cargo
  setorId?: string; // ID do setor
  clienteId?: number; // ID do cliente vinculado (para role cliente)
  regime?: 'CLT' | 'PJ'; // Regime de contratação (para colaboradores)
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Data URL (base64) used for persistent previews */
  dataUrl: string;
  /** Simulated remote URL returned by the mock upload */
  remoteUrl: string;
}

// Tipos para Folha de Pagamento
export interface ColaboradorCompleto {
  // Dados pessoais
  id: number;
  nomeCompleto: string;
  rg?: string;
  cpf: string;
  telefone?: string;
  dataNascimento?: string;
  email?: string;
  
  // Endereço
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  
  // Dados profissionais
  setor: string;
  funcao: string;
  empresa: string;
  regime: 'CLT' | 'PJ';
  contrato: 'CLT' | 'PJ';
  situacao: 'ativo' | 'afastado' | 'desligado' | 'ferias';
  
  // Dados bancários
  chavePix?: string;
  banco?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  
  // Dados PJ (se aplicável)
  cnpj?: string;
  razaoSocial?: string;
  tipo?: string;
  enderecoEmpresa?: string;
  numeroEmpresa?: string;
  complementoEmpresa?: string;
  cepEmpresa?: string;
  bairroEmpresa?: string;
  cidadeEmpresa?: string;
  
  // Outros
  avatar?: string;
  obs?: string;
}

export interface PercentualOperacao {
  empresa1: number;
  empresa1Nome?: string;
  empresa2: number;
  empresa2Nome?: string;
  empresa3: number;
  empresa3Nome?: string;
  empresa4: number;
  empresa4Nome?: string;
  totalOpers: number;
}

export interface NotaFiscal {
  id: string;
  numero?: string;
  status: 'aguardando' | 'recebida' | 'pendente';
  pagamento: 'pendente' | 'agendado' | 'pago';
  data?: string;
  obs?: string;
  anexo?: Attachment;
}

export interface FolhaPagamento {
  id: string;
  colaboradorId: number;
  colaborador: ColaboradorCompleto;
  periodo: string; // formato: "2025-11"
  
  // Valores (preenchido pela empresa - amarelo)
  valor: number;
  adicional: number;
  reembolso: number;
  desconto: number;
  beneficios: number; // custo total de benefícios do colaborador
  valorTotal: number; // calculado automaticamente
  
  // Status e pagamento
  situacao: 'pendente' | 'agendado' | 'pago' | 'cancelado';
  dataPagamento?: string;
  
  // Nota fiscal (apenas para PJ)
  notaFiscal?: NotaFiscal;
  
  // Percentual por operação (divisão entre empresas)
  valorTotalSemReembolso: number; // calculado
  percentualOperacao?: PercentualOperacao;
  empresa1Valor?: number;
  empresa2Valor?: number;
  empresa3Valor?: number;
  empresa4Valor?: number;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

// Tipos para Folha de Clientes (BPO Financeiro)
export interface ClienteCompleto {
  id: number;
  nome: string;
  cnpj?: string;
  responsavel: string;
  email?: string;
  telefone?: string;
  status: 'ativo' | 'pausado' | 'encerrado';
  mrr: number;
  inicio: string;
  servicos: string[];
  setor?: string;
}

// Funcionário cadastrado pelo cliente para uso na folha de pagamento
export interface FuncionarioCliente {
  id: string;
  clienteId: number; // Cliente ao qual pertence
  
  // Dados pessoais
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  
  // Endereço
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  
  // Dados profissionais
  funcao: string;
  setor?: string;
  dataAdmissao?: string;
  tipoContrato: 'CLT' | 'PJ';
  
  // Dados bancários
  chavePix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: 'corrente' | 'poupanca';
  
  // Dados PJ (se aplicável)
  cnpj?: string;
  razaoSocial?: string;
  
  // Status
  status: 'ativo' | 'inativo';
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
}

export interface FolhaCliente {
  id: string;
  clienteId: number;
  cliente: ClienteCompleto;
  funcionarioId?: string; // ID do funcionário cadastrado pelo cliente
  periodo: string; // formato: "2025-11"
  
  // Campos preenchidos pelo CLIENTE (amarelo)
  colaborador: string; // nome do colaborador
  funcao?: string;
  empresa: string; // empresa responsável pelo pagamento
  ctt?: string; // centro de custo
  valor: number;
  adicional: number;
  reembolso: number;
  desconto: number;
  
  // Percentual por operação (preenchido pelo cliente)
  percentualOperacao?: {
    empresa1?: string;
    empresa1Percent?: number;
    empresa1Valor?: number;
    empresa2?: string;
    empresa2Percent?: number;
    empresa2Valor?: number;
    empresa3?: string;
    empresa3Percent?: number;
    empresa3Valor?: number;
    empresa4?: string;
    empresa4Percent?: number;
    empresa4Valor?: number;
    totalOpers?: number;
  };
  
  // Campos preenchidos pela CFO (verde)
  valorTotal: number; // calculado
  valorTotalSemReembolso: number; // calculado
  situacao: 'pendente' | 'agendado' | 'pago' | 'cancelado';
  dataPagamento?: string;
  
  // Nota fiscal
  notaFiscal?: {
    numero?: string;
    status: 'aguardando' | 'recebida' | 'pendente';
    pagamento: 'pendente' | 'agendado' | 'pago';
    data?: string;
    obs?: string;
  };
  
  // Informações adicionais CFO
  responsavelSetor?: string; // quem da CFO está cuidando
  statusOmie?: 'pendente' | 'enviado' | 'sincronizado' | 'erro';
  dataEnvioOmie?: string;
  codigoOmie?: string;
  obs?: string;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

// ===== BENEFÍCIOS =====

export type TipoBeneficio = 'alimentacao' | 'refeicao' | 'transporte' | 'saude' | 'odontologico' | 'academia' | 'seguro_vida' | 'vale_cultura' | 'auxilio_creche' | 'outros';

export type FornecedorBeneficio = 'alelo' | 'sodexo' | 'vr' | 'ticket' | 'flash' | 'ben' | 'caju' | 'swile' | 'ifood' | 'pluxee' | 'manual';

export interface FornecedorConfig {
  fornecedor: FornecedorBeneficio;
  nome: string;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  integracaoAtiva: boolean;
  ultimaSincronizacao?: string;
  configuracoes?: Record<string, any>;
}

export interface Beneficio {
  id: string;
  tipo: TipoBeneficio;
  nome: string;
  descricao?: string;
  fornecedor: FornecedorBeneficio;
  
  // Valores e configurações
  valorEmpresa: number; // quanto a empresa paga
  valorColaborador: number; // desconto do colaborador
  valorTotal: number; // valor total do benefício
  taxaAdministracao?: number; // taxa do fornecedor
  
  // Regras de elegibilidade
  obrigatorio: boolean;
  aplicavelTodos: boolean; // se aplica a todos os colaboradores
  cargosElegiveis?: string[]; // IDs dos cargos elegíveis
  setoresElegiveis?: string[]; // IDs dos setores elegíveis
  regimeElegivel?: ('CLT' | 'PJ')[]; // regimes elegíveis
  
  // Status
  ativo: boolean;
  dataInicio: string;
  dataFim?: string;
  
  // Integração
  integracaoConfig?: {
    fornecedorId?: string; // ID na plataforma do fornecedor
    sincronizacaoAutomatica: boolean;
    ultimaSincronizacao?: string;
    erroIntegracao?: string;
  };
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface BeneficioColaborador {
  id: string;
  beneficioId: string;
  colaboradorId: string;
  
  // Status
  status: 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
  dataAdesao: string;
  dataCancelamento?: string;
  motivoCancelamento?: string;
  
  // Valores personalizados (se diferentes do padrão)
  valorEmpresaCustom?: number;
  valorColaboradorCustom?: number;
  
  // Dados de integração
  numeroCartao?: string;
  fornecedorId?: string; // ID do colaborador no sistema do fornecedor
  ultimaRecarga?: string;
  proximaRecarga?: string;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface TransacaoBeneficio {
  id: string;
  beneficioColaboradorId: string;
  beneficioId: string;
  colaboradorId: string;
  
  // Transação
  tipo: 'recarga' | 'estorno' | 'ajuste' | 'cancelamento';
  valor: number;
  data: string;
  descricao?: string;
  
  // Status
  status: 'pendente' | 'processando' | 'concluido' | 'falhou' | 'cancelado';
  erroMsg?: string;
  
  // Integração
  fornecedorTransacaoId?: string;
  sincronizado: boolean;
  
  // Metadados
  criadoEm: string;
  criadoPor?: string;
}

export interface MetricasBeneficios {
  // Totais gerais
  totalBeneficios: number;
  beneficiosAtivos: number;
  totalColaboradoresComBeneficios: number;
  
  // Custos mensais
  custoTotalMensal: number;
  custoEmpresaMensal: number;
  custoColaboradorMensal: number;
  
  // Por tipo
  custosPorTipo: {
    tipo: TipoBeneficio;
    nome: string;
    totalColaboradores: number;
    custoTotal: number;
    custoEmpresa: number;
    custoColaborador: number;
  }[];
  
  // Por fornecedor
  custosPorFornecedor: {
    fornecedor: FornecedorBeneficio;
    nome: string;
    totalBeneficios: number;
    totalColaboradores: number;
    custoTotal: number;
  }[];
  
  // Adesão
  taxaAdesao: number; // % de colaboradores com pelo menos 1 benefício
  beneficioMaisUtilizado: {
    nome: string;
    tipo: TipoBeneficio;
    totalColaboradores: number;
  } | null;
  
  // Tendências (últimos 6 meses)
  evolucaoCustos: {
    mes: string;
    custoTotal: number;
    custoEmpresa: number;
    custoColaborador: number;
  }[];
}

// ===== TAREFAS KANBAN =====

export type KanbanStatus = string; // Agora suporta status personalizados

export interface KanbanColumn {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  isPadrao: boolean; // Impede exclusão de colunas padrão
  criadoEm: string;
  atualizadoEm: string;
}

export interface Subtask {
  id: string;
  titulo: string;
  descricao?: string;
  status: KanbanStatus;
  concluido: boolean;
  ordem: number;
  subtasks?: Subtask[]; // Suporte a múltiplos níveis
  criadoEm: string;
  atualizadoEm: string;
}

export type FrequenciaTemplate = 'unica' | 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral' | 'anual';

export interface TagTarefa {
  id: string;
  nome: string;
  setorId?: string;
  cor?: string;
  criadoEm: string;
}

export interface TempoTarefa {
  id: string;
  tarefaId: string;
  colaboradorId: string;
  colaborador?: User;
  inicio: string; // ISO datetime
  fim?: string; // ISO datetime
  horasRegistradas: number;
  descricao?: string;
  criadoEm: string;
}

export interface LogTarefa {
  id: string;
  tarefaId: string;
  acao: 'criacao' | 'edicao' | 'movimentacao' | 'atribuicao' | 'comentario' | 'conclusao';
  campo?: string;
  valorAnterior?: any;
  valorNovo?: any;
  descricao: string;
  usuarioId: string;
  usuarioNome: string;
  criadoEm: string;
}

export interface SavedView {
  id: string;
  nome: string;
  filtros: {
    searchValue?: string;
    filterStatus?: KanbanStatus;
    filterColaborador?: string;
    filterSetor?: string;
    filterPriority?: string;
  };
  ordenacao?: {
    campo: 'prioridade' | 'data' | 'titulo';
    direcao: 'asc' | 'desc';
  };
  criadoEm: string;
}

export interface ComentarioTarefa {
  id: string;
  tarefaId: string;
  texto: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioAvatar?: string;
  criadoEm: string;
  atualizadoEm?: string;
  mentions?: string[]; // IDs dos usuários mencionados
}

export interface AnexoTarefa {
  id: string;
  tarefaId: string;
  nome: string;
  url: string;
  tipo: string; // mime type: image/png, application/pdf, etc
  tamanho: number; // bytes
  usuarioId: string;
  usuarioNome: string;
  criadoEm: string;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
}

export interface Milestone {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // YYYY-MM-DD
  tarefaIds: string[]; // Tarefas vinculadas
  cor?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: KanbanStatus;
  
  // Colaboradores responsáveis
  colaboradorIds: string[];
  colaboradores?: User[];
  
  // Watchers (seguidores)
  watcherIds: string[];
  
  // Histórico
  logs: LogTarefa[];
  
  // Comentários
  comentarios: ComentarioTarefa[];
  
  // Anexos
  anexos: AnexoTarefa[];
  
  // Checklist
  checklist: ChecklistItem[];
  
  // Milestone
  milestoneId?: string;
  
  // Dependências entre tarefas
  dependsOn: string[]; // tarefas que essa depende
  blocks: string[]; // tarefas que essa bloqueia
  
  // Subtasks
  subtasks?: Subtask[];
  
  // Categorias e tags
  tags: TagTarefa[];
  
  // OKR associado
  okrId?: string;
  okr?: any; // referência ao OKR
  
  // Timesheet
  tempos: TempoTarefa[];
  tempoTotalHoras: number;
  
  // Datas
  dataCriacao: string;
  dataInicio?: string;
  dataVencimento?: string;
  dataFinalizacao?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  
  // Recorrência (unificado com templates)
  isRecorrente?: boolean;
  recorrencia?: {
    frequencia: FrequenciaTemplate;
    dataInicioRecorrencia: string;
    dataFimRecorrencia?: string; // se vazio, repete indefinidamente
    dia?: number; // 1-31 para mensal, 1-7 para semanal (1=seg, 7=dom)
    diasSemana?: number[]; // para frequência semanal/quinzenal
    proximaExecucao?: string;
    ultimaExecucao?: string;
    ativa: boolean;
  };
  templateTarefaId?: string; // mantido para compatibilidade
  template?: TemplateTarefa;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface TemplateTarefa {
  id: string;
  titulo: string;
  descricao?: string;
  frequencia: FrequenciaTemplate;
  colaboradorIds: string[];
  tags: TagTarefa[];
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  okrId?: string;
  
  // Configuração de repetição
  dataInicio: string;
  dataFim?: string; // se vazio, repete indefinidamente
  dia?: number; // 1-31 para mensal, 1-7 para semanal (1=seg, 7=dom)
  diasSemana?: number[]; // para frequência semanal/quinzenal
  
  // Próxima execução
  proximaExecucao?: string;
  ultimaExecucao?: string;
  ativa: boolean;
  
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
}

// Automações
export type AutomacaoTrigger = 'tarefa_criada' | 'tarefa_completa' | 'vencimento_proximo' | 'status_mudou' | 'prioridade_mudou' | 'colaborador_atribuido';
export type AutomacaoAcao = 'enviar_notificacao' | 'alterar_status' | 'alterar_prioridade' | 'atribuir_colaborador' | 'adicionar_tag' | 'criar_tarefa_relacionada';

export interface CondicaoAutomacao {
  tipo: 'status' | 'prioridade' | 'colaborador' | 'dias_para_vencimento' | 'tag';
  valor: string | number;
  operador?: 'igual' | 'diferente' | 'maior' | 'menor'; // para datas e números
}

export interface AcaoAutomacao {
  tipo: AutomacaoAcao;
  parametros: {
    status?: KanbanStatus;
    prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
    mensagem?: string; // para notificações
    colaboradorIds?: string[]; // para atribuição
    tags?: string[];
    descricaoTarefaRelacionada?: string;
  };
}

export interface Automacao {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  
  // Trigger e condições
  trigger: AutomacaoTrigger;
  condicoes?: CondicaoAutomacao[];
  
  // Ações
  acoes: AcaoAutomacao[];
  
  // Escopo
  tarefasAplicaveis?: string[]; // IDs específicas ou deixar vazio para todas
  statusAplicavel?: KanbanStatus[];
  prioridadeAplicavel?: ('baixa' | 'media' | 'alta' | 'urgente')[];
  
  // Histórico
  ultimaExecucao?: string;
  vezesExecutada: number;
  
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
}
