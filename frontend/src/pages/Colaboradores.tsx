import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, UserCog, Gift } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CollaboratorCard } from '../components/CollaboratorCard';
import { Pagination } from '../components/ui/Pagination';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { useBeneficiosStore } from '../store/beneficiosStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useEffect } from 'react';
import { formatPhone, isValidCPF, isValidCNPJ } from '../utils/validation';
import toast from 'react-hot-toast';
import { useDocumentosStore } from '../store/documentosStore';
import { usePontoStore } from '../store/pontoStore';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { File, FolderOpen, Download, CheckCircle, XCircle, Clock, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { Badge } from '../components/ui/Badge';
import { minutesToHHMM } from '../utils/time';

const ITEMS_PER_PAGE = 12;

export function Colaboradores() {
  usePageTitle('Colaboradores');
  const navigate = useNavigate();
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const atualizarColaborador = useColaboradoresStore((s) => s.atualizarColaborador);
  const busca = useColaboradoresStore((s) => s.busca);
  const setBusca = useColaboradoresStore((s) => s.setBusca);
  const { user } = useAuthStore();
  const { getDocumentosByColaborador, getPastasByColaborador, getDocumentosByPasta } = useDocumentosStore();
  const { registros, bancoHoras } = usePontoStore();
  const { getBeneficiosPorColaborador, getCustoTotalColaborador, beneficios: beneficiosDisponiveis } = useBeneficiosStore();
  const { solicitacoes } = useSolicitacoesStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo'>('todos');

  const isColaboradorCompleto = (c: any) => {
    const cpfValido = c.cpf && isValidCPF(c.cpf.replace(/\D/g, ''));
    const cnpjValido = c.contrato === 'PJ' ? (c.cnpj && isValidCNPJ(c.cnpj.replace(/\D/g, ''))) : true;
    return cpfValido && cnpjValido;
  };

  const filtered = colaboradores
    .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter(c => {
      if (filtroStatus === 'todos') return true;
      return c.status === filtroStatus;
    });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedColaboradores = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Reset para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [busca, filtroStatus]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const podeGerenciarUsuarios = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const podeEditar = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  return (
    <div className="space-y-6">
      <PageBanner
        title="Colaboradores"
        icon={<UserCog size={32} />}
        right={(
          <>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-slate-400" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <Input
                className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700"
                placeholder="Buscar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </span>
            <Button variant="outline" onClick={() => { setBusca(''); }} className="px-3 py-2 text-sm whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Limpar
            </Button>
            <select
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value as 'todos' | 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Status: Todos</option>
              <option value="ativo">Ativo ({colaboradores.filter(c => c.status === 'ativo').length})</option>
              <option value="afastado">Afastado ({colaboradores.filter(c => c.status === 'afastado').length})</option>
              <option value="ferias">Férias ({colaboradores.filter(c => c.status === 'ferias').length})</option>
              <option value="em_contratacao">Em Contratação ({colaboradores.filter(c => c.status === 'em_contratacao').length})</option>
              <option value="inativo">Inativo ({colaboradores.filter(c => c.status === 'inativo').length})</option>
            </select>
            {podeGerenciarUsuarios && (
              <Button onClick={() => navigate('/colaboradores/cadastro')} className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <Plus size={18} />
                Novo Colaborador
              </Button>
            )}
          </>
        )}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedColaboradores.map(c => (
              <CollaboratorCard 
                key={c.id || c.email} 
                nome={c.nome} 
                cargo={c.cargo} 
                departamento={c.departamento} 
                avatar={c.avatar} 
                cpf={c.cpf}
                cnpj={c.cnpj}
                contrato={c.contrato}
                status={c.status}
                onOpen={() => navigate(`/colaboradores/cadastro?id=${c.id || c.email}`)} 
              />
            ))}
          </div>
          
          {filtered.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {previewOpen && previewDoc && (
        <PDFViewerModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          documentUrl={previewDoc.url}
          documentName={previewDoc.nome}
        />
      )}
    </div>
  );
}





