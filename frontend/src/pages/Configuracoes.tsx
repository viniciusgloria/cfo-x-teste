import { useState, useRef, useEffect } from 'react';
import { Settings, Plus, Pencil, Trash2, Search, History, Users, Eye, EyeOff } from 'lucide-react';
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
import { CargoModal } from '../components/CargoModal';
import { SetorModal } from '../components/SetorModal';
import { HistoricoList } from '../components/HistoricoList';
import { BulkAssignModal } from '../components/BulkAssignModal';

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

  // Estados para configuração de email
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    useTLS: true,
    useSSL: false,
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

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
      toast.error('Preencha nome e email');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === editUserId ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role } : u)));
    toast.success('Usuário atualizado');
    setEditUserId(null);
  };

  // Funções de Cargos
  const handleSaveCargo = (nome: string, descricao?: string) => {
    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';
    
    if (editingCargoId) {
      updateCargo(editingCargoId, nome, descricao, userId, userName);
      toast.success('Cargo atualizado com sucesso');
      setEditingCargoId(null);
    } else {
      addCargo(nome, descricao, userId, userName);
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
  const handleSaveSetor = (nome: string, descricao?: string) => {
    const userId = user?.id || 'system';
    const userName = user?.name || 'Sistema';
    
    if (editingSetorId) {
      updateSetor(editingSetorId, nome, descricao, userId, userName);
      toast.success('Setor atualizado com sucesso');
      setEditingSetorId(null);
    } else {
      addSetor(nome, descricao, userId, userName);
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

  // Funções de filtro
  const filterCargos = (query: string) => {
    return searchCargosFunction(query);
  };

  const filterSetores = (query: string) => {
    return searchSetoresFunction(query);
  };

  

  // validate empresa form on save
  const handleSaveEmpresa = () => {
    // mark fields as touched
    setTouchedEmpresa({ nome: true, cnpj: true, cidade: true });
    const errors: string[] = [];
    if (!empresa.nome) errors.push('Nome da empresa é obrigatório.');
    if (!empresa.cnpj) errors.push('CNPJ é obrigatório.');
    else if (!isValidCNPJ(empresa.cnpj)) errors.push('CNPJ inválido.');
    if (!maxLength(empresa.nome, 100)) errors.push('Nome da empresa é muito longo (máx. 100 caracteres).');

    if (errors.length) {
      toast.error('Existem erros no formulário');
      setEmpresaErrors(errors);
      return;
    }

    setEmpresaErrors([]);
    setIsSavingEmpresa(true);
    setTimeout(() => {
      setIsSavingEmpresa(false);
      toast.success('Dados da empresa salvos');
    }, 800);
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
            { id: 'cargos', label: 'Cargos' },
            { id: 'setores', label: 'Setores' },
            { id: 'permissoes', label: 'Permissões' },
            { id: 'integracoes', label: 'Integrações' },
          ]}
          activeTab={active}
          onTabChange={setActive}
        >
          {active === 'empresa' && (
            <div className="space-y-4 max-w-2xl mt-4">
              <FormError errors={empresaErrors} />
              <div className="flex flex-row gap-8 items-start">
                {/* Logo expandida */}
                <div className="flex flex-col items-center w-[260px]">
                  <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Logo Sidebar</div>
                  <div className="h-[55px] w-[246px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center p-2 mb-2 rounded">
                    {logo ? (
                      <img src={logo} alt="preview-expanded" className="h-[55px] w-[246px] object-contain" />
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-slate-500">Sem logo</div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRefExpanded.current?.click()}
                      className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700"
                      disabled={uploadingExpanded}
                    >
                      {uploadingExpanded ? 'Enviando...' : 'Upload'}
                    </button>
                  )}
                  <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 text-center">Exibição: 246×55 px<br/>PNG/JPG até 2MB</div>
                  <input ref={fileInputRefExpanded} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleExpandedUpload} className="hidden" />
                </div>

                {/* Mini logo */}
                <div className="flex flex-col items-center w-[120px]">
                  <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Mini Logo Sidebar</div>
                  <div className="h-10 w-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center mb-2 rounded">
                    {miniLogo ? (
                      <img src={miniLogo} alt="preview-collapsed" className="h-10 w-10 object-contain rounded" />
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-slate-500">—</div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRefMini.current?.click()}
                      className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700"
                      disabled={uploadingMini}
                    >
                      {uploadingMini ? 'Enviando...' : 'Upload'}
                    </button>
                  )}
                  <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 text-center">Exibição: 40×40 px<br/>PNG/JPG até 2MB</div>
                  <input ref={fileInputRefMini} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleMiniUpload} className="hidden" />
                </div>
              </div>
              
              <label className="block text-sm text-gray-600 dark:text-slate-300">Nome da empresa</label>
              <Input maxLength={100} aria-label="Nome da empresa" value={empresa.nome} onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, nome: true })} onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })} aria-invalid={!empresa.nome && touchedEmpresa.nome} />
              {!empresa.nome && touchedEmpresa.nome && <p className="text-xs text-red-500">O nome da empresa é obrigatório.</p>}
              <label className="block text-sm text-gray-600 dark:text-slate-300">CNPJ</label>
              <Input
                maxLength={18}
                aria-label="CNPJ"
                mask="cnpj"
                value={empresa.cnpj}
                onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, cnpj: true })}
                onChange={(e) => setEmpresa({ ...empresa, cnpj: (e.target as HTMLInputElement).value })}
                aria-invalid={!empresa.cnpj && touchedEmpresa.cnpj}
              />
              {!empresa.cnpj && touchedEmpresa.cnpj && <p className="text-xs text-red-500">CNPJ é obrigatório.</p>}
              {empresa.cnpj && touchedEmpresa.cnpj && !isValidCNPJ(empresa.cnpj) && <p className="text-xs text-red-500">CNPJ inválido.</p>}
              {empresa.cnpj && touchedEmpresa.cnpj && isValidCNPJ(empresa.cnpj) && <p className="text-xs text-green-600">CNPJ válido.</p>}
              <label className="block text-sm text-gray-600 dark:text-slate-300">Cidade</label>
              <Input maxLength={60} aria-label="Cidade" value={empresa.cidade} onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, cidade: true })} onChange={(e) => setEmpresa({ ...empresa, cidade: e.target.value })} />
              <div className="flex gap-3">
                <Button onClick={handleSaveEmpresa} loading={isSavingEmpresa} disabled={!empresa.nome || !empresa.cnpj}>Salvar</Button>
                <Button variant="outline" onClick={() => { setEmpresa({ nome: '', cnpj: '', cidade: '' }); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

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
                      <th className="p-2">Email</th>
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

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">Administrador</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Acesso total ao sistema</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium rounded-full">Admin</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 space-y-1">
                    <li>✓ Todas as funcionalidades do sistema</li>
                    <li>✓ Gerenciar usuários, cargos e setores</li>
                    <li>✓ Configurações da empresa</li>
                    <li>✓ Aprovar solicitações</li>
                    <li>✓ Acessar relatórios completos</li>
                    <li>✓ Gerenciar folha de pagamento</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">Gestor</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Gerenciamento de equipes e aprovações</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full">Gestor</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 space-y-1">
                    <li>✓ Aprovar solicitações da equipe</li>
                    <li>✓ Ver dados dos colaboradores</li>
                    <li>✓ Acessar relatórios</li>
                    <li>✓ Gerenciar avaliações e OKRs</li>
                    <li>✓ Aprovar ajustes de ponto</li>
                    <li>✗ Alterar configurações da empresa</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">Colaborador</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Usuário padrão com acesso aos recursos básicos</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Padrão</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 space-y-1">
                    <li>✓ Registrar ponto</li>
                    <li>✓ Ver próprio banco de horas</li>
                    <li>✓ Criar solicitações (ajuste, atestado, férias)</li>
                    <li>✓ Postar no mural</li>
                    <li>✗ Aprovar solicitações</li>
                    <li>✗ Ver dados de outros colaboradores</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">Cliente</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Acesso aos dados do próprio cliente (BPO)</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium rounded-full">Cliente</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 space-y-1">
                    <li>✓ Ver folha de pagamento do cliente</li>
                    <li>✓ Gerenciar funcionários do cliente</li>
                    <li>✓ Acompanhar status de pagamentos</li>
                    <li>✓ Visualizar relatórios do cliente</li>
                    <li>✗ Acessar dados de outros clientes</li>
                    <li>✗ Gerenciar colaboradores internos</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">Visitante</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Acesso somente leitura (ex: estagiário, consultor)</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-full">Limitado</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 space-y-1">
                    <li>✓ Ver dashboard</li>
                    <li>✓ Visualizar mural</li>
                    <li>✗ Registrar ponto</li>
                    <li>✗ Criar solicitações</li>
                    <li>✗ Postar no mural</li>
                    <li>✗ Acessar dados sensíveis</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Nota:</strong> As permissões são aplicadas automaticamente com base no nível de acesso do usuário.
                  Para alterar o nível de acesso, edite o usuário na aba Usuários.
                </p>
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

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Configurações Recomendadas</h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <p><strong>Gmail:</strong> smtp.gmail.com:587, TLS ativado</p>
                  <p><strong>Outlook:</strong> smtp-mail.outlook.com:587, TLS ativado</p>
                  <p><strong>Yahoo:</strong> smtp.mail.yahoo.com:587, TLS ativado</p>
                  <p><strong>Para outros provedores:</strong> Consulte a documentação do seu provedor de e-mail</p>
                </div>
              </div>

              <div className="flex justify-end">
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

          {active === 'cargos' && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Cargos</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowHistoricoCargos(!showHistoricoCargos)}
                      variant="outline"
                      size="sm"
                    >
                      <History size={16} className="mr-1" />
                      Histórico
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => setBulkAssignCargoOpen(true)}
                          variant="outline"
                          size="sm"
                        >
                          <Users size={16} className="mr-1" />
                          Atribuir em Massa
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingCargoId(null);
                            setCargoModalOpen(true);
                          }}
                          size="sm"
                        >
                          <Plus size={16} className="mr-1" />
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
                  <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Histórico de Alterações - Cargos</h4>
                    <HistoricoList historico={getHistorico('cargo')} tipo="cargo" />
                  </div>
                )}
              </div>

              {(() => {
                const cargosFiltrados = searchCargos ? filterCargos(searchCargos) : cargos;
                
                if (cargosFiltrados.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                      {searchCargos 
                        ? `Nenhum cargo encontrado para "${searchCargos}"`
                        : 'Nenhum cargo cadastrado. Clique em "Novo Cargo" para começar.'}
                    </div>
                  );
                }

                return (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {cargosFiltrados.map((cargo) => (
                      <div
                        key={cargo.id}
                        className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800"
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
                          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{cargo.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {active === 'setores' && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Setores</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowHistoricoSetores(!showHistoricoSetores)}
                      variant="outline"
                      size="sm"
                    >
                      <History size={16} className="mr-1" />
                      Histórico
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => setBulkAssignSetorOpen(true)}
                          variant="outline"
                          size="sm"
                        >
                          <Users size={16} className="mr-1" />
                          Atribuir em Massa
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingSetorId(null);
                            setSetorModalOpen(true);
                          }}
                          size="sm"
                        >
                          <Plus size={16} className="mr-1" />
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
                  <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Histórico de Alterações - Setores</h4>
                    <HistoricoList historico={getHistorico('setor')} tipo="setor" />
                  </div>
                )}
              </div>

              {(() => {
                const setoresFiltrados = searchSetores ? filterSetores(searchSetores) : setores;
                
                if (setoresFiltrados.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                      {searchSetores 
                        ? `Nenhum setor encontrado para "${searchSetores}"`
                        : 'Nenhum setor cadastrado. Clique em "Novo Setor" para começar.'}
                    </div>
                  );
                }

                return (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {setoresFiltrados.map((setor) => (
                      <div
                        key={setor.id}
                        className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-900 dark:bg-gray-800"
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
                          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{setor.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {active === 'integracoes' && (
            <div className="text-sm text-gray-600 dark:text-slate-300 mt-4">Integrações e webhooks (mock)</div>
          )}
        </Tabs>

      {/* Manutenção de dados removida */}

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmRemove} title="Remover usuário" />

      {/* Modais de Cargo */}
      <CargoModal
        isOpen={cargoModalOpen}
        onClose={() => {
          setCargoModalOpen(false);
          setEditingCargoId(null);
        }}
        onSave={handleSaveCargo}
        cargoInicial={editingCargoId ? cargos.find((c) => c.id === editingCargoId) : undefined}
        titulo={editingCargoId ? 'Editar Cargo' : 'Novo Cargo'}
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
      <SetorModal
        isOpen={setorModalOpen}
        onClose={() => {
          setSetorModalOpen(false);
          setEditingSetorId(null);
        }}
        onSave={handleSaveSetor}
        setorInicial={editingSetorId ? setores.find((s) => s.id === editingSetorId) : undefined}
        titulo={editingSetorId ? 'Editar Setor' : 'Novo Setor'}
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
            <label className="block text-sm text-gray-600 dark:text-slate-300 dark:text-gray-300">Email</label>
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
              <option value="visitante">Visitante</option>
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





