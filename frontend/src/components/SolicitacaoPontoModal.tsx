import { useMemo, useState } from 'react';
// X not needed; Modal handles close button
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Dropzone } from './ui/Dropzone';
import { Calendar, Clock, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import { usePontoStore } from '../store/pontoStore';
import { useAuthStore } from '../store/authStore';

interface SolicitacaoPontoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  tipo: 'ajuste' | 'justificativa';
}

export function SolicitacaoPontoModal({ isOpen, onClose, data, tipo }: SolicitacaoPontoModalProps) {
  const [horario, setHorario] = useState('');
  const [alvo, setAlvo] = useState<'entrada' | 'saida'>('entrada');
  const [motivo, setMotivo] = useState('');
  const { adicionar } = useAjustesPontoStore();
  const { user } = useAuthStore();
  const { attachments, readyAttachments, handleFiles, removeAttachment, reset, isUploading, hasError } = useAttachmentUploader();
  const { registros } = usePontoStore();

  const totalSize = useMemo(() => attachments.reduce((s, a) => s + (a.size || 0), 0), [attachments]);
  const fmtSize = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validation
    if (tipo === 'ajuste' && !horario) {
      toast.error('Informe o horário correto');
      return;
    }

    if (!motivo.trim()) {
      toast.error('Descreva o motivo da solicitação');
      return;
    }

    if (hasError) {
      toast.error('Remova anexos inválidos antes de enviar.');
      return;
    }

    if (tipo === 'ajuste') {
      adicionar({
        colaboradorEmail: user?.email || 'desconhecido',
        colaboradorNome: user?.name || 'Desconhecido',
        data,
        tipo: 'ajuste',
        alvo,
        horarioNovo: horario,
        motivo,
        anexos: readyAttachments,
      });
      toast.success('Solicitação de ajuste enviada!');
    } else {
      toast.success('Justificativa enviada!');
    }
    onClose();
    setHorario('');
    setMotivo('');
  };
  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); }} title={tipo === 'ajuste' ? 'Solicitar Ajuste de Ponto' : 'Justificar Falta/Atraso'}>
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3">
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><Calendar size={16} className="text-emerald-500"/>Data</label>
          <input type="text" value={data} disabled className="modal-accent-field w-full mt-2 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-lg" />
        </div>

        {tipo === 'ajuste' && (
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><FileText size={16} className="text-emerald-500"/>Tipo de ajuste</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                <input type="radio" name="alvo" value="entrada" checked={alvo === 'entrada'} onChange={() => setAlvo('entrada')} />
                Entrada
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                <input type="radio" name="alvo" value="saida" checked={alvo === 'saida'} onChange={() => setAlvo('saida')} />
                Saída
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><Clock size={16} className="text-emerald-500"/>Horário (HH:MM)</label>
            <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100" />
          </div>
        )}

        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><Calendar size={16} className="text-emerald-500"/>Registros do dia</label>
          <div className="text-sm text-gray-600 dark:text-slate-300 mb-2 mt-2">
            {(registros.find(r => r.data === data)?.punches || []).map((p: any) => (
              <div key={p.ts} className="flex items-center justify-between py-1 text-gray-700 dark:text-slate-200">
                <span className="capitalize text-sm">{p.type.replace('_', ' ')}</span>
                <span className="font-mono text-sm">{p.hhmm}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1"><FileText size={16} className="text-emerald-500"/>Anexos {tipo === 'ajuste' ? '(opcional)' : ''}</label>
          <Dropzone onFiles={handleFiles} />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
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
              <div className="text-xs text-gray-600 dark:text-slate-300">Total: {fmtSize(totalSize)}</div>
              {hasError && <div className="text-xs text-red-600">Remova anexos inválidos antes de prosseguir.</div>}
              {isUploading && <div className="text-xs text-gray-500 dark:text-slate-400">Enviando anexos...</div>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-slate-100 mb-1">Motivo</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} placeholder={tipo === 'ajuste' ? 'Ex: Esqueci de registrar...' : 'Ex: Consulta médica...'} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg resize-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" variant="primary" fullWidth>Enviar solicitação</Button>
        </div>
      </form>
    </Modal>
  );
}
