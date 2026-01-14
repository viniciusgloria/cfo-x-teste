import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { Search, RefreshCw, Filter, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Eye, Trash2, Check, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageBanner } from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { useClientesStore } from '../store/clientesStore';
import { useAuthStore } from '../store/authStore';

export function Clientes() {
  usePageTitle('Clientes');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clientes, filtroStatus, busca, setFiltroStatus, setBusca, removerCliente, aprovarCadastro, rejeitarCadastro, fetchClientes, deleteClienteAPI, isLoading: storeLoading } = useClientesStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const isAdminOrGestor = user?.role === 'admin' || user?.role === 'gestor';

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Carregar clientes da API ao montar o componente
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const clientesFiltrados = clientes.filter(cliente => {
    const matchStatus = filtroStatus === 'Todos' || cliente.status === filtroStatus.toLowerCase();
    const matchBusca = cliente.dadosGerais?.nome?.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  // Cálculos de paginação
  const totalItems = clientesFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

  // Reset para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroStatus, busca]);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toRejectId, setToRejectId] = useState<number | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast.success('Sincronização com OMIE concluída (mock)');
    setIsSyncing(false);
    setIsLoading(false);
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setIsConfirmOpen(true);
  };

  const doDelete = async () => {
    if (toDeleteId == null) return;
    try {
      await deleteClienteAPI(toDeleteId);
      setIsConfirmOpen(false);
      setToDeleteId(null);
    } catch (error) {
      // Erro já tratado no store
    }
  };

  const handleApprove = (id: number) => {
    aprovarCadastro(id, user?.id || 'sistema');
    toast.success('Cadastro aprovado!');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }
    if (toRejectId == null) return;
    rejeitarCadastro(toRejectId, rejectionReason);
    toast.success('Cadastro rejeitado e cliente notificado');
    setShowRejectModal(false);
    setRejectionReason('');
    setToRejectId(null);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      rascunho: { colors: 'bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200', label: 'Rascunho', icon: '📝' },
      pendente: { colors: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: '⏳' },
      aprovado: { colors: 'bg-green-100 text-green-800', label: 'Aprovado', icon: '✅' },
      rejeitado: { colors: 'bg-red-100 text-red-800', label: 'Rejeitado', icon: '❌' },
      devolvido: { colors: 'bg-orange-100 text-orange-800', label: 'Devolvido', icon: '🔄' },
      ativo: { colors: 'bg-green-100 text-green-800', label: 'Ativo', icon: '🟢' },
      pausado: { colors: 'bg-yellow-100 text-yellow-800', label: 'Pausado', icon: '⏸️' },
      encerrado: { colors: 'bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200', label: 'Encerrado', icon: '🔚' }
    };
    return config[status as keyof typeof config] || config.rascunho;
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Clientes"
        icon={<Users size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 rounded-md">
                <Search size={16} className="text-gray-500 dark:text-slate-200" />
                <Input
                  className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Buscar cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <div className="flex items-center gap-1">
                  <Filter size={16} className="text-gray-500 dark:text-slate-200" />
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option>Todos</option>
                    {isAdminOrGestor && (
                      <>
                        <option value="rascunho">Rascunho</option>
                        <option value="pendente">Pendente</option>
                        <option value="devolvido">Devolvido</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </>
                    )}
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => navigate('/cadastro-cliente')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus size={18} />
                Novo Cliente
              </Button>
            </div>
          </>
        )}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i}><div className="animate-pulse bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-64" /></div>
          ))}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 dark:text-slate-300 mb-4">Nenhum cliente encontrado.</p>
          <div className="inline-block">
            <Button onClick={() => navigate('/cadastro-cliente')} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <Plus size={18} />
              Cadastrar Cliente
            </Button>
          </div>
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesPaginados.map((cliente) => {
            const badgeInfo = getStatusBadge(cliente.status);
            const nomeEmpresa = cliente.dadosGerais?.nome || 'Sem nome';
            const cnpj = cliente.dadosGerais?.cnpj || '';
            const email = cliente.contatosPrincipais?.emailPrincipal || '';
            const tel = cliente.contatosPrincipais?.telefone || '';
            
            return (
              <Card key={cliente.id} className="p-6 hover:shadow-lg transition-shadow space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 line-clamp-2">{nomeEmpresa}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">CNPJ: {cnpj}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${badgeInfo.colors}`}>
                    {badgeInfo.label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-slate-300">Contato Principal</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100">{cliente.contatosPrincipais?.nomeSocio || '-'}</p>
                  </div>
                  {email && <p className="text-xs text-gray-600 dark:text-slate-200 truncate">{email}</p>}
                  {tel && <p className="text-xs text-gray-600 dark:text-slate-200">{tel}</p>}
                </div>

                {/* Serviços */}
                {cliente.servicosContratados && (
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-600 dark:text-slate-200 mb-2 font-medium">Serviços</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        cliente.servicosContratados.bpoFinanceiro && 'BPO Fin.',
                        cliente.servicosContratados.assessoriaFinanceira && 'Assessoria',
                        cliente.servicosContratados.contabilidade && 'Contab.',
                        cliente.servicosContratados.juridicoContratual && 'Jurídico'
                      ].filter(Boolean).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Submissão/Aprovação */}
                {cliente.dataSubmissao && (
                  <p className="text-xs text-gray-500 dark:text-slate-300 pt-2 border-t border-gray-200 dark:border-slate-700">
                    Enviado em {new Date(cliente.dataSubmissao).toLocaleDateString()}
                  </p>
                )}

                {/* Motivo Rejeição */}
                {cliente.status === 'rejeitado' && cliente.motivoRejeicao && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700"><strong>Motivo:</strong> {cliente.motivoRejeicao}</p>
                  </div>
                )}

                {/* Comentários Devolução */}
                {cliente.status === 'devolvido' && cliente.comentariosDevolucao && (
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <p className="text-xs text-orange-700"><strong>Correções necessárias:</strong> {cliente.comentariosDevolucao}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/cadastro-cliente?id=${cliente.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm dark:text-slate-100"
                  >
                    <Eye size={16} />
                    Visualizar
                  </Button>

                  {isAdminOrGestor && cliente.status === 'pendente' && (
                    <>
                      <Button
                        onClick={() => handleApprove(cliente.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <Check size={16} />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => { setToRejectId(cliente.id); setShowRejectModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <X size={16} />
                        Rejeitar
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => confirmDelete(cliente.id)}
                    className="flex items-center justify-center gap-1 text-red-600 hover:text-red-700 border-red-200"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="text-sm text-gray-600 dark:text-slate-200">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} clientes
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="Primeira página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex gap-1">
                          {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-slate-300">...</span>}
                          <Button
                            variant={currentPage === page ? "primary" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
        </>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => doDelete()} 
        title="Remover cliente"
      />

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Rejeitar Cadastro</h3>
            <textarea 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)} 
              placeholder="Motivo da rejeição..." 
              rows={4} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleReject} 
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Rejeitar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setShowRejectModal(false); setRejectionReason(''); setToRejectId(null); }} 
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}





