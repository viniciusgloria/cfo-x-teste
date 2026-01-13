import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Users, Plus, Search, Filter, Edit, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useFuncionariosClienteStore } from '../store/funcionariosClienteStore';
import { useAuthStore } from '../store/authStore';
import { useClientesStore } from '../store/clientesStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageBanner } from '../components/ui/PageBanner';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { FuncionarioCliente } from '../types';

export default function FuncionariosClientePage() {
  usePageTitle('Listar Colaboradores');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState<FuncionarioCliente | null>(null);
  const [formData, setFormData] = useState<Partial<FuncionarioCliente>>({
    tipoContrato: 'CLT',
    status: 'ativo'
  });

  const user = useAuthStore((state) => state.user);
  const { clientes } = useClientesStore();
  const {
    busca,
    filtroStatus,
    setBusca,
    setFiltroStatus,
    getFuncionariosFiltrados,
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario
  } = useFuncionariosClienteStore();

  // Determinar clienteId baseado no usuário
  const clienteId = clientes.find(c => c.status === 'ativo')?.id || 1;

  // cliente is intentionally not needed here

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const funcionariosFiltrados = getFuncionariosFiltrados(clienteId);

  // Paginação
  const totalItems = funcionariosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const funcionariosPaginados = funcionariosFiltrados.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [busca, filtroStatus]);

  const handleNovo = () => {
    setFuncionarioEditando(null);
    setFormData({
      tipoContrato: 'CLT',
      status: 'ativo',
      clienteId
    });
    setModalAberto(true);
  };

  const handleEditar = (funcionario: FuncionarioCliente) => {
    setFuncionarioEditando(funcionario);
    setFormData(funcionario);
    setModalAberto(true);
  };

  const handleSalvar = () => {
    // Validação básica
    if (!formData.nomeCompleto || !formData.cpf || !formData.funcao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (funcionarioEditando) {
      atualizarFuncionario(funcionarioEditando.id, formData);
      toast.success('Funcionário atualizado com sucesso!');
    } else {
      adicionarFuncionario({
        ...formData,
        clienteId
      } as Omit<FuncionarioCliente, 'id' | 'criadoEm' | 'atualizadoEm'>);
      toast.success('Funcionário cadastrado com sucesso!');
    }

    setModalAberto(false);
    setFormData({ tipoContrato: 'CLT', status: 'ativo' });
  };

  const handleRemover = (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente remover ${nome}?`)) {
      removerFuncionario(id);
      toast.success('Funcionário removido com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title={"Listar Colaboradores"}
        icon={<Users size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <Button variant="primary" onClick={handleNovo} className="flex items-center gap-2">
            <Plus size={18} />
            Novo Funcionário
          </Button>
        )}
      />

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search size={16} className="text-gray-500 dark:text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, função ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500 dark:text-slate-400" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:bg-gray-800"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Total de Funcionários</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {funcionariosFiltrados.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Ativos</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {funcionariosFiltrados.filter(f => f.status === 'ativo').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">Inativos</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
            {funcionariosFiltrados.filter(f => f.status === 'inativo').length}
          </div>
        </Card>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </Card>
      ) : funcionariosPaginados.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 dark:text-slate-500 mb-4" />
          <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 mb-4">
            Nenhum funcionário cadastrado
          </p>
          <Button variant="primary" onClick={handleNovo}>
            <Plus size={18} className="mr-2" />
            Cadastrar Primeiro Funcionário
          </Button>
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/50 dark:bg-gray-800 border-b border-gray-200 dark:border-slate-700 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    Contrato
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {funcionariosPaginados.map((funcionario) => (
                  <tr
                    key={funcionario.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {funcionario.nomeCompleto}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                      {funcionario.cpf}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                      {funcionario.funcao}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                      {funcionario.tipoContrato}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="default">
                        {funcionario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleEditar(funcionario)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleRemover(funcionario.id, funcionario.nomeCompleto)}
                          className="text-red-600 hover:text-red-700"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} funcionários
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
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
                              <span className="px-3 py-2 text-gray-500 dark:text-slate-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "primary" : "outline"}
                              onClick={() => setCurrentPage(page)}
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
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title={funcionarioEditando ? 'Editar Funcionário' : 'Novo Funcionário'}
      >
        <div className="space-y-4">
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dados Pessoais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Nome Completo *
              </label>
              <Input
                value={formData.nomeCompleto || ''}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                placeholder="Nome completo do funcionário"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  CPF *
                </label>
                <Input
                  value={formData.cpf || ''}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  RG
                </label>
                <Input
                  value={formData.rg || ''}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  placeholder="00.000.000-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <Input
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+55 11 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dados Profissionais</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Função *
                </label>
                <Input
                  value={formData.funcao || ''}
                  onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                  placeholder="Ex: Analista, Gerente..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Setor
                </label>
                <Input
                  value={formData.setor || ''}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  placeholder="Ex: Financeiro, TI..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Tipo de Contrato *
                </label>
                <select
                  value={formData.tipoContrato || 'CLT'}
                  onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as 'CLT' | 'PJ' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'ativo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 dark:bg-gray-800"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dados Bancários</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                Chave PIX
              </label>
              <Input
                value={formData.chavePix || ''}
                onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Banco
                </label>
                <Input
                  value={formData.banco || ''}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  placeholder="Nome do banco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Agência
                </label>
                <Input
                  value={formData.agencia || ''}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  placeholder="0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-1">
                  Conta
                </label>
                <Input
                  value={formData.conta || ''}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  placeholder="00000-0"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvar}>
              {funcionarioEditando ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}





