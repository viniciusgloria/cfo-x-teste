import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Lock, MessageCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { useFeedbacksStore } from '../store/feedbacksStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Avatar } from '../components/Avatar';

const colaboradores = ['Maria Santos', 'Carlos Lima', 'João Silva', 'Ana Costa'];

export function Feedbacks() {
  usePageTitle('Feedbacks');
  const [activeTab, setActiveTab] = useState('recebidos');
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paraQuem: '',
    tipo: 'geral',
    pergunta: '',
    anonimo: false
  });
  const [touched, setTouched] = useState({ paraQuem: false, pergunta: false });

  // Estado para paginação
  const [currentPageRecebidos, setCurrentPageRecebidos] = useState(1);
  const [currentPageEnviados, setCurrentPageEnviados] = useState(1);
  const [itemsPerPage] = useState(20);

  const { feedbacks, feedbacksEnviados, solicitarFeedback } = useFeedbacksStore();

  const tabs = [
    { id: 'recebidos', label: 'Recebidos', count: feedbacks.length },
    { id: 'enviados', label: 'Enviados', count: feedbacksEnviados.length },
    { id: 'solicitar', label: 'Solicitar' }
  ];

  // Cálculos de paginação para recebidos
  const totalRecebidos = feedbacks.length;
  const totalPagesRecebidos = Math.ceil(totalRecebidos / itemsPerPage);
  const startRecebidos = (currentPageRecebidos - 1) * itemsPerPage;
  const feedbacksRecebidosPaginados = feedbacks.slice(startRecebidos, startRecebidos + itemsPerPage);

  // Cálculos de paginação para enviados
  const totalEnviados = feedbacksEnviados.length;
  const totalPagesEnviados = Math.ceil(totalEnviados / itemsPerPage);
  const startEnviados = (currentPageEnviados - 1) * itemsPerPage;
  const feedbacksEnviadosPaginados = feedbacksEnviados.slice(startEnviados, startEnviados + itemsPerPage);

  // Reset para página 1 quando aba muda
  useEffect(() => {
    setCurrentPageRecebidos(1);
    setCurrentPageEnviados(1);
  }, [activeTab]);

  const handleSolicitar = () => {
    const errors: string[] = [];
    setTouched({ paraQuem: true, pergunta: true });
    if (!formData.paraQuem) errors.push('Selecione um colaborador.');
    if (!formData.pergunta) errors.push('A pergunta é obrigatória.');

    if (errors.length) {
      setFormErrors(errors);
      toast.error('Preencha todos os campos');
      return;
    }

    solicitarFeedback(formData.paraQuem, formData.tipo, formData.pergunta, formData.anonimo);
    toast.success('Feedback solicitado com sucesso!');
    setFormData({ paraQuem: '', tipo: 'geral', pergunta: '', anonimo: false });
  };

  const renderStars = (nota?: number) => {
    if (!nota) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < Math.round(nota / 2) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 dark:text-slate-300 ml-2">{nota}/10</span>
      </div>
    );
  };

  const feedbackDetalhes = feedbacks.find(f => f.id === detalhesId);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const enviarResposta = () => {
    if (!replyText.trim()) {
      toast.error('Digite uma resposta');
      return;
    }
    // Mock da resposta: apenas exibe toast
    toast.success('Resposta enviada');
    setReplyText('');
    setIsReplying(false);
  };
  const [isLoading, setIsLoading] = useState(true);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <PageBanner title="Feedbacks" icon={<MessageCircle size={32} />} />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'recebidos' && (
          <>
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : feedbacks.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 dark:text-slate-300">Você não recebeu feedbacks ainda</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbacksRecebidosPaginados.map((fb) => (
                  <Card
                    key={fb.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setDetalhesId(fb.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.de.avatar}`} alt={fb.de.nome} size="md" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{fb.de.nome}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">para {fb.para.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={fb.tipo}>
                          {fb.tipo === 'positivo' ? 'Positivo' : fb.tipo === 'construtivo' ? 'Construtivo' : 'Avaliação'}
                        </Badge>
                        {fb.privado && <Lock size={16} className="text-gray-400 dark:text-slate-500" />}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{fb.titulo}</h3>
                    <p className="text-gray-600 dark:text-slate-300 text-sm mb-3 line-clamp-3">{fb.mensagem}</p>

                    {fb.nota && (
                      <div className="mb-3">
                        {renderStars(fb.nota)}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{fb.data}</span>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetalhesId(fb.id);
                        }}
                        className="text-[#10B981] hover:text-[#059669] text-xs"
                      >
                        Ver completo
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Paginação Recebidos */}
          {totalPagesRecebidos > 1 && (
            <Card className="mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startRecebidos + 1}-{Math.min(startRecebidos + itemsPerPage, totalRecebidos)} de {totalRecebidos} feedbacks
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCurrentPageRecebidos(1)} disabled={currentPageRecebidos === 1} className="dark:text-white" aria-label="Primeira página">
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPageRecebidos(prev => Math.max(1, prev - 1))} disabled={currentPageRecebidos === 1} className="dark:text-white" aria-label="Página anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPagesRecebidos }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPagesRecebidos || Math.abs(page - currentPageRecebidos) <= 1)
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>}
                            <Button variant={currentPageRecebidos === page ? "primary" : "outline"} onClick={() => setCurrentPageRecebidos(page)} className={currentPageRecebidos === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button variant="outline" onClick={() => setCurrentPageRecebidos(prev => Math.min(totalPagesRecebidos, prev + 1))} disabled={currentPageRecebidos === totalPagesRecebidos} className="dark:text-white" aria-label="Próxima página">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPageRecebidos(totalPagesRecebidos)} disabled={currentPageRecebidos === totalPagesRecebidos} className="dark:text-white" aria-label="Última página">
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
          </>
        )}

        {activeTab === 'enviados' && (
          <>
            <div className="space-y-4">
              {feedbacksEnviados.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 dark:text-slate-300">Você ainda não enviou feedbacks</p>
                  <Button onClick={() => setActiveTab('solicitar')} className="mt-4">
                    Solicitar Feedback
                  </Button>
                </Card>
              ) : (
                feedbacksEnviadosPaginados.map((fb) => (
                <Card
                  key={fb.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setDetalhesId(fb.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.para.avatar}`} alt={fb.para.nome} size="md" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Para: {fb.para.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">De: {fb.de.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={fb.tipo}>
                        {fb.tipo === 'positivo' ? 'Positivo' : fb.tipo === 'construtivo' ? 'Construtivo' : 'Avaliação'}
                      </Badge>
                      {fb.privado && <Lock size={16} className="text-gray-400 dark:text-slate-500" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{fb.titulo}</h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm mb-3 line-clamp-3">{fb.mensagem}</p>

                  {fb.nota && (
                    <div className="mb-3">
                      {renderStars(fb.nota)}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <span>{fb.data}</span>
                  </div>
                </Card>
                ))
              )}
            </div>
            
            {/* Paginação Enviados */}
            {totalPagesEnviados > 1 && (
            <Card className="mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startEnviados + 1}-{Math.min(startEnviados + itemsPerPage, totalEnviados)} de {totalEnviados} feedbacks
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCurrentPageEnviados(1)} disabled={currentPageEnviados === 1} className="dark:text-white" aria-label="Primeira página">
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPageEnviados(prev => Math.max(1, prev - 1))} disabled={currentPageEnviados === 1} className="dark:text-white" aria-label="Página anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPagesEnviados }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPagesEnviados || Math.abs(page - currentPageEnviados) <= 1)
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>}
                            <Button variant={currentPageEnviados === page ? "primary" : "outline"} onClick={() => setCurrentPageEnviados(page)} className={currentPageEnviados === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button variant="outline" onClick={() => setCurrentPageEnviados(prev => Math.min(totalPagesEnviados, prev + 1))} disabled={currentPageEnviados === totalPagesEnviados} className="dark:text-white" aria-label="Próxima página">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPageEnviados(totalPagesEnviados)} disabled={currentPageEnviados === totalPagesEnviados} className="dark:text-white" aria-label="Última página">
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
            )}
          </>
        )}

        {activeTab === 'solicitar' && (
          <Card className="p-8 max-w-2xl">
            <div className="space-y-4">
              {/* show error summary when present */}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Para quem?</label>
                <select
                  value={formData.paraQuem}
                  onBlur={() => setTouched({ ...touched, paraQuem: true })}
                  onChange={(e) => setFormData({ ...formData, paraQuem: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="">Selecione um colaborador</option>
                  {colaboradores.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                {!formData.paraQuem && touched.paraQuem && <p className="text-xs text-red-500">Selecione um colaborador.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="geral">Geral</option>
                  <option value="projeto">Sobre projeto específico</option>
                  <option value="comportamento">Sobre comportamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">O que gostaria de saber?</label>
                <textarea
                  placeholder="Digite sua pergunta..."
                  value={formData.pergunta}
                  onBlur={() => setTouched({ ...touched, pergunta: true })}
                  onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
                  rows={5}
                />
                {!formData.pergunta && touched.pergunta && <p className="text-xs text-red-500">Escreva a pergunta.</p>}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonimo}
                  onChange={(e) => setFormData({ ...formData, anonimo: e.target.checked })}
                  className="w-4 h-4 text-[#10B981] border-gray-300 dark:border-slate-700 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200">Solicitar feedback anônimo</span>
              </label>

              <Button onClick={handleSolicitar} fullWidth disabled={!formData.paraQuem || !formData.pergunta}>
                Solicitar Feedback
              </Button>
            </div>
          </Card>
        )}
      </Tabs>

      <Modal
        isOpen={!!detalhesId && !!feedbackDetalhes}
        onClose={() => setDetalhesId(null)}
        title="Feedback Completo"
      >
        {feedbackDetalhes && (
          <div className="space-y-6">
              <div className="flex items-center gap-4">
              <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feedbackDetalhes.de.avatar}`} alt={feedbackDetalhes.de.nome} size="lg" />
              <div>
                <p className="font-semibold text-gray-800">{feedbackDetalhes.de.nome}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">para {feedbackDetalhes.para.nome}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={feedbackDetalhes.tipo}>
                  {feedbackDetalhes.tipo === 'positivo' ? 'Positivo' : feedbackDetalhes.tipo === 'construtivo' ? 'Construtivo' : 'Avaliação'}
                </Badge>
                {feedbackDetalhes.privado && (
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
                    <Lock size={14} /> Privado
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{feedbackDetalhes.titulo}</h3>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap">{feedbackDetalhes.mensagem}</p>
            </div>

            {feedbackDetalhes.nota && (
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Avaliação</p>
                {renderStars(feedbackDetalhes.nota)}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-slate-400">{feedbackDetalhes.data}</p>

            {!isReplying ? (
              <Button variant="outline" fullWidth onClick={() => setIsReplying(true)}>
                Responder
              </Button>
            ) : (
              <div className="space-y-3 mt-4">
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
                  placeholder="Escreva sua resposta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => { setIsReplying(false); setReplyText(''); }}>Cancelar</Button>
                  <Button fullWidth onClick={enviarResposta} disabled={!replyText.trim()}>Enviar</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}





