import { useState } from 'react';
import { Bell, Settings, Plus, Download, Calendar, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { LembretesPanel } from '../components/LembretesPanel';
import { useLembretesStore, TipoLembrete, PrioridadeLembrete } from '../store/lembretesStore';
import toast from 'react-hot-toast';

const tiposLembrete: { value: TipoLembrete; label: string }[] = [
  { value: 'contrato_experiencia', label: 'Contrato de Experiência' },
  { value: 'ferias_vencendo', label: 'Férias Vencendo' },
  { value: 'ferias_periodo', label: 'Período de Férias' },
  { value: 'documento_vencendo', label: 'Documento Vencendo' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'avaliacao_desempenho', label: 'Avaliação de Desempenho' },
  { value: 'contrato_vencendo', label: 'Contrato Vencendo' },
  { value: 'outro', label: 'Outro' },
];

const prioridadesLembrete: { value: PrioridadeLembrete; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

export function Lembretes() {
  const {
    lembretes,
    configuracoes,
    adicionarLembrete,
    atualizarConfiguracoes,
    limparLembretesAntigos,
    getLembretesPendentes,
    gerarLembretesAutomaticos,
  } = useLembretesStore();

  const [modalNovo, setModalNovo] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  const [novoLembrete, setNovoLembrete] = useState({
    tipo: 'outro' as TipoLembrete,
    prioridade: 'media' as PrioridadeLembrete,
    titulo: '',
    descricao: '',
    dataEvento: '',
    colaboradorId: '',
    colaboradorNome: '',
  });

  const [configForm, setConfigForm] = useState(configuracoes);

  const lembretesPendentes = getLembretesPendentes();
  const lembretesHistorico = lembretes.filter((l) => l.status === 'concluido' || l.status === 'dispensado');

  // Estatísticas
  const stats = {
    total: lembretes.length,
    pendentes: lembretes.filter((l) => l.status === 'pendente').length,
    visualizados: lembretes.filter((l) => l.status === 'visualizado').length,
    concluidos: lembretes.filter((l) => l.status === 'concluido').length,
    alta: lembretes.filter((l) => l.prioridade === 'alta' && (l.status === 'pendente' || l.status === 'visualizado')).length,
    media: lembretes.filter((l) => l.prioridade === 'media' && (l.status === 'pendente' || l.status === 'visualizado')).length,
    baixa: lembretes.filter((l) => l.prioridade === 'baixa' && (l.status === 'pendente' || l.status === 'visualizado')).length,
  };

  const handleCriarLembrete = () => {
    if (!novoLembrete.titulo || !novoLembrete.descricao || !novoLembrete.dataEvento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    adicionarLembrete({
      ...novoLembrete,
      status: 'pendente',
    });

    toast.success('Lembrete criado com sucesso!');
    setModalNovo(false);
    setNovoLembrete({
      tipo: 'outro',
      prioridade: 'media',
      titulo: '',
      descricao: '',
      dataEvento: '',
      colaboradorId: '',
      colaboradorNome: '',
    });
  };

  const handleSalvarConfiguracoes = () => {
    atualizarConfiguracoes(configForm);
    toast.success('Configurações atualizadas!');
    setModalConfig(false);
  };

  const handleAtualizar = () => {
    gerarLembretesAutomaticos();
    toast.success('Lembretes atualizados!');
  };

  const handleLimparAntigos = () => {
    limparLembretesAntigos(90); // Limpar lembretes mais antigos que 90 dias
    toast.success('Lembretes antigos removidos!');
  };

  const exportarCSV = () => {
    const headers = 'Tipo,Prioridade,Status,Título,Descrição,Colaborador,Data Evento,Data Lembrete\n';
    const rows = lembretes.map((l) =>
      `"${l.tipo}","${l.prioridade}","${l.status}","${l.titulo}","${l.descricao}","${l.colaboradorNome || ''}","${l.dataEvento}","${l.dataLembrete}"`
    ).join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lembretes-rh-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Relatório exportado!');
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Lembretes de RH"
        icon={<Bell size={32} />}
        right={
          <>
            <Button variant="outline" onClick={handleAtualizar}>
              <Calendar size={18} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportarCSV}>
              <Download size={18} />
              Exportar
            </Button>
            <Button variant="outline" onClick={() => setModalConfig(true)}>
              <Settings size={18} />
              Configurações
            </Button>
            <Button onClick={() => setModalNovo(true)}>
              <Plus size={18} />
              Novo Lembrete
            </Button>
          </>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendentes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Visualizados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.visualizados}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Concluídos</p>
          <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Alta</p>
          <p className="text-2xl font-bold text-red-600">{stats.alta}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Média</p>
          <p className="text-2xl font-bold text-orange-600">{stats.media}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Baixa</p>
          <p className="text-2xl font-bold text-blue-600">{stats.baixa}</p>
        </Card>
      </div>

      {/* Toggle Histórico */}
      <div className="flex items-center gap-2">
        <Button
          variant={!mostrarHistorico ? 'primary' : 'outline'}
          onClick={() => setMostrarHistorico(false)}
        >
          <Filter size={18} />
          Pendentes ({lembretesPendentes.length})
        </Button>
        <Button
          variant={mostrarHistorico ? 'primary' : 'outline'}
          onClick={() => setMostrarHistorico(true)}
        >
          <CheckCircle size={18} />
          Histórico ({lembretesHistorico.length})
        </Button>
      </div>

      {/* Lista de Lembretes */}
      {!mostrarHistorico ? (
        <LembretesPanel mostrarTodos={true} limite={0} />
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Histórico de Lembretes
          </h3>
          {lembretesHistorico.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 py-8">
              Nenhum lembrete no histórico
            </p>
          ) : (
            <div className="space-y-3">
              {lembretesHistorico.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg opacity-60"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                        {lembrete.titulo}
                      </h4>
                      <Badge>
                        {lembrete.status === 'concluido' ? (
                          <><CheckCircle size={12} /> Concluído</>
                        ) : (
                          <><XCircle size={12} /> Dispensado</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                      {lembrete.descricao}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-500 dark:text-slate-400 mt-2">
                      Data evento: {new Date(lembrete.dataEvento).toLocaleDateString('pt-BR')}
                      {lembrete.dataConclusao && ` • Concluído em: ${new Date(lembrete.dataConclusao).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal Novo Lembrete */}
      <Modal
        isOpen={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Novo Lembrete"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                value={novoLembrete.tipo}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, tipo: e.target.value as TipoLembrete })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {tiposLembrete.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Prioridade *
              </label>
              <select
                value={novoLembrete.prioridade}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, prioridade: e.target.value as PrioridadeLembrete })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {prioridadesLembrete.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={novoLembrete.titulo}
              onChange={(e) => setNovoLembrete({ ...novoLembrete, titulo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Renovação de contrato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              value={novoLembrete.descricao}
              onChange={(e) => setNovoLembrete({ ...novoLembrete, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
              placeholder="Descreva o lembrete..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Data do Evento *
              </label>
              <input
                type="date"
                value={novoLembrete.dataEvento}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, dataEvento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                Nome do Colaborador
              </label>
              <input
                type="text"
                value={novoLembrete.colaboradorNome}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, colaboradorNome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalNovo(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarLembrete}>Criar Lembrete</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Configurações */}
      <Modal
        isOpen={modalConfig}
        onClose={() => setModalConfig(false)}
        title="Configurações de Lembretes"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-4">
            Configure quantos dias antes dos eventos você deseja ser alertado.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Dias antes - Contrato de Experiência
            </label>
            <input
              type="number"
              value={configForm.diasAntesContratoExperiencia}
              onChange={(e) => setConfigForm({ ...configForm, diasAntesContratoExperiencia: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min="1"
              max="90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Dias antes - Férias
            </label>
            <input
              type="number"
              value={configForm.diasAntesFerias}
              onChange={(e) => setConfigForm({ ...configForm, diasAntesFerias: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min="1"
              max="90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Dias antes - Documentos
            </label>
            <input
              type="number"
              value={configForm.diasAntesDocumento}
              onChange={(e) => setConfigForm({ ...configForm, diasAntesDocumento: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min="1"
              max="90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Dias antes - Aniversários
            </label>
            <input
              type="number"
              value={configForm.diasAntesAniversario}
              onChange={(e) => setConfigForm({ ...configForm, diasAntesAniversario: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min="0"
              max="30"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notificarAniversarios"
              checked={configForm.notificarAniversarios}
              onChange={(e) => setConfigForm({ ...configForm, notificarAniversarios: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="notificarAniversarios" className="text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">
              Notificar aniversários de colaboradores
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notificarFerias"
              checked={configForm.notificarFerias}
              onChange={(e) => setConfigForm({ ...configForm, notificarFerias: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="notificarFerias" className="text-sm text-gray-700 dark:text-slate-200 dark:text-gray-300">
              Notificar períodos de férias
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 dark:border-gray-700">
            <Button variant="outline" onClick={handleLimparAntigos} className="w-full mb-3">
              Limpar Lembretes Antigos (90+ dias)
            </Button>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarConfiguracoes}>Salvar Configurações</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}





