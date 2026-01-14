import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, AlertCircle, Check, Loader, X, RotateCcw, Eye, EyeOff, Building2, ShoppingCart, Megaphone, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UpsellManager } from '../components/UpsellManager';
import { useClientesStore } from '../store/clientesStore';
import { useAuthStore } from '../store/authStore';
import { fetchAddressByCEP, formatCEP, isValidCNPJ, formatCNPJ, onlyDigits, formatCPF, formatPhone, isValidCPF } from '../utils/validation';
import { fetchCNPJ } from '../utils/brasilapi';
import { DadosGerais, ContatosPrincipais, OutroContato, ComunicacaoFluxo, ServicosContratados, PontosAtencao, ContextoGeral, OmieConfig } from '../store/clientesStore';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import { useSystemStore } from '../store/systemStore';

type TabSection = 'dados' | 'contatos' | 'outros' | 'comunicacao' | 'servicos' | 'atencao' | 'contexto' | 'omie';

interface FormState {
  dadosGerais: DadosGerais;
  contatosPrincipais: ContatosPrincipais;
  outrosContatos: OutroContato[];
  comunicacaoFluxo: ComunicacaoFluxo;
  servicosContratados: ServicosContratados;
  pontosAtencao: PontosAtencao;
  contextoGeral: ContextoGeral;
  omieConfig: OmieConfig;
}

const TABS_CLIENTE = ['dados', 'contatos', 'outros', 'comunicacao', 'servicos', 'omie'];
const TABS_COMPLETAS = ['dados', 'contatos', 'outros', 'comunicacao', 'servicos', 'atencao', 'contexto', 'omie'];

const SERVICO_OPTIONS = [
  { key: 'bpoFinanceiro', label: 'BPO Financeiro' },
  { key: 'assessoriaFinanceira', label: 'Assessoria Financeira' },
  { key: 'contabilidade', label: 'Contabilidade' },
  { key: 'juridicoContratual', label: 'Jurídico Contratual' },
  { key: 'juridicoTributario', label: 'Jurídico Tributário' },
  { key: 'trading', label: 'Trading' },
] as const;

type ServicoBooleanKey = typeof SERVICO_OPTIONS[number]['key'];

type IntegrationSection = 'erp' | 'marketplace' | 'ads' | 'gateway';
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
type IntegrationFieldSpec = { key: AuthFieldKey; label: string; placeholder?: string };
type IntegrationSystem = { key: string; label: string; fields: IntegrationFieldSpec[]; note?: string };

const field = (key: AuthFieldKey, label: string, placeholder?: string): IntegrationFieldSpec => ({ key, label, placeholder });

