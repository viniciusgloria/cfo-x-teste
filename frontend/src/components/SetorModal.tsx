import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface SetorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nome: string, descricao?: string) => void;
  setorInicial?: { nome: string; descricao?: string };
  titulo?: string;
}

export function SetorModal({ isOpen, onClose, onSave, setorInicial, titulo = 'Novo Setor' }: SetorModalProps) {
  const [nome, setNome] = useState(setorInicial?.nome || '');
  const [descricao, setDescricao] = useState(setorInicial?.descricao || '');

  // Atualizar estado quando setorInicial mudar
  useEffect(() => {
    if (setorInicial) {
      setNome(setorInicial.nome);
      setDescricao(setorInicial.descricao || '');
    } else {
      setNome('');
      setDescricao('');
    }
  }, [setorInicial]);

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do setor');
      return;
    }
    onSave(nome.trim(), descricao.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setNome('');
    setDescricao('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Nome do Setor <span className="text-red-500">*</span>
          </label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Tecnologia"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva as atividades do setor"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:bg-gray-700 dark:text-white"
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleSave} fullWidth>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
