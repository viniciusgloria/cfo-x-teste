import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, AlertCircle, TrendingUp, Award, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, BookOpen, Briefcase, BarChart3, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/Avatar';
import { useAvaliacoesStore, ProjetoRegistro, CursoRegistro } from '../store/avaliacoesStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Avaliacoes() {
  const { user } = useAuthStore();
  const { 
    avaliacoes, 
    concluirAvaliacao, 
    getAvaliacoesPendentes, 
    getAvaliacoesRecebidas,
    registrarProjeto,
    registrarCurso,
    getResumoMensalEquipe,
    getMetricasParaRelatorios
  } = useAvaliacoesStore();
  const { colaboradores } = useColaboradoresStore();
  const [avaliacaoAberta, setAvaliacaoAberta] = useState<number | null>(null);
  const [notas, setNotas] = useState({
    comunicacao: 0,
    trabalhoEmEquipe: 0,
    qualidadeTecnica: 0,
    pontualidade: 0,
    proatividade: 0,
  });
  const [pontosFortes, setPontosFortes] = useState('');
  const [pontosDesenvolvimento, setPontosDesenvolvimento] = useState('');
  const [comentarios, setComentarios] = useState('');
  
  // Controles de visualização gestor
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [modoVisualizacao, setModoVisualizacao] = useState<'individual' | 'equipe'>('individual');
  const [exibirGraficos, setExibirGraficos] = useState(false);
  
  // Modais de registro
  const [modalProjeto, setModalProjeto] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [projetoForm, setProjetoForm] = useState({ nome: '', descricao: '', data: '' });
  const [cursoForm, setCursoForm] = useState({ titulo: '', cargaHoraria: 0, certificacao: '', data: '' });

  const pendentes = user ? getAvaliacoesPendentes(user.id) : [];
  const recebidas = user ? getAvaliacoesRecebidas(user.id) : [];
  const recebidasConcluidas = recebidas.filter((a) => a.status === 'concluida');

  const [activeTab, setActiveTab] = useState<'pendentes' | 'recebidas'>('pendentes');
  
  // Métricas de equipe (gestor)
  const equipeIds = user?.papel === 'gestor' 
    ? colaboradores.filter(c => c.gestorId === user.id).map(c => c.id.toString())
    : [];
  
  const resumoMensal = modoVisualizacao === 'equipe' && user?.papel === 'gestor'
    ? getResumoMensalEquipe(mesSelecionado, equipeIds)
    : null;

  // Paginação
  const [currentPagePendentes, setCurrentPagePendentes] = useState(1);
  const [currentPageRecebidas, setCurrentPageRecebidas] = useState(1);
  const itemsPerPage = 20;

  const totalPendentes = pendentes.length;
  const totalPagesPendentes = Math.ceil(totalPendentes / itemsPerPage);
  const startPendentes = (currentPagePendentes - 1) * itemsPerPage;
  const pendentesPaginados = pendentes.slice(startPendentes, startPendentes + itemsPerPage);

  const totalRecebidas = recebidas.length;
  const totalPagesRecebidas = Math.ceil(totalRecebidas / itemsPerPage);
  const startRecebidas = (currentPageRecebidas - 1) * itemsPerPage;
  const recebidasPaginadas = recebidas.slice(startRecebidas, startRecebidas + itemsPerPage);

  // Reset pagination quando muda activeTab
  useEffect(() => {
    setCurrentPagePendentes(1);
    setCurrentPageRecebidas(1);
  }, [activeTab]);

  // Média geral do usuário considerando todas as avaliações concluídas recebidas
  const minhaMediaGeral = recebidasConcluidas.length > 0
    ? (() => {
        const soma = recebidasConcluidas.reduce(
          (acc, a) => ({
            comunicacao: acc.comunicacao + a.notas.comunicacao,
            trabalhoEmEquipe: acc.trabalhoEmEquipe + a.notas.trabalhoEmEquipe,
            qualidadeTecnica: acc.qualidadeTecnica + a.notas.qualidadeTecnica,
            pontualidade: acc.pontualidade + a.notas.pontualidade,
            proatividade: acc.proatividade + a.notas.proatividade,
          }),
          { comunicacao: 0, trabalhoEmEquipe: 0, qualidadeTecnica: 0, pontualidade: 0, proatividade: 0 }
        );

        const mediaPorCompetencia = {
          comunicacao: soma.comunicacao / recebidasConcluidas.length,
          trabalhoEmEquipe: soma.trabalhoEmEquipe / recebidasConcluidas.length,
          qualidadeTecnica: soma.qualidadeTecnica / recebidasConcluidas.length,
          pontualidade: soma.pontualidade / recebidasConcluidas.length,
          proatividade: soma.proatividade / recebidasConcluidas.length,
        };

        return calcularMedia(mediaPorCompetencia);
      })()
    : '0.0';

  const getColaborador = (id: string) => {
    return colaboradores.find((c) => c.id.toString() === id);
  };

  const handleAbrirAvaliacao = (id: number) => {
    const avaliacao = avaliacoes.find((a) => a.id === id);
    if (avaliacao) {
      setNotas(avaliacao.notas);
      setPontosFortes(avaliacao.pontosFortes || '');
      setPontosDesenvolvimento(avaliacao.pontosDesenvolvimento || '');
      setComentarios(avaliacao.comentarios || '');
      setAvaliacaoAberta(id);
    }
  };

  const handleConcluir = () => {
    if (!avaliacaoAberta) return;

    const todasNotasDadas = Object.values(notas).every((n) => n > 0);
    if (!todasNotasDadas) {
      toast.error('Por favor, preencha todas as notas');
      return;
    }

    concluirAvaliacao(avaliacaoAberta, {
      notas,
      pontosFortes,
      pontosDesenvolvimento,
      comentarios,
    });

    toast.success('Avaliação concluída com sucesso!');
    setAvaliacaoAberta(null);
    resetForm();
  };
  
  const handleRegistrarProjeto = () => {
    if (!avaliacaoAberta || !projetoForm.nome || !projetoForm.data) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    registrarProjeto(avaliacaoAberta, {
      id: `p-${Date.now()}`,
      ...projetoForm,
    });
    
    toast.success('Projeto registrado com sucesso!');
    setModalProjeto(false);
    setProjetoForm({ nome: '', descricao: '', data: '' });
  };
  
  const handleRegistrarCurso = () => {
    if (!avaliacaoAberta || !cursoForm.titulo || !cursoForm.data) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    registrarCurso(avaliacaoAberta, {
      id: `c-${Date.now()}`,
      ...cursoForm,
    });
    
    toast.success('Curso registrado com sucesso!');
    setModalCurso(false);
    setCursoForm({ titulo: '', cargaHoraria: 0, certificacao: '', data: '' });
  };
  
  const exportarRelatorio = (formato: 'csv' | 'json') => {
    const [ano, mes] = mesSelecionado.split('-');
    const inicioMes = mesSelecionado;
    const fimMes = `${ano}-${String(12).padStart(2, '0')}`; // até dezembro do ano
    
    const metricas = getMetricasParaRelatorios(inicioMes, fimMes, equipeIds);
    
    if (formato === 'json') {
      const blob = new Blob([JSON.stringify(metricas, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-avaliacoes-${mesSelecionado}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV simplificado
      const linhas = [
        'Mês,Total Avaliações,Concluídas,Pendentes,Média Geral,Projetos,Cursos',
        ...metricas.meses.map(m => 
          `${m.mes},${m.totalAvaliacoes},${m.concluidas},${m.pendentes},${m.mediaGeral},${m.projetosRealizados},${m.cursosConcluidos}`
        ),
      ];
      const csv = linhas.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-avaliacoes-${mesSelecionado}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast.success(`Relatório exportado em ${formato.toUpperCase()}`);
  };

  const resetForm = () => {
    setNotas({
      comunicacao: 0,
      trabalhoEmEquipe: 0,
      qualidadeTecnica: 0,
      pontualidade: 0,
      proatividade: 0,
    });
    setPontosFortes('');
    setPontosDesenvolvimento('');
    setComentarios('');
  };

  const renderStars = (competencia: keyof typeof notas, valor: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            onClick={() => setNotas({ ...notas, [competencia]: estrela })}
            className="transition-colors"
          >
            <Star
              size={24}
              className={estrela <= valor ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600 dark:text-slate-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  function calcularMedia(notasObj: typeof notas) {
    const valores = Object.values(notasObj);
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return valores.length > 0 ? (soma / valores.length).toFixed(1) : '0.0';
  }
  
  function formatarPeriodo(periodo: string) {
    const [ano, mes] = periodo.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  }

  const avaliacaoSelecionada = avaliacoes.find((a) => a.id === avaliacaoAberta);

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Avaliações de Desempenho" 
        icon={<Award size={32} />}
        actions={
          user?.papel === 'gestor' && (
            <div className="flex items-center gap-2">
              <Button
                variant={exibirGraficos ? 'primary' : 'outline'}
                onClick={() => setExibirGraficos(!exibirGraficos)}
              >
                <BarChart3 size={20} />
                Gráficos
              </Button>
              <Button variant="outline" onClick={() => exportarRelatorio('csv')}>
                <Download size={20} />
                CSV
              </Button>
              <Button variant="outline" onClick={() => exportarRelatorio('json')}>
                <FileText size={20} />
                JSON
              </Button>
            </div>
          )
        }
      />
      
      {/* Controles de Visualização (Gestor) */}
      {user?.papel === 'gestor' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={modoVisualizacao === 'individual' ? 'primary' : 'outline'}
                onClick={() => setModoVisualizacao('individual')}
              >
                Individual
              </Button>
              <Button
                variant={modoVisualizacao === 'equipe' ? 'primary' : 'outline'}
                onClick={() => setModoVisualizacao('equipe')}
              >
                Visão Equipe
              </Button>
            </div>
            
            {modoVisualizacao === 'equipe' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300">
                  Mês:
                </label>
                <input
                  type="month"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Cards de resumo - Individual ou Equipe */}
      {modoVisualizacao === 'individual' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-orange-600">{pendentes.length}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-green-600">
                {avaliacoes.filter((a) => a.status === 'concluida').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Minha Média</p>
              <p className="text-3xl font-bold text-blue-600">{minhaMediaGeral}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
      </div>
      ) : resumoMensal && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Total Avaliações</p>
                  <p className="text-3xl font-bold text-blue-600">{resumoMensal.totalAvaliacoes}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-500 dark:text-slate-400 mt-1">
                    {resumoMensal.concluidas} concluídas
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Award className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Média Geral</p>
                  <p className="text-3xl font-bold text-green-600">{resumoMensal.mediaGeral.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-500 dark:text-slate-400 mt-1">
                    de 5.0
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Projetos</p>
                  <p className="text-3xl font-bold text-purple-600">{resumoMensal.projetosRealizados}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-500 dark:text-slate-400 mt-1">
                    realizados
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-1">Cursos</p>
                  <p className="text-3xl font-bold text-orange-600">{resumoMensal.cursosConcluidos}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-500 dark:text-slate-400 mt-1">
                    concluídos
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <BookOpen className="text-orange-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
          
          {/* Gráficos de Competências */}
          {exibirGraficos && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Médias por Competência
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(resumoMensal.mediasPorCompetencia).map(([nome, valor]) => ({
                  competencia: nome.replace(/([A-Z])/g, ' $1').trim(),
                  media: valor,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="competencia" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="media" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}

      {/* Avaliações pendentes */}
      {pendentes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-600" />
            Avaliações Pendentes
          </h3>
          <div className="space-y-3">
            {pendentesPaginados.map((avaliacao) => {
              const avaliado = getColaborador(avaliacao.avaliadoId);
              if (!avaliado) return null;

              return (
                <div
                  key={avaliacao.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={avaliado.avatar} alt={avaliado.nome} size="md" />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{avaliado.nome}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        <span>{formatarPeriodo(avaliacao.periodo)}</span>
                        <span>•</span>
                        <span>Prazo: {new Date(avaliacao.dataLimite).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleAbrirAvaliacao(avaliacao.id)}>Avaliar</Button>
                </div>
              );
            })}
          </div>

          {/* Paginação Pendentes */}
          {totalPagesPendentes > 1 && (
            <Card className="mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startPendentes + 1}-{Math.min(startPendentes + itemsPerPage, totalPendentes)} de {totalPendentes} avaliações
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(1)} disabled={currentPagePendentes === 1} className="dark:text-white" aria-label="Primeira página">
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(prev => Math.max(1, prev - 1))} disabled={currentPagePendentes === 1} className="dark:text-white" aria-label="Página anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPagesPendentes }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPagesPendentes || Math.abs(page - currentPagePendentes) <= 1)
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>}
                            <Button variant={currentPagePendentes === page ? "primary" : "outline"} onClick={() => setCurrentPagePendentes(page)} className={currentPagePendentes === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(prev => Math.min(totalPagesPendentes, prev + 1))} disabled={currentPagePendentes === totalPagesPendentes} className="dark:text-white" aria-label="Próxima página">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(totalPagesPendentes)} disabled={currentPagePendentes === totalPagesPendentes} className="dark:text-white" aria-label="Última página">
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Card>
      )}

      {/* Avaliações recebidas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Minhas Avaliações
        </h3>
        <div className="space-y-3">
          {recebidas.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 py-8">
              Você ainda não recebeu avaliações
            </p>
          ) : (
            recebidasPaginadas.map((avaliacao) => {
              const avaliador = getColaborador(avaliacao.avaliadorId);
              if (!avaliador) return null;

              return (
                <div
                  key={avaliacao.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={avaliador.avatar} alt={avaliador.nome} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                          {avaliador.nome}
                        </h4>
                        <Badge className={avaliacao.status === 'concluida' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}>
                          {avaliacao.status === 'concluida' ? 'Concluída' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                        <span>{formatarPeriodo(avaliacao.periodo)}</span>
                        {avaliacao.status === 'concluida' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              Média: {calcularMedia(avaliacao.notas)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {avaliacao.status === 'concluida' && (
                    <Button variant="outline" onClick={() => handleAbrirAvaliacao(avaliacao.id)}>
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Paginação Recebidas */}
        {totalPagesRecebidas > 1 && (
          <Card className="mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                Mostrando {startRecebidas + 1}-{Math.min(startRecebidas + itemsPerPage, totalRecebidas)} de {totalRecebidas} avaliações
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(1)} disabled={currentPageRecebidas === 1} className="dark:text-white" aria-label="Primeira página">
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(prev => Math.max(1, prev - 1))} disabled={currentPageRecebidas === 1} className="dark:text-white" aria-label="Página anterior">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPagesRecebidas }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPagesRecebidas || Math.abs(page - currentPageRecebidas) <= 1)
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex gap-1">
                          {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">...</span>}
                          <Button variant={currentPageRecebidas === page ? "primary" : "outline"} onClick={() => setCurrentPageRecebidas(page)} className={currentPageRecebidas === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(prev => Math.min(totalPagesRecebidas, prev + 1))} disabled={currentPageRecebidas === totalPagesRecebidas} className="dark:text-white" aria-label="Próxima página">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(totalPagesRecebidas)} disabled={currentPageRecebidas === totalPagesRecebidas} className="dark:text-white" aria-label="Última página">
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {/* Modal de Avaliação */}
      {avaliacaoSelecionada && (
        <Modal
          isOpen={!!avaliacaoAberta}
          onClose={() => {
            setAvaliacaoAberta(null);
            resetForm();
          }}
          title={`Avaliação de ${getColaborador(avaliacaoSelecionada.avaliadoId)?.nome}`}
          className="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Competências */}
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Competências</h4>
              <div className="space-y-4">
                {Object.entries(notas).map(([competencia, valor]) => (
                  <div key={competencia} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-200 dark:text-gray-300 capitalize">
                      {competencia.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {avaliacaoSelecionada.status === 'pendente'
                      ? renderStars(competencia as keyof typeof notas, valor)
                      : (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((estrela) => (
                              <Star
                                key={estrela}
                                size={20}
                                className={
                                  estrela <= valor
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600 dark:text-slate-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                            {valor}/5
                          </span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback textual */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                  Pontos Fortes
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={pontosFortes}
                    onChange={(e) => setPontosFortes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Descreva os pontos fortes do colaborador..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-slate-200 dark:text-gray-300 p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.pontosFortes || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                  Pontos de Desenvolvimento
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={pontosDesenvolvimento}
                    onChange={(e) => setPontosDesenvolvimento(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Descreva áreas que podem ser desenvolvidas..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-slate-200 dark:text-gray-300 p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.pontosDesenvolvimento || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                  Comentários Gerais
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Comentários adicionais..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-slate-200 dark:text-gray-300 p-4 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.comentarios || 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAvaliacaoAberta(null);
                  resetForm();
                }}
              >
                Fechar
              </Button>
              {avaliacaoSelecionada.status === 'pendente' && (
                <Button onClick={handleConcluir}>Concluir Avaliação</Button>
              )}
              {avaliacaoSelecionada.status === 'concluida' && (
                <>
                  <Button variant="outline" onClick={() => setModalProjeto(true)}>
                    <Briefcase size={18} />
                    Registrar Projeto
                  </Button>
                  <Button variant="outline" onClick={() => setModalCurso(true)}>
                    <BookOpen size={18} />
                    Registrar Curso
                  </Button>
                </>
              )}
            </div>
            
            {/* Lista de Projetos e Cursos */}
            {avaliacaoSelecionada.status === 'concluida' && (
              <div className="mt-6 space-y-4">
                {(avaliacaoSelecionada.projetos && avaliacaoSelecionada.projetos.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Briefcase size={18} />
                      Projetos Realizados
                    </h4>
                    <div className="space-y-2">
                      {avaliacaoSelecionada.projetos.map((projeto) => (
                        <div key={projeto.id} className="p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{projeto.nome}</p>
                              {projeto.descricao && (
                                <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mt-1">{projeto.descricao}</p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {new Date(projeto.data).toLocaleDateString('pt-BR')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(avaliacaoSelecionada.cursos && avaliacaoSelecionada.cursos.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <BookOpen size={18} />
                      Cursos Concluídos
                    </h4>
                    <div className="space-y-2">
                      {avaliacaoSelecionada.cursos.map((curso) => (
                        <div key={curso.id} className="p-3 bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{curso.titulo}</p>
                              <div className="flex gap-3 mt-1 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                                {curso.cargaHoraria && <span>{curso.cargaHoraria}h</span>}
                                {curso.certificacao && <span>• {curso.certificacao}</span>}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {new Date(curso.data).toLocaleDateString('pt-BR')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
      
      {/* Modal Registrar Projeto */}
      <Modal
        isOpen={modalProjeto}
        onClose={() => {
          setModalProjeto(false);
          setProjetoForm({ nome: '', descricao: '', data: '' });
        }}
        title="Registrar Projeto"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Nome do Projeto *
            </label>
            <input
              type="text"
              value={projetoForm.nome}
              onChange={(e) => setProjetoForm({ ...projetoForm, nome: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Implantação módulo RH"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={projetoForm.descricao}
              onChange={(e) => setProjetoForm({ ...projetoForm, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
              placeholder="Descreva o projeto e suas entregas..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Data de Conclusão *
            </label>
            <input
              type="date"
              value={projetoForm.data}
              onChange={(e) => setProjetoForm({ ...projetoForm, data: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalProjeto(false);
                setProjetoForm({ nome: '', descricao: '', data: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleRegistrarProjeto}>Registrar</Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Registrar Curso */}
      <Modal
        isOpen={modalCurso}
        onClose={() => {
          setModalCurso(false);
          setCursoForm({ titulo: '', cargaHoraria: 0, certificacao: '', data: '' });
        }}
        title="Registrar Curso"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Título do Curso *
            </label>
            <input
              type="text"
              value={cursoForm.titulo}
              onChange={(e) => setCursoForm({ ...cursoForm, titulo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Comunicação Assertiva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Carga Horária (horas)
            </label>
            <input
              type="number"
              value={cursoForm.cargaHoraria || ''}
              onChange={(e) => setCursoForm({ ...cursoForm, cargaHoraria: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: 8"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Certificação/Instituição
            </label>
            <input
              type="text"
              value={cursoForm.certificacao}
              onChange={(e) => setCursoForm({ ...cursoForm, certificacao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Udemy, Coursera, etc"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
              Data de Conclusão *
            </label>
            <input
              type="date"
              value={cursoForm.data}
              onChange={(e) => setCursoForm({ ...cursoForm, data: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalCurso(false);
                setCursoForm({ titulo: '', cargaHoraria: 0, certificacao: '', data: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleRegistrarCurso}>Registrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}




