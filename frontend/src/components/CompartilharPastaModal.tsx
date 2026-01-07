import { useState } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Pasta, useDocumentosStore } from '../store/documentosStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import toast from 'react-hot-toast';

interface CompartilharPastaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pasta: Pasta;
}

export function CompartilharPastaModal({ isOpen, onClose, pasta }: CompartilharPastaModalProps) {
  const { colaboradores } = useColaboradoresStore();
  const { compartilharPasta, removerCompartilhamento } = useDocumentosStore();
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<number[]>([]);

  const colaboradoresDisponiveis = colaboradores.filter(
    (c) => 
      c.id !== pasta.colaboradorId && // Não mostrar o dono
      c.status === 'ativo' && // Apenas ativos
      !pasta.compartilhadoCom?.includes(c.id) // Não mostrar quem já tem acesso
  );

  const colaboradoresComAcesso = colaboradores.filter(
    (c) => pasta.compartilhadoCom?.includes(c.id)
  );

  const handleCompartilhar = () => {
    if (colaboradoresSelecionados.length === 0) {
      toast.error('Selecione pelo menos um colaborador');
      return;
    }

    compartilharPasta(pasta.id, colaboradoresSelecionados);
    toast.success(`Pasta compartilhada com ${colaboradoresSelecionados.length} colaborador(es)!`);
    setColaboradoresSelecionados([]);
    onClose();
  };

  const handleRemoverAcesso = (colaboradorId: number) => {
    removerCompartilhamento(pasta.id, colaboradorId);
    toast.success('Acesso removido!');
  };

  const toggleColaborador = (colaboradorId: number) => {
    setColaboradoresSelecionados((prev) =>
      prev.includes(colaboradorId)
        ? prev.filter((id) => id !== colaboradorId)
        : [...prev, colaboradorId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Pasta">
      <div className="space-y-6">
        {/* Pasta Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: pasta.cor + '20' }}
            >
              <Users size={20} style={{ color: pasta.cor }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{pasta.nome}</h3>
              {pasta.descricao && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{pasta.descricao}</p>
              )}
            </div>
          </div>
        </div>

        {/* Colaboradores com Acesso */}
        {colaboradoresComAcesso.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Com acesso ({colaboradoresComAcesso.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {colaboradoresComAcesso.map((colab) => (
                <div
                  key={colab.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                      {colab.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {colab.nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{colab.cargo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoverAcesso(colab.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar Colaboradores */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Adicionar colaboradores
          </h4>
          {colaboradoresDisponiveis.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum colaborador disponível para compartilhar
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {colaboradoresDisponiveis.map((colab) => (
                <label
                  key={colab.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={colaboradoresSelecionados.includes(colab.id)}
                    onChange={() => toggleColaborador(colab.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                    {colab.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {colab.nome}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{colab.cargo}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            fullWidth
            onClick={handleCompartilhar}
            disabled={colaboradoresSelecionados.length === 0}
          >
            <UserPlus size={16} className="mr-2" />
            Compartilhar ({colaboradoresSelecionados.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