const ERP_SYSTEMS: IntegrationSystem[] = [
  { key: 'omie', label: 'Omie', fields: [field('appKey', 'App Key'), field('appSecret', 'App Secret')] },
  { key: 'bling', label: 'Bling', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
  { key: 'tiny', label: 'Tiny', fields: [field('apiToken', 'API Token')] },
  { key: 'conta_azul', label: 'Conta Azul', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
  { key: 'linx', label: 'Linx', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
  { key: 'totvs', label: 'TOTVS', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
];

const MARKETPLACE_SYSTEMS: IntegrationSystem[] = [
  { key: 'mercado_livre', label: 'Mercado Livre', fields: [field('clientId', 'App ID'), field('clientSecret', 'App Secret'), field('refreshToken', 'Refresh Token (opcional)')] },
  { key: 'tiktok_shop', label: 'TikTok Shop', fields: [field('appKey', 'App Key'), field('appSecret', 'App Secret')] },
  { key: 'shopee', label: 'Shopee', fields: [field('partnerId', 'Partner ID'), field('partnerKey', 'Partner Key'), field('accessToken', 'Access Token (seller)')] },
  { key: 'amazon_br', label: 'Amazon BR (SP-API)', fields: [field('clientId', 'LWA Client ID'), field('clientSecret', 'LWA Client Secret'), field('refreshToken', 'LWA Refresh Token'), field('awsAccessKey', 'AWS Access Key'), field('awsSecretKey', 'AWS Secret Key'), field('roleArn', 'Role ARN')] },
  { key: 'magalu', label: 'Magalu', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
  { key: 'aliexpress', label: 'AliExpress', fields: [field('appKey', 'App Key'), field('appSecret', 'App Secret'), field('accessToken', 'Access Token (opcional)')] },
  { key: 'shein', label: 'Shein', fields: [field('appId', 'App ID'), field('appSecret', 'App Secret'), field('accessToken', 'Access Token (opcional)')] },
];

const ADS_SYSTEMS: IntegrationSystem[] = [
  { key: 'google_ads', label: 'Google Ads', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret'), field('refreshToken', 'Refresh Token')] },
  { key: 'meta_ads', label: 'Meta Ads', fields: [field('appId', 'App ID'), field('appSecret', 'App Secret'), field('accessToken', 'Access Token')] },
  { key: 'mercado_livre_ads', label: 'Mercado Livre Ads', fields: [field('clientId', 'App ID'), field('clientSecret', 'App Secret'), field('refreshToken', 'Refresh Token (opcional)')] },
  { key: 'tiktok_ads', label: 'TikTok Ads', fields: [field('appId', 'App ID'), field('appSecret', 'App Secret'), field('accessToken', 'Access Token (opcional)')] },
  { key: 'kwai_ads', label: 'Kwai Ads', fields: [field('appId', 'App ID'), field('appSecret', 'App Secret'), field('accessToken', 'Access Token (opcional)')] },
  { key: 'amazon_ads', label: 'Amazon Ads', fields: [field('clientId', 'LWA Client ID'), field('clientSecret', 'LWA Client Secret'), field('refreshToken', 'Refresh Token')] },
  { key: 'shopee_ads', label: 'Shopee Ads', fields: [field('partnerId', 'Partner ID'), field('partnerKey', 'Partner Key'), field('accessToken', 'Access Token (seller)')] },
  { key: 'pinterest_ads', label: 'Pinterest Ads', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret'), field('accessToken', 'Access Token')] },
];

const GATEWAY_SYSTEMS: IntegrationSystem[] = [
  { key: 'yampi', label: 'Yampi', fields: [field('apiToken', 'API Token')] },
  { key: 'shopify', label: 'Shopify', fields: [field('accessToken', 'Admin API Access Token')] },
  { key: 'mercado_pago', label: 'Mercado Pago', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret'), field('accessToken', 'Access Token (opcional)')] },
  { key: 'nuvemshop', label: 'Nuvemshop', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret'), field('accessToken', 'Access Token (opcional)')] },
  { key: 'cartpanda', label: 'CartPanda', fields: [field('apiToken', 'API Secret Key')] },
  { key: 'appmax', label: 'Appmax', fields: [field('apiToken', 'API Key')] },
  { key: 'pagarme', label: 'Pagar.me', fields: [field('appSecret', 'Secret Key'), field('encryptionKey', 'Encryption Key (opcional)')] },
  { key: 'pagseguro', label: 'PagSeguro', fields: [field('appId', 'App ID'), field('appKey', 'App Key')] },
  { key: 'paypal', label: 'PayPal', fields: [field('clientId', 'Client ID'), field('clientSecret', 'Client Secret')] },
  { key: 'vtex', label: 'VTEX', fields: [field('appKey', 'App Key'), field('appToken', 'App Token')] },
];

const INTEGRATION_SECTIONS: { key: IntegrationSection; title: string; systems: IntegrationSystem[] }[] = [
  { key: 'erp', title: 'ERP', systems: ERP_SYSTEMS },
  { key: 'marketplace', title: 'Marketplace', systems: MARKETPLACE_SYSTEMS },
  { key: 'ads', title: 'ADS', systems: ADS_SYSTEMS },
  { key: 'gateway', title: 'Gateway/Checkout', systems: GATEWAY_SYSTEMS },
];

const SECTION_COLORS: Record<IntegrationSection, { headerBg: string; headerHover: string; border: string; cardBg: string; text: string }> = {
  erp: { headerBg: 'bg-blue-50', headerHover: 'hover:bg-blue-100', border: 'border-blue-200', cardBg: 'bg-blue-50', text: 'text-blue-600' },
  marketplace: { headerBg: 'bg-yellow-50', headerHover: 'hover:bg-yellow-100', border: 'border-yellow-200', cardBg: 'bg-yellow-50', text: 'text-yellow-600' },
  ads: { headerBg: 'bg-red-50', headerHover: 'hover:bg-red-100', border: 'border-red-200', cardBg: 'bg-red-50', text: 'text-red-600' },
  gateway: { headerBg: 'bg-green-50', headerHover: 'hover:bg-green-100', border: 'border-green-200', cardBg: 'bg-green-50', text: 'text-green-600' },
};


const createEmptyIntegrationMap = (systems: IntegrationSystem[]) =>
  systems.reduce<Record<string, IntegrationCredentials>>((acc, { key, fields }) => {
    const base: IntegrationCredentials = {};
    fields.forEach((f) => {
      base[f.key] = '';
    });
    acc[key] = base;
    return acc;
  }, {});

const createDefaultIntegracoes = () => ({
  erp: createEmptyIntegrationMap(ERP_SYSTEMS),
  marketplace: createEmptyIntegrationMap(MARKETPLACE_SYSTEMS),
  ads: createEmptyIntegrationMap(ADS_SYSTEMS),
  gateway: createEmptyIntegrationMap(GATEWAY_SYSTEMS),
});

const mergeIntegracoes = (omieConfig?: OmieConfig): OmieConfig => {
  const defaults = createDefaultIntegracoes();
  const safe: OmieConfig = {
    pertenceGrupo: omieConfig?.pertenceGrupo ?? false,
    grupoId: omieConfig?.grupoId || '',
    appKey: omieConfig?.appKey || '',
    appSecret: omieConfig?.appSecret || '',
    integracoes: {
      erp: { ...defaults.erp },
      marketplace: { ...defaults.marketplace },
      ads: { ...defaults.ads },
      gateway: { ...defaults.gateway },
    },
  };

  const incoming = omieConfig?.integracoes || {};
  INTEGRATION_SECTIONS.forEach(({ key, systems }) => {
    const incomingSection = incoming[key];
    if (!incomingSection) return;
    systems.forEach(({ key: systemKey, fields }) => {
      const cred = incomingSection[systemKey];
      if (cred) {
        const base: IntegrationCredentials = {};
        fields.forEach((f) => {
          base[f.key] = cred[f.key] || '';
        });
        if (safe.integracoes && safe.integracoes[key]) {
          safe.integracoes[key][systemKey] = base;
        }
      }
    });
  });

  const omieCreds = safe.integracoes?.erp?.omie;
  if (omieCreds && (safe.appKey || safe.appSecret) && safe.integracoes?.erp) {
    safe.integracoes.erp.omie = {
      ...safe.integracoes.erp.omie,
      appKey: safe.appKey || omieCreds.appKey,
      appSecret: safe.appSecret || omieCreds.appSecret,
    };
  }

  return safe;
};

const isValidEmailLocal = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export function CadastroCliente() {
  usePageTitle('Cadastro de Cliente');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get('id');
  const isEdit = !!clienteId;

  const { user } = useAuthStore();
  const { criarCadastro, atualizarCadastro, clientes, submeterCadastro, aprovarCadastro, rejeitarCadastro, devolverCadastro, createClienteAPI } = useClientesStore();
  const { config } = useSystemStore();
  
  const isAdminOrGestor = user?.role === 'admin' || user?.role === 'gestor';
  const visibleTabs = isAdminOrGestor ? TABS_COMPLETAS : TABS_CLIENTE;

  const [currentTab, setCurrentTab] = useState<TabSection>('dados');
  const isFirstTab = visibleTabs[0] === currentTab;
  const isLastTab = visibleTabs[visibleTabs.length - 1] === currentTab;
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjValido, setCnpjValido] = useState<boolean | null>(null);
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [devolutionComments, setDevolutionComments] = useState('');
  const [showDevolutionModal, setShowDevolutionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [cnpjDragOver, setCnpjDragOver] = useState(false);
  const [contratoDragOver, setContratoDragOver] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState<Record<IntegrationSection, boolean>>({
    erp: false,
    marketplace: false,
    ads: false,
    gateway: false,
  });
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const handleIntegrationChange = (section: IntegrationSection, systemKey: string, field: keyof IntegrationCredentials, value: string) => {
    setForm((prev) => {
      const merged = mergeIntegracoes(prev.omieConfig);
      const updatedSection = {
        ...(merged.integracoes?.[section] || {}),
        [systemKey]: {
          ...(merged.integracoes?.[section]?.[systemKey] || {}),
          [field]: value,
        },
      };

      const nextConfig: OmieConfig = {
        ...merged,
        integracoes: {
          ...merged.integracoes!,
          [section]: updatedSection,
        },
      };

      if (section === 'erp' && systemKey === 'omie') {
        nextConfig.appKey = field === 'appKey' ? value : nextConfig.appKey;
        nextConfig.appSecret = field === 'appSecret' ? value : nextConfig.appSecret;
      }

      return { ...prev, omieConfig: nextConfig };
    });
  };

  const toggleFieldVisibility = (fieldId: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const getSystemCompletionStatus = (system: IntegrationSystem, cred: IntegrationCredentials): { complete: boolean; filled: number; total: number } => {
    const required = system.fields.filter((f) => !f.label.includes('(opcional)'));
    const filledRequired = required.filter((f) => (cred as IntegrationCredentials)[f.key]?.trim()).length;
    return { complete: filledRequired === required.length, filled: filledRequired, total: required.length };
  };

  const [form, setForm] = useState<FormState>({
    dadosGerais: { cnpj: '', nome: '', endereco: '', numero: '', bairro: '', cidade: '', cep: '', uf: '', site: '', segmentoAtuacao: '', tempoMercado: '1', observacao: '', nomeFantasia: '' },
    contatosPrincipais: { nomeSocio: '', cpfSocio: '', emailPrincipal: '', emailFinanceiro: '', telefone: '', whatsapp: '' },
    outrosContatos: [],
    comunicacaoFluxo: { canalPreferencial: 'email', horarioPreferencial: 'comercial', pessoaContatoPrincipal: '' },
    servicosContratados: { bpoFinanceiro: false, assessoriaFinanceira: false, contabilidade: false, juridicoContratual: false, juridicoTributario: false, trading: false, outro: '', observacoes: '', previsaoInicio: '' },
    pontosAtencao: { pendencias: '', exigenciasEspecificas: '', prioridade: 'media' },
    contextoGeral: { oQueEmpreendimento: '', perfilCliente: '', objetivos: '', situacao: '', expectativas: '', observacao: '' },
    omieConfig: { pertenceGrupo: false, grupoId: '', appKey: '', appSecret: '', integracoes: createDefaultIntegracoes() }
  });

  const emailPrincipalValido = isValidEmailLocal(form.contatosPrincipais.emailPrincipal || '');
  const emailFinanceiroValido = !form.contatosPrincipais.emailFinanceiro || isValidEmailLocal(form.contatosPrincipais.emailFinanceiro);
  const outrosEmailsInvalidos = form.outrosContatos.some((c) => c.email && !isValidEmailLocal(c.email));

  useEffect(() => {
    if (isEdit && clienteId) {
      const cliente = clientes.find(c => c.id === parseInt(clienteId));
      if (cliente) {
        setForm({
          dadosGerais: cliente.dadosGerais,
          contatosPrincipais: cliente.contatosPrincipais,
          outrosContatos: cliente.outrosContatos,
          comunicacaoFluxo: cliente.comunicacaoFluxo,
          servicosContratados: cliente.servicosContratados,
          pontosAtencao: cliente.pontosAtencao || form.pontosAtencao,
          contextoGeral: cliente.contextoGeral || form.contextoGeral,
          omieConfig: mergeIntegracoes(cliente.omieConfig || form.omieConfig)
        });
      }
    }
  }, [isEdit, clienteId, clientes]);

  // Auto-preencher endereço via CEP
  const handleCepChange = (value: string) => {
    const cleanCep = onlyDigits(value).slice(0, 8);
    setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, cep: cleanCep } }));
  };

  // Validar e preencher CEP ao sair do campo
  const handleCepBlur = async () => {
    const cleanCep = form.dadosGerais.cep || '';
    if (cleanCep.length !== 8) {
      setCepValido(null);
      return;
    }
    setCepLoading(true);
    try {
      const address = await fetchAddressByCEP(cleanCep);
      if (address) {
        setForm(prev => ({
          ...prev,
          dadosGerais: {
            ...prev.dadosGerais,
            endereco: address.logradouro || '',
            bairro: address.bairro || '',
            cidade: address.localidade || '',
            uf: address.uf || ''
          }
        }));
        setCepValido(true);
        toast.success('Endereço preenchido automaticamente!');
      } else {
        setCepValido(false);
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepValido(false);
      toast.error('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const goToNextTab = () => {
    const idx = visibleTabs.indexOf(currentTab);
    if (idx > -1 && idx < visibleTabs.length - 1) {
      setCurrentTab(visibleTabs[idx + 1] as TabSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevTab = () => {
    const idx = visibleTabs.indexOf(currentTab);
    if (idx > 0) {
      setCurrentTab(visibleTabs[idx - 1] as TabSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navegação por teclado: Ctrl + Setas esquerda/direita
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextTab();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, visibleTabs]);

  // CNPJ: formatação automática e validação local, com complemento pela BrasilAPI
  const handleCnpjChange = (value: string) => {
    const cleanCnpj = onlyDigits(value).slice(0, 14);
    setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, cnpj: cleanCnpj } }));

    const isValid = cleanCnpj.length === 14 ? isValidCNPJ(cleanCnpj) : false;
    setCnpjValido(cleanCnpj.length === 14 ? isValid : null);
  };

  const handleCnpjBlur = async () => {
    const cleanCnpj = form.dadosGerais.cnpj;
    if (cleanCnpj.length === 14 && cnpjValido === true) {
      setCnpjLoading(true);
      try {
        const data = await fetchCNPJ(cleanCnpj);
        if (data) {
          setForm(prev => ({
            ...prev,
            dadosGerais: {
              ...prev.dadosGerais,
              nome: data.razao_social || prev.dadosGerais.nome || '',
              nomeFantasia: data.nome_fantasia || prev.dadosGerais.nomeFantasia || ''
            }
          }));
          toast.success('Cnpj é válido!');
        }
      } catch (error) {
        console.error('Erro ao buscar CNPJ:', error);
      } finally {
        setCnpjLoading(false);
      }
    }
  };

  const handleAddOutroContato = () => {
    const novoContato: OutroContato = {
      id: `contato-${Date.now()}`,
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
      participaImplantacao: false
    };
    setForm(prev => ({ ...prev, outrosContatos: [...prev.outrosContatos, novoContato] }));
  };

  const handleRemoveOutroContato = (id: string) => {
    setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.filter(c => c.id !== id) }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const normalizedOmieConfig = mergeIntegracoes(form.omieConfig);
      
      // Salvar no localStorage (store local)
      if (isEdit && clienteId) {
        atualizarCadastro(parseInt(clienteId), {
          dadosGerais: {
            ...form.dadosGerais,
            logo: logoUploader.readyAttachments[0],
            cartoesCNPJ: cnpjUploader.readyAttachments,
            contratosSociais: contratoUploader.readyAttachments,
          },
          contatosPrincipais: form.contatosPrincipais,
          outrosContatos: form.outrosContatos,
          comunicacaoFluxo: form.comunicacaoFluxo,
          servicosContratados: form.servicosContratados,
          omieConfig: normalizedOmieConfig,
          ...(isAdminOrGestor && { pontosAtencao: form.pontosAtencao, contextoGeral: form.contextoGeral })
        });
        toast.success('Cadastro atualizado com sucesso!');
      } else {
        const id = criarCadastro({
          dadosGerais: {
            ...form.dadosGerais,
            logo: logoUploader.readyAttachments[0],
            cartoesCNPJ: cnpjUploader.readyAttachments,
            contratosSociais: contratoUploader.readyAttachments,
          },
          contatosPrincipais: form.contatosPrincipais,
          outrosContatos: form.outrosContatos,
          comunicacaoFluxo: form.comunicacaoFluxo,
          servicosContratados: form.servicosContratados,
          omieConfig: normalizedOmieConfig,
          ...(isAdminOrGestor && { pontosAtencao: form.pontosAtencao, contextoGeral: form.contextoGeral })
        });
        
        // Salvar também no banco de dados via API
        try {
          await createClienteAPI({
            nome: form.dadosGerais.nome,
            cnpj: form.dadosGerais.cnpj || undefined,
            razao_social: form.dadosGerais.nomeFantasia || undefined,
            email: form.contatosPrincipais.emailPrincipal || undefined,
            telefone: form.contatosPrincipais.telefone || form.dadosGerais.telefone || undefined,
            endereco: form.dadosGerais.endereco || undefined,
            status: 'ativo',
            mrr: 0,
          });
        } catch (apiError) {
          console.error('Erro ao salvar no banco:', apiError);
          // Não bloquear o fluxo se falhar a API
        }
        
        toast.success('Cadastro criado com sucesso!');
        navigate(`/cadastro-cliente?id=${id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      cnpjValido === true &&
      form.dadosGerais.nome.trim() !== '' &&
      cepValido === true &&
      cnpjUploader.readyAttachments.length >= 1 &&
      contratoUploader.readyAttachments.length >= 1 &&
      form.contatosPrincipais.nomeSocio.trim() !== '' &&
      cpfValido === true &&
      form.contatosPrincipais.emailPrincipal.trim() !== '' &&
      emailPrincipalValido &&
      emailFinanceiroValido &&
      !outrosEmailsInvalidos &&
      form.contatosPrincipais.telefone.trim() !== '' &&
      form.comunicacaoFluxo.canalPreferencial.trim() !== '' &&
      form.comunicacaoFluxo.horarioPreferencial.trim() !== '' &&
      form.comunicacaoFluxo.pessoaContatoPrincipal.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hasCnpjDocs = cnpjUploader.readyAttachments.length >= 1;
      const hasContratoDocs = contratoUploader.readyAttachments.length >= 1;
      if (cnpjValido !== true) {
        toast.error('CNPJ inválido. Corrija antes de enviar.');
        return;
      }
      if (!hasCnpjDocs) {
        toast.error('Anexe pelo menos 1 cartão CNPJ.');
        return;
      }
      if (!hasContratoDocs) {
        toast.error('Anexe pelo menos 1 contrato social.');
        return;
      }
      await handleSave();
      if (clienteId) {
        submeterCadastro(parseInt(clienteId));
        toast.success('Cadastro enviado para análise!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await handleSave();
      if (clienteId) {
        aprovarCadastro(parseInt(clienteId), user?.id || 'sistema');
        toast.success('Cadastro aprovado!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (clienteId) {
        rejeitarCadastro(parseInt(clienteId), '');
        toast.success('Cadastro rejeitado e cliente notificado');
        setShowRejectionModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevolution = async () => {
    if (!devolutionComments.trim()) {
      toast.error('Informe os comentários para devolução');
      return;
    }
    setLoading(true);
    try {
      if (clienteId) {
        await devolverCadastro(parseInt(clienteId), devolutionComments);
        toast.success('Cadastro devolvido para correção!');
        setShowDevolutionModal(false);
        setDevolutionComments('');
      }
    } finally {
      setLoading(false);
    }
  };

  const cliente = isEdit && clienteId ? clientes.find(c => c.id === parseInt(clienteId)) : null;
  const status = cliente?.status;

  const allServicos = SERVICO_OPTIONS.map(({ label }) => label);
  const historicoPlanos = (form.servicosContratados.planosHistorico || [])
    .map((plano) => plano.nomePlano)
    .filter(Boolean);
  const planoNomeOptions = Array.from(new Set([
    ...allServicos,
    ...historicoPlanos
  ]));
  const integracoes = mergeIntegracoes(form.omieConfig).integracoes || createDefaultIntegracoes();

  // Uploaders para anexos
  const logoUploader = useAttachmentUploader();
  const cnpjUploader = useAttachmentUploader();
  const contratoUploader = useAttachmentUploader();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/clientes')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {isEdit ? 'Editar Cadastro' : 'Novo Cadastro de Cliente'}
          </h2>
          {cliente && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm px-2 py-1 rounded-full font-semibold ${
                status === 'aprovado' ? 'bg-green-100 text-green-800' :
                status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-slate-200 dark:bg-slate-800/80 text-gray-800 dark:text-slate-200'
              }`}>
                {status === 'rascunho' ? 'Rascunho' :
                 status === 'pendente' ? 'Pendente análise' :
                 status === 'aprovado' ? 'Aprovado' :
                 status === 'rejeitado' ? 'Rejeitado' : status}
              </span>
              {cliente.dataSubmissao && <span className="text-xs text-gray-500 dark:text-slate-400">Enviado em {new Date(cliente.dataSubmissao).toLocaleDateString()}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {visibleTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab as TabSection)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                currentTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 dark:text-slate-300 hover:text-gray-800'
              }`}
            >
              {tab === 'dados' && '1. Dados Gerais'}
              {tab === 'contatos' && '2. Contatos Principais'}
              {tab === 'outros' && '3. Outros Contatos'}
              {tab === 'comunicacao' && '4. Comunicação'}
              {tab === 'servicos' && '5. Serviços'}
              {tab === 'atencao' && '6. Pontos de Atenção'}
              {tab === 'contexto' && '7. Contexto Geral'}
              {tab === 'omie' && '8. API & Integração'}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {/* Seção 1: Dados Gerais */}
        {currentTab === 'dados' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Dados Gerais da Empresa</h3>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CNPJ: *</label>
                <input
                  type="text"
                  value={formatCNPJ(form.dadosGerais.cnpj)}
                  onChange={(e) => handleCnpjChange(e.target.value)}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  disabled={cnpjLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                />
                {cnpjLoading && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Carregando dados...</p>}
                {!cnpjLoading && cnpjValido === true && (
                  <p className="text-xs text-green-600 mt-1">CNPJ válido</p>
                )}
                {!cnpjLoading && cnpjValido === false && (
                  <p className="text-xs text-red-600 mt-1">CNPJ inválido ou não encontrado</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Nome da Empresa: *</label>
                <input
                  type="text"
                  value={form.dadosGerais.nome}
                  onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, nome: e.target.value } }))}
                  placeholder="Razão social"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Nome Fantasia:</label>
                <input
                  type="text"
                  value={form.dadosGerais.nomeFantasia || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, nomeFantasia: e.target.value } }))}
                  placeholder="Nome da marca"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CEP: *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.dadosGerais.cep ? formatCEP(form.dadosGerais.cep) : ''}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    disabled={cepLoading}
                    maxLength={9}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                  />
                  {cepLoading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 dark:text-slate-500" size={18} />}
                </div>
                {!cepLoading && cepValido === true && (
                  <p className="text-xs text-green-600 mt-1">CEP válido</p>
                )}
                {!cepLoading && cepValido === false && (
                  <p className="text-xs text-red-600 mt-1">CEP não encontrado</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Endereço:</label>
                <input type="text" value={form.dadosGerais.endereco} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, endereco: e.target.value } }))} placeholder="Rua/Avenida" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Número:</label>
                <input type="text" value={form.dadosGerais.numero || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, numero: e.target.value } }))} placeholder="123" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Bairro:</label>
                <input type="text" value={form.dadosGerais.bairro || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, bairro: e.target.value } }))} placeholder="Bairro" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Cidade:</label>
                <input type="text" value={form.dadosGerais.cidade || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, cidade: e.target.value } }))} placeholder="Cidade" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">UF:</label>
                <input type="text" value={form.dadosGerais.uf || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, uf: e.target.value.toUpperCase() } }))} placeholder="SP" maxLength={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Site:</label>
                <input type="url" value={form.dadosGerais.site || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, site: e.target.value } }))} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Segmento de Atuação:</label>
                <input type="text" value={form.dadosGerais.segmentoAtuacao || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, segmentoAtuacao: e.target.value } }))} placeholder="Ex: E-commerce, Varejo" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tempo de Mercado:</label>
                <select value={form.dadosGerais.tempoMercado || '1'} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, tempoMercado: e.target.value as any } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100">
                  <option value="<1">Menos de 1 ano</option>
                  <option value="1">1 ano</option>
                  <option value="2">2 anos</option>
                  <option value="3">3 anos</option>
                  <option value="4">4 anos</option>
                  <option value="5">5 anos</option>
                  <option value=">5">Mais de 5 anos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Observação:</label>
              <textarea value={form.dadosGerais.observacao || ''} onChange={(e) => setForm(prev => ({ ...prev, dadosGerais: { ...prev.dadosGerais, observacao: e.target.value } }))} placeholder="Observações adicionais" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
            </div>

            {/* Anexos: Logo, Cartão CNPJ, Contrato Social */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* Logo da Empresa: */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Logo da Empresa: *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors min-h-[140px] flex items-center justify-center ${
                    logoDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 dark:border-slate-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setLogoDragOver(true);
                  }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setLogoDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      if (logoUploader.attachments.length >= 1) {
                        logoUploader.reset();
                      }
                      logoUploader.handleFiles(files);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      if (logoUploader.attachments.length >= 1) {
                        logoUploader.reset();
                      }
                      logoUploader.handleFiles(files);
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    {logoUploader.attachments.length === 0 ? (
                      <div>
                        <p className="text-gray-600 dark:text-slate-300">Arraste e solte aqui ou clique para selecionar</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">PNG ou JPG, até 5MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={logoUploader.attachments[0].dataUrl}
                          alt="Logo preview"
                          className="w-16 h-16 rounded border object-cover"
                        />
                        <p className="text-gray-600 dark:text-slate-300">Logo selecionado</p>
                        <button
                          type="button"
                          onClick={() => logoUploader.removeAttachment(logoUploader.attachments[0].id)}
                          className="p-2 border rounded text-gray-600 dark:text-slate-300 hover:text-red-600"
                          title="Remover logo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </label>
                  {logoUploader.isUploading && <span className="text-xs text-gray-500 dark:text-slate-400 block">Enviando...</span>}
                </div>
              </div>

              {/* Cartão CNPJ (multi) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Cartão CNPJ: *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors min-h-[140px] flex items-center justify-center ${
                    cnpjDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 dark:border-slate-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setCnpjDragOver(true);
                  }}
                  onDragLeave={() => setCnpjDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCnpjDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      cnpjUploader.handleFiles(files);
                    }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(e) => e.target.files && cnpjUploader.handleFiles(e.target.files)}
                    className="hidden"
                    id="cnpj-upload"
                  />
                  <label htmlFor="cnpj-upload" className="cursor-pointer flex-1">
                    {cnpjUploader.attachments.length === 0 ? (
                      <div>
                        <p className="text-gray-600 dark:text-slate-300">Arraste e solte aqui ou clique para selecionar</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">PDF, PNG ou JPG, até 5MB cada</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 justify-center items-start overflow-auto max-h-[120px] p-2">
                        {cnpjUploader.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2 bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-gray-900 dark:text-slate-100">
                            {att.mimeType && att.mimeType.startsWith('image') ? (
                              <img src={att.dataUrl} alt={att.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded text-xs text-gray-900 dark:text-slate-100">PDF</div>
                            )}
                            <span className="text-sm truncate max-w-[120px]">{att.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                cnpjUploader.removeAttachment(att.id);
                              }}
                              className="p-1 border rounded text-gray-600 dark:text-slate-300 hover:text-red-600"
                              title="Remover"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </label>
                  {cnpjUploader.isUploading && <span className="text-xs text-gray-500 dark:text-slate-400 block">Enviando...</span>}
                </div>
              </div>

              {/* Contrato Social (multi) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Contrato Social: *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors min-h-[140px] flex items-center justify-center ${
                    contratoDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 dark:border-slate-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setContratoDragOver(true);
                  }}
                  onDragLeave={() => setContratoDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setContratoDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      contratoUploader.handleFiles(files);
                    }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(e) => e.target.files && contratoUploader.handleFiles(e.target.files)}
                    className="hidden"
                    id="contrato-upload"
                  />
                  <label htmlFor="contrato-upload" className="cursor-pointer flex-1">
                    {contratoUploader.attachments.length === 0 ? (
                      <div>
                        <p className="text-gray-600 dark:text-slate-300">Arraste e solte aqui ou clique para selecionar</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">PDF, PNG ou JPG, até 5MB cada</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 justify-center items-start overflow-auto max-h-[120px] p-2">
                        {contratoUploader.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2 bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-gray-900 dark:text-slate-100">
                            {att.mimeType && att.mimeType.startsWith('image') ? (
                              <img src={att.dataUrl} alt={att.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded text-xs text-gray-900 dark:text-slate-100">PDF</div>
                            )}
                            <span className="text-sm truncate max-w-[120px]">{att.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                contratoUploader.removeAttachment(att.id);
                              }}
                              className="p-1 border rounded text-gray-600 dark:text-slate-300 hover:text-red-600"
                              title="Remover"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </label>
                  {contratoUploader.isUploading && <span className="text-xs text-gray-500 dark:text-slate-400 block">Enviando...</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção 2: Contatos Principais */}
        {currentTab === 'contatos' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contatos Principais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Nome do Sócio Responsável: *</label>
                <input type="text" value={form.contatosPrincipais.nomeSocio} onChange={(e) => setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, nomeSocio: e.target.value } }))} placeholder="Nome completo" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CPF: *</label>
                <input type="text" value={formatCPF(form.contatosPrincipais.cpfSocio || '')} onChange={(e) => {
                  const cleanCpf = onlyDigits(e.target.value).slice(0, 11);
                  setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, cpfSocio: cleanCpf } }));
                  setCpfValido(cleanCpf.length === 11 ? isValidCPF(cleanCpf) : null);
                }} placeholder="000.000.000-00" maxLength={14} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
                {cpfValido === true && (
                  <p className="text-xs text-green-600 mt-1">CPF válido</p>
                )}
                {cpfValido === false && (
                  <p className="text-xs text-red-600 mt-1">CPF inválido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">E-mail Principal: *</label>
                <input
                  type="email"
                  value={form.contatosPrincipais.emailPrincipal}
                  onChange={(e) => setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, emailPrincipal: e.target.value } }))}
                  placeholder="email@empresa.com"
                  className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 border ${emailPrincipalValido ? 'border-gray-300 dark:border-slate-700' : 'border-red-400'}`}
                  onBlur={() => {
                    if (!isValidEmailLocal(form.contatosPrincipais.emailPrincipal)) {
                      toast.error('Informe um e-mail principal válido');
                    }
                  }}
                />
                {!emailPrincipalValido && form.contatosPrincipais.emailPrincipal.trim() !== '' && (
                  <p className="text-xs text-red-600 mt-1">E-mail inválido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">E-mail Financeiro:</label>
                <input
                  type="email"
                  value={form.contatosPrincipais.emailFinanceiro || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, emailFinanceiro: e.target.value } }))}
                  placeholder="financeiro@empresa.com"
                  className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 border ${!form.contatosPrincipais.emailFinanceiro || emailFinanceiroValido ? 'border-gray-300 dark:border-slate-700' : 'border-red-400'}`}
                  onBlur={() => {
                    if (form.contatosPrincipais.emailFinanceiro && !isValidEmailLocal(form.contatosPrincipais.emailFinanceiro)) {
                      toast.error('Informe um e-mail financeiro válido');
                    }
                  }}
                />
                {form.contatosPrincipais.emailFinanceiro && !emailFinanceiroValido && (
                  <p className="text-xs text-red-600 mt-1">E-mail inválido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Telefone: *</label>
                <input type="tel" value={formatPhone(form.contatosPrincipais.telefone)} onChange={(e) => setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, telefone: onlyDigits(e.target.value).slice(0, 11) } }))} placeholder="(11) 98765-4321" maxLength={15} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">WhatsApp:</label>
                <input type="tel" value={formatPhone(form.contatosPrincipais.whatsapp || '')} onChange={(e) => setForm(prev => ({ ...prev, contatosPrincipais: { ...prev.contatosPrincipais, whatsapp: onlyDigits(e.target.value).slice(0, 11) } }))} placeholder="(11) 98765-4321" maxLength={15} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>
            </div>
          </div>
        )}

        {/* Seção 3: Outros Contatos */}
        {currentTab === 'outros' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Outros Contatos Relevantes</h3>
              <Button variant="secondary" onClick={handleAddOutroContato}>+ Adicionar Contato</Button>
            </div>
            
            {form.outrosContatos.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-sm">Nenhum contato adicional cadastrado</p>
            ) : (
              form.outrosContatos.map((contato, idx) => (
                <div key={contato.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Contato #{idx + 1}</h4>
                    <Button variant="outline" onClick={() => handleRemoveOutroContato(contato.id)}>Remover</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={contato.nome} onChange={(e) => setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.map(c => c.id === contato.id ? { ...c, nome: e.target.value } : c) }))} placeholder="Nome" className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg" />
                    <input type="text" value={contato.cargo} onChange={(e) => setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.map(c => c.id === contato.id ? { ...c, cargo: e.target.value } : c) }))} placeholder="Cargo" className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg" />
                    <div className="space-y-1">
                      <input
                        type="email"
                        value={contato.email}
                        onChange={(e) => setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.map(c => c.id === contato.id ? { ...c, email: e.target.value } : c) }))}
                        placeholder="E-mail"
                        className={`px-4 py-2 border rounded-lg w-full ${!contato.email || isValidEmailLocal(contato.email) ? 'border-gray-300 dark:border-slate-700' : 'border-red-400'}`}
                        onBlur={() => {
                          if (contato.email && !isValidEmailLocal(contato.email)) {
                            toast.error('Informe um e-mail válido');
                          }
                        }}
                      />
                      {contato.email && !isValidEmailLocal(contato.email) && (
                        <p className="text-xs text-red-600">E-mail inválido</p>
                      )}
                    </div>
                    <input type="tel" value={contato.telefone} onChange={(e) => setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.map(c => c.id === contato.id ? { ...c, telefone: e.target.value } : c) }))} placeholder="Telefone" className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={contato.participaImplantacao} onChange={(e) => setForm(prev => ({ ...prev, outrosContatos: prev.outrosContatos.map(c => c.id === contato.id ? { ...c, participaImplantacao: e.target.checked } : c) }))} className="w-4 h-4" />
                      <span className="text-sm">Participa da implantação?</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Seção 4: Comunicação */}
        {currentTab === 'comunicacao' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Comunicação e Fluxo de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Canal Preferencial: *</label>
                <select value={form.comunicacaoFluxo.canalPreferencial} onChange={(e) => setForm(prev => ({ ...prev, comunicacaoFluxo: { ...prev.comunicacaoFluxo, canalPreferencial: e.target.value as any } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {form.comunicacaoFluxo.canalPreferencial === 'outro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Especifique:</label>
                  <input type="text" value={form.comunicacaoFluxo.canalOutro || ''} onChange={(e) => setForm(prev => ({ ...prev, comunicacaoFluxo: { ...prev.comunicacaoFluxo, canalOutro: e.target.value } }))} placeholder="Ex: Telefone" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Horário Preferencial: *</label>
                <select value={form.comunicacaoFluxo.horarioPreferencial} onChange={(e) => setForm(prev => ({ ...prev, comunicacaoFluxo: { ...prev.comunicacaoFluxo, horarioPreferencial: e.target.value as any } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100">
                  <option value="comercial">Comercial (09h-18h)</option>
                  <option value="sem_preferencia">Sem preferência</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {form.comunicacaoFluxo.horarioPreferencial === 'outro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Especifique:</label>
                  <input type="text" value={form.comunicacaoFluxo.horarioOutro || ''} onChange={(e) => setForm(prev => ({ ...prev, comunicacaoFluxo: { ...prev.comunicacaoFluxo, horarioOutro: e.target.value } }))} placeholder="Ex: 19h-21h" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Pessoa de Contato Principal: *</label>
                <input type="text" value={form.comunicacaoFluxo.pessoaContatoPrincipal} onChange={(e) => setForm(prev => ({ ...prev, comunicacaoFluxo: { ...prev.comunicacaoFluxo, pessoaContatoPrincipal: e.target.value } }))} placeholder="Nome da pessoa" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>
            </div>
          </div>
        )}

        {/* Seção 5: Serviços */}
        {currentTab === 'servicos' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Serviços Contratados</h3>
            
            <div className="space-y-3">
              {SERVICO_OPTIONS.map(({ key, label }) => {
                const servicoKey = key as ServicoBooleanKey;
                return (
                  <label key={servicoKey} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.servicosContratados[servicoKey]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          servicosContratados: {
                            ...prev.servicosContratados,
                            [servicoKey]: e.target.checked
                          }
                        }))
                      }
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-gray-700 dark:text-slate-200">{label}</span>
                  </label>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Previsão de Início da Operação:</label>
                <input type="date" value={form.servicosContratados.previsaoInicio} onChange={(e) => setForm(prev => ({ ...prev, servicosContratados: { ...prev.servicosContratados, previsaoInicio: e.target.value } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Data do Contrato Fechado:</label>
                <input type="date" value={form.servicosContratados.dataContratoFechado || ''} onChange={(e) => setForm(prev => ({ ...prev, servicosContratados: { ...prev.servicosContratados, dataContratoFechado: e.target.value } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Observações:</label>
              <textarea value={form.servicosContratados.observacoes || ''} onChange={(e) => setForm(prev => ({ ...prev, servicosContratados: { ...prev.servicosContratados, observacoes: e.target.value } }))} placeholder="Observações sobre os serviços" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
            </div>

            {/* Gerenciador de Planos/Upsell */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <UpsellManager
                planos={form.servicosContratados.planosHistorico || []}
                planoOptions={planoNomeOptions}
                onAdd={(plano) => {
                  setForm(prev => ({
                    ...prev,
                    servicosContratados: {
                      ...prev.servicosContratados,
                      planosHistorico: [...(prev.servicosContratados.planosHistorico || []), plano]
                    }
                  }));
                }}
                onRemove={(id) => {
                  setForm(prev => ({
                    ...prev,
                    servicosContratados: {
                      ...prev.servicosContratados,
                      planosHistorico: (prev.servicosContratados.planosHistorico || []).filter(p => p.id !== id)
                    }
                  }));
                }}
                onUpdate={(id, plano) => {
                  setForm(prev => ({
                    ...prev,
                    servicosContratados: {
                      ...prev.servicosContratados,
                      planosHistorico: (prev.servicosContratados.planosHistorico || []).map(p => p.id === id ? plano : p)
                    }
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* Seção 6: Pontos de Atenção */}
        {currentTab === 'atencao' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Pontos de Atenção</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Pendências:</label>
                <textarea value={form.pontosAtencao.pendencias || ''} onChange={(e) => setForm(prev => ({ ...prev, pontosAtencao: { ...prev.pontosAtencao, pendencias: e.target.value } }))} placeholder="Descreva pendências" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Exigências Específicas:</label>
                <textarea value={form.pontosAtencao.exigenciasEspecificas || ''} onChange={(e) => setForm(prev => ({ ...prev, pontosAtencao: { ...prev.pontosAtencao, exigenciasEspecificas: e.target.value } }))} placeholder="Exigências do cliente" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Prioridade:</label>
                <select value={form.pontosAtencao.prioridade} onChange={(e) => setForm(prev => ({ ...prev, pontosAtencao: { ...prev.pontosAtencao, prioridade: e.target.value as any } }))} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Seção 7: Contexto Geral */}
        {currentTab === 'contexto' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contexto Geral</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">O que a Empresa faz?</label>
                <textarea value={form.contextoGeral.oQueEmpreendimento || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, oQueEmpreendimento: e.target.value } }))} placeholder="Descrição do negócio" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Perfil do Cliente:</label>
                <textarea value={form.contextoGeral.perfilCliente || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, perfilCliente: e.target.value } }))} placeholder="Perfil do cliente" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Objetivos:</label>
                <textarea value={form.contextoGeral.objetivos || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, objetivos: e.target.value } }))} placeholder="Objetivos da implantação" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Situação:</label>
                <textarea value={form.contextoGeral.situacao || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, situacao: e.target.value } }))} placeholder="Situação atual" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Expectativas:</label>
                <textarea value={form.contextoGeral.expectativas || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, expectativas: e.target.value } }))} placeholder="Expectativas do cliente" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Observação:</label>
                <textarea value={form.contextoGeral.observacao || ''} onChange={(e) => setForm(prev => ({ ...prev, contextoGeral: { ...prev.contextoGeral, observacao: e.target.value } }))} placeholder="Observações gerais" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100" />
              </div>
            </div>
          </div>
        )}

        {/* Seção 8: API & Integração */}
        {currentTab === 'omie' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">API & Integração</h3>

            

            <div className="space-y-3">
              {INTEGRATION_SECTIONS.map(({ key, title, systems }) => (
                              <div key={key} className={`border rounded-lg overflow-hidden ${SECTION_COLORS[key].border}`}>
                  <button
                    type="button"
                                  className={`w-full flex items-center justify-between px-4 py-3 ${SECTION_COLORS[key].headerBg} ${SECTION_COLORS[key].headerHover}`}
                    onClick={() => setIntegrationOpen((prev) => ({ ...prev, [key]: !prev[key] }))}
                  >
                                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                                    {key === 'erp' && <Building2 size={16} className={SECTION_COLORS[key].text} />}
                                    {key === 'marketplace' && <ShoppingCart size={16} className={SECTION_COLORS[key].text} />}
                                    {key === 'ads' && <Megaphone size={16} className={SECTION_COLORS[key].text} />}
                                    {key === 'gateway' && <CreditCard size={16} className={SECTION_COLORS[key].text} />}
                                    {title}
                                  </span>
                                  <span className={`text-sm ${SECTION_COLORS[key].text}`}>{integrationOpen[key] ? 'Ocultar' : 'Expandir'}</span>
                  </button>

                  {integrationOpen[key] && (
                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                      {systems.map((system) => {
                        const cred = integracoes[key]?.[system.key] || {};
                        const status = getSystemCompletionStatus(system, cred);
                        return (
                          <div key={system.key} className={`p-4 border rounded-lg shadow-sm space-y-3 ${SECTION_COLORS[key].border} ${SECTION_COLORS[key].cardBg}`}>
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-gray-800">{system.label}</div>
                              <div className="flex items-center gap-2">
                                {status.complete ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                    <Check size={14} /> Configurado
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                                    <AlertCircle size={14} /> {status.filled}/{status.total} campos
                                  </div>
                                )}
                              </div>
                            </div>
                            {system.note && <p className="text-xs text-gray-600 dark:text-slate-300 italic">{system.note}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg">
                              {system.fields.map((f) => {
                                const fieldId = `${key}-${system.key}-${f.key}`;
                                const fieldValue = (cred as IntegrationCredentials)[f.key] || '';
                                const isVisible = visibleFields[fieldId] || false;
                                const isOptional = f.label.includes('(opcional)');
                                return (
                                  <div key={f.key}>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                                      {f.label}
                                      {!isOptional && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                      <input
                                        type={isVisible ? 'text' : 'password'}
                                        value={fieldValue}
                                        onChange={(e) => handleIntegrationChange(key, system.key, f.key, e.target.value)}
                                        placeholder={f.placeholder || f.label}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 pr-10 font-mono text-sm overflow-hidden"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => toggleFieldVisibility(fieldId)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200"
                                        title={isVisible ? 'Ocultar' : 'Mostrar'}
                                      >
                                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Botões de Ação */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Save size={18} />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>

        {!isEdit && (
          <Button onClick={handleSubmit} disabled={loading || !isFormValid()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            Salvar e Enviar para Análise
          </Button>
        )}

        {isEdit && (status === 'rascunho' || status === 'devolvido') && (
          <Button onClick={handleSubmit} disabled={loading || !isFormValid()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            Enviar para Análise
          </Button>
        )}

        {isEdit && isAdminOrGestor && status === 'pendente' && (
          <>
            <Button onClick={() => setShowApprovalModal(true)} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Check size={18} />
              Aprovar
            </Button>
            <Button onClick={() => setShowDevolutionModal(true)} disabled={loading} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white">
              <RotateCcw size={18} />
              Devolver para Correção
            </Button>
            <Button onClick={() => setShowRejectionModal(true)} disabled={loading} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
              <AlertCircle size={18} />
              Rejeitar
            </Button>
          </>
        )}

        <Button variant="outline" onClick={() => navigate('/clientes')}>Cancelar</Button>

        <div className="ml-auto" />
        {!isFirstTab && (
          <Button onClick={goToPrevTab} variant="secondary" className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Voltar
          </Button>
        )}
        {!isLastTab && (
          <Button onClick={goToNextTab} variant="secondary" className="flex items-center gap-2">
            Próximo
            <ArrowRight size={18} />
          </Button>
        )}
      </div>

      {/* Modal de Rejeição */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeitar Cadastro</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-4">Tem certeza de que deseja rejeitar este cadastro de cliente?</p>
            <div className="flex gap-2">
              <Button onClick={handleReject} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Confirmar
              </Button>
              <Button variant="outline" onClick={() => setShowRejectionModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Devolução para Correção */}
      {showDevolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Devolver para Correção</h3>
            <textarea 
              value={devolutionComments} 
              onChange={(e) => setDevolutionComments(e.target.value)} 
              placeholder="Comentários sobre as correções necessárias..." 
              rows={4} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg mb-4" 
            />
            <div className="flex gap-2">
              <Button onClick={handleDevolution} disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                Devolver
              </Button>
              <Button variant="outline" onClick={() => setShowDevolutionModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-4">Tem certeza de que deseja aprovar este cadastro de cliente?</p>
            <div className="flex gap-2">
              <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Confirmar
              </Button>
              <Button variant="outline" onClick={() => setShowApprovalModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}





