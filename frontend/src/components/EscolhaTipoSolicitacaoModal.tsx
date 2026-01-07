import { Modal } from './ui/Modal';
import { FileText, FilePlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEscolher: (tipo: 'ajuste' | 'atestado') => void;
}

export function EscolhaTipoSolicitacaoModal({ isOpen, onClose, onEscolher }: Props) {
  const handleKey = (e: React.KeyboardEvent, tipo: 'ajuste' | 'atestado') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEscolher(tipo);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O que deseja solicitar?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onEscolher('ajuste')}
          onKeyDown={(e) => handleKey(e, 'ajuste')}
          className="w-full flex flex-col items-start gap-2 p-6 rounded-lg shadow-sm bg-emerald-600 text-white hover:shadow-md transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-white/10 rounded-md">
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold">Ajuste de Ponto</div>
              <div className="text-xs opacity-90">Solicitar correção de horários ou inclusão manual</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onEscolher('atestado')}
          onKeyDown={(e) => handleKey(e, 'atestado')}
          className="w-full flex flex-col items-start gap-2 p-6 rounded-lg border border-gray-200 bg-white text-gray-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-gray-100 rounded-md">
              <FilePlus size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold">Inclusão de Atestado</div>
              <div className="text-xs text-gray-500">Anexe PDF ou imagem para justificar ausência/horário</div>
            </div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
