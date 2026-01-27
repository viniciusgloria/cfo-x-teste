import { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle, Clock, XCircle, AlertCircle, User, Mail, ClipboardCheck, Send, Paperclip } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/Avatar';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { useAuthStore } from '../store/authStore';
import { useLembretesStore } from '../store/lembretesStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useDocumentosStore } from '../store/documentosStore';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { ApprovarSolicitacaoModal } from '../components/ApprovarSolicitacaoModal';
import { usePontoStore } from '../store/pontoStore';
import { useNotificacoesStore } from '../store/notificacoesStore';
import { LembretesPanel } from '../components/LembretesPanel';
import { EnviarRespostaArquivosModal } from '../components/EnviarRespostaArquivosModal';
import { Dropzone } from '../components/ui/Dropzone';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';

const tiposMap: Record<string, { label: string; badge: string }> = {
  material: { label: 'Material', badge: 'material' },
  documento: { label: 'Documento', badge: 'documento' },
  reembolso: { label: 'Reembolso', badge: 'reembolso' },
  ferias: { label: 'Férias', badge: 'ferias' },
  homeoffice: { label: 'Home Office', badge: 'homeoffice' }
};

const urgenciaMap: Record<string, { label: string; badge: string }> = {
  baixa: { label: 'Baixa', badge: 'urgencia-baixa' },
  media: { label: 'Média', badge: 'urgencia-media' },
  alta: { label: 'Alta', badge: 'urgencia-alta' }
};

