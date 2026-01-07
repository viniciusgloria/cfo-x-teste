import { useState, useEffect } from 'react';
import { Users, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useCargosSetoresStore } from '../store/cargosSetoresStore';
import toast from 'react-hot-toast';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'cargo' | 'setor';
}

export function BulkAssignModal({ isOpen, onClose, tipo }: BulkAssignModalProps) {
  const { colaboradores, atualizarColaborador } = useColaboradoresStore();
  const { cargos, setores } = useCargosSetoresStore();
  
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedValue, setSelectedValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers(new Set());
      setSelectedValue('');
      setSearchTerm('');
    }
  }, [isOpen]);

  const items = tipo === 'cargo' ? cargos : setores;
  const filteredColaboradores = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: number) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const toggleAll = () => {
    if (selectedUsers.size === filteredColaboradores.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredColaboradores.map(c => c.id)));
    }
  };

  const handleAssign = () => {
    if (!selectedValue) {
      toast.error(`Selecione um ${tipo === 'cargo' ? 'cargo' : 'setor'}`);
      return;
    }

    if (selectedUsers.size === 0) {
      toast.error('Selecione ao menos um usuário');
      return;
    }

    const selectedItem = items.find(i => i.id === selectedValue);
    if (!selectedItem) return;

    selectedUsers.forEach(userId => {
      const colaborador = colaboradores.find(c => c.id === userId);
      if (colaborador) {
        // Atualiza o campo cargo ou setor do colaborador
        const fieldToUpdate = tipo === 'cargo' ? 'cargo' : (tipo === 'setor' ? 'setor' : 'departamento');
        atualizarColaborador(userId, {
          [fieldToUpdate]: selectedItem.nome
        });
      }
    });

    toast.success(
      `${selectedUsers.size} usuário${selectedUsers.size > 1 ? 's' : ''} atribuído${selectedUsers.size > 1 ? 's' : ''} ao ${tipo} "${selectedItem.nome}"`
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Atribuir ${tipo === 'cargo' ? 'Cargo' : 'Setor'} em Massa`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Selecione o {tipo === 'cargo' ? 'Cargo' : 'Setor'}
          </label>
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">-- Selecione --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar Usuários
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome ou email..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-80 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 px-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredColaboradores.length && filteredColaboradores.length > 0}
                onChange={toggleAll}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecionar todos ({filteredColaboradores.length})
              </span>
            </label>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredColaboradores.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum colaborador cadastrado'}
              </div>
            ) : (
              filteredColaboradores.map(colab => (
                <label
                  key={colab.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(colab.id)}
                    onChange={() => toggleUser(colab.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{colab.nome}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{colab.email}</div>
                  </div>
                  {selectedUsers.has(colab.id) && (
                    <Check size={16} className="text-green-600" />
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={selectedUsers.size === 0 || !selectedValue}>
            <Users size={16} className="mr-1" />
            Atribuir ({selectedUsers.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
