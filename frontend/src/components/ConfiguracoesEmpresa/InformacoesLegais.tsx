import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { isValidCNPJ, formatCNPJ, isValidCPF, formatCPF, fetchAddressByCEP } from '../../utils/validation';
import { useEmpresaStore } from '../../store/empresaStore';

interface InformacoesLegaisProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  isLoading: boolean;
}

const ESTADOS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const CLASSIFICACOES = [
  { value: 'ASSOCIACAO', label: 'Associação' },
  { value: 'COOPERATIVA', label: 'Cooperativa' },
  { value: 'EIRELI', label: 'EIRELI - Empresa Individual de Responsabilidade Limitada' },
  { value: 'EPP', label: 'EPP - Empresa de Pequeno Porte' },
  { value: 'FUNDACAO', label: 'Fundação' },
  { value: 'GOVERNO', label: 'Governo' },
  { value: 'LTDA', label: 'LTDA - Sociedade Limitada' },
  { value: 'LTDA_MEI', label: 'LTDA-MEI' },
  { value: 'ME', label: 'ME - Microempresa' },
  { value: 'MEI', label: 'MEI - Microempreendedor Individual' },
  { value: 'ONG', label: 'ONG - Organização Não Governamental' },
  { value: 'OUTRO', label: 'Outro' },
  { value: 'PF', label: 'PF - Pessoa Física' },
  { value: 'PJ', label: 'PJ - Pessoa Jurídica' },
  { value: 'SA', label: 'SA - Sociedade Anônima' },
];

const REGIMES_TRIBUTARIOS = [
  { value: 'imunidade', label: 'Imunidade Tributária' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'lucro_real_mensal', label: 'Lucro Real - Mensal' },
  { value: 'lucro_real_trimestral', label: 'Lucro Real - Trimestral' },
  { value: 'nao_obrigado', label: 'Não Obrigado' },
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'simples_nacional_mei', label: 'Simples Nacional - MEI' },
];

const PORTES_EMPRESA = [
  { value: 'micro', label: 'Microempresa' },
  { value: 'pequena', label: 'Pequena Empresa' },
  { value: 'media', label: 'Média Empresa' },
  { value: 'grande', label: 'Grande Empresa' },
];

const SETORES = [
  { value: 'agropecuaria', label: 'Agropecuária' },
  { value: 'alimentos', label: 'Alimentos e Bebidas' },
  { value: 'automovel', label: 'Automotivo' },
  { value: 'beleza', label: 'Beleza e Estética' },
  { value: 'atacado', label: 'Comércio Atacadista' },
  { value: 'consultoria', label: 'Consultoria e Auditoria' },
  { value: 'construcao', label: 'Construção e Engenharia' },
  { value: 'contabilidade', label: 'Contabilidade' },
  { value: 'educacao', label: 'Educação' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'energia', label: 'Energia e Utilidades' },
  { value: 'entretenimento', label: 'Entretenimento e Mídia' },
  { value: 'fitness', label: 'Esportes e Fitness' },
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'impressao', label: 'Impressão e Gráfica' },
  { value: 'logistica', label: 'Logística e Transporte' },
  { value: 'manufatura', label: 'Manufatura e Indústria' },
  { value: 'moda', label: 'Moda e Confecção' },
  { value: 'outro', label: 'Outro' },
  { value: 'pesquisa', label: 'Pesquisa e Desenvolvimento' },
  { value: 'publicidade', label: 'Publicidade e Marketing' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'saude', label: 'Saúde e Farmacêutica' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'servicos', label: 'Serviços Diversos' },
  { value: 'financeiro', label: 'Serviços Financeiros' },
  { value: 'tecnologia', label: 'Tecnologia e Software' },
  { value: 'telecomunicacoes', label: 'Telecomunicações' },
  { value: 'turismo', label: 'Turismo e Hospedagem' },
  { value: 'varejo', label: 'Varejo' },
];

