import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, Briefcase, Building2, Shield, Clock, Loader, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dropzone } from '../components/ui/Dropzone';
import { useDocumentosStore } from '../store/documentosStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { useCargosSetoresStore } from '../store/cargosSetoresStore';
import { useBeneficiosStore } from '../store/beneficiosStore';
import { useFolhaPagamentoStore } from '../store/folhaPagamentoStore';
import api from '../services/api';
import { validateEmail, validatePhone, formatPhone, formatCPF, isValidCPF, formatCNPJ, isValidCNPJ, formatCEP, fetchAddressByCEP } from '../utils/validation';
import { getBankByCode, fetchCNPJ } from '../utils/brasilapi';
import { UserRole } from '../types';

interface FormData {
  nome: string;
  nomeCompleto?: string;
  email: string;
  senha?: string;
  telefone: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  cargoId: string;
  setorId: string;
  funcao?: string;
  empresa?: string;
  grupoId?: string;
  grupoNome?: string;
  regime?: 'CLT' | 'PJ';
  contrato?: 'CLT' | 'PJ';
  role: UserRole;
  metaHorasMensais: string;
  status: 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo';
  dispensaDocumentacao?: boolean;

  // Bancários / PJ
  chavePix?: string;
  banco?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  tipoConta?: 'corrente' | 'poupanca';
  cnpj?: string;
  razaoSocial?: string;
  tipo?: string;
  
  // Endereço Empresa PJ
  enderecoEmpresa?: string;
  numeroEmpresa?: string;
  complementoEmpresa?: string;
  bairroEmpresa?: string;
  cidadeEmpresa?: string;
  cepEmpresa?: string;
  
  obs?: string;
  
  // Benefícios
  beneficiosSelecionados: string[];
  
  // Folha de Pagamento
  salarioBase: string;
  dataAdmissao: string;
  descontos?: string[];
}

