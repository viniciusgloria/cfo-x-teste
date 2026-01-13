import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Plus, Pencil, Trash2, Search, History, Users, Eye, EyeOff, Building2, Clock, CreditCard, Palette, FileText, Zap, LayoutDashboard, UserCircle, Timer, FileText as FileTextIcon, Star, Target, CheckSquare, MessageSquare, MessageCircle, ThumbsUp, FileStack, Gift, BarChart3, UsersRound, DollarSign, FileSpreadsheet, LayoutGrid, List } from 'lucide-react';
import { Cargo, Setor } from '../types';
// Card removed: no longer needed after maintenance UI removal
import PageBanner from '../components/ui/PageBanner';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';
// removed resetHelpers import after removing maintenance UI
import { FormError } from '../components/ui/FormError';
import { isValidCNPJ, maxLength } from '../utils/validation';
import toast from 'react-hot-toast';
import { useEmpresaStore } from '../store/empresaStore';
import { useAuthStore } from '../store/authStore';
import { useSystemStore } from '../store/systemStore';
import { testOmieCredentials, OmieTestResult } from '../utils/omie';
import { useCargosSetoresStore } from '../store/cargosSetoresStore';
import { CargoModalAdvanced } from '../components/CargoModalAdvanced';
import { SetorModalAdvanced } from '../components/SetorModalAdvanced';
import { HistoricoList } from '../components/HistoricoList';
import { BulkAssignModal } from '../components/BulkAssignModal';
import {
  ConfiguracoesOperacionais,
  ConfiguracoesPonto,
  DadosBancarios,
  IdentidadeVisual,
  InformacoesLegais,
  Recursos,
  SmtpConfig,
} from '../components/ConfiguracoesEmpresa';

