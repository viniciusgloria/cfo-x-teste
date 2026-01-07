import { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Dropzone } from './ui/Dropzone';
import { Calendar, FileText, Info } from 'lucide-react';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import toast from 'react-hot-toast';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { useAuthStore } from '../store/authStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: string;
}

export function AtestadoModal({ isOpen, onClose, data }: Props) {
  const { user } = useAuthStore();
  const { adicionar } = useAjustesPontoStore();
  const [motivo, setMotivo] = useState('');
  const {
    attachments,
    readyAttachments,
    handleFiles,
    removeAttachment,
    reset,
    isUploading,
    hasError,
  } = useAttachmentUploader();

  const totalSize = attachments.reduce((s, a) => s + (a.size || 0), 0);

  const handleSubmit = () => {
    // final
    if (isUploading) {
      toast.error('Aguarde o envio dos anexos.');
      return;
    }

    if (!readyAttachments || readyAttachments.length === 0) {
      toast.error('Anexe pelo menos um PDF ou imagem (máx 3MB).');
      return;
    }

    if (attachments.some((a) => a.status === 'error')) {
      toast.error('Remova anexos inválidos antes de enviar.');
      return;
    }

    if (!motivo.trim()) {
      toast.error('Descreva o motivo/observação');
      return;
    }

    adicionar({
      colaboradorEmail: user?.email || 'desconhecido',
      colaboradorNome: user?.name || 'Desconhecido',
      data,
      tipo: 'atestado',
      motivo,
      anexos: readyAttachments,
    });
    toast.success('Atestado enviado para análise');
    setMotivo('');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); }} title="Inclusão de Atestado Médico">
      <div className="space-y-3 p-4 sm:p-6">
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><Calendar size={16} className="text-emerald-500"/>Data</label>
          <input type="text" value={data} disabled className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 w-full mt-2" />
        </div>

        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><FileText size={16} className="text-emerald-500"/>Anexos (PDF ou imagens, até 3MB)</label>
          <Dropzone onFiles={handleFiles} />

          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 border border-gray-200 dark:border-slate-700 rounded-md p-2 bg-gray-50 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    {a.mimeType.startsWith('image/') ? (
                      <img src={a.dataUrl} alt={a.name} className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded text-sm">PDF</div>
                    )}
                    <div className="text-sm w-full">
                      <div className="truncate max-w-[240px]">{a.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-300 flex items-center justify-between">
                        <span>{(a.size / 1024 / 1024).toFixed(2)} MB {a.status === 'error' ? `· Erro: ${a.error}` : ''}</span>
                        <span className="ml-2">{a.status === 'uploading' ? 'Enviando…' : a.status === 'done' ? 'Pronto' : ''}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-800 h-1 rounded mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-1" style={{ width: `${a.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-red-600 text-xs" onClick={() => removeAttachment(a.id)}>Remover</button>
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-600 dark:text-slate-300">Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</div>
              {attachments.some((a) => a.status === 'error') && <div className="text-xs text-red-600">Remova anexos inválidos antes de prosseguir.</div>}
              {isUploading && <div className="text-xs text-gray-500 dark:text-slate-400">Enviando anexos...</div>}
            </div>
          )}
        </div>

        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><Info size={16} className="text-emerald-500"/>Observação</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg resize-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 mt-2" placeholder="Ex: Retorno médico com atestado anexo." />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit} fullWidth disabled={!motivo.trim() || isUploading || attachments.some((a) => a.status === 'error')}>Enviar</Button>
        </div>
      </div>
    </Modal>
  );
}
