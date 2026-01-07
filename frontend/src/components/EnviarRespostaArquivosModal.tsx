import { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Dropzone } from './ui/Dropzone';
import { FileText, MessageSquare, Search, Folder, User, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import { Solicitacao } from '../store/solicitacoesStore';
import { useDocumentosStore } from '../store/documentosStore';
import { Attachment } from '../types';

interface EnviarRespostaArquivosModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: Solicitacao | null;
  onConfirm: (arquivos: any[], mensagem: string) => void;
}

export function EnviarRespostaArquivosModal({
  isOpen,
  onClose,
  solicitacao,
  onConfirm
}: EnviarRespostaArquivosModalProps) {
  const [mensagem, setMensagem] = useState('');
  const { attachments, readyAttachments, handleFiles, removeAttachment, reset, isUploading, hasError } = useAttachmentUploader();
  const { documentos, pastas, getDocumentosByPasta } = useDocumentosStore();
  const [docsSelecionados, setDocsSelecionados] = useState<Attachment[]>([]);
  const [buscaDoc, setBuscaDoc] = useState('');
  const [pastasExpandidas, setPastasExpandidas] = useState<Set<string>>(new Set());

  const totalSize = useMemo(() => attachments.reduce((s, a) => s + (a.size || 0), 0), [attachments]);
  const fmtSize = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;

  // Filtrar documentos e pastas por busca
  const { documentosFiltrados, pastasFiltradas } = useMemo(() => {
    if (!buscaDoc.trim()) {
      return { documentosFiltrados: documentos, pastasFiltradas: pastas };
    }
    const termo = buscaDoc.toLowerCase();
    const docs = documentos.filter((doc) => 
      doc.nome.toLowerCase().includes(termo) ||
      doc.colaboradorNome?.toLowerCase().includes(termo) ||
      doc.tipo.toLowerCase().includes(termo)
    );
    const pasts = pastas.filter((pasta) =>
      pasta.nome.toLowerCase().includes(termo) ||
      pasta.descricao?.toLowerCase().includes(termo)
    );
    return { documentosFiltrados: docs, pastasFiltradas: pasts };
  }, [documentos, pastas, buscaDoc]);

  // Toggle expansão de pasta
  const togglePasta = (pastaId: string) => {
    setPastasExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(pastaId)) {
        next.delete(pastaId);
      } else {
        next.add(pastaId);
      }
      return next;
    });
  };

  // Selecionar toda a pasta (todos documentos dentro)
  const handleSelectPasta = (pastaId: string) => {
    const docsNaPasta = getDocumentosByPasta(pastaId);
    const novosAnexos: Attachment[] = [];
    
    docsNaPasta.forEach((doc) => {
      if (!docsSelecionados.some((d) => d.id === doc.id)) {
        const remoteUrl = doc.url || `https://files.cfo-hub.local/docs/${doc.id}/${encodeURIComponent(doc.nome)}`;
        novosAnexos.push({
          id: doc.id,
          name: doc.nome,
          mimeType: doc.mimetype || 'application/octet-stream',
          size: doc.tamanho,
          dataUrl: doc.url || 'data:application/octet-stream;base64,',
          remoteUrl,
        });
      }
    });
    
    if (novosAnexos.length === 0) {
      toast.error('Todos os documentos desta pasta já foram adicionados');
      return;
    }
    
    setDocsSelecionados((prev) => [...prev, ...novosAnexos]);
    toast.success(`${novosAnexos.length} documento(s) da pasta adicionado(s)`);
  };

  if (!isOpen || !solicitacao) return null;

  const combinedReady = [...readyAttachments, ...docsSelecionados];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (combinedReady.length === 0) {
      toast.error('Adicione pelo menos um arquivo');
      return;
    }

    if (hasError) {
      toast.error('Remova anexos inválidos antes de enviar');
      return;
    }

    onConfirm(combinedReady, mensagem);
    reset();
    setDocsSelecionados([]);
    setMensagem('');
    onClose();
    toast.success('Resposta enviada com sucesso!');
  };

  const handleClose = () => {
    reset();
    setDocsSelecionados([]);
    setMensagem('');
    setBuscaDoc('');
    setPastasExpandidas(new Set());
    onClose();
  };

  const handleSelectDocumento = (id: string) => {
    if (!id) return;
    const doc = documentos.find((d) => d.id === id);
    if (!doc) return;
    // evitar duplicidade
    if (docsSelecionados.some((d) => d.id === doc.id)) {
      toast.error('Documento já adicionado');
      return;
    }
    const remoteUrl = doc.url || `https://files.cfo-hub.local/docs/${doc.id}/${encodeURIComponent(doc.nome)}`;
    const attachment: Attachment = {
      id: doc.id,
      name: doc.nome,
      mimeType: doc.mimetype || 'application/octet-stream',
      size: doc.tamanho,
      dataUrl: doc.url || 'data:application/octet-stream;base64,',
      remoteUrl,
    };
    setDocsSelecionados((prev) => [...prev, attachment]);
    setBuscaDoc(''); // Limpar busca após seleção
    toast.success('Documento adicionado');
  };

  const removeDocSelecionado = (id: string) => {
    setDocsSelecionados((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Enviar resposta para: ${solicitacao.solicitante.nome}`}>
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3">
        {/* Resumo da solicitação */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resumo</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{solicitacao.solicitante.nome}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{solicitacao.data}</p>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">{solicitacao.titulo}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{solicitacao.tipo.toUpperCase()} • {solicitacao.urgencia === 'alta' ? 'Alta' : solicitacao.urgencia === 'media' ? 'Média' : 'Baixa'}</p>
          {solicitacao.descricao && (
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 line-clamp-3 whitespace-pre-wrap">{solicitacao.descricao}</p>
          )}
        </div>

        {/* Dropzone para arquivos */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
            <FileText size={16} className="text-emerald-500" />
            Anexar arquivos
          </label>
          <p className="text-xs text-gray-500 mb-2">PDF, JPG ou PNG • até 5MB por arquivo</p>
          <Dropzone onFiles={handleFiles} />
          
          {attachments.length > 0 && (
            <div className="mt-4 space-y-3">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {a.mimeType.startsWith('image/') ? (
                      <img src={a.dataUrl} alt={a.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded text-xs font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">
                        {a.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                    )}
                    <div className="text-sm min-w-0 flex-1">
                      <div className="truncate text-gray-800 dark:text-gray-200">{a.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>{(a.size / 1024 / 1024).toFixed(2)} MB {a.status === 'error' ? `· Erro: ${a.error}` : ''}</span>
                        <span className="ml-2">
                          {a.status === 'uploading' ? 'Enviando…' : a.status === 'done' ? '✓ Pronto' : ''}
                        </span>
                      </div>
                      {a.progress > 0 && a.progress < 100 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-emerald-500 h-1 transition-all" style={{ width: `${a.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-red-600 dark:text-red-400 text-xs font-medium hover:text-red-700 flex-shrink-0"
                    onClick={() => removeAttachment(a.id)}
                  >
                    Remover
                  </button>
                </div>
              ))}
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{attachments.length} arquivo(s)</span>
                <span>Total: {fmtSize(totalSize)}</span>
              </div>
              
              {hasError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-2 rounded">
                  Remova anexos inválidos antes de prosseguir.
                </div>
              )}
              
              {isUploading && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                  Preparando anexos...
                </div>
              )}
            </div>
          )}
          {/* Selecionar dos Documentos - sempre visível */}
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Selecionar dos Documentos</label>
              <p className="text-xs text-gray-500 mt-1">Escolha arquivos já existentes no sistema para anexar na resposta.</p>
            </div>

            {documentos.length === 0 ? (
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 text-center">
                Nenhum documento disponível no sistema.
              </div>
            ) : (
              <>
                {/* Campo de busca */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, colaborador ou tipo..."
                    value={buscaDoc}
                    onChange={(e) => setBuscaDoc(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Lista de pastas e documentos */}
                <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-2">
                  {documentosFiltrados.length === 0 && pastasFiltradas.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">
                      Nenhum documento ou pasta encontrado com "{buscaDoc}"
                    </div>
                  ) : (
                    <>
                      {/* Renderizar pastas */}
                      {pastasFiltradas.map((pasta) => {
                        const isExpanded = pastasExpandidas.has(pasta.id);
                        const docsNaPasta = getDocumentosByPasta(pasta.id);
                        const todosDocsSelecionados = docsNaPasta.length > 0 && docsNaPasta.every((doc) => docsSelecionados.some((d) => d.id === doc.id));
                        
                        return (
                          <div key={pasta.id} className="border-b border-gray-200 dark:border-gray-700 pb-1 mb-1 last:border-b-0">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => togglePasta(pasta.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => !todosDocsSelecionados && handleSelectPasta(pasta.id)}
                                disabled={todosDocsSelecionados}
                                className={`flex-1 text-left p-2 rounded-lg transition-colors ${
                                  todosDocsSelecionados
                                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                    : 'hover:bg-white dark:hover:bg-gray-800 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {isExpanded ? (
                                    <FolderOpen size={16} className={`mt-0.5 flex-shrink-0 ${todosDocsSelecionados ? 'text-gray-400' : 'text-blue-600'}`} />
                                  ) : (
                                    <Folder size={16} className={`mt-0.5 flex-shrink-0 ${todosDocsSelecionados ? 'text-gray-400' : 'text-blue-600'}`} />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {pasta.nome}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{docsNaPasta.length} documento(s)</span>
                                      {pasta.descricao && (
                                        <>
                                          <span>·</span>
                                          <span className="truncate">{pasta.descricao}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {todosDocsSelecionados && (
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                      ✓ Todos selecionados
                                    </span>
                                  )}
                                </div>
                              </button>
                            </div>
                            
                            {/* Documentos da pasta (quando expandida) */}
                            {isExpanded && docsNaPasta.length > 0 && (
                              <div className="ml-6 mt-1 space-y-1">
                                {docsNaPasta.map((doc) => {
                                  const isSelected = docsSelecionados.some((d) => d.id === doc.id);
                                  
                                  return (
                                    <button
                                      key={doc.id}
                                      type="button"
                                      onClick={() => !isSelected && handleSelectDocumento(doc.id)}
                                      disabled={isSelected}
                                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                                        isSelected
                                          ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                          : 'hover:bg-white dark:hover:bg-gray-800 cursor-pointer'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <FileText size={14} className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-gray-400' : 'text-emerald-600'}`} />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {doc.nome}
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{fmtSize(doc.tamanho)}</span>
                                            <span>·</span>
                                            <span className="uppercase">{doc.tipo}</span>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Renderizar documentos sem pasta (raiz) */}
                      {documentosFiltrados.filter((doc) => !doc.pastaId).map((doc) => {
                        const isSelected = docsSelecionados.some((d) => d.id === doc.id);
                        
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => !isSelected && handleSelectDocumento(doc.id)}
                            disabled={isSelected}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                : 'hover:bg-white dark:hover:bg-gray-800 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <FileText size={16} className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-gray-400' : 'text-emerald-600'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {doc.nome}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {doc.colaboradorNome && (
                                    <span className="flex items-center gap-1">
                                      <User size={12} />
                                      {doc.colaboradorNome}
                                    </span>
                                  )}
                                  <span>·</span>
                                  <span>{fmtSize(doc.tamanho)}</span>
                                  <span>·</span>
                                  <span className="uppercase">{doc.tipo}</span>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  ✓ Selecionado
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Documentos selecionados */}
            {docsSelecionados.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Documentos selecionados ({docsSelecionados.length})
                </label>
                {docsSelecionados.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm border border-emerald-200 dark:border-emerald-700 rounded-lg p-2 bg-emerald-50 dark:bg-emerald-900/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-emerald-600 flex-shrink-0" />
                      <span className="truncate text-gray-900 dark:text-gray-100">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <span>{fmtSize(d.size)}</span>
                      <button 
                        type="button" 
                        className="text-red-600 dark:text-red-400 hover:text-red-700 font-medium" 
                        onClick={() => removeDocSelecionado(d.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem opcional */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
            <MessageSquare size={16} className="text-emerald-500" />
            Mensagem (opcional)
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            placeholder="Adicione uma mensagem sobre os arquivos enviados..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose} fullWidth>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={combinedReady.length === 0 || hasError || isUploading}
          >
            Enviar Resposta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
