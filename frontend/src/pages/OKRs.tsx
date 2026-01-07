import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/Avatar';
import { useOKRsStore, ResultadoChave } from '../store/okrsStore';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAuthStore } from '../store/authStore';

export function OKRs() {
  const [activeTab, setActiveTab] = useState('todos');
  const [trimestre, setTrimestre] = useState('Q4 2024');
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [isNovoModal, setIsNovoModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [selectedOKR, setSelectedOKR] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { okrs, atualizarProgresso, adicionarOKR, editarOKR, removerOKR } = useOKRsStore();
  const user = useAuthStore((state) => state.user);

  // Form state
  const [formData, setFormData] = useState({
    objetivo: '',
    tipo: 'pessoal' as 'empresa' | 'time' | 'pessoal',
    status: 'no-prazo' as 'no-prazo' | 'atencao' | 'atrasado'
  });
  const [resultadosChave, setResultadosChave] = useState<Omit<ResultadoChave, 'id' | 'progresso'>[]>([
    { descricao: '', meta: 0, atual: 0, unidade: '' }
  ]);

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'pessoal', label: 'Pessoal' },
    { id: 'time', label: 'Time' },
    { id: 'empresa', label: 'Empresa' }
  ];

  const okrsFiltrados = okrs.filter(okr => {
    if (activeTab === 'todos') return true;
    return okr.tipo === activeTab;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleUpdateProgress = () => {
    if (!selectedOKR) return;

    const okr = okrs.find(o => o.id === selectedOKR);
    if (!okr) return;

    okr.resultadosChave.forEach(kr => {
      if (progressValues[kr.id] !== undefined) {
        atualizarProgresso(selectedOKR, kr.id, progressValues[kr.id]);
      }
    });

    toast.success('Progresso atualizado!');
    setIsUpdateModal(false);
    setSelectedOKR(null);
    setProgressValues({});
  };

  const handleOpenUpdate = (okrId: string) => {
    const okr = okrs.find(o => o.id === okrId);
    if (okr) {
      setSelectedOKR(okrId);
      const values: Record<string, number> = {};
      okr.resultadosChave.forEach(kr => {
        values[kr.id] = kr.atual;
      });
      setProgressValues(values);
      setIsUpdateModal(true);
    }
  };

  const handleNovoOKR = () => {
    if (!formData.objetivo.trim()) {
      toast.error('Objetivo é obrigatório');
      return;
    }
    if (resultadosChave.some(kr => !kr.descricao.trim() || kr.meta <= 0)) {
      toast.error('Preencha todos os resultados-chave corretamente');
      return;
    }

    const krsComId = resultadosChave.map((kr, idx) => ({
      ...kr,
      id: `${Date.now()}-${idx}`,
      progresso: Math.round((kr.atual / kr.meta) * 100)
    }));

    adicionarOKR({
      objetivo: formData.objetivo,
      tipo: formData.tipo,
      status: formData.status,
      trimestre,
      owner: { nome: user?.name || 'Você', avatar: user?.avatar || '' },
      resultadosChave: krsComId
    });

    toast.success('OKR criado com sucesso!');
    setIsNovoModal(false);
    resetForm();
  };

  const handleEditarOKR = () => {
    if (!selectedOKR) return;
    
    if (!formData.objetivo.trim()) {
      toast.error('Objetivo é obrigatório');
      return;
    }
    if (resultadosChave.some(kr => !kr.descricao.trim() || kr.meta <= 0)) {
      toast.error('Preencha todos os resultados-chave corretamente');
      return;
    }

    const krsComId = resultadosChave.map((kr, idx) => ({
      ...kr,
      id: `${Date.now()}-${idx}`,
      progresso: Math.round((kr.atual / kr.meta) * 100)
    }));

    editarOKR(selectedOKR, {
      objetivo: formData.objetivo,
      tipo: formData.tipo,
      status: formData.status,
      trimestre,
      owner: { nome: user?.name || 'Você', avatar: user?.avatar || '' },
      resultadosChave: krsComId
    });

    toast.success('OKR atualizado com sucesso!');
    setIsEditModal(false);
    resetForm();
  };

  const handleOpenEdit = (okrId: string) => {
    const okr = okrs.find(o => o.id === okrId);
    if (okr) {
      setSelectedOKR(okrId);
      setFormData({
        objetivo: okr.objetivo,
        tipo: okr.tipo,
        status: okr.status
      });
      setResultadosChave(okr.resultadosChave.map(kr => ({
        descricao: kr.descricao,
        meta: kr.meta,
        atual: kr.atual,
        unidade: kr.unidade
      })));
      setIsEditModal(true);
    }
  };

  const handleDeleteOKR = (okrId: string) => {
    removerOKR(okrId);
    toast.success('OKR removido com sucesso!');
    setConfirmDelete(null);
  };

  const resetForm = () => {
    setFormData({ objetivo: '', tipo: 'pessoal', status: 'no-prazo' });
    setResultadosChave([{ descricao: '', meta: 0, atual: 0, unidade: '' }]);
    setSelectedOKR(null);
  };

  const addResultadoChave = () => {
    setResultadosChave([...resultadosChave, { descricao: '', meta: 0, atual: 0, unidade: '' }]);
  };

  const removeResultadoChave = (index: number) => {
    if (resultadosChave.length === 1) {
      toast.error('Deve haver pelo menos 1 resultado-chave');
      return;
    }
    setResultadosChave(resultadosChave.filter((_, i) => i !== index));
  };

  const updateResultadoChave = (index: number, field: string, value: any) => {
    const novos = [...resultadosChave];
    novos[index] = { ...novos[index], [field]: value };
    setResultadosChave(novos);
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Acompanhar Desenvolvimento"
        icon={<Target size={32} />}
        right={(
          <>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-md">
              <Filter size={16} className="text-gray-500 dark:text-slate-400" />
              <select
                value={trimestre}
                onChange={(e) => setTrimestre(e.target.value)}
                className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700"
              >
                <option>Q4 2024</option>
                <option>Q3 2024</option>
                <option>Q2 2024</option>
                <option>Q1 2024</option>
              </select>
            </div>
            <Button onClick={() => setIsNovoModal(true)} className="flex items-center gap-2">
              <Plus size={18} />
              Nova Meta
            </Button>
          </>
        )}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : okrsFiltrados.length === 0 ? (
            <EmptyState title="Nenhum objetivo criado" description="Crie uma meta para começar a acompanhar seu desenvolvimento." cta={<Button onClick={() => setIsNovoModal(true)}>Nova Meta</Button>} />
          ) : (
            okrsFiltrados.map((okr) => {
              return (
                <Card key={okr.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={okr.tipo}>{okr.tipo === 'empresa' ? 'Empresa' : okr.tipo === 'time' ? 'Time' : 'Pessoal'}</Badge>
                        <Badge variant={okr.status}>
                          {okr.status === 'no-prazo' ? 'No Prazo' : okr.status === 'atencao' ? 'Atenção' : 'Atrasado'}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{okr.objetivo}</h3>
                      <div className="flex items-center gap-3">
                        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${okr.owner.avatar}`} alt={okr.owner.nome} size="md" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{okr.owner.nome}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">{okr.trimestre}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <CircularProgress progress={okr.progresso} size={100} />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleOpenEdit(okr.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar OKR"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(okr.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover OKR"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    {okr.resultadosChave.map((kr) => (
                      <div key={kr.id}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-700 dark:text-slate-200">{kr.descricao}</p>
                          <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                            {kr.atual}/{kr.meta} {kr.unidade}
                          </span>
                        </div>
                        <ProgressBar progress={kr.progresso} showLabel={true} />
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleOpenUpdate(okr.id)}
                    fullWidth
                  >
                    Atualizar Progresso
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>

      <Modal
        isOpen={isUpdateModal}
        onClose={() => {
          setIsUpdateModal(false);
          setSelectedOKR(null);
        }}
        title="Atualizar Progresso"
      >
        {selectedOKR && okrs.find(o => o.id === selectedOKR) && (
          <div className="space-y-4">
            {okrs.find(o => o.id === selectedOKR)?.resultadosChave.map((kr) => (
              <div key={kr.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  {kr.descricao}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={progressValues[kr.id] || 0}
                    onChange={(e) =>
                      setProgressValues({
                        ...progressValues,
                        [kr.id]: parseFloat(e.target.value) || 0
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-slate-300 min-w-fit">/ {kr.meta} {kr.unidade}</span>
                </div>
              </div>
            ))}

            <Button onClick={handleUpdateProgress} fullWidth>
              Salvar Alterações
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Novo OKR */}
      <Modal
        isOpen={isNovoModal}
        onClose={() => {
          setIsNovoModal(false);
          resetForm();
        }}
        title="Criar Nova Meta"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Objetivo</label>
            <Input
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Ex: Aumentar eficiência operacional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="pessoal">Pessoal</option>
                <option value="time">Time</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="no-prazo">No Prazo</option>
                <option value="atencao">Atenção</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Resultados-Chave</label>
              <Button variant="outline" className="text-sm py-1 px-3" onClick={addResultadoChave}>
                <Plus size={16} />
              </Button>
            </div>

            {resultadosChave.map((kr, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg relative">
                {resultadosChave.length > 1 && (
                  <button
                    onClick={() => removeResultadoChave(index)}
                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="space-y-3">
                  <Input
                    value={kr.descricao}
                    onChange={(e) => updateResultadoChave(index, 'descricao', e.target.value)}
                    placeholder="Descrição do resultado"
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={kr.meta || ''}
                      onChange={(e) => updateResultadoChave(index, 'meta', parseFloat(e.target.value) || 0)}
                      placeholder="Meta"
                    />
                    <Input
                      type="number"
                      value={kr.atual || ''}
                      onChange={(e) => updateResultadoChave(index, 'atual', parseFloat(e.target.value) || 0)}
                      placeholder="Atual"
                    />
                    <Input
                      value={kr.unidade}
                      onChange={(e) => updateResultadoChave(index, 'unidade', e.target.value)}
                      placeholder="Unidade"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleNovoOKR} fullWidth>
            Criar OKR
          </Button>
        </div>
      </Modal>

      {/* Modal Editar OKR */}
      <Modal
        isOpen={isEditModal}
        onClose={() => {
          setIsEditModal(false);
          resetForm();
        }}
        title="Editar OKR"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Objetivo</label>
            <Input
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Ex: Aumentar eficiência operacional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="pessoal">Pessoal</option>
                <option value="time">Time</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="no-prazo">No Prazo</option>
                <option value="atencao">Atenção</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Resultados-Chave</label>
              <Button variant="outline" className="text-sm py-1 px-3" onClick={addResultadoChave}>
                <Plus size={16} />
              </Button>
            </div>

            {resultadosChave.map((kr, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg relative">
                {resultadosChave.length > 1 && (
                  <button
                    onClick={() => removeResultadoChave(index)}
                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="space-y-3">
                  <Input
                    value={kr.descricao}
                    onChange={(e) => updateResultadoChave(index, 'descricao', e.target.value)}
                    placeholder="Descrição do resultado"
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={kr.meta || ''}
                      onChange={(e) => updateResultadoChave(index, 'meta', parseFloat(e.target.value) || 0)}
                      placeholder="Meta"
                    />
                    <Input
                      type="number"
                      value={kr.atual || ''}
                      onChange={(e) => updateResultadoChave(index, 'atual', parseFloat(e.target.value) || 0)}
                      placeholder="Atual"
                    />
                    <Input
                      value={kr.unidade}
                      onChange={(e) => updateResultadoChave(index, 'unidade', e.target.value)}
                      placeholder="Unidade"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleEditarOKR} fullWidth>
            Salvar Alterações
          </Button>
        </div>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteOKR(confirmDelete)}
        title="Confirmar exclusão"
      />
    </div>
  );
}





