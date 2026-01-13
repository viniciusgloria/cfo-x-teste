import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Plus, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { Cargo, Setor } from '../types';

interface CargoModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cargo: Omit<Cargo, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  cargoInicial?: Cargo;
  titulo?: string;
  cargos: Cargo[];
  setores: Setor[];
}

const NIVEIS_HIERARQUICOS = [
  { value: 1, label: '1 - C-Level' },
  { value: 2, label: '2 - Gerencial' },
  { value: 3, label: '3 - Supervisão' },
  { value: 4, label: '4 - Operacional' },
  { value: 5, label: '5 - Estagiário' },
];

export function CargoModalAdvanced({ isOpen, onClose, onSave, cargoInicial, titulo = 'Novo Cargo', cargos, setores }: CargoModalAdvancedProps) {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    nivelHierarquico: 4 as number,
    cargosPaiSelecionados: [] as string[],
    salarioBase: '',
    salarioMax: '',
    setoresVinculados: [] as string[],
    competencias: [] as string[],
    responsabilidades: [] as string[]
  });
  const [novaCompetencia, setNovaCompetencia] = useState('');
  const [novaResponsabilidade, setNovaResponsabilidade] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (cargoInicial) {
      setForm({
        nome: cargoInicial.nome,
        descricao: cargoInicial.descricao || '',
        nivelHierarquico: cargoInicial.nivelHierarquico || 4,
        cargosPaiSelecionados: cargoInicial.cargosPai || [],
        salarioBase: cargoInicial.salarioBase?.toString() || '',
        salarioMax: cargoInicial.salarioMax?.toString() || '',
        setoresVinculados: cargoInicial.setoresVinculados || [],
        competencias: cargoInicial.competencias || [],
        responsabilidades: cargoInicial.responsabilidades || []
      });
    } else {
      setForm({
        nome: '',
        descricao: '',
        nivelHierarquico: 4,
        cargosPaiSelecionados: [],
        salarioBase: '',
        salarioMax: '',
        setoresVinculados: [],
        competencias: [],
        responsabilidades: []
      });
      setNovaCompetencia('');
      setNovaResponsabilidade('');
    }
  }, [isOpen, cargoInicial?.id]);

  const handleAddCompetencia = () => {
    if (novaCompetencia.trim()) {
      setForm((f) => ({ ...f, competencias: [...f.competencias, novaCompetencia.trim()] }));
      setNovaCompetencia('');
    }
  };

  const handleRemoveCompetencia = (index: number) => {
    setForm((f) => ({ ...f, competencias: f.competencias.filter((_, i) => i !== index) }));
  };

  const handleAddResponsabilidade = () => {
    if (novaResponsabilidade.trim()) {
      setForm((f) => ({ ...f, responsabilidades: [...f.responsabilidades, novaResponsabilidade.trim()] }));
      setNovaResponsabilidade('');
    }
  };

  const handleRemoveResponsabilidade = (index: number) => {
    setForm((f) => ({ ...f, responsabilidades: f.responsabilidades.filter((_, i) => i !== index) }));
  };

  const handleToggleSetorVinculado = (setorId: string) => {
    setForm((f) => ({
      ...f,
      setoresVinculados: f.setoresVinculados.includes(setorId)
        ? f.setoresVinculados.filter((id) => id !== setorId)
        : [...f.setoresVinculados, setorId]
    }));
  };

  const handleToggleCargoPai = (cargoId: string) => {
    setForm((f) => ({
      ...f,
      cargosPaiSelecionados: f.cargosPaiSelecionados.includes(cargoId)
        ? f.cargosPaiSelecionados.filter((id) => id !== cargoId)
        : [...f.cargosPaiSelecionados, cargoId]
    }));
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do cargo');
      return;
    }

    const salBase = form.salarioBase ? parseFloat(form.salarioBase.replace(/[^\d,]/g, '').replace(',', '.')) : undefined;
    const salMax = form.salarioMax ? parseFloat(form.salarioMax.replace(/[^\d,]/g, '').replace(',', '.')) : undefined;

    if (salBase && salMax && salMax < salBase) {
      toast.error('Salário máximo deve ser maior que o salário base');
      return;
    }

    const cargoData: Omit<Cargo, 'id' | 'criadoEm' | 'atualizadoEm'> = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      nivelHierarquico: form.nivelHierarquico,
      cargosPai: form.cargosPaiSelecionados.length > 0 ? form.cargosPaiSelecionados : undefined,
      salarioBase: salBase,
      salarioMax: salMax,
      setoresVinculados: form.setoresVinculados.length > 0 ? form.setoresVinculados : undefined,
      competencias: form.competencias.length > 0 ? form.competencias : undefined,
      responsabilidades: form.responsabilidades.length > 0 ? form.responsabilidades : undefined,
    };

    onSave(cargoData);
    handleClose();
  };

  const handleClose = useCallback(() => {
    initializedRef.current = false;
    onClose();
  }, [onClose]);

  // Filtrar cargos disponíveis para cargo pai (não pode selecionar a si mesmo)
  const cargosDisponiveis = (cargos || []).filter((c) => c.id !== cargoInicial?.id);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto overflow-x-visible px-2">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-white">Informações Básicas</h4>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Nome do Cargo <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Gerente de Operações"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o cargo..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Hierarquia */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Hierarquia</h4>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Nível Hierárquico
            </label>
            <div className="grid grid-cols-5 gap-2">
              {NIVEIS_HIERARQUICOS.map((nivel) => (
                <button
                  key={nivel.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, nivelHierarquico: nivel.value }))}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    form.nivelHierarquico === nivel.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500'
                  }`}
                >
                  {nivel.label}
                </button>
              ))}
            </div>
          </div>

          {form.nivelHierarquico > 1 && cargosDisponiveis.length > 0 && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Reporta-se a (Cargos Pai)
              </label>
              <div className="border border-gray-300 dark:border-slate-600 rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                {cargosDisponiveis.map((cargo) => (
                  <label key={cargo.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={form.cargosPaiSelecionados.includes(cargo.id)}
                      onChange={() => handleToggleCargoPai(cargo.id)}
                      className="rounded"
                    />
                    <span className="text-gray-700 dark:text-slate-300">{cargo.nome}</span>
                    {cargo.nivelHierarquico && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        (Nível {cargo.nivelHierarquico})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dados Financeiros */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <DollarSign size={18} />
            Faixa Salarial
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Salário Base (R$)
              </label>
              <input
                value={form.salarioBase}
                onChange={(e) => setForm((f) => ({ ...f, salarioBase: e.target.value }))}
                placeholder="Ex: 5000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Salário Máximo (R$)
              </label>
              <input
                value={form.salarioMax}
                onChange={(e) => setForm((f) => ({ ...f, salarioMax: e.target.value }))}
                placeholder="Ex: 8000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Setores Vinculados */}
        {setores.length > 0 && (
          <div className="space-y-4 mt-6 pt-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">Setores Vinculados</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Selecione os setores onde este cargo pode existir
            </p>
            
            <div className="border border-gray-300 dark:border-slate-600 rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
              {(setores || []).map((setor) => (
                <label key={setor.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={setoresVinculados.includes(setor.id)}
                    onChange={() => handleToggleSetorVinculado(setor.id)}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-slate-300">{setor.nome}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Competências */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Competências e Skills</h4>
          
          <div className="flex gap-2">
            <input
              value={novaCompetencia}
              onChange={(e) => setNovaCompetencia(e.target.value)}
              placeholder="Ex: Gestão de equipes"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCompetencia()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            />
            <Button type="button" onClick={handleAddCompetencia} variant="outline" size="sm">
              <Plus size={16} />
            </Button>
          </div>

          {form.competencias.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.competencias.map((comp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                >
                  {comp}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetencia(index)}
                    className="hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Responsabilidades */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Responsabilidades</h4>
          
          <div className="flex gap-2">
            <input
              value={novaResponsabilidade}
              onChange={(e) => setNovaResponsabilidade(e.target.value)}
              placeholder="Ex: Coordenar equipe de vendas"
              onKeyPress={(e) => e.key === 'Enter' && handleAddResponsabilidade()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            />
            <Button type="button" onClick={handleAddResponsabilidade} variant="outline" size="sm">
              <Plus size={16} />
            </Button>
          </div>

          {form.responsabilidades.length > 0 && (
            <ul className="space-y-1">
              {form.responsabilidades.map((resp, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-2 rounded"
                >
                  <span className="mt-1">•</span>
                  <span className="flex-1">{resp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsabilidade(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 px-2">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Cargo
        </Button>
      </div>
    </Modal>
  );
}
