import { useState } from 'react';
import { Avatar } from './Avatar';
import { Save, Calendar as CalendarIcon } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useBeneficiosStore } from '../store/beneficiosStore';


interface NovaFolhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: any) => void;
  periodo: string;
}

export function NovaFolhaModal({ isOpen, onClose, onSave, periodo }: NovaFolhaModalProps) {
  const colaboradores = useColaboradoresStore((state: any) => state.colaboradores);
  const colaboradoresAtivos = colaboradores.filter((c: any) => c.status === 'ativo');
  const { getCustoTotalColaborador } = useBeneficiosStore();

  const [formData, setFormData] = useState({
    colaboradorId: '',
    periodo: periodo,
    valor: 0,
    adicional: 0,
    reembolso: 0,
    desconto: 0,
    situacao: 'pendente' as 'pendente' | 'agendado' | 'pago' | 'cancelado',
    dataPagamento: '',
    // Percentual por operação handled in `empresas` state
    // Nota fiscal (para PJ)
    notaNumero: '',
    notaStatus: 'aguardando' as 'aguardando' | 'recebida' | 'pendente',
    notaPagamento: 'pendente' as 'pendente' | 'agendado' | 'pago',
    notaData: '',
    notaObs: '',
  });

  const [empresas, setEmpresas] = useState<Array<{ name: string; percent: number }>>([]);

  const colaboradorSelecionado = colaboradoresAtivos.find((c: any) => String(c.id) === formData.colaboradorId);
  const isPJ = colaboradorSelecionado?.contrato === 'PJ';
  const beneficios = colaboradorSelecionado ? getCustoTotalColaborador(String(colaboradorSelecionado.id)) : 0;

  const valorTotal = formData.valor + formData.adicional + formData.reembolso + beneficios - formData.desconto;
  const valorTotalSemReembolso = valorTotal - formData.reembolso;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.colaboradorId) {
      return;
    }

    const totalPercent = empresas.reduce((s, c) => s + (c.percent || 0), 0);

    const dados: any = {
      colaboradorId: formData.colaboradorId,
      periodo,
      valor: formData.valor,
      adicional: formData.adicional,
      reembolso: formData.reembolso,
      desconto: formData.desconto,
      beneficios,
      valorTotal,
      valorTotalSemReembolso,
      situacao: formData.situacao,
      dataPagamento: formData.dataPagamento || undefined,
    };

    // Adicionar percentual se preenchido — map dynamic empresas into empresa1..empresa4
    if (totalPercent > 0) {
      const po: any = { totalOpers: totalPercent };
      empresas.slice(0, 4).forEach((c, idx) => {
        const i = idx + 1;
        po[`empresa${i}`] = c.percent;
        po[`empresa${i}Nome`] = c.name || undefined;
        dados[`empresa${i}Valor`] = (valorTotalSemReembolso * (c.percent || 0)) / 100;
      });
      dados.percentualOperacao = po;
    } else {
      // fallback: assign 100% to colaborador's company
      const empresaNome = colaboradorSelecionado?.empresa || 'Empresa';
      dados.percentualOperacao = {
        empresa1: 100,
        empresa1Nome: empresaNome,
        empresa2: 0,
        empresa2Nome: undefined,
        empresa3: 0,
        empresa3Nome: undefined,
        empresa4: 0,
        empresa4Nome: undefined,
        totalOpers: 100,
      } as any;
      dados.empresa1Valor = valorTotalSemReembolso;
    }

    // Adicionar nota fiscal se for PJ e tiver dados
    if (isPJ && formData.notaNumero) {
      dados.notaFiscal = {
        numero: formData.notaNumero,
        status: formData.notaStatus,
        pagamento: formData.notaPagamento,
        data: formData.notaData || undefined,
        obs: formData.notaObs || undefined,
      };
    }

    onSave(dados);
    onClose();
    
    // Reset form
    setEmpresas([]);
    setFormData({
      colaboradorId: '',
      periodo: periodo,
      valor: 0,
      adicional: 0,
      reembolso: 0,
      desconto: 0,
      situacao: 'pendente',
      dataPagamento: '',
      // empresas reset via setEmpresas([])
      notaNumero: '',
      notaStatus: 'aguardando',
      notaPagamento: 'pendente',
      notaData: '',
      notaObs: '',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Folha de Pagamento">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Seleção de Colaborador */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Colaborador *
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecione o Colaborador
            </label>
            <select
              value={formData.colaboradorId}
              onChange={(e) => setFormData({ ...formData, colaboradorId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecione...</option>
              {colaboradoresAtivos.map((colaborador: any) => (
                <option key={colaborador.id} value={String(colaborador.id)}>
                  {colaborador.nomeCompleto || colaborador.nome}
                  {colaborador.funcao ? ` - ${colaborador.funcao}` : ''}
                  {colaborador.contrato ? ` (${colaborador.contrato})` : ''}
                </option>
              ))}
            </select>
          </div>
          {colaboradorSelecionado && (
            <div className="flex items-center gap-4 mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-emerald-500">
              <Avatar src={colaboradorSelecionado.avatar} alt={colaboradorSelecionado.nomeCompleto} size="lg" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{colaboradorSelecionado.nomeCompleto}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Setor: {colaboradorSelecionado.setor ?? colaboradorSelecionado.departamento ?? '-'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Função: {colaboradorSelecionado.funcao ?? colaboradorSelecionado.cargo ?? '-'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Contrato: {colaboradorSelecionado.contrato ?? colaboradorSelecionado.regime ?? '-'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Período */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Período
          </h3>
          <Input
            leftIcon={<CalendarIcon size={16} />}
            type="month"
            value={formData.periodo}
            onChange={e => setFormData({ ...formData, periodo: e.target.value })}
            className="w-full max-w-xs"
            required
          />
        </div>

        {/* Valores */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Valores
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Base
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adicional
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.adicional}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, adicional: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reembolso
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.reembolso}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, reembolso: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desconto
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.desconto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          
          {/* Benefícios (calculado automaticamente) */}
          {colaboradorSelecionado && beneficios > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-blue-900 dark:text-blue-200">Benefícios</span>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Calculado automaticamente com base nos benefícios vinculados
                  </p>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(beneficios)}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(valorTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor Total (s/ Reemb.):</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(valorTotalSemReembolso)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Situação e Data */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Situação e Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="pendente">Pendente</option>
                <option value="agendado">Agendado</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Pagamento
              </label>
              <Input
                type="date"
                value={formData.dataPagamento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, dataPagamento: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Percentual por Operação (Divisão entre Empresas) */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Percentual por Operação (Divisão entre Empresas)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {empresas.map((c, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa {idx + 1} (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={c.percent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = parseFloat(e.target.value) || 0;
                    setEmpresas(prev => prev.map((p, i) => i === idx ? { ...p, percent: v } : p));
                  }}
                />
                {c.percent > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatCurrency(valorTotalSemReembolso * (c.percent || 0) / 100)}
                  </p>
                )}
                <input
                  type="text"
                  value={c.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmpresas(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))
                  }
                  placeholder="Clique para editar nome"
                  className="mt-3 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() => setEmpresas(prev => prev.filter((_, i) => i !== idx))}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}

            {empresas.length < 4 && (
              <div className="flex items-center">
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                  onClick={() => setEmpresas(prev => [...prev, { name: `Empresa ${prev.length + 1}`, percent: 0 }])}
                >
                  Inserir Empresa
                </button>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total: </span>
            <span className={`font-semibold ${
              empresas.reduce((s, c) => s + (c.percent || 0), 0) === 100
                ? 'text-green-600'
                : empresas.reduce((s, c) => s + (c.percent || 0), 0) > 100
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {empresas.reduce((s, c) => s + (c.percent || 0), 0).toFixed(2)}%
            </span>
            {empresas.reduce((s, c) => s + (c.percent || 0), 0) !== 100 && empresas.reduce((s, c) => s + (c.percent || 0), 0) > 0 && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                (deve somar 100%)
              </span>
            )}
          </div>
        </div>

        {/* Nota Fiscal (apenas para PJ) */}
        {isPJ && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Nota Fiscal (PJ)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número da NF
                </label>
                <Input
                  value={formData.notaNumero}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, notaNumero: e.target.value })
                  }
                  placeholder="Ex: 12345"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status NF
                  </label>
                  <select
                    value={formData.notaStatus}
                    onChange={(e) => setFormData({ ...formData, notaStatus: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="aguardando">Aguardando</option>
                    <option value="recebida">Recebida</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pagamento NF
                  </label>
                  <select
                    value={formData.notaPagamento}
                    onChange={(e) => setFormData({ ...formData, notaPagamento: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="agendado">Agendado</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data NF
                  </label>
                  <Input
                    type="date"
                    value={formData.notaData}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, notaData: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações NF
                </label>
                <Input
                  value={formData.notaObs}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, notaObs: e.target.value })
                  }
                  placeholder="Observações sobre a nota fiscal"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" variant="primary">
            <span className="inline-flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </span>
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
