import { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Pencil, Trash2, Search, History, Users, Clock, CreditCard, Palette, FileText, Zap, LayoutDashboard, UserCircle, Timer, FileText as FileTextIcon, Star, Target, CheckSquare, MessageSquare, MessageCircle, ThumbsUp, FileStack, Gift, BarChart3, UsersRound, DollarSign, FileSpreadsheet, LayoutGrid, List, Eye, AlertCircle, Building2, Info, ChevronDown, ChevronUp, Home, UserCog, Award, BarChart, FolderOpen, Receipt } from 'lucide-react';
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
import api from '../services/api';
import { getWelcomeEmailData } from '../utils/emailTemplates';
import toast from 'react-hot-toast';
import { useEmpresaStore } from '../store/empresaStore';
import { useAuthStore } from '../store/authStore';
import { useSystemStore } from '../store/systemStore';
import { useCargosSetoresStore } from '../store/cargosSetoresStore';
import { CargoModalAdvanced } from '../components/CargoModalAdvanced';
import { HierarquiaSetor } from '../components/HierarquiaSetor';
import { OrganogramaModal } from '../components/OrganogramaModal';
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
} from '../components/ConfiguracoesEmpresa';

export function Configuracoes() {
  const [active, setActive] = useState('empresa');
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    grupoId?: string;
    grupoNome?: string;
    empresa?: string;
  }>>([
    { id: '1', name: 'João Silva', email: 'joao@cfocompany.com', role: 'admin' },
    { id: '2', name: 'Maria Santos', email: 'maria@cfocompany.com', role: 'colaborador' },
  ]);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemoveUser, setToRemoveUser] = useState<string | null>(null);
  
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ 
    name: string; 
    email: string; 
    role: string; 
    empresa?: string;
    grupoId?: string;
  }>({ name: '', email: '', role: 'colaborador' });

  // Estado para criação de usuário
  const [createUserForm, setCreateUserForm] = useState<{
    nome: string;
    email: string;
    role: string;
    empresa?: string;
  }>({ nome: '', email: '', role: 'colaborador' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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
  const [showOrganogramaModal, setShowOrganogramaModal] = useState(false);
  const [showHistoricoCargos, setShowHistoricoCargos] = useState(false);
  const [showHistoricoSetores, setShowHistoricoSetores] = useState(false);
  const [bulkAssignCargoOpen, setBulkAssignCargoOpen] = useState(false);
  const [bulkAssignSetorOpen, setBulkAssignSetorOpen] = useState(false);
  const [draggingCargoId, setDraggingCargoId] = useState<string | null>(null);

  // Estados para Estrutura Organizacional unificada
  const [estruturaView, setEstruturaView] = useState<'setores' | 'cargos' | 'hierarquia'>('setores');
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

  const { nomeEmpresa } = useEmpresaStore();

  const {
    updateEmailConfig,
    addOmieGrupo,
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

  const [novoGrupo, setNovoGrupo] = useState({ nome: '' });
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState('');
  const [criandoGrupoCliente, setCriandoGrupoCliente] = useState(false);
  const [vincularGrupo, setVincularGrupo] = useState(false);
  const [clienteAcessoForm, setClienteAcessoForm] = useState({ nome: '', email: '', empresa: '', ativo: true });

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

  // Estados para seções expansíveis na aba Permissões
  const [isAdministradorOpen, setIsAdministradorOpen] = useState(false);
  const [isGestorOpen, setIsGestorOpen] = useState(false);
  const [isColaboradorOpen, setIsColaboradorOpen] = useState(false);
  const [isClienteOpen, setIsClienteOpen] = useState(false);
  const [isRecursosOpen, setIsRecursosOpen] = useState(false);

  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

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
      notificationEmail: '',
      useTLS: systemConfig.useTLS ?? true,
      useSSL: systemConfig.useSSL ?? false,
    });
  }, []);

  const handleConfirmRemove = async (_reason?: string) => {
    if (!toRemoveUser) return;
    
    try {
      // TODO: Quando o backend estiver pronto, descomentar:
      // await api.delete(`/users/${toRemoveUser}`);
      
      setUsers((prev) => prev.filter((u) => u.id !== toRemoveUser));
      toast.success('Usuário removido com sucesso');
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast.error(error.detail || 'Erro ao remover usuário');
    } finally {
      setToRemoveUser(null);
      setConfirmOpen(false);
    }
  };

  const openEditUser = (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setEditUserId(id);
    setEditForm({ 
      name: u.name, 
      email: u.email, 
      role: u.role,
      empresa: u.empresa,
      grupoId: u.grupoId
    });
    setEditModalOpen(true);
  };

  const saveEditUser = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error('E-mail inválido');
      return;
    }

    if (editForm.role === 'cliente' && !editForm.empresa?.trim()) {
      toast.error('Para clientes, preencha a empresa');
      return;
    }

    try {
      // TODO: Quando o backend estiver pronto, descomentar:
      // await api.put(`/users/${editUserId}`, {
      //   nome: editForm.name,
      //   email: editForm.email,
      //   role: editForm.role,
      //   ...(editForm.role === 'cliente' && {
      //     empresa: editForm.empresa,
      //     ...(editForm.grupoId && { grupoId: editForm.grupoId })
      //   })
      // });

      // Atualizar estado local
      const grupoNome = editForm.grupoId 
        ? config.omieConfig.grupos.find(g => g.id === editForm.grupoId)?.nome 
        : undefined;

      setUsers((prev) => prev.map((u) => 
        u.id === editUserId 
          ? { 
              ...u, 
              name: editForm.name, 
              email: editForm.email, 
              role: editForm.role,
              empresa: editForm.empresa,
              grupoId: editForm.grupoId,
              grupoNome
            } 
          : u
      ));
      
      toast.success('Usuário atualizado com sucesso');
      setEditModalOpen(false);
      setEditUserId(null);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.detail || 'Erro ao atualizar usuário');
    }
  };

  const createUser = async () => {
    if (!createUserForm.nome.trim() || !createUserForm.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createUserForm.email)) {
      toast.error('E-mail inválido');
      return;
    }

    if (createUserForm.role === 'cliente' && !createUserForm.empresa?.trim()) {
      toast.error('Para clientes, preencha a empresa');
      return;
    }

    let resolvedGrupoId = grupoSelecionadoId;
    let resolvedGrupoNome = '';

    if (createUserForm.role === 'cliente' && vincularGrupo) {
      const existingGrupos = useSystemStore.getState().config.omieConfig.grupos;

      if (!resolvedGrupoId && !novoGrupo.nome.trim()) {
        toast.error('Selecione ou crie um grupo para clientes');
        return;
      }

      if (!resolvedGrupoId && novoGrupo.nome.trim()) {
        addOmieGrupo({ nome: novoGrupo.nome.trim() });
        const atualizados = useSystemStore.getState().config.omieConfig.grupos;
        resolvedGrupoId = atualizados[atualizados.length - 1]?.id || '';
        resolvedGrupoNome = novoGrupo.nome.trim();
      } else {
        const found = existingGrupos.find((g) => g.id === resolvedGrupoId);
        resolvedGrupoNome = found?.nome || '';
      }

      if (!resolvedGrupoId) {
        toast.error('Não foi possível criar/atribuir o grupo');
        return;
      }
    }

    setIsCreatingUser(true);

    try {
      const userData = {
        nome: createUserForm.nome,
        email: createUserForm.email,
        senha: 'Cfo123@@',
        role: createUserForm.role,
        ...(createUserForm.role === 'cliente' && { 
          empresa: createUserForm.empresa,
          ...(resolvedGrupoId && { grupoId: resolvedGrupoId })
        }),
      };

      await api.post('/users', userData);

      // Add to local state
      const newUser = {
        id: Date.now().toString(), // Temporary ID
        name: createUserForm.nome,
        email: createUserForm.email,
        role: createUserForm.role,
        grupoId: resolvedGrupoId || undefined,
        grupoNome: resolvedGrupoNome || undefined,
      };
      setUsers(prev => [...prev, newUser]);

      // Simular envio de email de boas vindas
      const { subject, body } = getWelcomeEmailData(
        createUserForm.nome,
        createUserForm.email,
        'Cfo123@@',
        createUserForm.role,
        undefined, // requiredDocuments - pode ser implementado depois
        createUserForm.empresa // company para clientes
      );
      console.log(`📧 ${subject}\n\nPara: ${createUserForm.email}\n\n${body}`);

      toast.success('Usuário criado com sucesso');
      setCreateUserForm({ nome: '', email: '', role: 'colaborador' });
      setGrupoSelecionadoId('');
      setNovoGrupo({ nome: '' });
      setCriandoGrupoCliente(false);
      setVincularGrupo(false);
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.detail || 'Erro ao criar usuário');
    } finally {
      setIsCreatingUser(false);
    }
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

  const handleUpdateHierarquia = (cargoId: string, novosCargosPai: string[]) => {
    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';

    // Atualizar o cargo com os novos cargos pai
    const cargoAtual = cargos.find(c => c.id === cargoId);
    if (cargoAtual) {
      const cargoAtualizado = {
        ...cargoAtual,
        cargosPai: novosCargosPai.length > 0 ? novosCargosPai : undefined
      };
      updateCargo(cargoId, cargoAtualizado, userId, userName);
      toast.success('Hierarquia atualizada com sucesso');
    }
  };

  const handleDropIntoSetor = (setorId: string | null) => {
    if (!draggingCargoId) return;

    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';
    const cargoAtual = cargos.find(c => c.id === draggingCargoId);
    if (cargoAtual) {
      const setoresVinculados = setorId ? [setorId] : [];

      // Evitar update desnecessário se já está no mesmo setor alvo
      const alreadyInTarget = setorId
        ? cargoAtual.setoresVinculados?.length === 1 && cargoAtual.setoresVinculados[0] === setorId
        : !cargoAtual.setoresVinculados || cargoAtual.setoresVinculados.length === 0;

      if (!alreadyInTarget) {
        const cargoAtualizado = {
          ...cargoAtual,
          setoresVinculados: setoresVinculados.length > 0 ? setoresVinculados : undefined,
        };
        updateCargo(draggingCargoId, cargoAtualizado, userId, userName);
        toast.success('Cargo movido de setor');
      }
    }
    setDraggingCargoId(null);
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
  const handleSaveEmpresa = async () => {
    setIsSavingEmpresa(true);
    try {
      const enderecoParts = [
        informacoesLegais.endereco,
        informacoesLegais.numero_endereco,
        informacoesLegais.complemento_endereco,
        informacoesLegais.bairro,
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean);

      const payload = {
        nome: (informacoesLegais.nome_empresa || nomeEmpresa || 'CFO Hub').trim(),
        cnpj: informacoesLegais.cnpj?.trim() || null,
        razao_social: informacoesLegais.nome_empresa?.trim() || null,
        email: informacoesLegais.email_fiscal?.trim() || null,
        telefone: informacoesLegais.telefone_principal?.trim() || null,
        site: informacoesLegais.website?.trim() || null,
        endereco: enderecoParts.length ? enderecoParts.join(', ') : null,
        cidade: informacoesLegais.cidade?.trim() || null,
        estado: informacoesLegais.estado || null,
        cep: informacoesLegais.cep?.trim() || null,
        logo: identidadeVisual.logo_sidebar || null,
        cor_primaria: identidadeVisual.cor_primaria || null,
        cor_secundaria: identidadeVisual.cor_secundaria || null,
        jornada_horas: configPonto.jornada_horas,
        jornada_dias: configPonto.jornada_dias,
        tolerancia_minutos: configPonto.tolerancia_minutos,
        ponto_ativo: recursos.ponto_ativo,
        solicitacoes_ativo: recursos.solicitacoes_ativo,
        okrs_ativo: recursos.okrs_ativo,
        mural_ativo: recursos.mural_ativo,
        configuracoes: {
          informacoes_legais: informacoesLegais,
          identidade_visual: identidadeVisual,
          config_ponto: configPonto,
          dados_bancarios: dadosBancarios,
          config_operacional: configOperacional,
          recursos,
        },
      };

      await api.post('/api/empresa', payload);
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error?.message || 'Erro ao salvar empresa');
    } finally {
      setIsSavingEmpresa(false);
    }
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

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

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

    toast.success('Alterações descartadas');
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
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
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
              <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
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
                  setConfigOperacional({
                    moeda_padrao: 'BRL',
                    idioma_padrao: 'pt-BR',
                    fuso_horario: 'America/Sao_Paulo',
                    formato_data: 'DD/MM/YYYY',
                  });
                  setConfigPonto({
                    horario_entrada: '08:00',
                    horario_saida: '17:00',
                    carga_horaria_semanal: 40,
                    jornada_horas: 8,
                    jornada_dias: 5,
                    tolerancia_minutos: 10,
                  });
                  setDadosBancarios({
                    codigo_banco: '001',
                    agencia: '',
                    conta_corrente: '',
                    dia_pagamento: '',
                  });
                  setIdentidadeVisual({
                    logo_sidebar: '',
                    logo_mini: '',
                    favicon: '',
                    cor_primaria: '#10B981',
                    cor_secundaria: '#6366F1',
                    aplicar_inversao_logo: false,
                  });
                  setInformacoesLegais({
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
            <div className="mt-4 space-y-6">
              {/* Formulário de Criação de Usuário - Apenas para Admin */}
              {user?.role === 'admin' && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
                    Criar Novo Usuário
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome do Usuário
                      </label>
                      <Input
                        value={createUserForm.nome}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, nome: e.target.value })}
                        placeholder="Digite o nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-mail de Acesso
                      </label>
                      <Input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Acesso
                      </label>
                      <select
                        value={createUserForm.role}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="admin">Administrador</option>
                        <option value="gestor">Gestor</option>
                        <option value="colaborador">Colaborador</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </div>
                    {createUserForm.role === 'cliente' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Empresa/Cliente
                          </label>
                          <Input
                            value={createUserForm.empresa || ''}
                            onChange={(e) => setCreateUserForm({ ...createUserForm, empresa: e.target.value })}
                            placeholder="Nome da empresa"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vincularGrupo}
                              onChange={(e) => {
                                setVincularGrupo(e.target.checked);
                                if (!e.target.checked) {
                                  setGrupoSelecionadoId('');
                                  setCriandoGrupoCliente(false);
                                  setNovoGrupo({ nome: '' });
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Vincular cliente a um grupo
                          </label>
                        </div>

                        {vincularGrupo && (
                          <>
                            {(config.omieConfig.grupos.length > 0 || criandoGrupoCliente) && (
                              <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                  Grupo do cliente
                                </label>
                                <div className="grid gap-2 md:grid-cols-[2fr,1fr]">
                                  <select
                                    value={grupoSelecionadoId}
                                    onChange={(e) => {
                                      setGrupoSelecionadoId(e.target.value);
                                      setCriandoGrupoCliente(false);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    disabled={criandoGrupoCliente}
                                  >
                                    <option value="">Selecione um grupo existente</option>
                                    {config.omieConfig.grupos.map((grupo) => (
                                      <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                                    ))}
                                  </select>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setCriandoGrupoCliente((v) => !v);
                                      setGrupoSelecionadoId('');
                                    }}
                                  >
                                    {criandoGrupoCliente ? 'Cancelar' : 'Criar grupo'}
                                  </Button>
                                </div>
                                {criandoGrupoCliente && (
                                  <Input
                                    placeholder="Nome do grupo"
                                    value={novoGrupo.nome}
                                    onChange={(e) => setNovoGrupo({ nome: e.target.value })}
                                  />
                                )}
                              </div>
                            )}
                            {config.omieConfig.grupos.length === 0 && !criandoGrupoCliente && (
                              <div className="md:col-span-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setCriandoGrupoCliente(true)}
                                  className="w-full"
                                >
                                  Criar primeiro grupo
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={createUser} loading={isCreatingUser}>
                      Criar Usuário
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                    <Info size={16} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span><strong>Atenção:</strong> A senha automática gerada pelo sistema é "Cfo123@@". No primeiro acesso, o usuário será orientado a alterar a senha.</span>
                  </p>
                </div>
              )}

              {/* Lista de Usuários */}
              {/* Mobile: cards */}
              <div className="space-y-3 md:hidden">
                {users.map((u) => (
                  <div key={u.id} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{u.role}</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{u.name}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-300">{u.email}</div>
                        {u.empresa && (
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Empresa: {u.empresa}</div>
                        )}
                        {u.grupoNome && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">Grupo: {u.grupoNome}</div>
                        )}
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
                      <th className="p-2">Empresa</th>
                      <th className="p-2">Grupo</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t dark:border-slate-700">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.role}</td>
                        <td className="p-2 text-sm">{u.empresa || '—'}</td>
                        <td className="p-2 text-sm">{u.grupoNome || '—'}</td>
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900">Contas de Clientes</h4>
                <p className="text-sm text-emerald-800">Crie acessos para clientes utilizarem a plataforma (portal do cliente).</p>
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
                            variant="outline"
                            onClick={() => toggleClienteAcesso(acc.id)}
                          >
                            {acc.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
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

          {active === 'emails' && (
            <div className="mt-4 space-y-6 max-w-2xl">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Configuração de E-mail</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
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
              {/* Bloco informativo */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                  Configuração da Estrutura Organizacional
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Configure de forma personalizada os setores e cargos da sua empresa, defina a hierarquia e informações adicionais.
                </p>
              </div>

              {/* Header com toggles de visualização */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setEstruturaView('setores')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      estruturaView === 'setores'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Setores
                  </button>
                  <button
                    onClick={() => setEstruturaView('cargos')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      estruturaView === 'cargos'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Cargos
                  </button>
                  <button
                    onClick={() => setEstruturaView('hierarquia')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      estruturaView === 'hierarquia'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Hierarquia
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEstruturaLayout('cards')}
                    className={`p-2 rounded-md transition-all ${
                      estruturaLayout === 'cards'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
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
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
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
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
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
                                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 mr-3"
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
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
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
                                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 mr-3"
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

              {estruturaView === 'hierarquia' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Organograma Hierárquico</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowOrganogramaModal(true)}
                        variant="outline"
                        className="inline-flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        Visualizar Organograma
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
                    <p className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <Info size={20} className="text-black dark:text-white flex-shrink-0" />
                      <span>Para organizar a hierarquia, arraste os cargos para suas posições corretas dentro de cada setor. Quando quiser definir um cargo abaixo hierarquicamente de outro, arraste um cargo para cima do outro, criando então um 'cargo pai'. Você poderá alterar quando e como desejar as posições hierárquicas. Esta organização será refletida em funcionalidades e visualizações do sistema.</span>
                    </p>
                  </div>

                  {setores.length === 0 && cargos.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                      <Building2 size={48} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                      <p>Crie setores e cargos primeiro para organizar a hierarquia</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Setores com seus cargos organizados hierarquicamente */}
                      {setores.map((setor) => {
                        const cargosDoSetor = cargos.filter(cargo =>
                          cargo.setoresVinculados?.includes(setor.id)
                        );

                        return (
                          <div
                            key={setor.id}
                            className={`border rounded-lg p-6 transition-all ${
                              draggingCargoId
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                            onDragOver={(e) => {
                              if (draggingCargoId) {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }
                            }}
                            onDragLeave={(e) => {
                              // Apenas se for deixando a setor div completamente
                              if (e.currentTarget === e.target) {
                                // Deixa o visual como estava
                              }
                            }}
                            onDrop={(e) => {
                              if (draggingCargoId) {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDropIntoSetor(setor.id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <Building2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{setor.nome}</h4>
                              <span className="text-sm text-gray-500 dark:text-slate-400">
                                ({cargosDoSetor.length} cargo{cargosDoSetor.length !== 1 ? 's' : ''})
                              </span>
                            </div>

                            {cargosDoSetor.length === 0 ? (
                              <div
                                className="text-sm text-gray-500 dark:text-slate-400 italic py-8 px-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-center bg-gray-50 dark:bg-slate-800/30"
                              >
                                <p>Nenhum cargo atribuído a este setor</p>
                                <p className="text-xs mt-2 text-gray-400">Arraste cargos de outros setores para aqui</p>
                              </div>
                            ) : (
                              <HierarquiaSetor
                                cargos={cargosDoSetor}
                                onUpdateHierarquia={handleUpdateHierarquia}
                                onDragStartCargo={setDraggingCargoId}
                                onDragEndCargo={() => setDraggingCargoId(null)}
                                draggingCargoId={draggingCargoId}
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Cargos sem setor */}
                      {(() => {
                        const cargosSemSetor = cargos.filter(cargo =>
                          !cargo.setoresVinculados || cargo.setoresVinculados.length === 0
                        );

                        if (cargosSemSetor.length === 0) return null;

                        return (
                          <div
                            className={`border rounded-lg p-6 transition-all ${
                              draggingCargoId
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                            onDragOver={(e) => {
                              if (draggingCargoId) {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }
                            }}
                            onDragLeave={(e) => {
                              // Apenas se for deixando a div completamente
                              if (e.currentTarget === e.target) {
                                // Deixa o visual como estava
                              }
                            }}
                            onDrop={(e) => {
                              if (draggingCargoId) {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDropIntoSetor(null);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Sem Setor Atribuído</h4>
                              <span className="text-sm text-gray-500 dark:text-slate-400">
                                ({cargosSemSetor.length} cargo{cargosSemSetor.length !== 1 ? 's' : ''})
                              </span>
                            </div>

                            <HierarquiaSetor
                              cargos={cargosSemSetor}
                              onUpdateHierarquia={handleUpdateHierarquia}
                              onDragStartCargo={setDraggingCargoId}
                              onDragEndCargo={() => setDraggingCargoId(null)}
                              draggingCargoId={draggingCargoId}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {active === 'integracoes' && (
            <div className="text-sm text-gray-600 dark:text-slate-300 mt-4">Página em desenvolvimento.</div>
          )}

          {active === 'permissoes' && (
            <div className="mt-4 space-y-6">
              <div className="rounded-lg shadow-sm border p-4 mb-6" style={{
                backgroundColor: `hsl(var(--card-bg))`,
                borderColor: `hsl(var(--card-border))`,
                color: `hsl(var(--text))`
              }}>
                <p className="text-base text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  <Info size={20} className="text-gray-800 dark:text-gray-100 flex-shrink-0" />
                  <span><strong>Configuração de Permissões:</strong> Defina quais páginas e funcionalidades cada nível de acesso pode visualizar e utilizar no sistema.</span>
                </p>
              </div>

              {/* Lista de Permissões por Nível */}
              <div className="space-y-6">
                {/* Seção: Recursos Globais */}
                <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                      Recursos Globais do Sistema
                    </h3>
                    <button onClick={() => setIsRecursosOpen(!isRecursosOpen)} className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded">
                      {isRecursosOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {isRecursosOpen && (
                    <>
                      <Recursos
                        data={recursos}
                        onChange={(updates) => setRecursos({ ...recursos, ...updates })}
                        isLoading={isSavingConfigs}
                      />
                    </>
                  )}
                </div>

                {/* Administrador */}
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Administrador</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 text-xs font-bold rounded-full">ADMIN</span>
                      <button onClick={() => setIsAdministradorOpen(!isAdministradorOpen)} className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded">
                        {isAdministradorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {isAdministradorOpen && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-slate-300 mb-2 font-medium">O administrador tem acesso irrestrito a todos os módulos do sistema.</p>
                    </div>
                  )}
                </div>

                {/* Gestor */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Gestor</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 text-xs font-bold rounded-full">GESTOR</span>
                      <button onClick={() => setIsGestorOpen(!isGestorOpen)} className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded">
                        {isGestorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {isGestorOpen && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                      {[
                        { key: 'dashboard', label: 'Dashboard', icon: Home },
                        { key: 'colaboradores', label: 'Colaboradores', icon: UserCog },
                        { key: 'ponto', label: 'Ponto', icon: Clock },
                        { key: 'solicitacoes', label: 'Solicitações', icon: FileText },
                        { key: 'avaliacoes', label: 'Avaliações', icon: Award },
                        { key: 'okrs', label: 'Desenvolvimento', icon: Target },
                        { key: 'tarefas', label: 'Tarefas', icon: CheckSquare },
                        { key: 'mural', label: 'Mural', icon: MessageSquare },
                        { key: 'chat', label: 'Chat', icon: MessageCircle },
                        { key: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
                        { key: 'relatorios', label: 'Relatórios', icon: BarChart },
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
                  )}
                </div>

                {/* Colaborador */}
                <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Colaborador</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-200 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 text-xs font-bold rounded-full">COLAB</span>
                      <button onClick={() => setIsColaboradorOpen(!isColaboradorOpen)} className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded">
                        {isColaboradorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {isColaboradorOpen && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                      {[
                        { key: 'dashboard', label: 'Dashboard', icon: Home },
                        { key: 'ponto', label: 'Ponto', icon: Clock },
                        { key: 'solicitacoes', label: 'Solicitações', icon: FileText },
                        { key: 'tarefas', label: 'Tarefas', icon: CheckSquare },
                        { key: 'mural', label: 'Mural', icon: MessageSquare },
                        { key: 'chat', label: 'Chat', icon: MessageCircle },
                        { key: 'documentos', label: 'Documentos', icon: FolderOpen },
                        { key: 'beneficios', label: 'Benefícios', icon: Gift },
                        { key: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded accent-emerald-600" 
                              checked={permissoesColaborador[item.key as keyof typeof permissoesColaborador] || false}
                              onChange={() => handleTogglePermissaoColaborador(item.key)}
                            />
                            <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cliente */}
                <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Cliente</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100 text-xs font-bold rounded-full">CLIENTE</span>
                      <button onClick={() => setIsClienteOpen(!isClienteOpen)} className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded">
                        {isClienteOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {isClienteOpen && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                      {[
                        { key: 'dashboard', label: 'Dashboard', icon: Home },
                        { key: 'clientes', label: 'Clientes', icon: Users },
                        { key: 'folha_clientes', label: 'Folha de Pagamento', icon: DollarSign },
                        { key: 'funcionarios_cliente', label: 'Colaboradores', icon: UserCircle },
                        { key: 'chat', label: 'Chat', icon: MessageCircle },
                        { key: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
                        { key: 'relatorios', label: 'Relatórios', icon: BarChart },
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
                  )}
                </div>
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

      {/* Modal de Edição de Usuário */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Usuário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Usuário
            </label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Digite o nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-mail de Acesso
            </label>
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="usuario@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Acesso
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor</option>
              <option value="colaborador">Colaborador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          {editForm.role === 'cliente' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Empresa/Cliente
                </label>
                <Input
                  value={editForm.empresa || ''}
                  onChange={(e) => setEditForm({ ...editForm, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grupo (Opcional)
                </label>
                <select
                  value={editForm.grupoId || ''}
                  onChange={(e) => setEditForm({ ...editForm, grupoId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Nenhum grupo</option>
                  {config.omieConfig.grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEditUser}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>

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

      {/* Modal Organograma */}
      {showOrganogramaModal && (
        <OrganogramaModal
          isOpen={showOrganogramaModal}
          onClose={() => setShowOrganogramaModal(false)}
          setores={setores}
          cargos={cargos}
        />
      )}
    </div>
  );
}
