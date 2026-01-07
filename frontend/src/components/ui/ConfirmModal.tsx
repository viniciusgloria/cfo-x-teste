import { Modal } from './Modal';
import { Button } from './Button';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Tem certeza?' }: Props) {
  const [reason, setReason] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Essa ação não pode ser desfeita. Informe um motivo (opcional):</p>
        <textarea aria-label="motivo" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={3} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} aria-label="cancelar">Cancelar</Button>
          <Button onClick={() => { onConfirm(reason); setReason(''); }} aria-label="confirmar">Confirmar</Button>
        </div>
      </div>
    </Modal>
  );
}
