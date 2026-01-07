import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useReservasStore, TipoSala } from '../store/reservasStore';
import { useAuthStore } from '../store/authStore';

interface ReservaSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSelecionada?: string;
}

export function ReservaSalaModal({ isOpen, onClose, dataSelecionada }: ReservaSalaModalProps) {
  const { user } = useAuthStore();
  const { adicionarReserva, verificarDisponibilidade } = useReservasStore();
  
  const [tipoSala, setTipoSala] = useState<TipoSala>('call');
  const [data, setData] = useState(dataSelecionada || '');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!data) newErrors.data = 'Selecione uma data';
    if (!horaInicio) newErrors.horaInicio = 'Selecione o horário de início';
    if (!horaFim) newErrors.horaFim = 'Selecione o horário de fim';
    if (!motivo.trim()) newErrors.motivo = 'Descreva o motivo da reserva';

    // Validar se hora fim é depois da hora início
    if (horaInicio && horaFim) {
      const [hI, mI] = horaInicio.split(':').map(Number);
      const [hF, mF] = horaFim.split(':').map(Number);
      const minInicio = hI * 60 + mI;
      const minFim = hF * 60 + mF;
      
      if (minFim <= minInicio) {
        newErrors.horaFim = 'O horário de fim deve ser posterior ao de início';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Verificar disponibilidade
    const { disponivel, conflito } = verificarDisponibilidade(tipoSala, data, horaInicio, horaFim);

    if (!disponivel && conflito) {
      toast.error(
        `A ${tipoSala === 'call' ? 'Sala de Call' : 'Sala de Reunião'} já está reservada das ${conflito.horaInicio} às ${conflito.horaFim} por ${conflito.usuarioNome}.`,
        { duration: 5000 }
      );
      return;
    }

    const sucesso = adicionarReserva({
      usuarioId: user?.id || '1',
      usuarioNome: user?.name || 'Usuário',
      tipoSala,
      data,
      horaInicio,
      horaFim,
      motivo,
    });

    if (sucesso) {
      toast.success('Reserva realizada com sucesso!');
      onClose();
      // Reset form
      setTipoSala('call');
      setData('');
      setHoraInicio('');
      setHoraFim('');
      setMotivo('');
      setErrors({});
    } else {
      toast.error('Não foi possível realizar a reserva. Tente outro horário.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservar Sala">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Tipo de Sala *
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="radio"
                name="tipoSala"
                value="call"
                checked={tipoSala === 'call'}
                onChange={(e) => setTipoSala(e.target.value as TipoSala)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-[#374151] dark:border-slate-700 rounded-lg cursor-pointer peer-checked:border-[#10B981] transition-all bg-white dark:bg-slate-900">
                <p className="font-medium text-gray-800 dark:text-slate-100">Sala de Call</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Para videoconferências</p>
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="tipoSala"
                value="reuniao"
                checked={tipoSala === 'reuniao'}
                onChange={(e) => setTipoSala(e.target.value as TipoSala)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-[#374151] dark:border-slate-700 rounded-lg cursor-pointer peer-checked:border-[#10B981] transition-all bg-white dark:bg-slate-900">
                <p className="font-medium text-gray-800 dark:text-slate-100">Sala de Reunião</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Para reuniões presenciais</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Data *
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
            />
          </div>
          {errors.data && <p className="text-sm text-red-600 mt-1">{errors.data}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Horário de Início *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
              />
            </div>
            {errors.horaInicio && <p className="text-sm text-red-600 mt-1">{errors.horaInicio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Horário de Fim *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
              />
            </div>
            {errors.horaFim && <p className="text-sm text-red-600 mt-1">{errors.horaFim}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Motivo da Reserva *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: Reunião de planejamento trimestral"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg resize-none bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
          />
          {errors.motivo && <p className="text-sm text-red-600 mt-1">{errors.motivo}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" fullWidth>
            Confirmar Reserva
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
