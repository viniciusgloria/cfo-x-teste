import { useState, useMemo } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  User,
  Mail,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useDocumentosStore } from '../store/documentosStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function PendenciasRH() {
  usePageTitle('Pendências RH');

  const { user } = useAuthStore();
  const { colaboradores, enviarEmailBoasVindas, atualizarColaborador, podeAtivarColaborador } = useColaboradoresStore();
  const { 
    documentos, 
    getDocumentosObrigatorios, 
    getProgressoDocumentos, 
    criarPastasDeTemplate,
    aprovarDocumento,
    rejeitarDocumento
  } = useDocumentosStore();

  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<number | null>(null);

  const isGestor = user?.role === 'gestor' || user?.role === 'admin';

  // Filtrar colaboradores em contratação
  const colaboradoresEmContratacao = useMemo(() => {
    return colaboradores.filter(c => c.status === 'em_contratacao');
  }, [colaboradores]);

  // Calcular progresso de cada colaborador
  const colaboradoresComProgresso = useMemo(() => {
    return colaboradoresEmContratacao.map(colaborador => {
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
  }, [colaboradoresEmContratacao, getProgressoDocumentos, getDocumentosObrigatorios, documentos]);

  const colaboradorDetalhes = useMemo(() => {
    if (!colaboradorSelecionado) return null;
    return colaboradoresComProgresso.find(c => c.id === colaboradorSelecionado);
  }, [colaboradorSelecionado, colaboradoresComProgresso]);

  const handleCriarPastas = (colaborador: typeof colaboradoresComProgresso[0]) => {
    criarPastasDeTemplate(
      colaborador.id,
      colaborador.cargo,
      user?.id || '1',
      user?.name || 'Sistema'
    );
    toast.success(`Pastas criadas para ${colaborador.nome}!`);
  };

  const handleEnviarEmail = (colaboradorId: number) => {
    enviarEmailBoasVindas(colaboradorId);
  };

  const handleAtivarColaborador = (colaborador: typeof colaboradoresComProgresso[0]) => {
    const resultado = podeAtivarColaborador(colaborador.id);
    
    if (!resultado.pode) {
      toast.error(resultado.motivo || 'Não é possível ativar este colaborador');
      return;
    }

    atualizarColaborador(colaborador.id, { status: 'ativo' });
    toast.success(`${colaborador.nome} ativado com sucesso!`);
  };

  const handleAprovarDocumento = (docId: string) => {
    aprovarDocumento(docId, user?.id || '1', user?.name || 'Gestor');
    toast.success('Documento aprovado!');
  };

  const handleRejeitarDocumento = (docId: string) => {
    const motivo = prompt('Digite o motivo da rejeição:');
    if (motivo) {
      rejeitarDocumento(docId, user?.id || '1', user?.name || 'Gestor', motivo);
      toast.success('Documento rejeitado!');
    }
  };

  if (!isGestor) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
          Apenas gestores e administradores podem acessar esta página
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Pendências RH" />

      {colaboradoresComProgresso.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma pendência
          </h3>
          <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
            Não há colaboradores em processo de contratação no momento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Colaboradores */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Em Contratação ({colaboradoresComProgresso.length})
            </h3>

            {colaboradoresComProgresso.map((colaborador) => (
              <div
                key={colaborador.id}
                className={`bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-lg p-4 cursor-pointer border-2 transition-all ${
                  colaboradorSelecionado === colaborador.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-slate-700 dark:border-gray-700 hover:border-blue-300'
                }`}
                onClick={() => setColaboradorSelecionado(colaborador.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
                      {colaborador.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {colaborador.nome}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        {colaborador.cargo}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    size={20} 
                    className={`text-gray-400 dark:text-slate-500 transition-transform ${
                      colaboradorSelecionado === colaborador.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Barra de Progresso */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Progresso</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {colaborador.percentualCompleto}%
                    </span>
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
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    <span>{colaborador.progresso.aprovados}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Clock size={14} />
                    <span>{colaborador.progresso.pendentes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle size={14} />
                    <span>{colaborador.progresso.rejeitados}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detalhes do Colaborador */}
          <div className="lg:col-span-2">
            {colaboradorDetalhes ? (
              <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {colaboradorDetalhes.nome}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {colaboradorDetalhes.cargo}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        {colaboradorDetalhes.email}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleEnviarEmail(colaboradorDetalhes.id)}
                    variant="outline"
                    className="px-3 py-2"
                  >
                    <Mail size={16} className="mr-2" />
                    Enviar Email
                  </Button>
                </div>

                {/* Ações Rápidas */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCriarPastas(colaboradorDetalhes)}
                    variant="outline"
                    fullWidth
                  >
                    <FileText size={16} className="mr-2" />
                    Criar Pastas
                  </Button>
                  <Button
                    onClick={() => handleAtivarColaborador(colaboradorDetalhes)}
                    className="bg-green-600 hover:bg-green-700"
                    fullWidth
                    disabled={colaboradorDetalhes.percentualCompleto < 100}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Ativar Colaborador
                  </Button>
                </div>

                {/* Checklist de Documentos Obrigatórios */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Documentos Obrigatórios ({colaboradorDetalhes.progresso.aprovados}/{colaboradorDetalhes.docsObrigatorios.length})
                  </h4>

                  <div className="space-y-3">
                    {colaboradorDetalhes.docsObrigatorios.map((tipoDoc) => {
                      const doc = colaboradorDetalhes.documentos.find(d => d.tipo === tipoDoc);

                      return (
                        <div
                          key={tipoDoc}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {doc ? (
                              doc.status === 'aprovado' ? (
                                <CheckCircle className="text-green-600" size={20} />
                              ) : doc.status === 'pendente' ? (
                                <Clock className="text-yellow-600" size={20} />
                              ) : (
                                <XCircle className="text-red-600" size={20} />
                              )
                            ) : (
                              <AlertCircle className="text-gray-400 dark:text-slate-500" size={20} />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {tipoDoc}
                              </p>
                              {doc && (
                                <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                                  {doc.nome}
                                  {doc.observacoes && ` • ${doc.observacoes}`}
                                </p>
                              )}
                            </div>
                          </div>

                          {doc && doc.status === 'pendente' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAprovarDocumento(doc.id)}
                                className="bg-green-600 hover:bg-green-700 px-3 py-2"
                              >
                                <CheckCircle size={16} />
                              </Button>
                              <Button
                                onClick={() => handleRejeitarDocumento(doc.id)}
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 px-3 py-2"
                              >
                                <XCircle size={16} />
                              </Button>
                            </div>
                          )}

                          {!doc && (
                            <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                              Aguardando envio
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Documentos Adicionais */}
                {colaboradorDetalhes.documentos.filter(
                  d => !colaboradorDetalhes.docsObrigatorios.includes(d.tipo)
                ).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Documentos Adicionais
                    </h4>
                    <div className="space-y-2">
                      {colaboradorDetalhes.documentos
                        .filter(d => !colaboradorDetalhes.docsObrigatorios.includes(d.tipo))
                        .map(doc => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {doc.status === 'aprovado' ? (
                                <CheckCircle className="text-green-600" size={18} />
                              ) : doc.status === 'pendente' ? (
                                <Clock className="text-yellow-600" size={18} />
                              ) : (
                                <XCircle className="text-red-600" size={18} />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {doc.tipo} - {doc.nome}
                                </p>
                              </div>
                            </div>

                            {doc.status === 'pendente' && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAprovarDocumento(doc.id)}
                                  className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => handleRejeitarDocumento(doc.id)}
                                  variant="outline"
                                  className="text-red-600 border-red-600 px-3 py-1 text-sm"
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                <User size={48} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Selecione um colaborador para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