export function Solicitacoes() {
  const [activeTab, setActiveTab] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ tipo: 'material', titulo: '', descricao: '', urgencia: 'media' });
  const [touched, setTouched] = useState({ titulo: false, descricao: false });
  const { attachments, readyAttachments, handleFiles, removeAttachment, reset: resetUploads, isUploading, hasError } = useAttachmentUploader();
  
  // Estados para aprovação de ponto
  const [approvarPontoOpen, setApprovarPontoOpen] = useState(false);
  const [actionPontoId, setActionPontoId] = useState<string | null>(null);
  const [actionPontoType, setActionPontoType] = useState<'aprovar' | 'rejeitar'>('aprovar');
  const [confirmPontoOpen, setConfirmPontoOpen] = useState(false);
  const [selectedPontoIds, setSelectedPontoIds] = useState<string[]>([]);

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Estados para envio de resposta com arquivos
  const [enviarRespostaOpen, setEnviarRespostaOpen] = useState(false);
  const [solicitacaoResposta, setSolicitacaoResposta] = useState<string | null>(null);

  const { solicitacoes, adicionarSolicitacao, atualizarStatus, enviarRespostaComArquivos } = useSolicitacoesStore();
  const user = useAuthStore((state) => state.user);
  const { colaboradores, atualizarColaborador, enviarEmailBoasVindas } = useColaboradoresStore();
  const { documentos, getDocumentosObrigatorios, getProgressoDocumentos, aprovarDocumento, rejeitarDocumento, criarPastasDeTemplate } = useDocumentosStore();
  const { solicitacoes: solicitacoesPonto, atualizarStatus: atualizarStatusPonto } = useAjustesPontoStore();
  const { aplicarAjusteAprovado } = usePontoStore();
  const { adicionarNotificacao } = useNotificacoesStore();

  const isGestor = user?.role === 'gestor' || user?.role === 'admin';
  const isAprovador = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  // Colaboradores em contratação com progresso
  const colaboradoresEmContratacao = useMemo(() => {
    return colaboradores
      .filter(c => c.status === 'em_contratacao')
      .map(colaborador => {
        const progresso = getProgressoDocumentos(colaborador.id);
        const docsObrigatorios = getDocumentosObrigatorios(colaborador.cargo);
        const docsColaborador = documentos.filter(d => d.colaboradorId === colaborador.id);

        return {
          ...colaborador,
          progresso,
          docsObrigatorios,
          documentos: docsColaborador,
          percentualCompleto: docsObrigatorios.length > 0 
            ? Math.round((progresso.aprovados / docsObrigatorios.length) * 100) 
            : 0
        };
      });
  }, [colaboradores, getProgressoDocumentos, getDocumentosObrigatorios, documentos]);

  const { lembretes: lembretesStore, getLembretesPendentes } = useLembretesStore();
  
  const lembretesPendentes = getLembretesPendentes();

  const tabs = [
    { id: 'todas', label: 'Todas', count: solicitacoes.length },
    { id: 'pendentes', label: 'Pendentes', count: solicitacoes.filter(s => s.status === 'pendente').length },
    { id: 'ponto', label: 'Ponto', count: solicitacoesPonto.filter(s => s.status === 'pendente').length },
    { id: 'documentos', label: 'Documentos', count: colaboradoresEmContratacao.length },
    { id: 'lembretes', label: 'Lembretes', count: lembretesPendentes.length },
    { id: 'historico', label: 'Histórico', count: solicitacoes.filter(s => s.status !== 'pendente').length }
  ];

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (activeTab === 'pendentes') return s.status === 'pendente';
    if (activeTab === 'historico') return s.status !== 'pendente';
    if (activeTab === 'documentos') return false; // Documentos tem renderização própria
    if (activeTab === 'ponto') return false; // Ponto tem renderização própria
    return true;
  });

  // Cálculos de paginação
  const totalItems = solicitacoesFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const solicitacoesPaginadas = solicitacoesFiltradas.slice(startIndex, endIndex);

  const [isLoading, setIsLoading] = useState(true);

  // Reset para página 1 quando aba muda
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const errors: string[] = [];
    setTouched({ titulo: true, descricao: true });
    if (!formData.titulo) errors.push('Título é obrigatório.');
    if (!formData.descricao) errors.push('Descrição é obrigatória.');
    if (hasError) errors.push('Remova anexos inválidos antes de enviar.');

    if (errors.length) {
      setFormErrors(errors);
      toast.error('Preencha todos os campos');
      return;
    }

    const novasolicitacao = {
      id: Date.now().toString(),
      tipo: formData.tipo as any,
      titulo: formData.titulo,
      descricao: formData.descricao,
      status: 'pendente' as const,
      solicitante: { nome: user?.name || 'Você', avatar: user?.name || 'Você' },
      data: new Date().toLocaleDateString('pt-BR'),
      urgencia: formData.urgencia as any,
      anexos: readyAttachments
    };

    adicionarSolicitacao(novasolicitacao);
    toast.success('Solicitação enviada com sucesso!');
    setIsModalOpen(false);
    setFormData({ tipo: 'material', titulo: '', descricao: '', urgencia: 'media' });
    resetUploads();
  };

  const handleAprovar = (id: string) => {
    atualizarStatus(id, 'aprovada');
    toast.success('Solicitação aprovada!');
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRejectId, setToRejectId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingBulkReject, setPendingBulkReject] = useState(false);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleRejeitar = (id: string) => {
    setToRejectId(id);
    setConfirmOpen(true);
  };

  const confirmRejeitar = (_reason?: string) => {
    if (pendingBulkReject) {
      // bulk reject
      if (selectedIds.length === 0) {
        setConfirmOpen(false);
        setPendingBulkReject(false);
        return;
      }
      selectedIds.forEach((id) => atualizarStatus(id, 'rejeitada'));
      toast.error(`${selectedIds.length} solicitações rejeitadas`);
      setSelectedIds([]);
      setConfirmOpen(false);
      setPendingBulkReject(false);
      setToRejectId(null);
      return;
    }

    if (!toRejectId) return;
    atualizarStatus(toRejectId, 'rejeitada');
    toast.error('Solicitação rejeitada');
    setConfirmOpen(false);
    setToRejectId(null);
  };

  // Handler para enviar resposta com arquivos
  const handleEnviarResposta = (id: string) => {
    setSolicitacaoResposta(id);
    setEnviarRespostaOpen(true);
  };

  const confirmEnviarResposta = (arquivos: any[], mensagem: string) => {
    if (!solicitacaoResposta || !user) return;
    enviarRespostaComArquivos(solicitacaoResposta, arquivos, mensagem, user.name || 'Gestor');
    setEnviarRespostaOpen(false);
    setSolicitacaoResposta(null);
  };

  // Handlers para ponto
  const handleAprovarPonto = (id: string) => {
    setActionPontoId(id);
    setActionPontoType('aprovar');
    setApprovarPontoOpen(true);
  };

  const handleRejeitarPonto = (id: string) => {
    setActionPontoId(id);
    setActionPontoType('rejeitar');
    setConfirmPontoOpen(true);
  };

  const confirmActionPonto = () => {
    if (!actionPontoId || !user) return;
    if (actionPontoType === 'rejeitar') {
      const decididoPor = { id: user.id, name: user.name, role: user.role };
      atualizarStatusPonto(actionPontoId, 'rejeitada', decididoPor);
      try {
        adicionarNotificacao({
          tipo: 'solicitacao_rejeitada',
          titulo: 'Solicitação de Ponto Rejeitada',
          mensagem: `Sua solicitação foi rejeitada.`,
          link: '/solicitacoes',
          icone: 'XCircle',
          cor: 'text-red-600',
        });
      } catch (e) {}
      toast.error('Solicitação de ponto rejeitada');
      setConfirmPontoOpen(false);
      setActionPontoId(null);
    }
  };

  const handleApproveConfirmedPonto = (id: string, horarioFinal?: string) => {
    if (!id || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    const sol = solicitacoesPonto.find((s) => s.id === id);
    if (sol) {
      if (sol.tipo === 'ajuste' && horarioFinal) {
        aplicarAjusteAprovado({ data: sol.data, alvo: sol.alvo, horarioNovo: horarioFinal });
      }
      atualizarStatusPonto(id, 'aprovada', decididoPor);
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
    }
    setApprovarPontoOpen(false);
    setActionPontoId(null);
  };

  const toggleSelectPonto = (id: string) => {
    setSelectedPontoIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleBulkApprovePonto = () => {
    if (selectedPontoIds.length === 0 || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    selectedPontoIds.forEach((id) => atualizarStatusPonto(id, 'aprovada', decididoPor));
    toast.success(`${selectedPontoIds.length} solicitações de ponto aprovadas`);
    setSelectedPontoIds([]);
  };

  const handleBulkRejectPonto = () => {
    if (selectedPontoIds.length === 0 || !user) return;
    const decididoPor = { id: user.id, name: user.name, role: user.role };
    selectedPontoIds.forEach((id) => atualizarStatusPonto(id, 'rejeitada', decididoPor));
    toast.error(`${selectedPontoIds.length} solicitações de ponto rejeitadas`);
    setSelectedPontoIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => atualizarStatus(id, 'aprovada'));
    toast.success(`${selectedIds.length} solicitações aprovadas`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    setPendingBulkReject(true);
    setConfirmOpen(true);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'gestor';
  const solicitacaoDetalhes = solicitacoes.find(s => s.id === detalhesId);

  return (
    <div className="space-y-6">
      <PageBanner
        title="Solicitações"
        icon={<FileText size={32} />}
        right={(
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Nova Solicitação
          </Button>
        )}
      />

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700 dark:border-slate-700">
            <span className="text-sm text-gray-700 dark:text-slate-200 dark:text-slate-300">{selectedIds.length} selecionada(s)</span>
            <div className="ml-auto flex gap-2">
              <Button onClick={handleBulkApprove} className="text-sm">Aprovar selecionadas</Button>
              <Button onClick={handleBulkReject} variant="outline" className="text-sm border-red-300 text-red-600 dark:border-red-700 dark:text-red-400">Rejeitar selecionadas</Button>
            </div>
          </div>
        )}

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'ponto' ? (
          // Renderização específica para aba de ponto
          isAprovador ? (
            solicitacoesPonto.length === 0 ? (
              <EmptyState 
                title="Nenhuma solicitação de ponto" 
                description="Não há solicitações de ponto para exibir." 
              />
            ) : (
              <>
                {selectedPontoIds.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-slate-900/50 rounded mb-4 border border-gray-200 dark:border-slate-700 dark:border-slate-700">
                    <span className="text-sm text-gray-700 dark:text-slate-200 dark:text-slate-300">{selectedPontoIds.length} selecionada(s)</span>
                    <div className="ml-auto flex gap-2">
                      <Button onClick={handleBulkApprovePonto} className="text-sm">Aprovar selecionadas</Button>
                      <Button onClick={handleBulkRejectPonto} variant="outline" className="text-sm border-red-300 text-red-600 dark:border-red-700 dark:text-red-400">Rejeitar selecionadas</Button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {solicitacoesPonto.map((sol) => (
                    <Card key={sol.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {isAprovador && sol.status === 'pendente' && (
                            <input
                              type="checkbox"
                              checked={selectedPontoIds.includes(sol.id)}
                              onChange={() => toggleSelectPonto(sol.id)}
                              aria-label={`Selecionar solicitação de ${sol.colaboradorNome}`}
                            />
                          )}
                          <Badge variant={sol.tipo === 'ajuste' ? 'material' : 'ferias'}>
                            {sol.tipo === 'ajuste' ? 'Ajuste de Ponto' : 'Atestado Médico'}
                          </Badge>
                        </div>
                        <Badge variant={sol.status}>
                          {sol.status === 'pendente' ? 'Pendente' : sol.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{sol.colaboradorNome}</h3>
                      <p className="text-gray-600 dark:text-slate-300 text-sm mb-2">{sol.data}</p>
                      {sol.tipo === 'ajuste' && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 dark:text-slate-200"><strong>Alvo:</strong> {sol.alvo === 'entrada' ? 'Entrada' : 'Saída'}</p>
                          {sol.horarioNovo && <p className="text-sm text-gray-700 dark:text-slate-200"><strong>Novo horário:</strong> {sol.horarioNovo}</p>}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{sol.motivo}</p>

                      {sol.status === 'pendente' && isAprovador && (
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                          <Button
                            onClick={() => handleAprovarPonto(sol.id)}
                            className="flex-1 text-sm"
                          >
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejeitarPonto(sol.id)}
                            variant="outline"
                            className="flex-1 text-sm border-red-300 text-red-600"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      )}

                      {sol.decididoPor && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-slate-900/50 rounded text-sm border border-gray-200 dark:border-slate-700 dark:border-slate-700">
                          <p className="text-gray-700 dark:text-slate-200 dark:text-slate-300"><strong>Decidido por:</strong> {sol.decididoPor.name}</p>
                          {sol.decididoEm && <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-xs">{new Date(sol.decididoEm).toLocaleDateString('pt-BR')}</p>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            )
          ) : (
            <EmptyState 
              title="Acesso restrito" 
              description="Apenas aprovadores podem visualizar solicitações de ponto." 
            />
          )
        ) : activeTab === 'documentos' ? (
          // Renderização específica para aba de documentos
          isGestor ? (
            colaboradoresEmContratacao.length === 0 ? (
              <EmptyState 
                title="Nenhum colaborador em contratação" 
                description="Não há colaboradores aguardando documentação no momento." 
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {colaboradoresEmContratacao.map((colaborador) => (
                  <Card key={colaborador.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={colaborador.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${colaborador.nome.split(' ')[0]}`}
                          alt={colaborador.nome}
                          size="lg"
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {colaborador.nome}
                            </h3>
                            {colaborador.dispensaDocumentacao && (
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                                ⚠️ Documentação dispensada
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {colaborador.cargo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {colaborador.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            criarPastasDeTemplate(colaborador.id, colaborador.cargo, user?.id || '1', user?.name || 'Sistema');
                            toast.success('Pastas criadas!');
                          }}
                          variant="outline"
                          className="px-3 py-2 text-sm"
                        >
                          Criar Pastas
                        </Button>
                        <Button
                          onClick={() => enviarEmailBoasVindas(colaborador.id)}
                          variant="outline"
                          className="px-3 py-2 text-sm"
                        >
                          Enviar Email
                        </Button>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={colaborador.dispensaDocumentacao || false}
                            onChange={(e) => {
                              atualizarColaborador(colaborador.id, { dispensaDocumentacao: e.target.checked });
                              toast.success(
                                e.target.checked
                                  ? 'Documentação dispensada - Situação atípica'
                                  : 'Documentação obrigatória reativada'
                              );
                            }}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <span className="text-gray-700 dark:text-slate-200 dark:text-gray-300">Dispensar documentação</span>
                        </label>
                        <Button
                          onClick={() => {
                            const podeAtivar = podeAtivarColaborador(colaborador.id);
                            if (podeAtivar.pode) {
                              atualizarColaborador(colaborador.id, { status: 'ativo' });
                              toast.success(`${colaborador.nome} ativado!`);
                            } else {
                              toast.error(podeAtivar.motivo || 'Não foi possível ativar o colaborador');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 text-sm"
                          disabled={!podeAtivarColaborador(colaborador.id).pode}
                        >
                          Ativar
                        </Button>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Progresso da Documentação</span>
                        <span className="font-semibold">{colaborador.percentualCompleto}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            colaborador.percentualCompleto === 100
                              ? 'bg-green-500'
                              : colaborador.percentualCompleto >= 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${colaborador.percentualCompleto}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={14} />
                          {colaborador.progresso.aprovados} aprovados
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock size={14} />
                          {colaborador.progresso.pendentes} pendentes
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle size={14} />
                          {colaborador.progresso.rejeitados} rejeitados
                        </span>
                      </div>
                    </div>

                    {/* Documentos Obrigatórios */}
                    <div className="space-y-2">
                      {colaborador.docsObrigatorios.map((tipoDoc) => {
                        const doc = colaborador.documentos.find(d => d.tipo === tipoDoc);
                        return (
                          <div key={tipoDoc} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              {doc ? (
                                doc.status === 'aprovado' ? (
                                  <CheckCircle className="text-green-600" size={18} />
                                ) : doc.status === 'pendente' ? (
                                  <Clock className="text-yellow-600" size={18} />
                                ) : (
                                  <XCircle className="text-red-600" size={18} />
                                )
                              ) : (
                                <AlertCircle className="text-gray-400 dark:text-slate-500" size={18} />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{tipoDoc}</p>
                                {doc && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {doc.nome}
                                    {doc.observacoes && ` • ${doc.observacoes}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            {doc && doc.status === 'pendente' && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    aprovarDocumento(doc.id, user?.id || '1', user?.name || 'Gestor');
                                    toast.success('Documento aprovado!');
                                  }}
                                  className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => {
                                    const motivo = prompt('Motivo da rejeição:');
                                    if (motivo) {
                                      rejeitarDocumento(doc.id, user?.id || '1', user?.name || 'Gestor', motivo);
                                      toast.success('Documento rejeitado!');
                                    }
                                  }}
                                  variant="outline"
                                  className="text-red-600 border-red-600 px-3 py-1 text-sm"
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            )}

                            {!doc && (
                              <span className="text-xs text-gray-500 dark:text-slate-400">Aguardando envio</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <EmptyState 
              title="Acesso restrito" 
              description="Apenas gestores podem visualizar documentações pendentes." 
            />
          )
        ) : activeTab === 'lembretes' ? (
          <LembretesPanel mostrarTodos={true} limite={0} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : solicitacoesFiltradas.length === 0 ? (
          <EmptyState title="Nenhuma solicitação" description="Não há solicitações para exibir." cta={<Button onClick={() => setIsModalOpen(true)}>Nova Solicitação</Button>} />
        ) : (
          <>
          <div className="grid grid-cols-1 gap-4">
            {solicitacoesPaginadas.map((sol) => (
                <Card
                  key={sol.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setDetalhesId(sol.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sol.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelect(sol.id);
                          }}
                          aria-label={`Selecionar solicitação ${sol.titulo}`}
                        />
                      )}
                      <Badge variant={sol.tipo}>{tiposMap[sol.tipo].label}</Badge>
                    </div>
                    <Badge variant={sol.status}>{sol.status === 'pendente' ? 'Pendente' : sol.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{sol.titulo}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-3">{sol.descricao}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {sol.solicitante.nome}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {sol.data}
                    </span>
                  </div>

                  {sol.anexos && sol.anexos.length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded text-sm">
                      <p className="text-xs text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">
                        <Paperclip size={12} className="inline mr-1" />
                        {sol.anexos.length} anexo(s)
                      </p>
                    </div>
                  )}

                  {sol.respostaGestor && (
                    <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-700">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Resposta do Gestor:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {new Date(sol.respostaGestor.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {sol.respostaGestor.mensagem && (
                        <p className="text-sm text-emerald-700 mt-2 italic">{sol.respostaGestor.mensagem}</p>
                      )}
                      {sol.arquivosResposta && sol.arquivosResposta.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-emerald-700">{sol.arquivosResposta.length} arquivo(s):</p>
                          {sol.arquivosResposta.map((anexo) => (
                            <div key={anexo.id} className="text-xs text-emerald-600 flex items-center gap-1">
                              <FileText size={12} />
                              <span className="truncate">{anexo.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && !sol.respostaGestor && sol.status !== 'rejeitada' && (
                    <div
                      className={`flex gap-2 ${sol.status === 'pendente' ? '' : 'pt-2 border-t border-gray-200 dark:border-slate-700'}`}
                    >
                      {sol.status === 'pendente' && (
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAprovar(sol.id);
                          }}
                          className="flex-1 text-sm"
                        >
                          Aprovar
                        </Button>
                      )}
                      {sol.status === 'pendente' && (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejeitar(sol.id);
                          }}
                          className="flex-1 text-sm border-red-300 text-red-600"
                        >
                          Rejeitar
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnviarResposta(sol.id);
                        }}
                        className="flex-1 text-sm border-emerald-300 text-emerald-600 flex items-center justify-center gap-1"
                      >
                        <Send size={14} />
                        Enviar Resposta
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

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmRejeitar} title="Confirmar rejeição" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Solicitação"
      >
        <div className="space-y-4">
          {/* summary errors */}
          {formErrors.length > 0 && (
            <div role="alert" aria-live="assertive" className="mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              <strong className="block font-medium">Por favor corrija os seguintes erros:</strong>
              <ul className="mt-2 list-disc list-inside text-sm">
                {formErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {Object.entries(tiposMap).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Título</label>
            <Input
              placeholder="Título da solicitação"
              value={formData.titulo}
              onBlur={() => setTouched({ ...touched, titulo: true })}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              aria-invalid={!formData.titulo && touched.titulo}
            />
            {!formData.titulo && touched.titulo && <p className="text-xs text-red-500">Título é obrigatório.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Descrição</label>
            <textarea
              placeholder="Descreva sua solicitação"
              value={formData.descricao}
              onBlur={() => setTouched({ ...touched, descricao: true })}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
              rows={4}
            />
            {!formData.descricao && touched.descricao && <p className="text-xs text-red-500">Descrição é obrigatória.</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              <Paperclip size={16} />
              Anexos (opcional)
            </label>
            <p className="text-xs text-gray-500 dark:text-slate-400">PDF, JPG ou PNG • até 5MB por arquivo</p>
            <Dropzone onFiles={handleFiles} />
            {attachments.length > 0 && (
              <div className="space-y-2 border border-gray-200 dark:border-slate-700 rounded p-3 bg-gray-50 dark:bg-slate-900/50">
                {attachments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} className="text-emerald-600" />
                      <div className="min-w-0">
                        <p className="truncate text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{(a.size / 1024 / 1024).toFixed(2)} MB</p>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 h-1 rounded overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-1" style={{ width: `${a.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() => removeAttachment(a.id)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {hasError && (
                  <p className="text-xs text-red-600">Remova anexos inválidos antes de enviar.</p>
                )}
                {isUploading && (
                  <p className="text-xs text-gray-600 dark:text-slate-300">Processando anexos...</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Urgência</label>
            <select
              value={formData.urgencia}
              onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <Button onClick={handleSubmit} fullWidth disabled={!formData.titulo || !formData.descricao}>
            Enviar Solicitação
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!detalhesId && !!solicitacaoDetalhes}
        onClose={() => setDetalhesId(null)}
        title="Detalhes da Solicitação"
      >
        {solicitacaoDetalhes && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Tipo</p>
              <Badge variant={solicitacaoDetalhes.tipo}>{tiposMap[solicitacaoDetalhes.tipo].label}</Badge>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Título</p>
              <p className="text-lg font-semibold">{solicitacaoDetalhes.titulo}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Descrição</p>
              <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap">{solicitacaoDetalhes.descricao}</p>
            </div>

            {solicitacaoDetalhes.valor && (
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Valor</p>
                <p className="text-2xl font-bold text-green-600">R$ {solicitacaoDetalhes.valor.toFixed(2)}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Solicitante</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${solicitacaoDetalhes.solicitante.avatar}`} alt={solicitacaoDetalhes.solicitante.nome} className="w-8 h-8" />
                  <span className="font-medium text-gray-800">{solicitacaoDetalhes.solicitante.nome}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400">{solicitacaoDetalhes.data}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Timeline</p>
              <p className="text-sm text-gray-700 dark:text-slate-200">Criada em {solicitacaoDetalhes.data}</p>
              {solicitacaoDetalhes.status !== 'pendente' && (
                <p className="text-sm text-gray-700 dark:text-slate-200 mt-2">
                  {solicitacaoDetalhes.status === 'aprovada' ? '✓ Aprovada' : '✗ Rejeitada'}
                </p>
              )}
            </div>

            {solicitacaoDetalhes.respostaGestor && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <p className="font-semibold text-emerald-800">Resposta do Gestor</p>
                </div>
                <p className="text-sm text-emerald-700 mb-2">
                  Enviado por <strong>{solicitacaoDetalhes.respostaGestor.enviadoPor}</strong> em {solicitacaoDetalhes.respostaGestor.enviadoEm}
                </p>
                {solicitacaoDetalhes.respostaGestor.mensagem && (
                  <p className="text-sm text-emerald-700 mb-3 italic border-l-2 border-emerald-400 pl-2">
                    "{solicitacaoDetalhes.respostaGestor.mensagem}"
                  </p>
                )}
                {solicitacaoDetalhes.arquivosResposta && solicitacaoDetalhes.arquivosResposta.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-800">Arquivos anexados:</p>
                    {solicitacaoDetalhes.arquivosResposta.map((anexo) => (
                      <div key={anexo.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-emerald-200">
                        <FileText size={16} className="text-emerald-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{anexo.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{(anexo.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && !solicitacaoDetalhes.respostaGestor && solicitacaoDetalhes.status !== 'rejeitada' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                {solicitacaoDetalhes.status === 'pendente' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleAprovar(solicitacaoDetalhes.id);
                      setDetalhesId(null);
                    }}
                    fullWidth
                  >
                    Aprovar
                  </Button>
                )}
                {solicitacaoDetalhes.status === 'pendente' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejeitar(solicitacaoDetalhes.id);
                      setDetalhesId(null);
                    }}
                    fullWidth
                    className="border-red-300 text-red-600"
                  >
                    Rejeitar
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleEnviarResposta(solicitacaoDetalhes.id);
                    setDetalhesId(null);
                  }}
                  fullWidth
                  className="border-emerald-300 text-emerald-600"
                >
                  <Send size={16} className="inline mr-2" />
                  Enviar Resposta
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <EnviarRespostaArquivosModal
        isOpen={enviarRespostaOpen}
        onClose={() => setEnviarRespostaOpen(false)}
        solicitacao={solicitacoes.find(s => s.id === solicitacaoResposta) || null}
        onConfirm={confirmEnviarResposta}
      />

      <ApprovarSolicitacaoModal
        isOpen={approvarPontoOpen}
        onClose={() => setApprovarPontoOpen(false)}
        onConfirm={handleApproveConfirmedPonto}
        solicitacao={solicitacoesPonto.find(s => s.id === actionPontoId)}
      />

      <ConfirmModal
        isOpen={confirmPontoOpen}
        onClose={() => setConfirmPontoOpen(false)}
        onConfirm={confirmActionPonto}
        title="Rejeitar Solicitação de Ponto"
        message="Tem certeza que deseja rejeitar esta solicitação de ponto?"
        confirmText="Rejeitar"
        variant="danger"
      />
    </div>
  );
}