export function Configuracoes() {
  const [active, setActive] = useState('empresa');
  const [empresa, setEmpresa] = useState({ nome: 'CFO Hub Ltda', cnpj: '12.345.678/0001-99', cidade: 'São Paulo' });
  const [users, setUsers] = useState([
    { id: '1', name: 'João Silva', email: 'joao@cfocompany.com', role: 'admin' },
    { id: '2', name: 'Maria Santos', email: 'maria@cfocompany.com', role: 'colaborador' },
  ]);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemoveUser, setToRemoveUser] = useState<string | null>(null);
  
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string }>({ name: '', email: '', role: 'colaborador' });

  // Estados para modais de Cargos e Setores
  const [cargoModalOpen, setCargoModalOpen] = useState(false);
  const [setorModalOpen, setSetorModalOpen] = useState(false);
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [editingSetorId, setEditingSetorId] = useState<string | null>(null);
  const [confirmCargoDelete, setConfirmCargoDelete] = useState(false);
  const [confirmSetorDelete, setConfirmSetorDelete] = useState(false);
  const [toDeleteCargoId, setToDeleteCargoId] = useState<string | null>(null);
  const [toDeleteSetorId, setToDeleteSetorId] = useState<string | null>(null);

  // Estados para busca e histórico
  const [searchCargos, setSearchCargos] = useState('');
  const [searchSetores, setSearchSetores] = useState('');
  const [showHistoricoCargos, setShowHistoricoCargos] = useState(false);
  const [showHistoricoSetores, setShowHistoricoSetores] = useState(false);
  const [bulkAssignCargoOpen, setBulkAssignCargoOpen] = useState(false);
  const [bulkAssignSetorOpen, setBulkAssignSetorOpen] = useState(false);

  // Estados para Estrutura Organizacional unificada
  const [estruturaView, setEstruturaView] = useState<'setores' | 'cargos'>('setores');
  const [estruturaLayout, setEstruturaLayout] = useState<'cards' | 'table'>('cards');

  // Estados para configuração de email
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    notificationEmail: '',
    useTLS: true,
    useSSL: false,
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  const {
    updateEmailConfig,
    addOmieGrupo,
    removeOmieGrupo,
    addClienteAcesso,
    toggleClienteAcesso,
    removeClienteAcesso,
    config,
  } = useSystemStore();

  const {
    cargos,
    setores,
    addCargo,
    updateCargo,
    removeCargo,
    addSetor,
    updateSetor,
    removeSetor,
    getHistorico,
    searchCargos: searchCargosFunction,
    searchSetores: searchSetoresFunction,
  } = useCargosSetoresStore();

  const [novoGrupo, setNovoGrupo] = useState({ nome: '', descricao: '' });
  const [clienteAcessoForm, setClienteAcessoForm] = useState({ nome: '', email: '', empresa: '', ativo: true });

  // Teste de credenciais Omie (aba Omie)
  const [omieTest, setOmieTest] = useState<{
    appKey: string;
    appSecret: string;
    status: 'idle' | 'testing' | 'success' | 'error';
    result?: OmieTestResult;
    logs: string[];
  }>({ appKey: '', appSecret: '', status: 'idle', logs: [] });
  const [showTestKey, setShowTestKey] = useState(false);
  const [showTestSecret, setShowTestSecret] = useState(false);

  // Estados para novas abas de Configurações
  const [configOperacional, setConfigOperacional] = useState({
    moeda_padrao: 'BRL',
    idioma_padrao: 'pt-BR',
    fuso_horario: 'America/Sao_Paulo',
    formato_data: 'DD/MM/YYYY',
  });

  const [configPonto, setConfigPonto] = useState({
    horario_entrada: '08:00',
    horario_saida: '17:00',
    carga_horaria_semanal: 40,
    jornada_horas: 8,
    jornada_dias: 5,
    tolerancia_minutos: 10,
  });

  const [dadosBancarios, setDadosBancarios] = useState({
    codigo_banco: '001',
    agencia: '',
    conta_corrente: '',
    dia_pagamento: '',
  });

  const [identidadeVisual, setIdentidadeVisual] = useState({
    logo_sidebar: '',
    logo_mini: '',
    favicon: '',
    cor_primaria: '#10B981',
    cor_secundaria: '#6366F1',
    aplicar_inversao_logo: false,
  });

  const [informacoesLegais, setInformacoesLegais] = useState({
    cnpj: '',
    cpf_responsavel: '',
    classificacao: 'LTDA',
    estado: 'SP',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    numero_endereco: '',
    complemento_endereco: '',
  });

  const [recursos, setRecursos] = useState({
    ponto_ativo: true,
    solicitacoes_ativo: true,
    okrs_ativo: true,
    mural_ativo: true,
    chat_ativo: true,
    documentos_ativo: true,
    feedbacks_ativo: true,
    beneficios_ativo: true,
    avaliacoes_ativo: true,
    clientes_ativo: true,
    colaboradores_ativo: true,
    folha_pagamento_ativo: true,
    folha_clientes_ativo: true,
    tarefas_ativo: true,
    relatorios_ativo: true,
  });

  // Estados para permissões por role
  const [permissoesGestor, setPermissoesGestor] = useState({
    dashboard: true,
    colaboradores: true,
    ponto: true,
    solicitacoes: true,
    avaliacoes: true,
    okrs: true,
    tarefas: true,
    mural: true,
    chat: true,
    feedbacks: true,
    relatorios: true,
  });

  const [permissoesColaborador, setPermissoesColaborador] = useState({
    dashboard: true,
    ponto: true,
    solicitacoes: true,
    tarefas: true,
    mural: true,
    chat: true,
    documentos: true,
    beneficios: true,
    feedbacks: true,
  });

  const [permissoesCliente, setPermissoesCliente] = useState({
    dashboard: true,
    clientes: true,
    folha_clientes: true,
    funcionarios_cliente: true,
    chat: true,
    feedbacks: true,
    relatorios: true,
  });

  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  // Persistence helpers for system Omie logs
  const getSystemLogsKey = () => 'omie_logs_system';

  const loadSavedSystemLogs = (): string[] => {
    try {
      const raw = localStorage.getItem(getSystemLogsKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore
    }
    return [];
  };

  const saveSystemLogs = (logs: string[]) => {
    try {
      localStorage.setItem(getSystemLogsKey(), JSON.stringify(logs));
    } catch (e) {
      // ignore
    }
  };

  const handleTestOmie = async () => {
    if (omieTest.status === 'testing') return;
    setOmieTest((p) => ({ ...p, status: 'testing' }));
    try {
      const res = await testOmieCredentials(omieTest.appKey, omieTest.appSecret);
      const simulated = (res.details as any)?.simulated;
      const prefix = simulated ? 'Simulação: ' : '';
      const newLine = `${new Date().toLocaleString()}: ${res.ok ? 'OK' : 'ERRO'} - ${prefix}${res.message} (${res.latencyMs}ms)`;
      const newLogs = [newLine, ...omieTest.logs].slice(0, 3);
      setOmieTest((p) => ({ ...p, status: res.ok ? 'success' : 'error', result: res, logs: newLogs }));
      saveSystemLogs(newLogs);
    } catch (e) {
      const newLine = `${new Date().toLocaleString()}: ERRO inesperado ao testar conexão`;
      const newLogs = [newLine, ...omieTest.logs].slice(0, 3);
      setOmieTest((p) => ({ ...p, status: 'error', logs: newLogs }));
      saveSystemLogs(newLogs);
    }
  };

  // load saved system logs on mount
  useEffect(() => {
    const saved = loadSavedSystemLogs();
    if (saved && saved.length > 0) setOmieTest((p) => ({ ...p, logs: saved }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar configurações de email existentes
  useEffect(() => {
    const systemConfig = useSystemStore.getState().config.emailConfig;
    setEmailConfig({
      smtpHost: systemConfig.smtpHost || '',
      smtpPort: systemConfig.smtpPort || 587,
      smtpUser: systemConfig.smtpUser || '',
      smtpPassword: systemConfig.smtpPassword || '',
      fromEmail: systemConfig.fromEmail || '',
      fromName: systemConfig.fromName || '',
      useTLS: systemConfig.useTLS ?? true,
      useSSL: systemConfig.useSSL ?? false,
    });
  }, []);

  const handleConfirmRemove = (_reason?: string) => {
    if (!toRemoveUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== toRemoveUser));
    setToRemoveUser(null);
    setConfirmOpen(false);
  };

  const openEditUser = (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setEditUserId(id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const saveEditUser = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === editUserId ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role } : u)));
    toast.success('Usuário atualizado');
    setEditUserId(null);
  };

  // Funções de Cargos
  const handleSaveCargo = (cargoData: Omit<Cargo, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';
    
    if (editingCargoId) {
      updateCargo(editingCargoId, cargoData, userId, userName);
      toast.success('Cargo atualizado com sucesso');
      setEditingCargoId(null);
    } else {
      addCargo(cargoData, userId, userName);
      toast.success('Cargo criado com sucesso');
    }
    setCargoModalOpen(false);
  };

  const handleEditCargo = (id: string) => {
    setEditingCargoId(id);
    setCargoModalOpen(true);
  };

  const handleDeleteCargo = () => {
    if (toDeleteCargoId) {
      const userId = user?.id || 'system';
      const userName = user?.name || 'Sistema';
      removeCargo(toDeleteCargoId, userId, userName);
      toast.success('Cargo removido com sucesso');
      setToDeleteCargoId(null);
    }
    setConfirmCargoDelete(false);
  };

  // Funções de Setores
  const handleSaveSetor = (setorData: Omit<Setor, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';
    
    if (editingSetorId) {
      updateSetor(editingSetorId, setorData, userId, userName);
      toast.success('Setor atualizado com sucesso');
      setEditingSetorId(null);
    } else {
      addSetor(setorData, userId, userName);
      toast.success('Setor criado com sucesso');
    }
    setSetorModalOpen(false);
  };

  const handleEditSetor = (id: string) => {
    setEditingSetorId(id);
    setSetorModalOpen(true);
  };

  const handleDeleteSetor = () => {
    if (toDeleteSetorId) {
      const userId = user?.id || 'system';
      const userName = user?.name || 'Sistema';
      removeSetor(toDeleteSetorId, userId, userName);
      toast.success('Setor removido com sucesso');
      setToDeleteSetorId(null);
    }
    setConfirmSetorDelete(false);
  };

  // Callbacks estáveis para fechar modais
  const handleCloseCargoModal = useCallback(() => {
    setCargoModalOpen(false);
    setEditingCargoId(null);
  }, []);

  const handleCloseSetorModal = useCallback(() => {
    setSetorModalOpen(false);
    setEditingSetorId(null);
  }, []);

  // Funções de filtro
  const filterCargos = (query: string) => {
    return searchCargosFunction(query);
  };

  const filterSetores = (query: string) => {
    return searchSetoresFunction(query);
  };

  

  // validate empresa form on save
  const handleSaveEmpresa = () => {
    // Validação simplificada - a empresa já é pré-preenchida com dados válidos
    setEmpresaErrors([]);
    setIsSavingEmpresa(true);
    setTimeout(() => {
      setIsSavingEmpresa(false);
      // Não mostrar mensagem redundante já que as seções individuais mostram suas próprias mensagens
    }, 800);
  };

  const handleTestSMTPConnection = async () => {
    const errors: Record<string, string> = {};

    if (!emailConfig.smtpHost.trim()) errors.smtpHost = 'Host SMTP é obrigatório';
    if (!emailConfig.smtpPort || emailConfig.smtpPort <= 0) errors.smtpPort = 'Porta SMTP deve ser maior que 0';

    setEmailErrors(errors);

    if (Object.keys(errors).length > 0) {
      setTestResult({success: false, message: 'Preencha os campos obrigatórios'});
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      // Simular teste de conexão SMTP
      // Em produção, conectar ao backend para fazer o teste real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTestResult({
        success: true,
        message: 'Conexão SMTP estabelecida com sucesso!'
      });
      toast.success('Conexão testada com sucesso');
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Falha ao conectar ao servidor SMTP. Verifique as credenciais.'
      });
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveEmailConfig = () => {
    const errors: Record<string, string> = {};

    if (!emailConfig.smtpHost.trim()) errors.smtpHost = 'Host SMTP é obrigatório';
    if (!emailConfig.smtpPort || emailConfig.smtpPort <= 0) errors.smtpPort = 'Porta SMTP deve ser maior que 0';
    if (!emailConfig.fromEmail.trim()) errors.fromEmail = 'E-mail do remetente é obrigatório';
    if (!emailConfig.fromName.trim()) errors.fromName = 'Nome do remetente é obrigatório';

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailConfig.fromEmail && !emailRegex.test(emailConfig.fromEmail)) {
      errors.fromEmail = 'E-mail inválido';
    }

    setEmailErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Corrija os erros no formulário');
      return;
    }

    setIsSavingEmail(true);
    setTimeout(() => {
      updateEmailConfig(emailConfig);
      setIsSavingEmail(false);
      toast.success('Configuração de e-mail salva com sucesso');
    }, 800);
  };

  const handleAddGrupoOmie = () => {
    if (!novoGrupo.nome.trim()) {
      toast.error('Informe o nome do grupo');
      return;
    }
    addOmieGrupo({ nome: novoGrupo.nome.trim(), descricao: novoGrupo.descricao.trim() });
    setNovoGrupo({ nome: '', descricao: '' });
    toast.success('Grupo Omie adicionado');
  };

  const handleAddClienteAcesso = () => {
    if (!clienteAcessoForm.nome.trim() || !clienteAcessoForm.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clienteAcessoForm.email)) {
      toast.error('E-mail inválido');
      return;
    }
    addClienteAcesso({
      nome: clienteAcessoForm.nome.trim(),
      email: clienteAcessoForm.email.trim(),
      empresa: clienteAcessoForm.empresa.trim(),
      ativo: clienteAcessoForm.ativo,
    });
    setClienteAcessoForm({ nome: '', email: '', empresa: '', ativo: true });
    toast.success('Conta de cliente criada');
  };

  const [empresaErrors, setEmpresaErrors] = useState<string[]>([]);

  const { logo, miniLogo, setLogo, setMiniLogo } = useEmpresaStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const fileInputRefExpanded = useRef<HTMLInputElement | null>(null);
  const fileInputRefMini = useRef<HTMLInputElement | null>(null);
  const [uploadingExpanded, setUploadingExpanded] = useState(false);
  const [uploadingMini, setUploadingMini] = useState(false);

  const handleExpandedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploadingExpanded(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max display size for sidebar expanded is 246x55px
        const maxWidth = 246;
        const maxHeight = 55;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL(file.type);
        setLogo(resizedDataUrl);
        setUploadingExpanded(false);
        toast.success('Logo Sidebar atualizado com sucesso!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMiniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploadingMini(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max display size for sidebar collapsed is 32x32px
        const maxSize = 32;
        let width = img.width;
        let height = img.height;

        if (width > maxSize) {
          height = (maxSize / width) * height;
          width = maxSize;
        }
        if (height > maxSize) {
          width = (maxSize / height) * width;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL(file.type);
        setMiniLogo(resizedDataUrl);
        setUploadingMini(false);
        toast.success('Mini Logo Sidebar atualizado com sucesso!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // validation / touched states for inline errors
  const [touchedEmpresa, setTouchedEmpresa] = useState({ nome: false, cnpj: false, cidade: false });

  // Handlers para salvar configurações
  const handleSaveConfigOperacional = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Configurações operacionais salvas');
    }, 800);
  };

  const handleSaveConfigPonto = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Configurações de ponto salvas');
    }, 800);
  };

  const handleSaveDadosBancarios = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Dados bancários salvos');
    }, 800);
  };

  const handleSaveInformacoesLegais = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Informações legais salvas');
    }, 800);
  };

  const handleSaveIdentidadeVisual = () => {
    setIsSavingConfigs(true);
    
    // Sincronizar logos, favicon e inversão de cores com o store
    const { setLogo, setMiniLogo, setFavicon, setAplicarInversaoLogo } = useEmpresaStore.getState();
    
    if (identidadeVisual.logo_sidebar) {
      setLogo(identidadeVisual.logo_sidebar);
    }
    if (identidadeVisual.logo_mini) {
      setMiniLogo(identidadeVisual.logo_mini);
    }
    if (identidadeVisual.favicon) {
      setFavicon(identidadeVisual.favicon);
      
      // Aplicar favicon no HTML head
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = identidadeVisual.favicon;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = identidadeVisual.favicon;
        document.head.appendChild(newFavicon);
      }
    }
    
    // Aplicar inversão de cores
    if (identidadeVisual.aplicar_inversao_logo !== undefined) {
      setAplicarInversaoLogo(identidadeVisual.aplicar_inversao_logo);
    }
    
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Identidade visual salva');
    }, 800);
  };

  const handleSaveRecursos = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Configuração de recursos salva');
    }, 800);
  };

  // Funções para gerenciar permissões
  const handleTogglePermissaoGestor = (key: string) => {
    setPermissoesGestor(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleTogglePermissaoColaborador = (key: string) => {
    setPermissoesColaborador(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleTogglePermissaoCliente = (key: string) => {
    setPermissoesCliente(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSavePermissoes = () => {
    setIsSavingConfigs(true);
    
    // Salvar permissões no localStorage
    localStorage.setItem('permissoes_gestor', JSON.stringify(permissoesGestor));
    localStorage.setItem('permissoes_colaborador', JSON.stringify(permissoesColaborador));
    localStorage.setItem('permissoes_cliente', JSON.stringify(permissoesCliente));
    localStorage.setItem('recursos_sistema', JSON.stringify(recursos));
    
    // Disparar evento customizado para atualizar sidebar
    window.dispatchEvent(new Event('storage'));
    
    setTimeout(() => {
      setIsSavingConfigs(false);
      toast.success('Permissões salvas com sucesso!');
    }, 800);
  };

  const handleCancelarPermissoes = () => {
    // Recarregar permissões do localStorage ou usar valores padrão
    const gestorSaved = localStorage.getItem('permissoes_gestor');
    const colaboradorSaved = localStorage.getItem('permissoes_colaborador');
    const clienteSaved = localStorage.getItem('permissoes_cliente');
    const recursosSaved = localStorage.getItem('recursos_sistema');

    if (gestorSaved) setPermissoesGestor(JSON.parse(gestorSaved));
    if (colaboradorSaved) setPermissoesColaborador(JSON.parse(colaboradorSaved));
    if (clienteSaved) setPermissoesCliente(JSON.parse(clienteSaved));
    if (recursosSaved) setRecursos(JSON.parse(recursosSaved));

    toast.info('Alterações descartadas');
  };

  // Carregar permissões salvas ao montar o componente
  useEffect(() => {
    const gestorSaved = localStorage.getItem('permissoes_gestor');
    const colaboradorSaved = localStorage.getItem('permissoes_colaborador');
    const clienteSaved = localStorage.getItem('permissoes_cliente');
    const recursosSaved = localStorage.getItem('recursos_sistema');

    if (gestorSaved) setPermissoesGestor(JSON.parse(gestorSaved));
    if (colaboradorSaved) setPermissoesColaborador(JSON.parse(colaboradorSaved));
    if (clienteSaved) setPermissoesCliente(JSON.parse(clienteSaved));
    if (recursosSaved) setRecursos(JSON.parse(recursosSaved));
  }, []);

  return (
    <div className="space-y-6">
      <PageBanner title="Configurações" icon={<Settings size={32} />} />
      <Tabs
          tabs={[
            { id: 'empresa', label: 'Empresa' },
            { id: 'usuarios', label: 'Usuários' },
            { id: 'clientes', label: 'Clientes' },
            { id: 'omie', label: 'Omie' },
            { id: 'emails', label: 'E-mails' },
            { id: 'estrutura', label: 'Estrutura Organizacional' },
            { id: 'permissoes', label: 'Permissões' },
            { id: 'integracoes', label: 'Integrações' },
          ]}
          activeTab={active}
          onTabChange={setActive}
        >
          {active === 'empresa' && (
            <div className="mt-4 space-y-6">
              {/* Seção: Informações Legais */}
              <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informações Legais
                </h3>
                <InformacoesLegais
                  data={informacoesLegais}
                  onChange={(updates) => setInformacoesLegais({ ...informacoesLegais, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Seção: Identidade Visual */}
              <div className="p-6 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Identidade Visual
                </h3>
                <IdentidadeVisual
                  data={identidadeVisual}
                  onChange={(updates) => setIdentidadeVisual({ ...identidadeVisual, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Seção: Configurações de Ponto */}
              <div className="p-6 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Configurações de Ponto
                </h3>
                <ConfiguracoesPonto
                  data={configPonto}
                  onChange={(updates) => setConfigPonto({ ...configPonto, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Seção: Dados Bancários */}
              <div className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dados Bancários
                </h3>
                <DadosBancarios
                  data={dadosBancarios}
                  onChange={(updates) => setDadosBancarios({ ...dadosBancarios, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Seção: Configurações Operacionais */}
              <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações Operacionais
                </h3>
                <ConfiguracoesOperacionais
                  data={configOperacional}
                  onChange={(updates) => setConfigOperacional({ ...configOperacional, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => { 
                  setConfigOperacional({});
                  setConfigPonto({});
                  setDadosBancarios({});
                  setIdentidadeVisual({});
                  setInformacoesLegais({});
                }}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  handleSaveEmpresa();
                  handleSaveInformacoesLegais();
                  handleSaveIdentidadeVisual();
                  handleSaveConfigOperacional();
                  handleSaveConfigPonto();
                  handleSaveDadosBancarios();
                }} loading={isSavingEmpresa || isSavingConfigs}>
                  Salvar Configurações
                </Button>
              </div>
            </div>
          )}

          {/* Configurações Operacionais - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {/* Configurações de Ponto - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {/* Dados Bancários - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {/* Identidade Visual - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {/* Informações Legais - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {/* Recursos - REMOVIDA */}
          {/* Agora integrada na aba Empresa como seção */}

          {active === 'usuarios' && (
            <div className="mt-4">
              {/* Mobile: cards */}
              <div className="space-y-3 md:hidden">
                {users.map((u) => (
                  <div key={u.id} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{u.role}</div>
                        <div className="font-medium text-gray-800">{u.name}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-300">{u.email}</div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="ghost" aria-label={`Editar usuário ${u.name}`} onClick={() => openEditUser(u.id)}>Editar</Button>
                        <Button variant="outline" onClick={() => { setToRemoveUser(u.id); setConfirmOpen(true); }} aria-label={`Remover usuário ${u.name}`}>Remover</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 dark:text-slate-300">
                      <th className="p-2">Nome</th>
                      <th className="p-2">E-mail</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.role}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="ghost" aria-label={`Editar usuário ${u.name}`} onClick={() => openEditUser(u.id)}>Editar</Button>
                            <Button variant="outline" onClick={() => { setToRemoveUser(u.id); setConfirmOpen(true); }} aria-label={`Remover usuário ${u.name}`}>Remover</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
          )}

          {active === 'clientes' && (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900">Contas de Clientes</h4>
                <p className="text-sm text-blue-800">Crie acessos para clientes utilizarem a plataforma (portal do cliente).</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Nome do responsável"
                  value={clienteAcessoForm.nome}
                  onChange={(e) => setClienteAcessoForm({ ...clienteAcessoForm, nome: e.target.value })}
                />
                <Input
                  placeholder="E-mail de acesso"
                  type="email"
                  value={clienteAcessoForm.email}
                  onChange={(e) => setClienteAcessoForm({ ...clienteAcessoForm, email: e.target.value })}
                />
                <Input
                  placeholder="Empresa/Cliente"
                  value={clienteAcessoForm.empresa}
                  onChange={(e) => setClienteAcessoForm({ ...clienteAcessoForm, empresa: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={clienteAcessoForm.ativo}
                    onChange={(e) => setClienteAcessoForm({ ...clienteAcessoForm, ativo: e.target.checked })}
                  />
                  Ativar acesso imediatamente
                </label>
                <Button onClick={handleAddClienteAcesso}>Criar acesso</Button>
              </div>

              <div className="border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="p-3 border-b text-sm font-semibold text-gray-700 dark:text-slate-200">Acessos criados</div>
                {config.clientesAccess.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-slate-400">Nenhum acesso criado ainda.</div>
                ) : (
                  <div className="divide-y">
                    {config.clientesAccess.map((acc) => (
                      <div key={acc.id} className="p-4 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{acc.nome}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-300">{acc.email}</div>
                          {acc.empresa && <div className="text-xs text-gray-500 dark:text-slate-400">Empresa: {acc.empresa}</div>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${acc.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200'}`}>
                          {acc.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleClienteAcesso(acc.id)}
                          >
                            {acc.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeClienteAcesso(acc.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {active === 'omie' && (
            <div className="mt-4 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900">Grupos Omie</h4>
                <p className="text-sm text-emerald-800">Cadastre grupos (holdings) para associar clientes na aba de cadastro.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Nome do grupo"
                  value={novoGrupo.nome}
                  onChange={(e) => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={novoGrupo.descricao}
                  onChange={(e) => setNovoGrupo({ ...novoGrupo, descricao: e.target.value })}
                />
                <Button onClick={handleAddGrupoOmie}>Adicionar grupo</Button>
              </div>

              <div className="border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="p-3 border-b text-sm font-semibold text-gray-700 dark:text-slate-200">Grupos cadastrados</div>
                {config.omieConfig.grupos.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-slate-400">Nenhum grupo cadastrado.</div>
                ) : (
                  <div className="divide-y">
                    {config.omieConfig.grupos.map((grupo) => (
                      <div key={grupo.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{grupo.nome}</div>
                          {grupo.descricao && <div className="text-sm text-gray-600 dark:text-slate-300">{grupo.descricao}</div>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeOmieGrupo(grupo.id)}>Remover</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Teste de credenciais Omie */}
              <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                <h4 className="font-semibold text-emerald-900 mb-2">Testar conexão Omie</h4>
                <p className="text-sm text-emerald-800 mb-3">Informe App Key e App Secret e execute um teste rápido de conexão.</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="relative">
                    <Input
                      type={showTestKey ? 'text' : 'password'}
                      placeholder="App Key"
                      value={omieTest.appKey}
                      onChange={(e) => setOmieTest((p) => ({ ...p, appKey: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-slate-300 hover:text-gray-800"
                      aria-label={showTestKey ? 'Ocultar App Key' : 'Mostrar App Key'}
                      onClick={() => setShowTestKey((v) => !v)}
                    >
                      {showTestKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showTestSecret ? 'text' : 'password'}
                      placeholder="App Secret"
                      value={omieTest.appSecret}
                      onChange={(e) => setOmieTest((p) => ({ ...p, appSecret: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-slate-300 hover:text-gray-800"
                      aria-label={showTestSecret ? 'Ocultar App Secret' : 'Mostrar App Secret'}
                      onClick={() => setShowTestSecret((v) => !v)}
                    >
                      {showTestSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button onClick={handleTestOmie} loading={omieTest.status === 'testing'}>
                    {omieTest.status === 'testing' ? 'Testando...' : 'Testar conexão'}
                  </Button>
                </div>

                {omieTest.status !== 'idle' && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      omieTest.status === 'success' ? 'bg-green-100 text-green-700' : omieTest.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}>
                      {omieTest.status === 'success' ? 'Conexão válida' : omieTest.status === 'error' ? 'Falha na conexão' : 'Aguardando'}
                    </span>
                    {/* description moved below logs to avoid duplication */}
                  </div>
                )}

                {omieTest.logs.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Logs recentes</div>
                    <ul className="text-xs text-gray-600 dark:text-slate-300 list-disc pl-4 space-y-1">
                      {omieTest.logs.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                    {/* description removed — keep logs only */}
                  </div>
                )}
              </div>
            </div>
          )}

          {active === 'emails' && (
            <div className="mt-4 space-y-6 max-w-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Configuração de E-mail</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Configure as credenciais SMTP para envio de notificações automáticas do sistema,
                  como devoluções de cadastros e aprovações.
                </p>
              </div>

              <FormError errors={Object.values(emailErrors)} />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Host SMTP *
                  </label>
                  <Input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className={emailErrors.smtpHost ? 'border-red-500' : ''}
                  />
                  {emailErrors.smtpHost && (
                    <p className="text-red-500 text-xs mt-1">{emailErrors.smtpHost}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Porta SMTP *
                  </label>
                  <Input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                    placeholder="587"
                    className={emailErrors.smtpPort ? 'border-red-500' : ''}
                  />
                  {emailErrors.smtpPort && (
                    <p className="text-red-500 text-xs mt-1">{emailErrors.smtpPort}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Usuário SMTP
                  </label>
                  <Input
                    type="text"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="seu-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Senha SMTP
                  </label>
                  <Input
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    E-mail do Remetente *
                  </label>
                  <Input
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="sistema@cfocompany.com"
                    className={emailErrors.fromEmail ? 'border-red-500' : ''}
                  />
                  {emailErrors.fromEmail && (
                    <p className="text-red-500 text-xs mt-1">{emailErrors.fromEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    Nome do Remetente *
                  </label>
                  <Input
                    type="text"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="CFO Hub"
                    className={emailErrors.fromName ? 'border-red-500' : ''}
                  />
                  {emailErrors.fromName && (
                    <p className="text-red-500 text-xs mt-1">{emailErrors.fromName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                    E-mail para Notificações do Sistema
                  </label>
                  <Input
                    type="email"
                    value={emailConfig.notificationEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, notificationEmail: e.target.value }))}
                    placeholder="notificacoes@cfocompany.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">Configurações de Segurança</h4>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailConfig.useTLS}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, useTLS: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">Usar TLS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailConfig.useSSL}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, useSSL: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">Usar SSL</span>
                  </label>
                </div>
              </div>

              {testResult && (
                <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                  <p className={`text-sm ${testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {testResult.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleTestSMTPConnection}
                  disabled={testingConnection}
                  variant="outline"
                  className="px-6"
                >
                  {testingConnection ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button
                  onClick={handleSaveEmailConfig}
                  disabled={isSavingEmail}
                  className="px-6"
                >
                  {isSavingEmail ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
              </div>
            </div>
          )}

          {active === 'estrutura' && (
            <div className="mt-4 space-y-4">
              {/* Header com toggles de visualização */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setEstruturaView('setores')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      estruturaView === 'setores'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Setores
                  </button>
                  <button
                    onClick={() => setEstruturaView('cargos')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      estruturaView === 'cargos'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Cargos
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEstruturaLayout('cards')}
                    className={`p-2 rounded-md transition-all ${
                      estruturaLayout === 'cards'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em cards"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setEstruturaLayout('table')}
                    className={`p-2 rounded-md transition-all ${
                      estruturaLayout === 'table'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em tabela"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo baseado na view selecionada */}
              {estruturaView === 'setores' && (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Setores</h3>
                      <div className="flex gap-2 flex-nowrap">
                        <Button
                          onClick={() => setShowHistoricoSetores(!showHistoricoSetores)}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap inline-flex items-center"
                        >
                          <History size={16} className="mr-1 align-middle" />
                          Histórico
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              onClick={() => setBulkAssignSetorOpen(true)}
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap inline-flex items-center"
                            >
                              <Users size={16} className="mr-1 align-middle" />
                              Atribuir em Massa
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingSetorId(null);
                                setSetorModalOpen(true);
                              }}
                              size="sm"
                              className="whitespace-nowrap inline-flex items-center"
                            >
                              <Plus size={16} className="mr-1 align-middle" />
                              Novo Setor
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                      <Input
                        value={searchSetores}
                        onChange={(e) => setSearchSetores(e.target.value)}
                        placeholder="Buscar setores por nome ou descrição..."
                        className="pl-10"
                      />
                    </div>

                    {showHistoricoSetores && (
                      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Histórico de Alterações - Setores</h4>
                        <HistoricoList historico={getHistorico('setor')} tipo="setor" />
                      </div>
                    )}
                  </div>

                  {(() => {
                    const setoresFiltrados = searchSetores ? filterSetores(searchSetores) : setores;
                    
                    if (setoresFiltrados.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                          {searchSetores 
                            ? `Nenhum setor encontrado para "${searchSetores}"`
                            : 'Nenhum setor cadastrado. Clique em "Novo Setor" para começar.'}
                        </div>
                      );
                    }

                    if (estruturaLayout === 'cards') {
                      return (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {setoresFiltrados.map((setor) => (
                            <div
                              key={setor.id}
                              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{setor.nome}</h4>
                                {isAdmin && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditSetor(setor.id)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                      aria-label={`Editar ${setor.nome}`}
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setToDeleteSetorId(setor.id);
                                        setConfirmSetorDelete(true);
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      aria-label={`Remover ${setor.nome}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {setor.descricao && (
                                <p className="text-sm text-gray-600 dark:text-slate-300">{setor.descricao}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // Tabela view
                      return (
                        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                  Nome do Setor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                  Descrição
                                </th>
                                {isAdmin && (
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                    Ações
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                              {setoresFiltrados.map((setor) => (
                                <tr key={setor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900 dark:text-white">{setor.nome}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 dark:text-slate-300">{setor.descricao || '-'}</div>
                                  </td>
                                  {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditSetor(setor.id)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => {
                                          setToDeleteSetorId(setor.id);
                                          setConfirmSetorDelete(true);
                                        }}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        Remover
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  })()}
                </>
              )}

              {estruturaView === 'cargos' && (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Cargos</h3>
                      <div className="flex gap-2 flex-nowrap">
                        <Button
                          onClick={() => setShowHistoricoCargos(!showHistoricoCargos)}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap inline-flex items-center"
                        >
                          <History size={16} className="mr-1 align-middle" />
                          Histórico
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              onClick={() => setBulkAssignCargoOpen(true)}
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap inline-flex items-center"
                            >
                              <Users size={16} className="mr-1 align-middle" />
                              Atribuir em Massa
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingCargoId(null);
                                setCargoModalOpen(true);
                              }}
                              size="sm"
                              className="whitespace-nowrap inline-flex items-center"
                            >
                              <Plus size={16} className="mr-1 align-middle" />
                              Novo Cargo
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                      <Input
                        value={searchCargos}
                        onChange={(e) => setSearchCargos(e.target.value)}
                        placeholder="Buscar cargos por nome ou descrição..."
                        className="pl-10"
                      />
                    </div>

                    {showHistoricoCargos && (
                      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Histórico de Alterações - Cargos</h4>
                        <HistoricoList historico={getHistorico('cargo')} tipo="cargo" />
                      </div>
                    )}
                  </div>

                  {(() => {
                    const cargosFiltrados = searchCargos ? filterCargos(searchCargos) : cargos;
                    
                    if (cargosFiltrados.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                          {searchCargos 
                            ? `Nenhum cargo encontrado para "${searchCargos}"`
                            : 'Nenhum cargo cadastrado. Clique em "Novo Cargo" para começar.'}
                        </div>
                      );
                    }

                    if (estruturaLayout === 'cards') {
                      return (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {cargosFiltrados.map((cargo) => (
                            <div
                              key={cargo.id}
                              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{cargo.nome}</h4>
                                {isAdmin && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditCargo(cargo.id)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                      aria-label={`Editar ${cargo.nome}`}
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setToDeleteCargoId(cargo.id);
                                        setConfirmCargoDelete(true);
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      aria-label={`Remover ${cargo.nome}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {cargo.descricao && (
                                <p className="text-sm text-gray-600 dark:text-slate-300">{cargo.descricao}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // Tabela view
                      return (
                        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                  Nome do Cargo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                  Descrição
                                </th>
                                {isAdmin && (
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                    Ações
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                              {cargosFiltrados.map((cargo) => (
                                <tr key={cargo.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900 dark:text-white">{cargo.nome}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 dark:text-slate-300">{cargo.descricao || '-'}</div>
                                  </td>
                                  {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditCargo(cargo.id)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => {
                                          setToDeleteCargoId(cargo.id);
                                          setConfirmCargoDelete(true);
                                        }}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        Remover
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  })()}
                </>
              )}
            </div>
          )}

          {active === 'integracoes' && (
            <div className="text-sm text-gray-600 dark:text-slate-300 mt-4">Integrações e webhooks (mock)</div>
          )}

          {active === 'permissoes' && (
            <div className="mt-4 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>• Configuração de Permissões:</strong> Defina quais páginas e funcionalidades cada nível de acesso pode visualizar e utilizar no sistema.
                </p>
              </div>

              {/* Lista de Permissões por Nível */}
              <div className="space-y-6">
                {/* Administrador */}
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Administrador</h3>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Acesso total ao sistema</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 text-xs font-bold rounded-full">ADMIN</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-2 font-medium">✓ Todas as funcionalidades habilitadas</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">O administrador tem acesso irrestrito a todos os módulos do sistema.</p>
                  </div>
                </div>

                {/* Gestor */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Gestor</h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Gerenciamento de equipes</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 text-xs font-bold rounded-full">GESTOR</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                    {[
                      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { key: 'colaboradores', label: 'Colaboradores', icon: UserCircle },
                      { key: 'ponto', label: 'Ponto', icon: Timer },
                      { key: 'solicitacoes', label: 'Solicitações', icon: FileTextIcon },
                      { key: 'avaliacoes', label: 'Avaliações', icon: Star },
                      { key: 'okrs', label: 'OKRs', icon: Target },
                      { key: 'tarefas', label: 'Tarefas', icon: CheckSquare },
                      { key: 'mural', label: 'Mural', icon: MessageSquare },
                      { key: 'chat', label: 'Chat', icon: MessageCircle },
                      { key: 'feedbacks', label: 'Feedbacks', icon: ThumbsUp },
                      { key: 'relatorios', label: 'Relatórios', icon: BarChart3 },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded accent-blue-600" 
                            checked={permissoesGestor[item.key as keyof typeof permissoesGestor] || false}
                            onChange={() => handleTogglePermissaoGestor(item.key)}
                          />
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Colaborador */}
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Colaborador</h3>
                      <p className="text-xs text-green-700 dark:text-green-300">Acesso padrão</p>
                    </div>
                    <span className="px-3 py-1 bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100 text-xs font-bold rounded-full">COLAB</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                    {[
                      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { key: 'ponto', label: 'Ponto', icon: Timer },
                      { key: 'solicitacoes', label: 'Solicitações', icon: FileTextIcon },
                      { key: 'tarefas', label: 'Tarefas', icon: CheckSquare },
                      { key: 'mural', label: 'Mural', icon: MessageSquare },
                      { key: 'chat', label: 'Chat', icon: MessageCircle },
                      { key: 'documentos', label: 'Documentos', icon: FileStack },
                      { key: 'beneficios', label: 'Benefícios', icon: Gift },
                      { key: 'feedbacks', label: 'Feedbacks', icon: ThumbsUp },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded accent-green-600" 
                            checked={permissoesColaborador[item.key as keyof typeof permissoesColaborador] || false}
                            onChange={() => handleTogglePermissaoColaborador(item.key)}
                          />
                          <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Cliente */}
                <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Cliente</h3>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Portal do cliente</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100 text-xs font-bold rounded-full">CLIENTE</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                    {[
                      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { key: 'clientes', label: 'Meus Dados', icon: UsersRound },
                      { key: 'folha_clientes', label: 'Folha de Pagamento', icon: DollarSign },
                      { key: 'funcionarios_cliente', label: 'Meus Funcionários', icon: UserCircle },
                      { key: 'chat', label: 'Chat', icon: MessageCircle },
                      { key: 'feedbacks', label: 'Feedbacks', icon: ThumbsUp },
                      { key: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded accent-orange-600" 
                            checked={permissoesCliente[item.key as keyof typeof permissoesCliente] || false}
                            onChange={() => handleTogglePermissaoCliente(item.key)}
                          />
                          <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Seção: Recursos Globais */}
              <div className="p-6 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recursos Globais do Sistema
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ative ou desative módulos globalmente. Módulos desativados não estarão disponíveis para nenhum nível de acesso.
                </p>
                <Recursos
                  data={recursos}
                  onChange={(updates) => setRecursos({ ...recursos, ...updates })}
                  isLoading={isSavingConfigs}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={handleCancelarPermissoes}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePermissoes} loading={isSavingConfigs}>
                  Salvar Permissões
                </Button>
              </div>
            </div>
          )}
        </Tabs>

      {/* Manutenção de dados removida */}

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmRemove} title="Remover usuário" />

      {/* Modais de Cargo */}
      <CargoModalAdvanced
        isOpen={cargoModalOpen}
        onClose={handleCloseCargoModal}
        onSave={handleSaveCargo}
        cargoInicial={editingCargoId ? cargos.find((c) => c.id === editingCargoId) : undefined}
        titulo={editingCargoId ? 'Editar Cargo' : 'Novo Cargo'}
        cargos={cargos}
        setores={setores}
      />
      <ConfirmModal
        isOpen={confirmCargoDelete}
        onClose={() => {
          setConfirmCargoDelete(false);
          setToDeleteCargoId(null);
        }}
        onConfirm={handleDeleteCargo}
        title="Remover Cargo"
        message="Tem certeza que deseja remover este cargo? Esta ação não pode ser desfeita."
      />

      {/* Modais de Setor */}
      <SetorModalAdvanced
        key={setorModalOpen ? (editingSetorId || 'new') : 'closed'}
        isOpen={setorModalOpen}
        onClose={handleCloseSetorModal}
        onSave={handleSaveSetor}
        setorInicial={editingSetorId ? setores.find((s) => s.id === editingSetorId) : undefined}
        titulo={editingSetorId ? 'Editar Setor' : 'Novo Setor'}
        setores={setores}
        usuarios={users}
      />
      <ConfirmModal
        isOpen={confirmSetorDelete}
        onClose={() => {
          setConfirmSetorDelete(false);
          setToDeleteSetorId(null);
        }}
        onConfirm={handleDeleteSetor}
        title="Remover Setor"
        message="Tem certeza que deseja remover este setor? Esta ação não pode ser desfeita."
      />

      {/* Modal Editar Usuário */}
      <Modal isOpen={!!editUserId} onClose={() => setEditUserId(null)} title="Editar Usuário">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-slate-300 dark:text-gray-300">Nome</label>
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-slate-300 dark:text-gray-300">E-mail</label>
            <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-slate-300 dark:text-gray-300">Nível de Acesso</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:bg-gray-700 dark:text-white"
            >
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>

            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditUserId(null)} fullWidth>Cancelar</Button>
            <Button onClick={saveEditUser} fullWidth>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modais de Atribuição em Massa */}
      <BulkAssignModal
        isOpen={bulkAssignCargoOpen}
        onClose={() => setBulkAssignCargoOpen(false)}
        tipo="cargo"
      />
      <BulkAssignModal
        isOpen={bulkAssignSetorOpen}
        onClose={() => setBulkAssignSetorOpen(false)}
        tipo="setor"
      />
    </div>
  );
}





