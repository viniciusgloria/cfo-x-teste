import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, UserCog, Gift } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { CollaboratorCard } from '../components/CollaboratorCard';
import { Pagination } from '../components/ui/Pagination';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { useBeneficiosStore } from '../store/beneficiosStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useEffect } from 'react';
import { formatPhone, isValidCPF, isValidCNPJ } from '../utils/validation';
import toast from 'react-hot-toast';
import { useDocumentosStore } from '../store/documentosStore';
import { usePontoStore } from '../store/pontoStore';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { File, FolderOpen, Download, CheckCircle, XCircle, Clock, TrendingUp, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { Badge } from '../components/ui/Badge';
import { minutesToHHMM } from '../utils/time';

const ITEMS_PER_PAGE = 12;

export function Colaboradores() {
  usePageTitle('Colaboradores');
  const navigate = useNavigate();
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const atualizarColaborador = useColaboradoresStore((s) => s.atualizarColaborador);
  const busca = useColaboradoresStore((s) => s.busca);
  const setBusca = useColaboradoresStore((s) => s.setBusca);
  const { user } = useAuthStore();
  const { getDocumentosByColaborador, getPastasByColaborador, getDocumentosByPasta } = useDocumentosStore();
  const { registros, bancoHoras } = usePontoStore();
  const { getBeneficiosPorColaborador, getCustoTotalColaborador, beneficios: beneficiosDisponiveis } = useBeneficiosStore();
  const { solicitacoes } = useSolicitacoesStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTemp, setMetaTemp] = useState('176');
  const [currentPage, setCurrentPage] = useState(1);
  const [editandoJornada, setEditandoJornada] = useState(false);
  const [jornadaTemp, setJornadaTemp] = useState({ inicio: '09:00', fim: '18:00', intervalo: '01:00' });
  const [filtroValidacao, setFiltroValidacao] = useState<'todos' | 'incompletos' | 'validos'>('todos');

  const isColaboradorCompleto = (c: any) => {
    const cpfValido = c.cpf && isValidCPF(c.cpf.replace(/\D/g, ''));
    const cnpjValido = c.contrato === 'PJ' ? (c.cnpj && isValidCNPJ(c.cnpj.replace(/\D/g, ''))) : true;
    return cpfValido && cnpjValido;
  };

  const filtered = colaboradores
    .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter(c => {
      if (filtroValidacao === 'incompletos') return !isColaboradorCompleto(c);
      if (filtroValidacao === 'validos') return isColaboradorCompleto(c);
      return true;
    });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedColaboradores = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [activePasta, setActivePasta] = useState<any | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const podeGerenciarUsuarios = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const openProfile = (id: number) => { 
    setSelected(id); 
    setOpen(true); 
    setActiveTab('dados'); 
    const colab = colaboradores.find(c => c.id === id);
    setMetaTemp(String(colab?.metaHorasMensais || 176));
    setEditandoMeta(false);
    setJornadaTemp({
      inicio: colab?.jornadaInicio || '09:00',
      fim: colab?.jornadaFim || '18:00',
      intervalo: colab?.jornadaIntervalo || '01:00'
    });
    setEditandoJornada(false);
  };

  const sel = colaboradores.find(c => c.id === selected);
  const podeEditar = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  const salvarMeta = () => {
    if (!sel) return;
    const metaNum = parseInt(metaTemp, 10);
    if (isNaN(metaNum) || metaNum <= 0) {
      toast.error('Meta de horas inválida');
      return;
    }
    atualizarColaborador(sel.id, { metaHorasMensais: metaNum });
    setEditandoMeta(false);
    toast.success('Meta de horas atualizada!');
  };

  const salvarJornada = () => {
    if (!sel) return;
    if (!jornadaTemp.inicio || !jornadaTemp.fim) {
      toast.error('Informe o horário de início e fim da jornada');
      return;
    }
    atualizarColaborador(sel.id, {
      jornadaInicio: jornadaTemp.inicio,
      jornadaFim: jornadaTemp.fim,
      jornadaIntervalo: jornadaTemp.intervalo
    });
    setEditandoJornada(false);
    toast.success('Jornada atualizada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Colaboradores"
        icon={<UserCog size={32} />}
        right={(
          <>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-slate-400" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <Input
                className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700"
                placeholder="Buscar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </span>
            <Button variant="outline" onClick={() => { setBusca(''); }} className="px-3 py-2 text-sm whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Limpar
            </Button>
            <select
              value={filtroValidacao}
              onChange={(e) => {
                setFiltroValidacao(e.target.value as 'todos' | 'incompletos' | 'validos');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos ({colaboradores.length})</option>
              <option value="validos">Dados Completos ({colaboradores.filter(isColaboradorCompleto).length})</option>
              <option value="incompletos">Dados Incompletos ({colaboradores.filter(c => !isColaboradorCompleto(c)).length})</option>
            </select>
            {podeGerenciarUsuarios && (
              <Button onClick={() => navigate('/colaboradores/cadastro')} className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <Plus size={18} />
                Novo Colaborador
              </Button>
            )}
          </>
        )}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedColaboradores.map(c => (
              <CollaboratorCard 
                key={c.id} 
                nome={c.nome} 
                cargo={c.cargo} 
                departamento={c.departamento} 
                avatar={c.avatar} 
                cpf={c.cpf}
                cnpj={c.cnpj}
                contrato={c.contrato}
                onOpen={() => openProfile(c.id)} 
              />
            ))}
          </div>
          
          {filtered.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={sel ? sel.nome : 'Perfil'}>
        {sel && (
          <div>
            <Tabs tabs={[{ id: 'dados', label: 'Dados' }, { id: 'jornada', label: 'Jornada' }, { id: 'beneficios', label: 'Benefícios' }, { id: 'documentos', label: 'Documentos' }, { id: 'ferias', label: 'Férias' }, { id: 'ponto', label: 'Ponto' }]} activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'dados' && (
                <div className="space-y-3">
                  <p className="text-sm"><strong>Email:</strong> {sel.email}</p>
                  <p className="text-sm"><strong>Telefone:</strong> {sel.telefone ? formatPhone(sel.telefone) : '—'}</p>
                  <p className="text-sm"><strong>Departamento:</strong> {sel.departamento}</p>
                  <p className="text-sm"><strong>Cargo:</strong> {sel.cargo}</p>
                  
                  {podeEditar && (
                    <>
                      <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Meta de Horas Mensais</label>
                        {editandoMeta ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={metaTemp}
                              onChange={(e) => setMetaTemp(e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-gray-600 dark:text-slate-300">horas/mês</span>
                            <Button onClick={salvarMeta} className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                              <CheckCircle size={14} />
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setEditandoMeta(false)} className="flex items-center gap-2 whitespace-nowrap text-sm">
                              <XCircle size={14} />
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm"><strong>{sel.metaHorasMensais || 176}h/mês</strong></p>
                            <Button variant="outline" onClick={() => setEditandoMeta(true)} className="flex items-center gap-2 whitespace-nowrap text-sm">
                              <Edit size={14} />
                              Editar
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                        <Button 
                          onClick={() => navigate(`/colaboradores/cadastro?id=${sel.id}`)} 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2"
                        >
                          <Edit size={16} />
                          Editar Dados Completos
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'beneficios' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Benefícios vinculados a este colaborador. Alterações na página Benefícios refletem automaticamente aqui.
                    </p>
                  </div>

                  {(() => {
                    const beneficiosColaborador = getBeneficiosPorColaborador(String(sel.id));
                    const custoTotal = getCustoTotalColaborador(String(sel.id));
                    
                    return (
                      <>
                        <div className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Gift className="h-5 w-5 text-emerald-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300">Custo Total Mensal</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Benefícios ativos</p>
                              </div>
                            </div>
                            <p className="text-xl font-bold text-emerald-600">
                              R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {beneficiosColaborador.length === 0 ? (
                          <div className="text-center py-8">
                            <Gift className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Nenhum benefício vinculado</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Acesse a página Benefícios para vincular</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {beneficiosColaborador.map((bc) => {
                              const beneficio = beneficiosDisponiveis.find(b => b.id === bc.beneficioId);
                              if (!beneficio) return null;
                              
                              return (
                                <div key={bc.id} className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{beneficio.nome}</h4>
                                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{beneficio.descricao}</p>
                                    </div>
                                    <Badge variant={bc.status === 'ativo' ? 'success' : bc.status === 'suspenso' ? 'warning' : 'error'}>
                                      {bc.status === 'ativo' ? 'Ativo' : bc.status === 'suspenso' ? 'Suspenso' : 'Cancelado'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 dark:border-gray-700">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-slate-400">Empresa</p>
                                      <p className="text-sm font-medium text-emerald-600">
                                        R$ {bc.valorEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-slate-400">Colaborador</p>
                                      <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                                        R$ {bc.valorColaborador.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {beneficio.fornecedor !== 'manual' && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 dark:border-gray-700">
                                      <p className="text-xs text-gray-500 dark:text-slate-400">
                                        <strong>Fornecedor:</strong> {beneficio.fornecedor.toUpperCase()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="mt-2 text-xs text-gray-400 dark:text-slate-500">
                                    Vinculado em: {new Date(bc.criadoEm).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700 dark:border-gray-700">
                          <Button 
                            onClick={() => navigate('/beneficios')} 
                            variant="outline" 
                            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Gift size={16} />
                            Gerenciar Benefícios
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              {activeTab === 'jornada' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Configure a jornada de trabalho personalizada para este colaborador. Se não configurado, será usado o padrão (09:00 - 18:00 com 1h de intervalo).
                    </p>
                  </div>

                  {editandoJornada ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                          Início da Jornada
                        </label>
                        <Input
                          type="time"
                          value={jornadaTemp.inicio}
                          onChange={(e) => setJornadaTemp({ ...jornadaTemp, inicio: e.target.value })}
                        />
                      </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={salvarJornada} className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2">
                            <CheckCircle size={14} />
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setEditandoJornada(false)} className="flex items-center gap-2 whitespace-nowrap">
                            <XCircle size={14} />
                            Cancelar
                          </Button>
                        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                          Fim da Jornada
                        </label>
                        <Input
                          type="time"
                          value={jornadaTemp.fim}
                          onChange={(e) => setJornadaTemp({ ...jornadaTemp, fim: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                          Intervalo (hh:mm)
                        </label>
                        <Input
                          type="time"
                          value={jornadaTemp.intervalo}
                          onChange={(e) => setJornadaTemp({ ...jornadaTemp, intervalo: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={salvarJornada} className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                          <CheckCircle size={14} />
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={() => setEditandoJornada(false)} className="flex items-center gap-2 whitespace-nowrap">
                          <XCircle size={14} />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">Início</p>
                          <p className="text-sm font-medium">{sel.jornadaInicio || '09:00'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">Fim</p>
                          <p className="text-sm font-medium">{sel.jornadaFim || '18:00'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">Intervalo</p>
                          <p className="text-sm font-medium">{sel.jornadaIntervalo || '01:00'}</p>
                        </div>
                      </div>
                      {podeEditar && (
                        <Button variant="outline" onClick={() => setEditandoJornada(true)} className="w-full flex items-center justify-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2">
                          <Edit size={16} className="mr-2" />
                          Editar Jornada
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'documentos' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Documentos organizados do colaborador. Para gerenciamento completo, acesse a página Documentos.
                    </p>
                  </div>

                  {(() => {
                    const pastas = getPastasByColaborador(sel.id);
                    const docs = getDocumentosByColaborador(sel.id);

                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case 'aprovado':
                          return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Aprovado</Badge>;
                        case 'rejeitado':
                          return <Badge variant="error"><XCircle size={12} className="mr-1" />Rejeitado</Badge>;
                        default:
                          return <Badge variant="warning"><Clock size={12} className="mr-1" />Pendente</Badge>;
                      }
                    };

                    if (showAllDocs) {
                      // Full in-modal document browser
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => { setShowAllDocs(false); setActivePasta(null); }} className="flex items-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2">
                              <ChevronLeft size={16} />
                              Voltar
                            </Button>
                            <h4 className="text-lg font-semibold">Documentos de {sel.nome}</h4>
                          </div>

                          {activePasta ? (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <FolderOpen size={18} style={{ color: activePasta.cor }} />
                                <h5 className="font-medium">{activePasta.nome}</h5>
                              </div>
                              <div className="space-y-2">
                                {getDocumentosByPasta(activePasta.id).map((d) => (
                                  <div key={d.id} className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <File size={18} className="text-emerald-600" />
                                      <div className="truncate">
                                        <button onClick={() => { if (d.url) { setPreviewDoc(d); setPreviewOpen(true); } else { toast.error('Pré-visualização indisponível'); } }} className="text-left">
                                          <p className="text-sm font-medium truncate">{d.nome}</p>
                                          <p className="text-xs text-gray-500 dark:text-slate-400">{d.tipo}</p>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(d.status)}
                                      <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap" onClick={() => {
                                        if (d.url) {
                                          const a = document.createElement('a');
                                          a.href = d.url;
                                          a.download = d.nome;
                                          a.target = '_blank';
                                          document.body.appendChild(a);
                                          a.click();
                                          a.remove();
                                        } else {
                                          toast.error('Arquivo não disponível para download');
                                        }
                                      }}>
                                        <Download size={14} />
                                        Baixar
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {pastas.map((p) => (
                                <div key={p.id} className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <FolderOpen size={18} style={{ color: p.cor }} />
                                      <div>
                                        <p className="font-medium">{p.nome}</p>
                                        {p.descricao && <p className="text-xs text-gray-500 dark:text-slate-400">{p.descricao}</p>}
                                      </div>
                                    </div>
                                    <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap" onClick={() => setActivePasta(p)}>
                                      Abrir
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {getDocumentosByPasta(p.id).map((d) => (
                                      <div key={d.id} className="flex items-center justify-between p-2 rounded border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <File size={16} className="text-emerald-600" />
                                          <div className="truncate">
                                            <p className="text-sm truncate">{d.nome}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{d.tipo}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(d.status)}
                                          <Button variant="outline" onClick={() => { /* download */ }} className="flex items-center gap-2 whitespace-nowrap">
                                            <Download size={14} />
                                            Baixar
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (pastas.length === 0 && docs.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                          <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Nenhum documento cadastrado</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {/* Pastas */}
                        {pastas.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">Pastas</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {pastas.map((pasta) => (
                                <div
                                  key={pasta.id}
                                  className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 cursor-pointer"
                                  onClick={() => { setActivePasta(pasta); setShowAllDocs(true); }}
                                >
                                  <div className="flex items-center gap-2">
                                    <FolderOpen size={20} style={{ color: pasta.cor }} />
                                    <span className="text-sm font-medium truncate">{pasta.nome}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documentos */}
                        {docs.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                              Documentos Recentes ({docs.length})
                            </h4>
                            <div className="space-y-2">
                              {docs.slice(0, 5).map((doc) => (
                                <div
                                  key={doc.id}
                                  className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                      <File size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.nome}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">{doc.tipo}</p>
                                      </div>
                                    </div>
                                    {getStatusBadge(doc.status)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => { setActivePasta(null); setShowAllDocs(true); }}
                          className="w-full mt-4 flex items-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2"
                        >
                          <FolderOpen size={16} className="mr-2 text-emerald-600" />
                          Ver Todos os Documentos
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeTab === 'ferias' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                          Histórico de férias e solicitações do colaborador.
                        </p>
                      </div>

                  {(() => {
                    const solicitacoesFerias = solicitacoes.filter(
                      s => s.tipo === 'ferias' && s.solicitante.nome === sel.nome
                    );

                    if (solicitacoesFerias.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                          <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Nenhuma solicitação de férias registrada</p>
                        </div>
                      );
                    }

                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case 'aprovada':
                          return <Badge variant="success">Aprovada</Badge>;
                        case 'rejeitada':
                          return <Badge variant="error">Rejeitada</Badge>;
                        default:
                          return <Badge variant="warning">Pendente</Badge>;
                      }
                    };

                    return (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                          Solicitações de Férias ({solicitacoesFerias.length})
                        </h4>
                        {solicitacoesFerias.map((sol) => (
                          <div
                            key={sol.id}
                            className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{sol.titulo}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">{sol.descricao}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">Data: {sol.data}</p>
                              </div>
                              {getStatusBadge(sol.status)}
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => navigate('/solicitacoes')}
                          className="w-full flex items-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2"
                        >
                          <CalendarIcon size={16} className="mr-2 text-emerald-600" />
                          Ver Todas as Solicitações
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeTab === 'ponto' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Resumo do ponto do colaborador. Para visualização completa, acesse a página de Ponto.
                    </p>
                  </div>

                  {(() => {
                    // Pegar últimos 5 registros
                    const ultimosRegistros = registros.slice(0, 5);

                    return (
                      <div className="space-y-4">
                        {/* Card de Banco de Horas */}
                        <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Banco de Horas</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {bancoHoras || '+00:00'}
                              </p>
                            </div>
                            <TrendingUp size={32} className="text-emerald-600" />
                          </div>
                        </div>

                        {/* Meta de Horas */}
                        <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Meta Mensal</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {sel.metaHorasMensais || 176}h
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Média Diária</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {minutesToHHMM(Math.round(((sel.metaHorasMensais || 176) * 60) / 22))}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Últimos Registros */}
                        {ultimosRegistros.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                              Últimos Registros
                            </h4>
                            <div className="space-y-2">
                              {ultimosRegistros.map((reg, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">{reg.data}</p>
                                    <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                                      {reg.totalMinutos ? minutesToHHMM(reg.totalMinutos) : '—'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {reg.punches.map((punch, pIndex) => (
                                      <Badge key={pIndex} variant="outline" className="text-xs">
                                        {punch.type === 'entrada' && '⏰ Entrada'}
                                        {punch.type === 'saida' && '🚪 Saída'}
                                        {punch.type === 'inicio_intervalo' && '☕ Início'}
                                        {punch.type === 'fim_intervalo' && '▶️ Retorno'}
                                        : {punch.hhmm}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ultimosRegistros.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                            <Clock size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Nenhum registro de ponto encontrado</p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => navigate('/ponto')}
                          className="w-full flex items-center gap-2 whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2"
                        >
                          <Clock size={16} className="mr-2 text-emerald-600" />
                          Ver Histórico Completo
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </Tabs>
          </div>
        )}
      </Modal>
      {previewOpen && previewDoc && (
        <PDFViewerModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          documentUrl={previewDoc.url}
          documentName={previewDoc.nome}
        />
      )}
    </div>
  );
}