export function CadastroUsuario() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  const { colaboradores, adicionarColaborador, atualizarColaborador } = useColaboradoresStore();
  const { user } = useAuthStore();
  const { cargos, setores } = useCargosSetoresStore();
  const documentosStore = useDocumentosStore();
  const adicionarDocumentoStore = useDocumentosStore((s) => s.adicionarDocumento);
  const { beneficios, carregarBeneficios } = useBeneficiosStore();
  const { adicionarFolha } = useFolhaPagamentoStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cepLoading, setCepLoading] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [cnpjValido, setCnpjValido] = useState<boolean | null>(null);
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [cepEmpresaValido, setCepEmpresaValido] = useState<boolean | null>(null);
  const toastShownRef = useRef(false);
  const [userData, setUserData] = useState<{
    id?: string;
    email: string;
    senha: string;
    role: string;
  } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cargoId: '',
    setorId: '',
    role: 'colaborador',
    metaHorasMensais: '176',
    status: 'em_contratacao',
    dispensaDocumentacao: false,
    empresa: '',
    grupoId: '',
    grupoNome: '',
    beneficiosSelecionados: [],
    salarioBase: '',
    dataAdmissao: '',
  });

  // Verificar permissão
  const podeGerenciarUsuarios = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  const loadUserData = async (identifier: string | null) => {
    if (!identifier) {
      console.log('Identificador inválido, será criado novo usuário');
      return null;
    }

    try {
      // Tentar buscar por ID primeiro (se for numérico)
      if (!isNaN(Number(identifier))) {
        const response = await api.get(`/api/users/${identifier}`);
        if (response) {
          const user = response;
          setUserData({
            id: user.id.toString(),
            email: user.email,
            senha: '', // Não carregamos a senha por segurança
            role: user.role,
          });
          return user;
        }
      }
      
      // Se não for numérico ou não encontrou por ID, tentar por email
      const response = await api.get('/api/users/', { params: { email: identifier } });
      if (response && response.length > 0) {
        // Validar que o email retornado corresponde ao solicitado
        const user = response.find((u: any) => u.email === identifier);
        if (user) {
          setUserData({
            id: user.id.toString(),
            email: user.email,
            senha: '', // Não carregamos a senha por segurança
            role: user.role,
          });
          return user;
        }
      }
    } catch (error) {
      console.log('Usuário não encontrado na API, será criado novo');
    }
    return null;
  };

  useEffect(() => {
    if (!podeGerenciarUsuarios) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/dashboard');
      return;
    }

    if (isEdit) {
      // Primeiro, tentar encontrar pelo ID numérico
      let colab = colaboradores.find((c) => c.id === parseInt(editId));
      
      // Se não encontrou por ID numérico, tentar por email
      if (!colab && editId.includes('@')) {
        colab = colaboradores.find((c) => c.email === editId);
      }
      
      if (colab) {
        // Colaborador encontrado, carregar dados normalmente
        setFormData({
          nome: colab.nome,
          email: colab.email,
          telefone: colab.telefone || '',
          nomeCompleto: colab.nomeCompleto || colab.nome,
          cpf: colab.cpf || '',
          rg: colab.rg || '',
          dataNascimento: colab.dataNascimento || undefined,
          endereco: colab.endereco || '',
          numero: colab.numero || '',
          complemento: colab.complemento || '',
          bairro: colab.bairro || '',
          cidade: colab.cidade || '',
          cep: colab.cep || '',
          cargoId: '', // TODO: migrar dados antigos se necessário
          setorId: '', // TODO: migrar dados antigos se necessário
          funcao: colab.funcao || '',
          empresa: colab.empresa || '',
          grupoId: colab.grupoId || '',
          grupoNome: colab.grupoNome || '',
          regime: colab.regime || undefined,
          contrato: colab.contrato || undefined,
          role: 'colaborador', // Será atualizado quando carregar dados do usuário
          metaHorasMensais: String(colab.metaHorasMensais || 176),
          status: colab.status,
          dispensaDocumentacao: !!colab.dispensaDocumentacao,
          chavePix: colab.chavePix || '',
          banco: colab.banco || '',
          codigoBanco: colab.codigoBanco || '',
          agencia: colab.agencia || '',
          conta: colab.conta || '',
          operacao: colab.operacao || '',
          tipoConta: colab.tipoConta || undefined,
          cnpj: colab.cnpj || '',
          razaoSocial: colab.razaoSocial || '',
          tipo: colab.tipo || '',
          enderecoEmpresa: colab.enderecoEmpresa || '',
          numeroEmpresa: colab.numeroEmpresa || '',
          complementoEmpresa: colab.complementoEmpresa || '',
          bairroEmpresa: colab.bairroEmpresa || '',
          cidadeEmpresa: colab.cidadeEmpresa || '',
          cepEmpresa: colab.cepEmpresa || '',
          obs: colab.obs || '',
          beneficiosSelecionados: [], // TODO: carregar benefícios vinculados
          salarioBase: '', // TODO: carregar salário
          dataAdmissao: '', // TODO: carregar data admissão
        });

        // Tentar carregar dados do usuário correspondente para obter o role correto
        loadUserData(colab.email);
      } else {
        // Colaborador não encontrado, tentar carregar dados do usuário
        const loadUserForEdit = async () => {
          try {
            const user = await loadUserData(editId); // Usar editId como possível email
            
            if (user) {
              // Usuário encontrado, criar registro básico de colaborador
              setFormData({
                nome: user.nome || '',
                email: user.email || '',
                telefone: '',
                nomeCompleto: user.nome || '',
                cpf: '',
                rg: '',
                dataNascimento: undefined,
                endereco: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                cep: '',
                cargoId: '',
                setorId: '',
                funcao: '',
                empresa: user.empresa || '',
                grupoId: user.grupoId || '',
                grupoNome: user.grupoNome || '',
                regime: undefined,
                contrato: undefined,
                role: user.role || 'colaborador',
                metaHorasMensais: '176',
                status: 'ativo',
                dispensaDocumentacao: false,
                chavePix: '',
                banco: '',
                codigoBanco: '',
                agencia: '',
                conta: '',
                operacao: '',
                tipoConta: undefined,
                cnpj: '',
                razaoSocial: '',
                tipo: '',
                enderecoEmpresa: '',
                numeroEmpresa: '',
                complementoEmpresa: '',
                bairroEmpresa: '',
                cidadeEmpresa: '',
                cepEmpresa: '',
                obs: '',
                beneficiosSelecionados: [],
                salarioBase: '',
                dataAdmissao: '',
              });
              
              // Mostrar aviso que alguns dados podem estar incompletos
              if (!toastShownRef.current) {
                toast('Colaborador encontrado, mas alguns dados podem estar incompletos. Complete as informações necessárias.', {
                  icon: '⚠️',
                  duration: 5000,
                });
                toastShownRef.current = true;
              }
            } else {
              // Nem colaborador nem usuário encontrado
              toast.error('Colaborador não encontrado');
              navigate('/colaboradores');
            }
          } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            toast.error('Erro ao carregar dados do colaborador');
            navigate('/colaboradores');
          }
        };
        
        loadUserForEdit();
      }
    }
  }, [editId, isEdit, navigate, podeGerenciarUsuarios]);

  // Carregar benefícios disponíveis
  useEffect(() => {
    carregarBeneficios();
  }, [carregarBeneficios]);

  // Auto-preencher Nome do Banco a partir do Código (BrasilAPI)
  useEffect(() => {
    let active = true;
    (async () => {
      const code = (formData.codigoBanco || '').replace(/\D/g, '');
      if (code && code.length >= 3) {
        const bank = await getBankByCode(code);
        if (active && bank?.name) {
          setFormData(prev => ({ ...prev, banco: bank.name }));
        }
      }
    })();
    return () => { active = false; };
  }, [formData.codigoBanco]);

  // Auto-preencher Razão Social a partir do CNPJ quando for PJ (BrasilAPI)
  useEffect(() => {
    let active = true;
    (async () => {
      if ((formData as any).contrato === 'PJ') {
        const digits = (formData.cnpj || '').replace(/\D/g, '');
        if (digits.length === 14) {
          const info = await fetchCNPJ(digits);
          if (active && info?.razao_social) {
            setFormData(prev => ({ ...prev, razaoSocial: info.razao_social }));
          }
        }
      }
    })();
    return () => { active = false; };
  }, [formData.cnpj, (formData as any).contrato]);

  // Sincronizar senha do userData com formData
  useEffect(() => {
    if (userData?.senha !== undefined) {
      setFormData(prev => ({ ...prev, senha: userData.senha }));
    }
  }, [userData?.senha]);

  // Sincronizar role do userData com formData
  useEffect(() => {
    if (userData?.role !== undefined) {
      setFormData(prev => ({ ...prev, role: userData.role }));
    }
  }, [userData?.role]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Quando contrato muda, regime também muda
      if (field === 'contrato') {
        newData.regime = value as 'CLT' | 'PJ';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    handleChange('cep', cleanCep);
  };

  const handleCepBlur = async () => {
    const cleanCep = formData.cep;
    if (!cleanCep || cleanCep.length !== 8) {
      setCepValido(null);
      return;
    }
    setCepLoading(true);
    try {
      const address = await fetchAddressByCEP(cleanCep);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          endereco: address.logradouro || '',
          bairro: address.bairro || '',
          cidade: address.localidade || '',
        }));
        setCepValido(true);
        toast.success('Endereço preenchido automaticamente!');
      } else {
        setCepValido(false);
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar endereço');
      setCepValido(false);
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepEmpresaChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    handleChange('cepEmpresa', cleanCep);
  };

  const handleCepEmpresaBlur = async () => {
    const cleanCep = formData.cepEmpresa;
    if (!cleanCep || cleanCep.length !== 8) {
      setCepEmpresaValido(null);
      return;
    }
    setCepLoading(true);
    try {
      const address = await fetchAddressByCEP(cleanCep);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          enderecoEmpresa: address.logradouro || '',
          bairroEmpresa: address.bairro || '',
          cidadeEmpresa: address.localidade || '',
        }));
        setCepEmpresaValido(true);
        toast.success('Endereço da empresa preenchido automaticamente!');
      } else {
        setCepEmpresaValido(false);
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar endereço');
      setCepEmpresaValido(false);
    } finally {
      setCepLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    // Email obrigatório apenas quando preenchido (para criação de usuário)
    if (formData.email.trim()) {
      if (!validateEmail(formData.email)) {
        newErrors.email = 'E-mail inválido';
      }
    }

    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    // CPF obrigatório para folha
    if (!formData.cpf || !formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // CNPJ obrigatório quando contrato for PJ
    if (formData.contrato === 'PJ') {
      if (!formData.cnpj || !formData.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório para contrato PJ';
      } else if (!isValidCNPJ(formData.cnpj)) {
        newErrors.cnpj = 'CNPJ inválido';
      }
    } else {
      // Validação opcional de CNPJ quando informado para contratos não-PJ
      if (formData.cnpj && formData.cnpj.trim()) {
        if (!isValidCNPJ(formData.cnpj)) {
          newErrors.cnpj = 'CNPJ inválido';
        }
      }
    }

    if (!formData.cargoId) {
      newErrors.cargoId = 'Cargo é obrigatório';
    }

    if (!formData.setorId) {
      newErrors.setorId = 'Setor é obrigatório';
    }

    if (!formData.salarioBase || parseFloat(formData.salarioBase) <= 0) {
      newErrors.salarioBase = 'Salário base é obrigatório e deve ser maior que zero';
    }

    if (!formData.dataAdmissao) {
      newErrors.dataAdmissao = 'Data de admissão é obrigatória';
    }

    const meta = parseInt(formData.metaHorasMensais, 10);
    if (formData.contrato !== 'PJ' && (isNaN(meta) || meta <= 0)) {
      newErrors.metaHorasMensais = 'Meta de horas inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      // Salvar usuário apenas se email estiver preenchido
      const shouldCreateUser = !!formData.email.trim();

      if (shouldCreateUser) {
        if (userData?.id) {
          // Atualizar usuário existente
          const userUpdateData: any = {
            nome: formData.nome,
            role: formData.role,
            ...(formData.role === 'cliente' && {
              empresa: formData.empresa,
              grupoId: formData.grupoId,
              grupoNome: formData.grupoNome,
            }),
          };
          if (formData.senha && formData.senha.trim()) {
            userUpdateData.senha = formData.senha;
          }
          await api.put(`/api/users/${userData.id}`, userUpdateData);
        } else {
          // Criar novo usuário
          const userCreateData: any = {
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha || 'Cfo123@@', // Senha padrão se não informada
            role: formData.role,
            ...(formData.role === 'cliente' && {
              empresa: formData.empresa,
              grupoId: formData.grupoId,
              grupoNome: formData.grupoNome,
            }),
          };
          const newUser = await api.post('/api/users', userCreateData);
          setUserData({
            id: newUser.id.toString(),
            email: newUser.email,
            senha: '',
            role: newUser.role,
          });
        }
      }

      if (isEdit) {
        // Atualizar colaborador existente
        const cargo = cargos.find(c => c.id === formData.cargoId)?.nome || '';
        const departamento = setores.find(s => s.id === formData.setorId)?.nome || '';
        atualizarColaborador(parseInt(editId), {
          nome: formData.nome,
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          rg: formData.rg,
          dataNascimento: formData.dataNascimento,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          cep: formData.cep,
          cargo,
          departamento,
          funcao: formData.funcao,
          empresa: formData.empresa,
          grupoId: formData.grupoId,
          grupoNome: formData.grupoNome,
          regime: formData.regime,
          contrato: formData.contrato,
          status: formData.status,
          metaHorasMensais: parseInt(formData.metaHorasMensais, 10),
          dispensaDocumentacao: !!formData.dispensaDocumentacao,
          chavePix: formData.chavePix,
          banco: formData.banco,
          codigoBanco: formData.codigoBanco,
          agencia: formData.agencia,
          conta: formData.conta,
          operacao: formData.operacao,
          tipoConta: formData.tipoConta,
          cnpj: formData.cnpj,
          razaoSocial: formData.razaoSocial,
          tipo: formData.tipo,
          enderecoEmpresa: formData.enderecoEmpresa,
          numeroEmpresa: formData.numeroEmpresa,
          complementoEmpresa: formData.complementoEmpresa,
          bairroEmpresa: formData.bairroEmpresa,
          cidadeEmpresa: formData.cidadeEmpresa,
          cepEmpresa: formData.cepEmpresa,
          obs: formData.obs
        });
        toast.success(shouldCreateUser ? 'Colaborador e usuário atualizados com sucesso!' : 'Colaborador atualizado com sucesso!');
      } else {
        // Criar novo colaborador
        const cargo = cargos.find(c => c.id === formData.cargoId)?.nome || '';
        const departamento = setores.find(s => s.id === formData.setorId)?.nome || '';

        // Calcular próximo id previsto (o store usa max id + 1)
        const nextId = colaboradores.length ? Math.max(...colaboradores.map(c => c.id)) + 1 : 1;

        adicionarColaborador({
          nome: formData.nome,
          nomeCompleto: formData.nomeCompleto || formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          rg: formData.rg,
          dataNascimento: formData.dataNascimento,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          cep: formData.cep,
          cargo,
          departamento,
          funcao: formData.funcao,
          empresa: formData.empresa,
          grupoId: formData.grupoId,
          grupoNome: formData.grupoNome,
          regime: formData.regime,
          contrato: formData.contrato,
          status: formData.status,
          metaHorasMensais: parseInt(formData.metaHorasMensais, 10),
          dispensaDocumentacao: !!formData.dispensaDocumentacao,
          chavePix: formData.chavePix,
          banco: formData.banco,
          codigoBanco: formData.codigoBanco,
          agencia: formData.agencia,
          conta: formData.conta,
          operacao: formData.operacao,
          tipoConta: formData.tipoConta,
          cnpj: formData.cnpj,
          razaoSocial: formData.razaoSocial,
          tipo: formData.tipo,
          enderecoEmpresa: formData.enderecoEmpresa,
          numeroEmpresa: formData.numeroEmpresa,
          complementoEmpresa: formData.complementoEmpresa,
          bairroEmpresa: formData.bairroEmpresa,
          cidadeEmpresa: formData.cidadeEmpresa,
          cepEmpresa: formData.cepEmpresa,
          obs: formData.obs,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.nome.split(' ')[0]}`,
        });

        // Criar pastas padrão e adicionar documentos enviados (se houver)
        try {
          documentosStore.criarPastasDeTemplate(nextId, cargo || 'default', String(user?.id || 'system'), user?.email || 'Sistema');
          const pastas = documentosStore.getPastasByColaborador(nextId);
          const targetPastaId = pastas && pastas.length ? pastas[0].id : undefined;

          if (uploadedFiles.length > 0) {
            uploadedFiles.forEach((file) => {
              const url = URL.createObjectURL(file);
              adicionarDocumentoStore({
                nome: file.name,
                tipo: 'Outro',
                tamanho: file.size,
                uploadPor: String(user?.id || 'system'),
                uploadPorNome: user?.email || 'Sistema',
                colaboradorId: nextId,
                colaboradorNome: formData.nome,
                pastaId: targetPastaId,
                url,
                mimetype: file.type,
                status: 'pendente'
              });
            });
          }
        } catch (err) {
          console.error('Erro ao criar pastas/adicionar documentos', err);
        }

        // TODO: Integrar Benefícios - Vincular benefícios selecionados ao colaborador
        // formData.beneficiosSelecionados.forEach(beneficioId => {
        //   useBeneficiosStore.getState().vincularBeneficioColaborador({
        //     beneficioId,
        //     colaboradorId: nextId,
        //     valorPersonalizado: undefined, // ou calcular baseado no benefício
        //   });
        // });

        // TODO: Integrar Folha de Pagamento - Criar entrada inicial na folha
        // const periodoAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
        // adicionarFolha({
        //   periodo: periodoAtual,
        //   colaboradorId: nextId,
        //   colaboradorNome: formData.nome,
        //   empresa: formData.empresa || 'Empresa',
        //   contrato: formData.contrato || 'CLT',
        //   valor: parseFloat(formData.salarioBase),
        //   status: 'rascunho',
        //   // outros campos...
        // });

        toast.success(shouldCreateUser ? 'Colaborador e usuário criados com sucesso!' : 'Colaborador criado com sucesso!');
      }

      navigate('/colaboradores');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar colaborador e usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/colaboradores')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {isEdit ? 'Atualize as informações do colaborador' : 'Cadastre um novo membro da equipe'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon size={20} className="text-[#10B981]" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address fields moved to dedicated Endereço section below */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Nome Completo: *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    placeholder="Ex: João Silva"
                    className={`w-full px-4 py-2 border ${errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  />
                  {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Telefone:
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formatPhone(formData.telefone)}
                      onChange={(e) => handleChange('telefone', e.target.value.replace(/\D/g, ''))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      className={`w-full pl-10 px-4 py-2 border ${errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CPF: *</label>
                  <input
                    type="text"
                    value={formData.cpf ? formatCPF(formData.cpf) : ''}
                    onChange={(e) => {
                      const cleanCpf = e.target.value.replace(/\D/g, '').slice(0, 11);
                      handleChange('cpf', cleanCpf);
                      setCpfValido(cleanCpf.length === 11 ? isValidCPF(cleanCpf) : null);
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-4 py-2 border ${errors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  />
                  {errors.cpf && <p className="text-sm text-red-600 mt-1">{errors.cpf}</p>}
                  {!errors.cpf && cpfValido === true && <p className="text-xs text-green-600 mt-1">✓ CPF válido</p>}
                  {!errors.cpf && cpfValido === false && <p className="text-xs text-red-600 mt-1">✗ CPF inválido</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">RG:</label>
                  <input
                    type="text"
                    value={formData.rg || ''}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    placeholder="00.000.000-0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Data de Nascimento:</label>
                  <input
                    type="date"
                    value={formData.dataNascimento || ''}
                    onChange={(e) => handleChange('dataNascimento', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-[#10B981]" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    CEP: *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cep ? formatCEP(formData.cep) : ''}
                      onChange={(e) => handleCepChange(e.target.value)}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    />
                    {cepLoading && (
                      <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 animate-spin" size={18} />
                    )}
                  </div>
                  {!cepLoading && cepValido === true && <p className="text-xs text-green-600 mt-1">✓ CEP válido</p>}
                  {!cepLoading && cepValido === false && <p className="text-xs text-red-600 mt-1">✗ CEP não encontrado</p>}
                  {!cepValido && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Digite o CEP para preencher endereço automaticamente (ViaCEP/BrasilAPI)</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Rua, Av, etc:
                  </label>
                  <input
                    type="text"
                    value={formData.endereco || ''}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Número:
                  </label>
                  <input
                    type="text"
                    value={formData.numero || ''}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Complemento:
                  </label>
                  <input
                    type="text"
                    value={formData.complemento || ''}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Bairro:
                  </label>
                  <input
                    type="text"
                    value={formData.bairro || ''}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Cidade:
                  </label>
                  <input
                    type="text"
                    value={formData.cidade || ''}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    placeholder="Cidade"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[#3B82F6]" />
                Dados Profissionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Cargo:
                  </label>
                  <select
                    value={formData.cargoId}
                    onChange={(e) => handleChange('cargoId', e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.cargoId ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  >
                    <option value="">Selecione um cargo...</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                      </option>
                    ))}
                  </select>
                  {errors.cargoId && <p className="text-sm text-red-600 mt-1">{errors.cargoId}</p>}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Gerencie os cargos em Configurações → Cargos
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Status:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="ferias">Férias</option>
                    <option value="em_contratacao">Em Contratação</option>
                    <option value="afastado">Afastado</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Função:</label>
                  <input
                    type="text"
                    value={(formData as any).funcao || ''}
                    onChange={(e) => handleChange('funcao', e.target.value)}
                    placeholder="Ex: Analista, Gerente..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Empresa:</label>
                  <input
                    type="text"
                    value={(formData as any).empresa || ''}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    placeholder="Empresa"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Grupo:</label>
                  <input
                    type="text"
                    value={(formData as any).grupoNome || ''}
                    onChange={(e) => handleChange('grupoNome', e.target.value)}
                    placeholder="Grupo"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                {/* Regime field removed as requested */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo de Contrato: *</label>
                  <select
                    value={(formData as any).contrato || ''}
                    onChange={(e) => handleChange('contrato', e.target.value as 'CLT' | 'PJ')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Setor:
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <select
                      value={formData.setorId}
                      onChange={(e) => handleChange('setorId', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        errors.setorId ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                      } rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    >
                      <option value="">Selecione um setor...</option>
                      {setores.map((setor) => (
                        <option key={setor.id} value={setor.id}>
                          {setor.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.setorId && <p className="text-sm text-red-600 mt-1">{errors.setorId}</p>}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Gerencie os setores em Configurações → Setores
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Meta de Horas Mensais:
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="number"
                      value={formData.metaHorasMensais}
                      onChange={(e) => handleChange('metaHorasMensais', e.target.value)}
                      placeholder="176"
                      min="1"
                      className={`w-full pl-10 px-4 py-2 border ${errors.metaHorasMensais ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.metaHorasMensais && <p className="text-sm text-red-600 mt-1">{errors.metaHorasMensais}</p>}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Horas de trabalho esperadas por mês</p>
                </div>
              </div>
            </div>

            {/* Dados Bancários e PJ */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#8B5CF6]" />
                Dados Bancários
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Chave PIX:</label>
                  <input
                    type="text"
                    value={formData.chavePix || ''}
                    onChange={(e) => handleChange('chavePix', e.target.value)}
                    placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Banco:</label>
                  <input
                    type="text"
                    value={formData.banco || ''}
                    onChange={(e) => handleChange('banco', e.target.value)}
                    placeholder="Nome do banco"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Código do Banco:</label>
                  <input
                    type="text"
                    value={formData.codigoBanco || ''}
                    onChange={(e) => handleChange('codigoBanco', e.target.value)}
                    placeholder="001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Agência:</label>
                  <input
                    type="text"
                    value={formData.agencia || ''}
                    onChange={(e) => handleChange('agencia', e.target.value)}
                    placeholder="0000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Conta:</label>
                  <input
                    type="text"
                    value={formData.conta || ''}
                    onChange={(e) => handleChange('conta', e.target.value)}
                    placeholder="00000-0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Operação:</label>
                  <input
                    type="text"
                    value={formData.operacao || ''}
                    onChange={(e) => handleChange('operacao', e.target.value)}
                    placeholder="Operação"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo de Conta:</label>
                  <select
                    value={formData.tipoConta || ''}
                    onChange={(e) => handleChange('tipoConta', e.target.value as 'corrente' | 'poupanca')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="corrente">Corrente</option>
                    <option value="poupanca">Poupança</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Salário Base: *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400">R$</span>
                    <input
                      type="text"
                      value={formData.salarioBase}
                      onChange={(e) => handleChange('salarioBase', e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
                      placeholder="0.00"
                      className={`w-full pl-8 px-4 py-2 border ${errors.salarioBase ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.salarioBase && <p className="text-sm text-red-600 mt-1">{errors.salarioBase}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Data de Admissão: *
                  </label>
                  <input
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.dataAdmissao ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  />
                  {errors.dataAdmissao && <p className="text-sm text-red-600 mt-1">{errors.dataAdmissao}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CNPJ (se PJ):</label>
                  <input
                    type="text"
                    value={formData.cnpj ? formatCNPJ(formData.cnpj) : ''}
                    onChange={(e) => {
                      const cleanCnpj = e.target.value.replace(/\D/g, '').slice(0, 14);
                      handleChange('cnpj', cleanCnpj);
                      setCnpjValido(cleanCnpj.length === 14 ? isValidCNPJ(cleanCnpj) : null);
                    }}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                  {cnpjValido === true && <p className="text-xs text-green-600 mt-1">✓ CNPJ válido</p>}
                  {cnpjValido === false && <p className="text-xs text-red-600 mt-1">✗ CNPJ inválido</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Razão Social (se PJ):</label>
                  <input
                    type="text"
                    value={formData.razaoSocial || ''}
                    onChange={(e) => handleChange('razaoSocial', e.target.value)}
                    placeholder="Razão Social"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo (se PJ):</label>
                  <select
                    value={formData.tipo || ''}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Associação">Associação</option>
                    <option value="Cooperativa">Cooperativa</option>
                    <option value="EI">EI - Empresário Individual</option>
                    <option value="EIRELI">EIRELI - Empresa Individual de Responsabilidade Limitada</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                    <option value="Fundação">Fundação</option>
                    <option value="LTDA">LTDA - Sociedade Limitada</option>
                    <option value="MEI">MEI - Microempreendedor Individual</option>
                    <option value="OS">OS - Organização Social</option>
                    <option value="OSCIP">OSCIP - Organização da Sociedade Civil de Interesse Público</option>
                    <option value="S.A.">S.A. - Sociedade Anônima</option>
                    <option value="S.S.">S.S. - Sociedade Simples</option>
                  </select>
                </div>
              </div>

              {/* Endereço da Empresa PJ */}
              {(formData as any).contrato === 'PJ' && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-[#8B5CF6]" />
                    Endereço da Empresa PJ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">CEP Empresa:</label>
                      <input
                        type="text"
                        value={formData.cepEmpresa ? formatCEP(formData.cepEmpresa) : ''}
                        onChange={(e) => handleCepEmpresaChange(e.target.value)}
                        onBlur={handleCepEmpresaBlur}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                      {cepEmpresaValido === true && <p className="text-xs text-green-600 mt-1">✓ CEP válido</p>}
                      {cepEmpresaValido === false && <p className="text-xs text-red-600 mt-1">✗ CEP não encontrado</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Endereço Empresa:</label>
                      <input
                        type="text"
                        value={formData.enderecoEmpresa || ''}
                        onChange={(e) => handleChange('enderecoEmpresa', e.target.value)}
                        placeholder="Rua, Avenida..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Número Empresa:</label>
                      <input
                        type="text"
                        value={formData.numeroEmpresa || ''}
                        onChange={(e) => handleChange('numeroEmpresa', e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Complemento Empresa:</label>
                      <input
                        type="text"
                        value={formData.complementoEmpresa || ''}
                        onChange={(e) => handleChange('complementoEmpresa', e.target.value)}
                        placeholder="Sala, Andar..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Bairro Empresa:</label>
                      <input
                        type="text"
                        value={formData.bairroEmpresa || ''}
                        onChange={(e) => handleChange('bairroEmpresa', e.target.value)}
                        placeholder="Bairro"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Cidade Empresa:</label>
                      <input
                        type="text"
                        value={formData.cidadeEmpresa || ''}
                        onChange={(e) => handleChange('cidadeEmpresa', e.target.value)}
                        placeholder="Cidade"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Observações:</label>
                  <textarea
                    value={formData.obs || ''}
                    onChange={(e) => handleChange('obs', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Gift size={20} className="text-[#F59E0B]" />
                Benefícios
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Selecione os benefícios que este colaborador terá acesso:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {beneficios.filter(b => b.ativo).map((beneficio) => (
                    <div key={beneficio.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <input
                        type="checkbox"
                        id={`beneficio-${beneficio.id}`}
                        checked={formData.beneficiosSelecionados.includes(beneficio.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            beneficiosSelecionados: checked
                              ? [...prev.beneficiosSelecionados, beneficio.id]
                              : prev.beneficiosSelecionados.filter(id => id !== beneficio.id)
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-emerald-400"
                      />
                      <label htmlFor={`beneficio-${beneficio.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">{beneficio.nome}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{beneficio.descricao}</div>
                      </label>
                    </div>
                  ))}
                </div>
                {beneficios.filter(b => b.ativo).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                    Nenhum benefício ativo disponível. Configure benefícios na página de Benefícios.
                  </p>
                )}
              </div>
            </div>

            {/* Documentos e Onboarding */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon size={20} className="text-[#10B981]" />
                Documentos e Onboarding
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    id="dispensa"
                    type="checkbox"
                    checked={!!formData.dispensaDocumentacao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dispensaDocumentacao: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-emerald-400"
                  />
                  <label htmlFor="dispensa" className="text-sm">Dispensar documentação (ativar colaborador sem documentos)</label>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Envie documentos iniciais (opcional):</p>
                  <Dropzone onFiles={(files) => {
                    const arr = Array.from(files as FileList);
                    setUploadedFiles((prev) => [...prev, ...arr]);
                  }} />

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 p-2 rounded-md">
                          <div>
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{Math.round(f.size / 1024)} KB</p>
                          </div>
                          <div>
                            <Button variant="outline" onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}>
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Permissões e Acesso */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#8B5CF6]" />
                Permissões e Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    E-mail de Acesso:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="usuario@empresa.com"
                      className={`w-full pl-10 px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    E-mail usado para login no sistema.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Senha: {isEdit ? '' : ''}
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={formData.senha || ''}
                    onChange={(e) => handleChange('senha', e.target.value)}
                    placeholder={isEdit ? 'Nova senha (opcional)' : 'Digite a senha'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                  {!isEdit && !formData.senha && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Se não informar, será usada a senha padrão do sistema.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                    Tipo de Acesso:
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    disabled={user?.role !== 'admin'}
                  >
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="gestor">Gestor</option>
                  </select>
                  {user?.role !== 'admin' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Apenas administradores podem alterar o tipo de acesso
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center gap-3">
              <Button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save size={18} />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/colaboradores')}>Cancelar</Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}




