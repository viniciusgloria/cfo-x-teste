import { useState, useMemo } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  FolderOpen, 
  File, 
  Upload, 
  FolderPlus, 
  ChevronRight, 
  Home,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Grid,
  List,
  Eye,
  Share2
} from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useDocumentosStore, Pasta, Documento, TipoDocumento } from '../store/documentosStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { CompartilharPastaModal } from '../components/CompartilharPastaModal';
import { useNotificacoesStore } from '../store/notificacoesStore';

export function Documentos() {
  usePageTitle('Documentos');
  
  const { user } = useAuthStore();
  const { colaboradores } = useColaboradoresStore();
  const {
    documentos,
    pastas,
    adicionarPasta,
    adicionarDocumento,
    removerPasta,
    removerDocumento,
    aprovarDocumento,
    rejeitarDocumento,
    getPastasByPai
  } = useDocumentosStore();
  
  const { notificarDocumentoAprovado, notificarDocumentoRejeitado, notificarDocumentoEnviado } = useNotificacoesStore();

  const [pastaAtualId, setPastaAtualId] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id?: string; nome: string }>>([
    { nome: 'Raiz' }
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [novaPastaOpen, setNovaPastaOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detalhesDoc, setDetalhesDoc] = useState<Documento | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ tipo: 'pasta' | 'doc'; id: string } | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<Documento | null>(null);
  const [compartilharPastaOpen, setCompartilharPastaOpen] = useState(false);
  const [pastaParaCompartilhar, setPastaParaCompartilhar] = useState<Pasta | null>(null);

  // Form states
  const [nomePasta, setNomePasta] = useState('');
  const [descricaoPasta, setDescricaoPasta] = useState('');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<number | ''>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('Outro');

  const isGestor = user?.role === 'gestor' || user?.role === 'admin';
  const userId = user?.id || '1';
  const userName = user?.name || 'Usuário';

  // Colaborador atual (se for colaborador comum)
  const colaboradorAtual = colaboradores.find(c => c.email === user?.email);

  // Filtrar pastas e documentos baseado em permissões
  const pastasVisiveis = useMemo(() => {
    const pastasDaPastaAtual = getPastasByPai(pastaAtualId);
    
    if (isGestor) {
      return pastasDaPastaAtual;
    }
    
    // Colaborador vê apenas suas pastas
    return pastasDaPastaAtual.filter(p => 
      !p.colaboradorId || p.colaboradorId === colaboradorAtual?.id
    );
  }, [pastaAtualId, pastas, isGestor, colaboradorAtual]);

  const documentosVisiveis = useMemo(() => {
    let docs = documentos.filter(d => d.pastaId === pastaAtualId);
    
    if (!isGestor && colaboradorAtual) {
      docs = docs.filter(d => d.colaboradorId === colaboradorAtual.id);
    }

    if (searchTerm) {
      docs = docs.filter(d => 
        d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return docs;
  }, [pastaAtualId, documentos, isGestor, colaboradorAtual, searchTerm]);

  const navegarPasta = (pasta?: Pasta) => {
    if (!pasta) {
      setPastaAtualId(undefined);
      setBreadcrumb([{ nome: 'Raiz' }]);
    } else {
      setPastaAtualId(pasta.id);
      const novoBreadcrumb = [...breadcrumb];
      const index = novoBreadcrumb.findIndex(b => b.id === pasta.id);
      if (index >= 0) {
        setBreadcrumb(novoBreadcrumb.slice(0, index + 1));
      } else {
        setBreadcrumb([...novoBreadcrumb, { id: pasta.id, nome: pasta.nome }]);
      }
    }
  };

  const handleCriarPasta = () => {
    if (!nomePasta.trim()) {
      toast.error('Digite um nome para a pasta');
      return;
    }

    if (!isGestor && !colaboradorSelecionado) {
      toast.error('Selecione um colaborador');
      return;
    }

    adicionarPasta({
      nome: nomePasta,
      descricao: descricaoPasta,
      pastaIdPai: pastaAtualId,
      criadoPor: userId,
      criadoPorNome: userName,
      colaboradorId: isGestor ? (colaboradorSelecionado || undefined) : colaboradorAtual?.id,
      cor: `#${Math.floor(Math.random()*16777215).toString(16)}`
    });

    toast.success('Pasta criada com sucesso!');
    setNovaPastaOpen(false);
    setNomePasta('');
    setDescricaoPasta('');
    setColaboradorSelecionado('');
  };

  const handleUpload = () => {
    if (!uploadFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (!isGestor && !colaboradorAtual) {
      toast.error('Colaborador não identificado');
      return;
    }

    const colaboradorId = isGestor && colaboradorSelecionado 
      ? Number(colaboradorSelecionado) 
      : colaboradorAtual?.id;

    if (!colaboradorId) {
      toast.error('Selecione um colaborador');
      return;
    }

    const colaborador = colaboradores.find(c => c.id === colaboradorId);

    adicionarDocumento({
      nome: uploadFile.name,
      tipo: tipoDocumento,
      tamanho: uploadFile.size,
      uploadPor: userId,
      uploadPorNome: userName,
      colaboradorId,
      colaboradorNome: colaborador?.nome || 'Desconhecido',
      pastaId: pastaAtualId,
      mimetype: uploadFile.type,
      status: 'pendente'
    });

    // Notificar gestores sobre novo documento pendente
    const gestoresIds = colaboradores
      .filter(c => c.cargo.toLowerCase().includes('gerente') || c.cargo.toLowerCase().includes('gestor'))
      .map(c => c.id.toString());
    
    if (gestoresIds.length > 0) {
      notificarDocumentoEnviado(gestoresIds, colaborador?.nome || 'Colaborador', tipoDocumento);
    }

    toast.success('Documento enviado com sucesso!');
    setUploadOpen(false);
    setUploadFile(null);
    setTipoDocumento('Outro');
    setColaboradorSelecionado('');
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    if (confirmDelete.tipo === 'pasta') {
      removerPasta(confirmDelete.id);
      toast.success('Pasta removida com sucesso!');
    } else {
      removerDocumento(confirmDelete.id);
      toast.success('Documento removido com sucesso!');
    }

    setConfirmDelete(null);
  };

  const handleAprovar = (docId: string) => {
    const doc = documentos.find(d => d.id === docId);
    if (doc) {
      aprovarDocumento(docId, userId, userName);
      notificarDocumentoAprovado(doc.colaboradorId.toString(), doc.nome);
      toast.success('Documento aprovado!');
    }
    setDetalhesDoc(null);
  };

  const handleRejeitar = (docId: string) => {
    const doc = documentos.find(d => d.id === docId);
    const motivo = prompt('Digite o motivo da rejeição:');
    if (motivo && doc) {
      rejeitarDocumento(docId, userId, userName, motivo);
      notificarDocumentoRejeitado(doc.colaboradorId.toString(), doc.nome, motivo);
      toast.success('Documento rejeitado!');
      setDetalhesDoc(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle size={12} className="mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle size={12} className="mr-1" />Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock size={12} className="mr-1" />Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Documentos"
        icon={<FolderOpen size={32} />}
        right={
          <div className="flex gap-2">
            {isGestor && (
              <>
                <Button variant="outline" onClick={() => setNovaPastaOpen(true)}>
                  <FolderPlus size={18} className="mr-1" />
                  Nova Pasta
                </Button>
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload size={18} className="mr-1" />
                  Upload
                </Button>
              </>
            )}
            {!isGestor && (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload size={18} className="mr-1" />
                Enviar Documento
              </Button>
            )}
          </div>
        }
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
        <Home 
          size={16} 
          className="cursor-pointer hover:text-gray-900 dark:hover:text-white" 
          onClick={() => navegarPasta()}
        />
        {breadcrumb.map((item, index) => (
          <div key={item.id || 'root'} className="flex items-center gap-2">
            <ChevronRight size={14} />
            <span
              className={`${index === breadcrumb.length - 1 ? 'font-medium text-gray-900 dark:text-white' : 'cursor-pointer hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => {
                if (index < breadcrumb.length - 1) {
                  const pasta = pastas.find(p => p.id === item.id);
                  if (pasta) navegarPasta(pasta);
                  else navegarPasta();
                }
              }}
            >
              {item.nome}
            </span>
          </div>
        ))}
      </div>

      {/* Search and View Toggle */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar documentos..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
            className="px-3 py-2"
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
            className="px-3 py-2"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Pastas */}
          {pastasVisiveis.map((pasta) => (
            <div
              key={pasta.id}
              className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 cursor-pointer group"
              onClick={() => navegarPasta(pasta)}
            >
              <div className="flex items-start justify-between mb-2">
                <FolderOpen size={32} style={{ color: pasta.cor }} />
                {isGestor && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPastaParaCompartilhar(pasta);
                        setCompartilharPastaOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700"
                      title="Compartilhar"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ tipo: 'pasta', id: pasta.id });
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {pasta.nome}
              </p>
              {pasta.descricao && (
                <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 truncate mt-1">
                  {pasta.descricao}
                </p>
              )}
            </div>
          ))}

          {/* Documentos */}
          {documentosVisiveis.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 cursor-pointer group"
              onClick={() => setDetalhesDoc(doc)}
            >
              <div className="flex items-start justify-between mb-2">
                <File size={32} className="text-blue-600" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfViewerDoc(doc);
                      setPdfViewerOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  {isGestor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ tipo: 'doc', id: doc.id });
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {doc.nome}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                  {formatBytes(doc.tamanho)}
                </span>
                {getStatusBadge(doc.status)}
              </div>
            </div>
          ))}

          {pastasVisiveis.length === 0 && documentosVisiveis.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
              <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum item nesta pasta</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-slate-700 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800">
              <tr className="text-left text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Colaborador</th>
                <th className="p-3">Data Upload</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pastasVisiveis.map((pasta) => (
                <tr
                  key={pasta.id}
                  className="border-t border-gray-200 dark:border-slate-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => navegarPasta(pasta)}
                >
                  <td className="p-3 flex items-center gap-2">
                    <FolderOpen size={20} style={{ color: pasta.cor }} />
                    <span className="font-medium">{pasta.nome}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Pasta</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">—</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                    {colaboradores.find(c => c.id === pasta.colaboradorId)?.nome || 'Compartilhado'}
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                    {new Date(pasta.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3">—</td>
                  <td className="p-3">
                    {isGestor && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPastaParaCompartilhar(pasta);
                            setCompartilharPastaOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Compartilhar"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ tipo: 'pasta', id: pasta.id });
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {documentosVisiveis.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t border-gray-200 dark:border-slate-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setDetalhesDoc(doc)}
                >
                  <td className="p-3 flex items-center gap-2">
                    <File size={20} className="text-blue-600" />
                    <span>{doc.nome}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{doc.tipo}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{formatBytes(doc.tamanho)}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{doc.colaboradorNome}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                    {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3">{getStatusBadge(doc.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfViewerDoc(doc);
                          setPdfViewerOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      {isGestor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ tipo: 'doc', id: doc.id });
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {pastasVisiveis.length === 0 && documentosVisiveis.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                    <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhum item nesta pasta</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Nova Pasta */}
      <Modal isOpen={novaPastaOpen} onClose={() => setNovaPastaOpen(false)} title="Nova Pasta">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
              Nome da Pasta *
            </label>
            <Input
              value={nomePasta}
              onChange={(e) => setNomePasta(e.target.value)}
              placeholder="Ex: Documentos Pessoais"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <Input
              value={descricaoPasta}
              onChange={(e) => setDescricaoPasta(e.target.value)}
              placeholder="Descrição opcional"
            />
          </div>
          {isGestor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Colaborador (opcional)
              </label>
              <select
                value={colaboradorSelecionado}
                onChange={(e) => setColaboradorSelecionado(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
              >
                <option value="">Pasta compartilhada</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCriarPasta} fullWidth>
              Criar Pasta
            </Button>
            <Button variant="outline" onClick={() => setNovaPastaOpen(false)} fullWidth>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Upload */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload de Documento">
        <div className="space-y-4">
          {isGestor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Colaborador *
              </label>
              <select
                value={colaboradorSelecionado}
                onChange={(e) => setColaboradorSelecionado(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
              Tipo de Documento *
            </label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
            >
              <option value="RG">RG</option>
              <option value="CPF">CPF</option>
              <option value="Comprovante Residência">Comprovante de Residência</option>
              <option value="Contrato">Contrato</option>
              <option value="Carteira Trabalho">Carteira de Trabalho</option>
              <option value="Certidão Nascimento">Certidão de Nascimento</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificado">Certificado</option>
              <option value="Atestado">Atestado</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
              Arquivo *
            </label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpload} fullWidth disabled={!uploadFile}>
              <Upload size={16} className="mr-1" />
              Enviar
            </Button>
            <Button variant="outline" onClick={() => setUploadOpen(false)} fullWidth>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Detalhes do Documento */}
      {detalhesDoc && (
        <Modal
          isOpen={!!detalhesDoc}
          onClose={() => setDetalhesDoc(null)}
          title="Detalhes do Documento"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <File size={48} className="text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium text-lg">{detalhesDoc.nome}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">{detalhesDoc.tipo}</p>
              </div>
              {getStatusBadge(detalhesDoc.status)}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 dark:border-gray-700 pt-4 space-y-2">
              <p className="text-sm">
                <strong>Tamanho:</strong> {formatBytes(detalhesDoc.tamanho)}
              </p>
              <p className="text-sm">
                <strong>Colaborador:</strong> {detalhesDoc.colaboradorNome}
              </p>
              <p className="text-sm">
                <strong>Enviado por:</strong> {detalhesDoc.uploadPorNome}
              </p>
              <p className="text-sm">
                <strong>Data:</strong> {formatDate(detalhesDoc.dataUpload)}
              </p>
              {detalhesDoc.observacoes && (
                <p className="text-sm">
                  <strong>Observações:</strong> {detalhesDoc.observacoes}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => {
                  setPdfViewerDoc(detalhesDoc);
                  setPdfViewerOpen(true);
                }}
              >
                <Eye size={16} className="mr-1" />
                Visualizar
              </Button>
              <Button variant="outline" fullWidth>
                <Download size={16} className="mr-1" />
                Baixar
              </Button>
              {isGestor && detalhesDoc.status === 'pendente' && (
                <>
                  <Button
                    onClick={() => handleAprovar(detalhesDoc.id)}
                    className="bg-green-600 hover:bg-green-700"
                    fullWidth
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleRejeitar(detalhesDoc.id)}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    fullWidth
                  >
                    <XCircle size={16} className="mr-1" />
                    Rejeitar
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Confirmar Exclusão */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`Remover ${confirmDelete?.tipo === 'pasta' ? 'Pasta' : 'Documento'}`}
      />

      {/* Modal: Visualizador de PDF */}
      {pdfViewerDoc && (
        <PDFViewerModal
          isOpen={pdfViewerOpen}
          onClose={() => {
            setPdfViewerOpen(false);
            setPdfViewerDoc(null);
          }}
          documentUrl={pdfViewerDoc.url || ''}
          documentName={pdfViewerDoc.nome}
        />
      )}

      {/* Modal: Compartilhar Pasta */}
      {pastaParaCompartilhar && (
        <CompartilharPastaModal
          isOpen={compartilharPastaOpen}
          onClose={() => {
            setCompartilharPastaOpen(false);
            setPastaParaCompartilhar(null);
          }}
          pasta={pastaParaCompartilhar}
        />
      )}
    </div>
  );
}





