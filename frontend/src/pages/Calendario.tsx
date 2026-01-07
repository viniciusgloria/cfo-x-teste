import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users as UsersIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import PlaceAutocomplete from '../components/ui/PlaceAutocomplete';
import { Badge } from '../components/ui/Badge';
import { ReservaSalaModal } from '../components/ReservaSalaModal';
import { useReservasStore } from '../store/reservasStore';
import { PageBanner } from '../components/ui/PageBanner';

interface Evento {
  id: number;
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'reuniao' | 'aniversario' | 'deadline' | 'reserva';
  local?: string;
  participantes?: string[];
  descricao?: string;
}

const mockEventos: Evento[] = [];

export function Calendario() {
  const { reservas } = useReservasStore();
  const [eventos, setEventos] = useState<Evento[]>(mockEventos);
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [reservaModalOpen, setReservaModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    tipo: 'reuniao',
    local: '',
    participantes: [],
    descricao: '',
  });

  // Sincronizar reservas com eventos
  useEffect(() => {
    const eventosDeReservas: Evento[] = reservas
      .filter(r => r.status === 'ativa')
      .map(r => ({
        id: parseInt(r.id),
        titulo: `Reserva: ${r.tipoSala === 'call' ? 'Sala de Call' : 'Sala de Reunião'}`,
        data: r.data,
        horaInicio: r.horaInicio,
        horaFim: r.horaFim,
        tipo: 'reserva' as const,
        local: r.tipoSala === 'call' ? 'Sala de Call' : 'Sala de Reunião',
        participantes: [r.usuarioNome],
        descricao: r.motivo,
      }));
    
    setEventos([...mockEventos, ...eventosDeReservas]);
  }, [reservas]);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias: (Date | null)[] = [];

    // Adiciona dias vazios antes do primeiro dia do mês
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null);
    }

    // Adiciona todos os dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(ano, mes, dia));
    }

    return dias;
  };

  const getEventosParaDia = (data: Date | null) => {
    if (!data) return [];
    const dataStr = data.toISOString().split('T')[0];
    return eventos.filter(e => e.data === dataStr);
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'reuniao': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'aniversario': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'deadline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'reserva': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'reuniao': return 'Reunião';
      case 'aniversario': return 'Aniversário';
      case 'deadline': return 'Prazo';
      case 'reserva': return 'Reserva';
      default: return tipo;
    }
  };

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageBanner
        title="Calendário"
        icon={<CalendarIcon size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <>
            <Button onClick={() => setReservaModalOpen(true)} variant="outline" className="flex items-center gap-2">
              <CalendarIcon size={18} />
              Reservar Sala
            </Button>
            <Button onClick={() => setNovoEventoOpen(true)} className="flex items-center gap-2">
              <Plus size={18} />
              Novo Evento
            </Button>
          </>
        )}
      />

      <Card className="p-6">
        {/* Navegação do mês */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={mesAnterior}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </h3>
          <button
            onClick={proximoMes}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-2">
          {/* Cabeçalho dos dias da semana */}
          {diasSemana.map(dia => (
            <div key={dia} className="text-center font-semibold text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 text-sm py-2">
              {dia}
            </div>
          ))}

          {/* Dias do mês */}
          {getDiasDoMes().map((data, index) => {
            const eventosNoDia = getEventosParaDia(data);
            const ehHoje = data?.toISOString().split('T')[0] === hoje;

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg ${
                  data ? 'bg-white dark:bg-slate-900 dark:bg-gray-800' : 'bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-900'
                } ${ehHoje ? 'ring-2 ring-green-500' : ''}`}
              >
                {data && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${ehHoje ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-slate-200 dark:text-gray-300'}`}>
                      {data.getDate()}
                    </div>
                    <div className="space-y-1">
                      {eventosNoDia.slice(0, 2).map(evento => (
                        <button
                          key={evento.id}
                          onClick={() => setEventoSelecionado(evento)}
                          className={`w-full text-left text-xs p-1 rounded truncate ${getCorTipo(evento.tipo)}`}
                        >
                          {evento.horaInicio} {evento.titulo}
                        </button>
                      ))}
                      {eventosNoDia.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 pl-1">
                          +{eventosNoDia.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lista de próximos eventos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CalendarIcon size={20} />
          Próximos Eventos
        </h3>
        <div className="space-y-3">
          {eventos.slice(0, 5).map(evento => (
            <button
              key={evento.id}
              onClick={() => setEventoSelecionado(evento)}
              className="w-full text-left p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{evento.titulo}</h4>
                    <Badge className={getCorTipo(evento.tipo)}>
                      {getTipoLabel(evento.tipo)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {evento.horaInicio} - {evento.horaFim}
                    </span>
                    {evento.local && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {evento.local}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Modal Novo Evento */}
      <Modal
        isOpen={novoEventoOpen}
        onClose={() => setNovoEventoOpen(false)}
        title="Novo Evento"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Título
            </label>
            <Input
              placeholder="Nome do evento"
              value={novoEvento.titulo}
              onChange={e => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
              className="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Data
              </label>
              <Input
                type="date"
                value={novoEvento.data}
                onChange={e => setNovoEvento({ ...novoEvento, data: e.target.value })}
                className="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                value={novoEvento.tipo}
                onChange={e => setNovoEvento({ ...novoEvento, tipo: e.target.value })}
              >
                <option value="reuniao">Reunião</option>
                <option value="aniversario">Aniversário</option>
                <option value="deadline">Prazo</option>
                <option value="reserva">Reserva</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Hora Início
              </label>
              <Input
                type="time"
                value={novoEvento.horaInicio}
                onChange={e => setNovoEvento({ ...novoEvento, horaInicio: e.target.value })}
                className="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Hora Fim
              </label>
              <Input
                type="time"
                value={novoEvento.horaFim}
                onChange={e => setNovoEvento({ ...novoEvento, horaFim: e.target.value })}
                className="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Local
            </label>
            <PlaceAutocomplete
              placeholder="Local do evento"
              leftIcon={<MapPin size={18} />}
              value={novoEvento.local}
              onChange={e => setNovoEvento({ ...novoEvento, local: e.target.value })}
              inputClassName="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
              onSelect={(place) => {
                // ao selecionar, preenche o campo com o nome completo do lugar
                setNovoEvento(prev => ({ ...prev, local: place.display_name }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <Input
              placeholder="Descrição do evento"
              value={novoEvento.descricao}
              onChange={e => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
              className="dark:bg-slate-950 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setNovoEventoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!novoEvento.titulo || !novoEvento.data || !novoEvento.horaInicio || !novoEvento.horaFim) return;
                setEventos(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    titulo: novoEvento.titulo,
                    data: novoEvento.data,
                    horaInicio: novoEvento.horaInicio,
                    horaFim: novoEvento.horaFim,
                    tipo: novoEvento.tipo as 'reuniao' | 'aniversario' | 'deadline' | 'reserva',
                    local: novoEvento.local,
                    participantes: [],
                    descricao: novoEvento.descricao,
                  },
                ]);
                setNovoEvento({
                  titulo: '',
                  data: '',
                  horaInicio: '',
                  horaFim: '',
                  tipo: 'reuniao',
                  local: '',
                  participantes: [],
                  descricao: '',
                });
                setNovoEventoOpen(false);
              }}
            >
              Criar Evento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalhes do Evento */}
      {eventoSelecionado && (
        <Modal
          isOpen={!!eventoSelecionado}
          onClose={() => setEventoSelecionado(null)}
          title={eventoSelecionado.titulo}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getCorTipo(eventoSelecionado.tipo)}>
                {getTipoLabel(eventoSelecionado.tipo)}
              </Badge>
            </div>
            
            <div className="space-y-3 text-gray-700 dark:text-slate-200 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <CalendarIcon size={18} className="text-gray-400 dark:text-slate-500" />
                <span>{new Date(eventoSelecionado.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-400 dark:text-slate-500" />
                <span>{eventoSelecionado.horaInicio} - {eventoSelecionado.horaFim}</span>
              </div>
              {eventoSelecionado.local && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400 dark:text-slate-500" />
                  <span>{eventoSelecionado.local}</span>
                </div>
              )}
              {eventoSelecionado.participantes && eventoSelecionado.participantes.length > 0 && (
                <div className="flex items-center gap-3">
                  <UsersIcon size={18} className="text-gray-400 dark:text-slate-500" />
                  <span>{eventoSelecionado.participantes.join(', ')}</span>
                </div>
              )}
            </div>

            {eventoSelecionado.descricao && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900/70 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-slate-200">{eventoSelecionado.descricao}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEventoSelecionado(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Reservar Sala */}
      <ReservaSalaModal
        isOpen={reservaModalOpen}
        onClose={() => setReservaModalOpen(false)}
      />
    </div>
  );
}




