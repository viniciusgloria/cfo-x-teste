import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Clock, CheckCircle, XCircle, Paperclip, ImageIcon, X, ClipboardCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ApprovarSolicitacaoModal } from '../components/ApprovarSolicitacaoModal';
import { Avatar } from '../components/Avatar';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { useAuthStore } from '../store/authStore';
import { usePontoStore } from '../store/pontoStore';
import { useNotificacoesStore } from '../store/notificacoesStore';
import toast from 'react-hot-toast';
import { Attachment } from '../types';

const tipoLabel = { ajuste: 'Ajuste de Ponto', atestado: 'Atestado Médico' };
const alvoLabel = { entrada: 'Entrada', saida: 'Saída' };

export function SolicitacoesPonto() {
  usePageTitle('Aprovações de Ponto');
  const [activeTab, setActiveTab] = useState('todas');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [approvarOpen, setApprovarOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'aprovar' | 'rejeitar'>('aprovar');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const { solicitacoes, atualizarStatus } = useAjustesPontoStore();
  const { user } = useAuthStore();
  const { aplicarAjusteAprovado } = usePontoStore();
  const { adicionarNotificacao } = useNotificacoesStore();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const isAprovador = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  const tabs = [
    { id: 'todas', label: 'Todas', count: solicitacoes.length },
    { id: 'pendentes', label: 'Pendentes', count: solicitacoes.filter(s => s.status === 'pendente').length },
    { id: 'historico', label: 'Histórico', count: solicitacoes.filter(s => s.status !== 'pendente').length }
  ];

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (activeTab === 'pendentes') return s.status === 'pendente';
    if (activeTab === 'historico') return s.status !== 'pendente';
    return true;
  });

  // Cálculos de paginação
  const totalItems = solicitacoesFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const solicitacoesPaginadas = solicitacoesFiltradas.slice(startIndex, endIndex);

  // Reset para página 1 quando aba muda
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleAprovar = (id: string) => {
    setActionId(id);
    setActionType('aprovar');
    setApprovarOpen(true);
  };

  const handleRejeitar = (id: string) => {
    setActionId(id);
    setActionType('rejeitar');
    setConfirmOpen(true);
  };

  const confirmAction = (reason?: string) => {
    if (!actionId || !user) return;
    // This confirmAction is used for rejection only in the current flow
    if (actionType === 'rejeitar') {
      const status = 'rejeitada';
      const decididoPor = { id: user.id, name: user.name, role: user.role };
      atualizarStatus(actionId, status, decididoPor);
      // add notification to requester
      try {
        useNotificacoesStore.getState().adicionarNotificacao({
          tipo: 'solicitacao_rejeitada',
          titulo: 'Solicitação de Ponto Rejeitada',
          mensagem: `Sua solicitação foi rejeitada.`,
          link: '/solicitacoes',
          icone: 'XCircle',
          cor: 'text-red-600',
        });
      } catch (e) {}
      toast.error(`Solicitação rejeitada${reason ? `: ${reason}` : ''}`);
      setConfirmOpen(false);
      setActionId(null);
    }
  };

  const handleApproveConfirmed = (id: string, horarioFinal?: string, observacao?: string) => {
    if (!id || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    // apply ajustment if needed
    const sol = solicitacoes.find((s) => s.id === id);
    if (sol) {
      if (sol.tipo === 'ajuste' && horarioFinal) {
        aplicarAjusteAprovado({ data: sol.data, alvo: sol.alvo, horarioNovo: horarioFinal });
      }
      atualizarStatus(id, 'aprovada', decididoPor);
      try {
        adicionarNotificacao({
          tipo: 'ajuste_ponto_aprovado',
          titulo: 'Solicitação atendida',
          mensagem: `Sua solicitação foi aprovada e os dados foram atualizados.`,
          link: '/ponto',
          icone: 'CheckCircle',
          cor: 'text-green-600',
        });
      } catch (e) {}
      // simulate email send (console log)
      console.log(`Email enviado para ${sol.colaboradorEmail}: Solicitação aprovada`);
    }
    setApprovarOpen(false);
    setActionId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0 || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    selectedIds.forEach((id) => atualizarStatus(id, 'aprovada', decididoPor));
    toast.success(`${selectedIds.length} solicitações aprovadas`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0 || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    selectedIds.forEach((id) => atualizarStatus(id, 'rejeitada', decididoPor));
    toast.error(`${selectedIds.length} solicitações rejeitadas`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Aprovações de Ponto"
        icon={<ClipboardCheck size={32} />}
        right={isAprovador && selectedIds.length > 0 ? (
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg dark:bg-transparent">
            <span className="text-sm text-gray-700 dark:text-slate-200 dark:text-white">{selectedIds.length} selecionada(s)</span>
            <div className="flex gap-2">
              <Button onClick={handleBulkApprove} className="text-sm">Aprovar</Button>
              <Button onClick={handleBulkReject} variant="outline" className="text-sm border-red-300 text-red-600">Rejeitar</Button>
            </div>
          </div>
        ) : undefined}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : solicitacoesFiltradas.length === 0 ? (
          <EmptyState 
            title="Nenhuma solicitação" 
            description={activeTab === 'pendentes' ? 'Não há solicitações pendentes no momento.' : 'Não há solicitações para exibir.'} 
          />
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {solicitacoesPaginadas.map((sol) => (
              <Card key={sol.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isAprovador && sol.status === 'pendente' && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sol.id)}
                        onChange={() => toggleSelect(sol.id)}
                        aria-label={`Selecionar solicitação de ${sol.colaboradorNome}`}
                      />
                    )}
                    <Badge variant={sol.tipo === 'ajuste' ? 'material' : 'ferias'}>
                      {tipoLabel[sol.tipo]}
                    </Badge>
                  </div>
                  <Badge variant={sol.status}>
                    {sol.status === 'pendente' ? 'Pendente' : sol.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sol.colaboradorNome}`} 
                    alt={sol.colaboradorNome} 
                    size="md" 
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{sol.colaboradorNome}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{sol.colaboradorEmail}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                    <Clock size={14} />
                    <span>Data: <strong>{sol.data}</strong></span>
                  </div>
                  
                  {sol.tipo === 'ajuste' && (
                    <div className="pl-5 text-gray-700 dark:text-slate-200">
                      <p>Alvo: <strong>{alvoLabel[sol.alvo!]}</strong></p>
                      <p>Horário: <strong>{sol.horarioNovo}</strong></p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Motivo/Justificativa:</p>
                  <p className="text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap bg-gray-50 dark:bg-slate-900/50 p-2 rounded">{sol.motivo}</p>
                </div>

                {sol.anexos && sol.anexos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Anexos:</p>
                    <div className="flex flex-wrap gap-2">
                      {sol.anexos.map((a) => {
                        const isImage = a.mimeType.startsWith('image/');
                        return (
                          <div key={a.id} className="flex items-center gap-2 rounded border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-2 py-1 text-xs text-gray-600 dark:text-slate-300">
                            {isImage ? (
                              <button
                                type="button"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                onClick={() => setPreviewAttachment(a)}
                              >
                                <ImageIcon size={14} />
                                <span className="truncate max-w-[120px]" title={a.name}>{a.name}</span>
                              </button>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Paperclip size={14} />
                                <span className="truncate max-w-[120px]" title={a.name}>{a.name}</span>
                              </span>
                            )}
                            <a href={a.dataUrl} download={a.name} className="text-blue-600 underline">baixar</a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sol.decididoPor && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-900/50 rounded text-xs text-gray-600 dark:text-slate-300">
                    <p>
                      {sol.status === 'aprovada' ? '✓ Aprovada' : '✗ Rejeitada'} por{' '}
                      <strong>{sol.decididoPor.name}</strong> ({sol.decididoPor.role})
                    </p>
                    <p className="mt-1">{new Date(sol.decididoEm!).toLocaleString('pt-BR')}</p>
                  </div>
                )}

                {sol.status === 'pendente' && isAprovador && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Button
                      variant="primary"
                      onClick={() => handleAprovar(sol.id)}
                      className="flex-1 text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejeitar(sol.id)}
                      className="flex-1 text-sm border-red-300 text-red-600 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <Card className="mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} solicitações
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="dark:text-white"
                    aria-label="Primeira página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="dark:text-white"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && (
                              <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "primary" : "outline"}
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? "" : "dark:text-white"}
                              aria-label={`Página ${page}`}
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
                    className="dark:text-white"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="dark:text-white"
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
      </Tabs>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={actionType === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar rejeição'}
      />

      <ApprovarSolicitacaoModal
        isOpen={approvarOpen}
        onClose={() => setApprovarOpen(false)}
        solicitacao={actionId ? solicitacoes.find((s) => s.id === actionId) ?? null : null}
        onConfirm={(horario, obs) => {
          if (actionId) handleApproveConfirmed(actionId, horario, obs);
        }}
      />

      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-12 right-0 rounded-full bg-white/80 p-2 text-gray-700 dark:text-slate-200 hover:bg-white dark:bg-slate-900"
              onClick={() => setPreviewAttachment(null)}
              aria-label="Fechar visualização"
            >
              <X size={18} />
            </button>
            <img
              src={previewAttachment.dataUrl}
              alt={previewAttachment.name}
              className="max-h-[80vh] w-auto max-w-full rounded shadow-lg"
            />
            <p className="mt-3 text-sm text-gray-200">{previewAttachment.name}</p>
            <a
              href={previewAttachment.dataUrl}
              download={previewAttachment.name}
              className="mt-2 text-xs text-blue-200 underline"
            >
              Baixar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}





