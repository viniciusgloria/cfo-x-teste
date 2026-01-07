import { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon, Trash } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import toast from 'react-hot-toast';
import { FolhaPagamento } from '../types';
import { Avatar } from './Avatar';

interface EditarFolhaModalProps {
  folha: FolhaPagamento | null;
  onClose: () => void;
  onSave: (id: string, dados: Partial<FolhaPagamento>) => void;
  onDelete?: (id: string) => void;
}

export function EditarFolhaModal({ folha, onClose, onSave, onDelete }: EditarFolhaModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (folha) {
      setFormData({
        valor: folha.valor,
        adicional: folha.adicional,
        reembolso: folha.reembolso,
        desconto: folha.desconto,
        situacao: folha.situacao,
        dataPagamento: folha.dataPagamento || '',
        // empresa fields are migrated to `empresas` state
        notaNumero: folha.notaFiscal?.numero || '',
        notaStatus: folha.notaFiscal?.status || 'aguardando',
        notaPagamento: folha.notaFiscal?.pagamento || 'pendente',
        notaData: folha.notaFiscal?.data || '',
        notaObs: folha.notaFiscal?.obs || '',
      });

      // Initialize empresas array from folha.percentualOperacao if present
      const ops = folha.percentualOperacao;
      const fromOps: Array<{ name: string; percent: number }> = [];
      if (ops) {
        if (ops.empresa1 || ops.empresa1Nome) fromOps.push({ name: ops.empresa1Nome || 'Empresa 1', percent: ops.empresa1 || 0 });
        if (ops.empresa2 || ops.empresa2Nome) fromOps.push({ name: ops.empresa2Nome || 'Empresa 2', percent: ops.empresa2 || 0 });
        if (ops.empresa3 || ops.empresa3Nome) fromOps.push({ name: ops.empresa3Nome || 'Empresa 3', percent: ops.empresa3 || 0 });
        if (ops.empresa4 || ops.empresa4Nome) fromOps.push({ name: ops.empresa4Nome || 'Empresa 4', percent: ops.empresa4 || 0 });
      }
      setEmpresas(fromOps);
    }
  }, [folha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folha) return;

    const beneficios = folha.beneficios || 0;
    const valorTotal = formData.valor + formData.adicional + formData.reembolso + beneficios - formData.desconto;
    const valorTotalSemReembolso = valorTotal - formData.reembolso;

    const totalPercent = empresas.reduce((s, c) => s + (c.percent || 0), 0);

    const dados: Partial<FolhaPagamento> = {
      valor: formData.valor,
      adicional: formData.adicional,
      reembolso: formData.reembolso,
      desconto: formData.desconto,
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
        (dados as any)[`empresa${i}Valor`] = (valorTotalSemReembolso * (c.percent || 0)) / 100;
      });
      dados.percentualOperacao = po;
    }

    // Adicionar nota fiscal se for PJ
    if (folha.colaborador.contrato === 'PJ') {
      dados.notaFiscal = {
        id: folha.notaFiscal?.id || `nf-${Date.now()}`,
        numero: formData.notaNumero || undefined,
        status: formData.notaStatus,
        pagamento: formData.notaPagamento,
        data: formData.notaData || undefined,
        obs: formData.notaObs || undefined,
      };
    }

    onSave(folha.id, dados);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const valorTotal = formData.valor + formData.adicional + formData.reembolso + (folha?.beneficios || 0) - formData.desconto;
  const empresasTotalPercent = empresas.reduce((s, c) => s + (c.percent || 0), 0);

  if (!folha) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Editar Folha - ${folha.colaborador.nomeCompleto}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Colaborador */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-emerald-500">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Informações do Colaborador
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={folha.colaborador.avatar}
              alt={folha.colaborador.nomeCompleto}
              size="lg"
              className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-center"
            >
              {!folha.colaborador.avatar && folha.colaborador.nomeCompleto
                ? folha.colaborador.nomeCompleto.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
                : null}
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{folha.colaborador.nomeCompleto}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Nome:</span>{' '}
              <span className="text-gray-900 dark:text-white">{folha.colaborador.nomeCompleto}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Função:</span>{' '}
              <span className="text-gray-900 dark:text-white">{folha.colaborador.funcao}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Setor:</span>{' '}
              <span className="text-gray-900 dark:text-white">{folha.colaborador.setor}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Contrato:</span>{' '}
              <span className="text-gray-900 dark:text-white">{folha.colaborador.contrato}</span>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Valores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Base (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adicional (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.adicional}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, adicional: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reembolso (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.reembolso}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, reembolso: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desconto (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Benefícios (calculado automaticamente) */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">Benefícios</span>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Calculado automaticamente com base nos benefícios vinculados
                </p>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(folha.beneficios || 0)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Valor Total:</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(valorTotal)}</span>
                {empresasTotalPercent === 100 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Percentual OK</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status e Pagamento */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status e Pagamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
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
                  leftIcon={<CalendarIcon size={16} />}
                  type="date"
                  value={formData.dataPagamento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, dataPagamento: e.target.value })
                  }
                  className="max-w-xs"
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
                  className={`${c.percent > 0 ? 'focus:ring-2 focus:ring-emerald-400 border-emerald-200' : ''}`}
                />
                {c.percent > 0 && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency((valorTotal - formData.reembolso) * (c.percent || 0) / 100)}
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
              empresasTotalPercent === 100
                ? 'text-green-600'
                : empresasTotalPercent > 100
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {empresasTotalPercent.toFixed(2)}%
            </span>
            {empresasTotalPercent !== 100 && empresasTotalPercent > 0 && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                (deve somar 100%)
              </span>
            )}
          </div>
        </div>

        {/* Nota Fiscal (apenas para PJ) */}
        {folha.colaborador.contrato === 'PJ' && (
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
                    leftIcon={<CalendarIcon size={16} />}
                    type="date"
                    value={formData.notaData}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, notaData: e.target.value })
                    }
                    className="max-w-xs"
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
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 items-center">
          {typeof onDelete === 'function' && folha && (
            <div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash className="w-4 h-4" />
                  Excluir
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                  <span className="text-sm text-red-800 dark:text-red-200">Você deseja remover esta folha permanentemente?</span>
                  <button
                    type="button"
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => {
                      if (!folha) return;
                      try { onDelete(folha.id); toast.success('Folha removida'); } catch {}
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                  >Confirmar</button>
                  <button
                    type="button"
                    className="px-2 py-1 bg-white border rounded"
                    onClick={() => setShowDeleteConfirm(false)}
                  >Cancelar</button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" variant="primary">
            <Save className="w-4 h-4 mr-2 inline" />
            Salvar
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2 inline" />
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