const CARGOS_RESPONSAVEL = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'contador_responsavel', label: 'Contador Responsável' },
  { value: 'diretor_executivo', label: 'Diretor Executivo' },
  { value: 'diretor_financeiro', label: 'Diretor Financeiro' },
  { value: 'diretor_geral', label: 'Diretor Geral' },
  { value: 'diretor_operacional', label: 'Diretor Operacional' },
  { value: 'gerente_administrativo', label: 'Gerente Administrativo' },
  { value: 'gerente_financeiro', label: 'Gerente Financeiro' },
  { value: 'gerente_geral', label: 'Gerente Geral' },
  { value: 'presidente', label: 'Presidente' },
  { value: 'procurador', label: 'Procurador' },
  { value: 'representante_legal', label: 'Representante Legal' },
  { value: 'socio_administrador', label: 'Sócio-Administrador' },
  { value: 'socio_gerente', label: 'Sócio-Gerente' },
  { value: 'socio_proprietario', label: 'Sócio-Proprietário' },
  { value: 'vice_presidente', label: 'Vice-Presidente' },
];

// Validador CNPJ
// Usando isValidCNPJ importado de utils/validation.ts

// Validador CPF
// Usando isValidCPF importado de utils/validation.ts

export function InformacoesLegais({
  data,
  onChange,
  isLoading,
}: InformacoesLegaisProps) {
  const [cnpjError, setCnpjError] = useState<string>('');
  const [cpfError, setCpfError] = useState<string>('');
  const [loadingCep, setLoadingCep] = useState(false);
  const { setNomeEmpresa } = useEmpresaStore();

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    onChange({ cnpj: formatted });
    setCnpjError('');
    
    // Apenas validar se estiver completo
    if (formatted.replace(/\D/g, '').length === 14 && !isValidCNPJ(formatted)) {
      setCnpjError('CNPJ inválido');
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    onChange({ cpf_responsavel: formatted });
    setCpfError('');

    // Apenas validar se estiver completo
    if (formatted.replace(/\D/g, '').length === 11 && !isValidCPF(formatted)) {
      setCpfError('CPF inválido');
    }
  };

  const handleSearchCEP = async () => {
    const cep = data.cep?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      toast.error('CEP deve conter 8 dígitos');
      return;
    }

    setLoadingCep(true);
    try {
      const result = await fetchAddressByCEP(cep);

      if (!result) {
        toast.error('CEP não encontrado');
        return;
      }

      onChange({
        endereco: result.logradouro,
        bairro: result.bairro,
        cidade: result.localidade,
        estado: result.uf,
      });

      toast.success('Endereço preenchido com sucesso');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
      console.error(error);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seção: Informações Básicas */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Informações Básicas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Empresa:
            </label>
            <Input
              type="text"
              value={data.nome_empresa || ''}
              onChange={(e) => {
                const novoNome = e.target.value;
                onChange({ nome_empresa: novoNome });
                setNomeEmpresa(novoNome);
              }}
              disabled={isLoading}
              placeholder="Razão social"
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Fantasia:
            </label>
            <Input
              type="text"
              value={data.nome_fantasia || ''}
              onChange={(e) => onChange({ nome_fantasia: e.target.value })}
              disabled={isLoading}
              placeholder="Nome comercial (opcional)"
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail Fiscal:
            </label>
            <Input
              type="email"
              value={data.email_fiscal || ''}
              onChange={(e) => onChange({ email_fiscal: e.target.value })}
              disabled={isLoading}
              placeholder="fiscal@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefone Principal:
            </label>
            <Input
              type="tel"
              value={data.telefone_principal || ''}
              onChange={(e) => onChange({ telefone_principal: e.target.value })}
              disabled={isLoading}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website:
            </label>
            <Input
              type="url"
              value={data.website || ''}
              onChange={(e) => onChange({ website: e.target.value })}
              disabled={isLoading}
              placeholder="https://www.exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Setor:
            </label>
            <Select
              options={SETORES}
              value={data.setor || 'outro'}
              onChange={(value) => onChange({ setor: value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Porte da Empresa:
            </label>
            <Select
              options={PORTES_EMPRESA}
              value={data.porte_empresa || 'micro'}
              onChange={(value) => onChange({ porte_empresa: value })}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Seção: Informações Fiscais */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Informações Fiscais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CNPJ da Empresa:
            </label>
            <Input
              type="text"
              value={data.cnpj || ''}
              onChange={(e) => handleCNPJChange(e.target.value)}
              disabled={isLoading}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            {cnpjError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{cnpjError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inscrição Estadual (IE):
            </label>
            <Input
              type="text"
              value={data.inscricao_estadual || ''}
              onChange={(e) => onChange({ inscricao_estadual: e.target.value })}
              disabled={isLoading}
              placeholder="00.000.000.000.000"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inscrição Municipal (IM):
            </label>
            <Input
              type="text"
              value={data.inscricao_municipal || ''}
              onChange={(e) => onChange({ inscricao_municipal: e.target.value })}
              disabled={isLoading}
              placeholder="000.000.000.000"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Classificação:
            </label>
            <Select
              options={CLASSIFICACOES}
              value={data.classificacao || 'LTDA'}
              onChange={(value) => onChange({ classificacao: value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regime Tributário:
            </label>
            <Select
              options={REGIMES_TRIBUTARIOS}
              value={data.regime_tributario || 'simples'}
              onChange={(value) => onChange({ regime_tributario: value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Natureza Jurídica (Código):
            </label>
            <Input
              type="text"
              value={data.natureza_juridica || ''}
              onChange={(e) => onChange({ natureza_juridica: e.target.value })}
              disabled={isLoading}
              placeholder="2062"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Constituição:
            </label>
            <Input
              type="date"
              value={data.data_constituicao || ''}
              onChange={(e) => onChange({ data_constituicao: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Abertura:
            </label>
            <Input
              type="date"
              value={data.data_abertura || ''}
              onChange={(e) => onChange({ data_abertura: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Seção: Responsável Legal */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Responsável Legal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CPF do Responsável:
            </label>
            <Input
              type="text"
              value={data.cpf_responsavel || ''}
              onChange={(e) => handleCPFChange(e.target.value)}
              disabled={isLoading}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {cpfError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{cpfError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Responsável:
            </label>
            <Input
              type="text"
              value={data.nome_responsavel || ''}
              onChange={(e) => onChange({ nome_responsavel: e.target.value })}
              disabled={isLoading}
              placeholder="Nome completo"
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo do Responsável:
            </label>
            <Select
              options={CARGOS_RESPONSAVEL}
              value={data.cargo_responsavel || 'socio'}
              onChange={(value) => onChange({ cargo_responsavel: value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail do Responsável:
            </label>
            <Input
              type="email"
              value={data.email_responsavel || ''}
              onChange={(e) => onChange({ email_responsavel: e.target.value })}
              disabled={isLoading}
              placeholder="responsavel@empresa.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefone do Responsável:
            </label>
            <Input
              type="tel"
              value={data.telefone_responsavel || ''}
              onChange={(e) => onChange({ telefone_responsavel: e.target.value })}
              disabled={isLoading}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Seção de Endereço */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CEP:
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={data.cep || ''}
                onChange={(e) => onChange({ cep: e.target.value })}
                disabled={isLoading || loadingCep}
                placeholder="00000-000"
                maxLength={9}
              />
              <Button
                onClick={handleSearchCEP}
                disabled={isLoading || loadingCep}
                variant="secondary"
              >
                {loadingCep ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endereço:
            </label>
            <Input
              type="text"
              value={data.endereco || ''}
              onChange={(e) => onChange({ endereco: e.target.value })}
              disabled={isLoading}
              placeholder="Rua, avenida, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bairro:
            </label>
            <Input
              type="text"
              value={data.bairro || ''}
              onChange={(e) => onChange({ bairro: e.target.value })}
              disabled={isLoading}
              placeholder="Bairro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cidade:
            </label>
            <Input
              type="text"
              value={data.cidade || ''}
              onChange={(e) => onChange({ cidade: e.target.value })}
              disabled={isLoading}
              placeholder="Cidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado:
            </label>
            <Select
              options={ESTADOS}
              value={data.estado || 'SP'}
              onChange={(value) => onChange({ estado: value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número:
            </label>
            <Input
              type="text"
              value={data.numero_endereco || ''}
              onChange={(e) => onChange({ numero_endereco: e.target.value })}
              disabled={isLoading}
              placeholder="Nº"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Complemento:
            </label>
            <Input
              type="text"
              value={data.complemento_endereco || ''}
              onChange={(e) => onChange({ complemento_endereco: e.target.value })}
              disabled={isLoading}
              placeholder="Apto, sala, etc (opcional)"
            />
          </div>
        </div>
      </div>

      {/* Card informativo */}
      <div className="bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>• Importante:</strong> Mantenha estes dados sempre atualizados para fins legais, fiscais e de conformidade regulatória.
        </p>
      </div>
    </div>
  );
}

export default InformacoesLegais;
