import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  Download,
  Settings,
  Gift
} from 'lucide-react';
import { useBeneficiosStore } from '../store/beneficiosStore';
import { usePageTitle } from '../hooks/usePageTitle';
import { Beneficio, TipoBeneficio, FornecedorBeneficio } from '../types';
import BeneficioCard from '../components/BeneficioCard';
import BeneficioModal from '../components/BeneficioModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Beneficios() {
  usePageTitle('Benefícios');

  const {
    carregarBeneficios,
    carregarFornecedores,
    carregarMetricas,
    metricas,
    getBeneficiosFiltrados,
    ativarDesativarBeneficio,
    filtroTipo,
    filtroStatus,
    filtroFornecedor,
    termoBusca,
    setFiltroTipo,
    setFiltroStatus,
    setFiltroFornecedor,
    setTermoBusca,
    limparFiltros
  } = useBeneficiosStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [beneficioEdicao, setBeneficioEdicao] = useState<Beneficio | null>(null);

  useEffect(() => {
    carregarBeneficios();
    carregarFornecedores();
    carregarMetricas();
  }, []);

  const beneficiosFiltrados = getBeneficiosFiltrados();

  const handleNovoBeneficio = () => {
    setBeneficioEdicao(null);
    setModalOpen(true);
  };

  const handleEditarBeneficio = (beneficio: Beneficio) => {
    setBeneficioEdicao(beneficio);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setBeneficioEdicao(null);
  };

  // Dados para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const dadosPizzaTipo = metricas?.custosPorTipo.map((item, index) => ({
    name: item.nome,
    value: item.custoTotal,
    color: COLORS[index % COLORS.length]
  })) || [];

  const dadosPizzaFornecedor = metricas?.custosPorFornecedor.map((item, index) => ({
    name: item.nome,
    value: item.custoTotal,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Benefícios" 
        icon={<Gift size={32} />}
        right={(
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-sm px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="text-sm px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <Settings className="h-4 w-4" />
              Integrações
            </Button>
            <Button onClick={handleNovoBeneficio} variant="primary" className="text-sm px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Novo Benefício
            </Button>
          </div>
        )}
      />

      {/* Cards de Métricas */}
      {metricas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Benefícios Ativos</h3>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{metricas.beneficiosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                de {metricas.totalBeneficios} cadastrados
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Colaboradores com Benefícios</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{metricas.totalColaboradoresComBeneficios}</div>
              <p className="text-xs text-muted-foreground">
                {metricas.taxaAdesao.toFixed(1)}% de adesão
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Custo Total Mensal</h3>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                R$ {metricas.custoTotalMensal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                Empresa: R$ {metricas.custoEmpresaMensal.toLocaleString('pt-BR')}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Mais Utilizado</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              {metricas.beneficioMaisUtilizado ? (
                <>
                  <div className="text-2xl font-bold">
                    {metricas.beneficioMaisUtilizado.nome}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metricas.beneficioMaisUtilizado.totalColaboradores} colaboradores
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Nenhum dado</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {metricas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfico de Linha - Evolução de Custos */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4">Evolução de Custos (Últimos 6 Meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.evolucaoCustos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="custoTotal" 
                    stroke="#3b82f6" 
                    name="Custo Total"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="custoEmpresa" 
                    stroke="#10b981" 
                    name="Custo Empresa"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="custoColaborador" 
                    stroke="#f59e0b" 
                    name="Custo Colaborador"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gráfico de Pizza - Custos por Tipo */}
          <Card>
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4">Custos por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizzaTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizzaTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gráfico de Barras - Custos por Tipo Detalhado */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4">Custos Detalhados por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricas.custosPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Bar dataKey="custoEmpresa" fill="#10b981" name="Custo Empresa" />
                  <Bar dataKey="custoColaborador" fill="#f59e0b" name="Custo Colaborador" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gráfico de Pizza - Custos por Fornecedor */}
          <Card>
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4">Custos por Fornecedor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizzaFornecedor}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizzaFornecedor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar benefícios..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value as TipoBeneficio | 'todos')}
              className="w-full md:w-[200px] px-3 py-2 border rounded-md"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="alimentacao">Alimentação</option>
              <option value="refeicao">Refeição</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="odontologico">Odontológico</option>
              <option value="academia">Academia</option>
              <option value="seguro_vida">Seguro de Vida</option>
              <option value="vale_cultura">Vale Cultura</option>
              <option value="auxilio_creche">Auxílio Creche</option>
              <option value="outros">Outros</option>
            </select>

            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'ativo' | 'inativo')}
              className="w-full md:w-[180px] px-3 py-2 border rounded-md"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>

            <select 
              value={filtroFornecedor} 
              onChange={(e) => setFiltroFornecedor(e.target.value as FornecedorBeneficio | 'todos')}
              className="w-full md:w-[180px] px-3 py-2 border rounded-md"
            >
              <option value="todos">Todos</option>
              <option value="alelo">Alelo</option>
              <option value="sodexo">Sodexo</option>
              <option value="vr">VR</option>
              <option value="ticket">Ticket</option>
              <option value="flash">Flash</option>
              <option value="caju">Caju</option>
              <option value="manual">Manual</option>
            </select>

            {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroFornecedor !== 'todos' || termoBusca) && (
              <Button variant="ghost" onClick={limparFiltros}>
                Limpar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista de Benefícios */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Benefícios Cadastrados ({beneficiosFiltrados.length})
          </h2>
        </div>

        {beneficiosFiltrados.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum benefício encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {termoBusca || filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroFornecedor !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro benefício'}
              </p>
              {!termoBusca && filtroTipo === 'todos' && filtroStatus === 'todos' && filtroFornecedor === 'todos' && (
                <Button onClick={handleNovoBeneficio}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Benefício
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beneficiosFiltrados.map((beneficio) => (
              <BeneficioCard
                key={beneficio.id}
                beneficio={beneficio}
                onEdit={handleEditarBeneficio}
                onToggleStatus={ativarDesativarBeneficio}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <BeneficioModal
        open={modalOpen}
        onClose={handleCloseModal}
        beneficio={beneficioEdicao}
      />
    </div>
  );
}



