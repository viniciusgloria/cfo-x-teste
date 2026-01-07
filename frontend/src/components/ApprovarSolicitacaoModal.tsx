import { useState, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { usePontoStore } from '../store/pontoStore';
import { SolicitacaoPonto } from '../store/ajustesPontoStore';
import { minutesToHHMM } from '../utils/time';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoPonto | null;
  onConfirm: (horarioFinal?: string, observacao?: string) => void;
}

export function ApprovarSolicitacaoModal({ isOpen, onClose, solicitacao, onConfirm }: Props) {
  const { registros, aplicarAjusteAprovado } = usePontoStore();
  const [horario, setHorario] = useState(solicitacao?.horarioNovo || '');
  const [obs, setObs] = useState('');

  if (!isOpen || !solicitacao) return null;

  const registro = useMemo(() => registros.find((r) => r.data === solicitacao.data), [registros, solicitacao]);

  const handleSubmit = () => {
    // apply adjustment to pontoStore if ajuste
    if (solicitacao.tipo === 'ajuste') {
      if (!horario) return;
      aplicarAjusteAprovado({ data: solicitacao.data, alvo: solicitacao.alvo, horarioNovo: horario });
    }
    onConfirm(horario, obs);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Aprovar solicitação de ${solicitacao.colaboradorNome}`}>
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input type="text" value={solicitacao.data} disabled className="w-full px-3 py-2 border rounded" />
        </div>

        {registro && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registros do dia</label>
            <ul className="text-sm space-y-1">
              {registro.punches.map((p) => (
                <li key={p.ts} className="flex items-center justify-between">
                  <span>{p.type}</span>
                  <span className="font-mono">{p.hhmm}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {solicitacao.tipo === 'ajuste' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário final</label>
            <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit} fullWidth>Confirmar e aplicar</Button>
        </div>
      </div>
    </Modal>
  );
}
