import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { DollarSign, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Setor } from '../types';

interface SetorModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (setor: Omit<Setor, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  setorInicial?: Setor;
  titulo?: string;
  setores: Setor[];
  usuarios: any[];
}

function SetorModalAdvancedComponent({ isOpen, onClose, onSave, setorInicial, titulo = 'Novo Setor', setores, usuarios }: SetorModalAdvancedProps) {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    setorPai: '',
    gestorId: '',
    orcamentoAnual: '',
    localizacao: '',
    email: '',
    ramal: ''
  });
  const initializedRef = useRef(false);

  // Initialize form only once per open or when switching edit target
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (setorInicial) {
      setForm({
        nome: setorInicial.nome,
        descricao: setorInicial.descricao || '',
        setorPai: setorInicial.setorPai || '',
        gestorId: setorInicial.gestorId || '',
        orcamentoAnual: setorInicial.orcamentoAnual?.toString() || '',
        localizacao: setorInicial.localizacao || '',
        email: setorInicial.email || '',
        ramal: setorInicial.ramal || ''
      });
    } else {
      setForm({
        nome: '',
        descricao: '',
        setorPai: '',
        gestorId: '',
        orcamentoAnual: '',
        localizacao: '',
        email: '',
        ramal: ''
      });
    }
  }, [isOpen, setorInicial?.id]);

  const handleClose = useCallback(() => {
    initializedRef.current = false;
    onClose();
  }, [onClose]);

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do setor');
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Email inválido');
      return;
    }

    const orcamento = form.orcamentoAnual
      ? parseFloat(form.orcamentoAnual.replace(/[^\d,]/g, '').replace(',', '.'))
      : undefined;
    const gestorSelecionado = (usuarios || []).find((u) => u.id === form.gestorId);

    const setorData: Omit<Setor, 'id' | 'criadoEm' | 'atualizadoEm'> = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      setorPai: form.setorPai || undefined,
      gestorId: form.gestorId || undefined,
      gestorNome: gestorSelecionado?.name || undefined,
      orcamentoAnual: orcamento,
      localizacao: form.localizacao.trim() || undefined,
      email: form.email.trim() || undefined,
      ramal: form.ramal.trim() || undefined
    };

    onSave(setorData);
    handleClose();
  };

  const setoresDisponiveis = (setores || []).filter((s) => s.id !== setorInicial?.id);
  const gestoresDisponiveis = (usuarios || []).filter((u) => u.role === 'admin' || u.role === 'gestor');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto overflow-x-visible px-2">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-white">Informações Básicas</h4>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Nome do Setor <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Recursos Humanos"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o setor..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Hierarquia */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Hierarquia</h4>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Setor Pai</label>
            <select
              value={form.setorPai}
              onChange={(e) => setForm((f) => ({ ...f, setorPai: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            >
              <option value="">Nenhum</option>
              {setoresDisponiveis.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gestão e Orçamento */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Gestão e Orçamento</h4>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Gestor do Setor</label>
            <select
              value={form.gestorId}
              onChange={(e) => setForm((f) => ({ ...f, gestorId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            >
              <option value="">Sem gestor definido</option>
              {gestoresDisponiveis.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Orçamento Anual (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <DollarSign size={18} />
              </span>
              <input
                value={form.orcamentoAnual}
                onChange={(e) => setForm((f) => ({ ...f, orcamentoAnual: e.target.value }))}
                placeholder="Ex: 250000,00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all pl-10"
              />
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-4 mt-6 pt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Informações de Contato</h4>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Localização</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <MapPin size={18} />
              </span>
              <input
                value={form.localizacao}
                onChange={(e) => setForm((f) => ({ ...f, localizacao: e.target.value }))}
                placeholder="Ex: Prédio A, 2º andar"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Mail size={18} />
                </span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="exemplo@empresa.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Ramal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Phone size={18} />
                </span>
                <input
                  value={form.ramal}
                  onChange={(e) => setForm((f) => ({ ...f, ramal: e.target.value }))}
                  placeholder="Ex: 1234"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Setor</Button>
        </div>
      </div>
    </Modal>
  );
}

export const SetorModalAdvanced = React.memo(SetorModalAdvancedComponent);
