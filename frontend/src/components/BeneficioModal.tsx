import { useState, useEffect } from 'react';
import { Beneficio, TipoBeneficio, FornecedorBeneficio } from '../types';
import { useBeneficiosStore } from '../store/beneficiosStore';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface BeneficioModalProps {
  open: boolean;
  onClose: () => void;
  beneficio?: Beneficio | null;
}

export default function BeneficioModal({ open, onClose, beneficio }: BeneficioModalProps) {
  const { adicionarBeneficio, editarBeneficio } = useBeneficiosStore();
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'alimentacao' as TipoBeneficio,
    descricao: '',
    fornecedor: 'manual' as FornecedorBeneficio,
    valorEmpresa: 0,
    valorColaborador: 0,
    taxaAdministracao: 0,
    obrigatorio: false,
    aplicavelTodos: true,
    cargosElegiveis: [] as string[],
    setoresElegiveis: [] as string[],
    regimeElegivel: ['CLT', 'PJ'] as ('CLT' | 'PJ')[],
    ativo: true,
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    sincronizacaoAutomatica: false,
    apiKey: '',
    apiSecret: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (beneficio) {
      setFormData({
        nome: beneficio.nome,
        tipo: beneficio.tipo,
        descricao: beneficio.descricao || '',
        fornecedor: beneficio.fornecedor,
        valorEmpresa: beneficio.valorEmpresa,
        valorColaborador: beneficio.valorColaborador,
        taxaAdministracao: beneficio.taxaAdministracao || 0,
        obrigatorio: beneficio.obrigatorio,
        aplicavelTodos: beneficio.aplicavelTodos,
        cargosElegiveis: beneficio.cargosElegiveis || [],
        setoresElegiveis: beneficio.setoresElegiveis || [],
        regimeElegivel: beneficio.regimeElegivel || ['CLT', 'PJ'],
        ativo: beneficio.ativo,
        dataInicio: beneficio.dataInicio,
        dataFim: beneficio.dataFim || '',
        sincronizacaoAutomatica: beneficio.integracaoConfig?.sincronizacaoAutomatica || false,
        apiKey: '',
        apiSecret: ''
      });
    } else {
      resetForm();
    }
  }, [beneficio, open]);

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'alimentacao',
      descricao: '',
      fornecedor: 'manual',
      valorEmpresa: 0,
      valorColaborador: 0,
      taxaAdministracao: 0,
      obrigatorio: false,
      aplicavelTodos: true,
      cargosElegiveis: [],
      setoresElegiveis: [],
      regimeElegivel: ['CLT', 'PJ'],
      ativo: true,
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      sincronizacaoAutomatica: false,
      apiKey: '',
      apiSecret: ''
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.valorEmpresa < 0) {
      newErrors.valorEmpresa = 'Valor deve ser positivo';
    }

    if (formData.valorColaborador < 0) {
      newErrors.valorColaborador = 'Valor deve ser positivo';
    }

    if (!formData.aplicavelTodos && formData.cargosElegiveis.length === 0 && formData.setoresElegiveis.length === 0) {
      newErrors.elegibilidade = 'Selecione ao menos um cargo ou setor se não aplicável a todos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const valorTotal = formData.valorEmpresa + formData.valorColaborador;

    const dadosBeneficio = {
      nome: formData.nome,
      tipo: formData.tipo,
      descricao: formData.descricao || undefined,
      fornecedor: formData.fornecedor,
      valorEmpresa: formData.valorEmpresa,
      valorColaborador: formData.valorColaborador,
      valorTotal,
      taxaAdministracao: formData.taxaAdministracao || undefined,
      obrigatorio: formData.obrigatorio,
      aplicavelTodos: formData.aplicavelTodos,
      cargosElegiveis: formData.aplicavelTodos ? undefined : formData.cargosElegiveis,
      setoresElegiveis: formData.aplicavelTodos ? undefined : formData.setoresElegiveis,
      regimeElegivel: formData.regimeElegivel,
      ativo: formData.ativo,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || undefined,
      integracaoConfig: {
        sincronizacaoAutomatica: formData.sincronizacaoAutomatica,
        ultimaSincronizacao: beneficio?.integracaoConfig?.ultimaSincronizacao
      }
    };

    if (beneficio) {
      editarBeneficio(beneficio.id, dadosBeneficio);
    } else {
      adicionarBeneficio(dadosBeneficio);
    }

    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const tiposBeneficio: { value: TipoBeneficio; label: string }[] = [
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'refeicao', label: 'Refeição' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'saude', label: 'Saúde' },
    { value: 'odontologico', label: 'Odontológico' },
    { value: 'academia', label: 'Academia' },
    { value: 'seguro_vida', label: 'Seguro de Vida' },
    { value: 'vale_cultura', label: 'Vale Cultura' },
    { value: 'auxilio_creche', label: 'Auxílio Creche' },
    { value: 'outros', label: 'Outros' }
  ];

  const fornecedores: { value: FornecedorBeneficio; label: string }[] = [
    { value: 'alelo', label: 'Alelo' },
    { value: 'sodexo', label: 'Sodexo' },
    { value: 'vr', label: 'VR Benefícios' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'flash', label: 'Flash' },
    { value: 'ben', label: 'Ben Benefícios' },
    { value: 'caju', label: 'Caju' },
    { value: 'swile', label: 'Swile' },
    { value: 'ifood', label: 'iFood Benefícios' },
    { value: 'pluxee', label: 'Pluxee' },
    { value: 'manual', label: 'Manual (sem integração)' }
  ];

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={beneficio ? 'Editar Benefício' : 'Novo Benefício'}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome do Benefício <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Vale Alimentação"
                />
                {errors.nome && (
                  <p className="text-xs text-red-500">{errors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tipo" className="text-sm font-medium">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoBeneficio })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {tiposBeneficio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do benefício..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Fornecedor e Integração */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Fornecedor e Integração</h3>
            
            <div className="space-y-2">
              <label htmlFor="fornecedor" className="text-sm font-medium">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <select
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value as FornecedorBeneficio })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {fornecedores.map((forn) => (
                  <option key={forn.value} value={forn.value}>
                    {forn.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.fornecedor !== 'manual' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label htmlFor="sincronizacao" className="text-sm font-medium">
                    Sincronização Automática
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Sincronizar automaticamente com a plataforma do fornecedor
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="sincronizacao"
                  checked={formData.sincronizacaoAutomatica}
                  onChange={(e) =>
                    setFormData({ ...formData, sincronizacaoAutomatica: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
            )}
          </div>

          {/* Valores */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Valores</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="valorEmpresa" className="text-sm font-medium">
                  Valor Empresa (R$)
                </label>
                <Input
                  id="valorEmpresa"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorEmpresa}
                  onChange={(e) =>
                    setFormData({ ...formData, valorEmpresa: parseFloat(e.target.value) || 0 })
                  }
                />
                {errors.valorEmpresa && (
                  <p className="text-xs text-red-500">{errors.valorEmpresa}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="valorColaborador" className="text-sm font-medium">
                  Valor Colaborador (R$)
                </label>
                <Input
                  id="valorColaborador"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorColaborador}
                  onChange={(e) =>
                    setFormData({ ...formData, valorColaborador: parseFloat(e.target.value) || 0 })
                  }
                />
                {errors.valorColaborador && (
                  <p className="text-xs text-red-500">{errors.valorColaborador}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="taxaAdministracao" className="text-sm font-medium">
                  Taxa Admin (%)
                </label>
                <Input
                  id="taxaAdministracao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.taxaAdministracao}
                  onChange={(e) =>
                    setFormData({ ...formData, taxaAdministracao: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Valor Total:</span>{' '}
                <span className="text-lg font-bold">
                  R$ {(formData.valorEmpresa + formData.valorColaborador).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Elegibilidade */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Elegibilidade</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label htmlFor="obrigatorio" className="text-sm font-medium">
                    Benefício Obrigatório
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Todos os colaboradores elegíveis devem ter este benefício
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="obrigatorio"
                  checked={formData.obrigatorio}
                  onChange={(e) => setFormData({ ...formData, obrigatorio: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label htmlFor="aplicavelTodos" className="text-sm font-medium">
                    Aplicável a Todos
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Todos os colaboradores podem aderir a este benefício
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="aplicavelTodos"
                  checked={formData.aplicavelTodos}
                  onChange={(e) => setFormData({ ...formData, aplicavelTodos: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Regime de Contratação</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.regimeElegivel.includes('CLT')}
                      onChange={(e) => {
                        const newRegime = e.target.checked
                          ? [...formData.regimeElegivel, 'CLT' as const]
                          : formData.regimeElegivel.filter((r) => r !== 'CLT');
                        setFormData({ ...formData, regimeElegivel: newRegime });
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">CLT</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.regimeElegivel.includes('PJ')}
                      onChange={(e) => {
                        const newRegime = e.target.checked
                          ? [...formData.regimeElegivel, 'PJ' as const]
                          : formData.regimeElegivel.filter((r) => r !== 'PJ');
                        setFormData({ ...formData, regimeElegivel: newRegime });
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">PJ</span>
                  </label>
                </div>
              </div>

              {errors.elegibilidade && (
                <p className="text-xs text-red-500">{errors.elegibilidade}</p>
              )}
            </div>
          </div>

          {/* Datas e Status */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Período e Status</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="dataInicio" className="text-sm font-medium">
                  Data Início <span className="text-red-500">*</span>
                </label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataFim" className="text-sm font-medium">
                  Data Fim (Opcional)
                </label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label htmlFor="ativo" className="text-sm font-medium">
                  Benefício Ativo
                </label>
                <p className="text-xs text-muted-foreground">
                  Benefícios inativos não podem receber novas adesões
                </p>
              </div>
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {beneficio ? 'Salvar Alterações' : 'Criar Benefício'}
            </Button>
          </div>
        </form>
      </Modal>
  );
}
