import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { FileText, Download, Clock, Users, Target, Filter, BarChart, DollarSign, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePontoStore } from '../store/pontoStore';
import { minutesToHHMM, formatBankMinutes } from '../utils/time';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { useOKRsStore } from '../store/okrsStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useFolhaPagamentoStore } from '../store/folhaPagamentoStore';
import { useFolhaClientesStore } from '../store/folhaClientesStore';
import { useClientesStore } from '../store/clientesStore';

type ReportType = 'ponto' | 'solicitacoes' | 'okrs' | 'colaboradores' | 'folha-pagamento' | 'folha-clientes' | 'mrr';

export function Relatorios() {
  usePageTitle('Relatórios');
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const { registros } = usePontoStore();
  const { solicitacoes } = useSolicitacoesStore();
  const { okrs } = useOKRsStore();
  const { colaboradores } = useColaboradoresStore();
  const { getFolhasFiltradas: getFolhasPagamento } = useFolhaPagamentoStore();
  const { getFolhasFiltradas: getFolhasClientes } = useFolhaClientesStore();
  const { clientes } = useClientesStore();

  const reportTypes = [
    {
      type: 'mrr' as ReportType,
      title: 'Relatório de MRR',
      description: 'Histórico de MRR por cliente com períodos',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      count: clientes.filter(c => c.servicosContratados?.planosHistorico?.length).length,
    },
    {
      type: 'ponto' as ReportType,
      title: 'Relatório de Ponto',
      description: 'Registros de entrada, saída e banco de horas',
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      count: registros.length,
    },
    {
      type: 'solicitacoes' as ReportType,
      title: 'Relatório de Solicitações',
      description: 'Atestados e ajustes de ponto',
      icon: FileText,
      color: 'bg-cyan-100 text-cyan-600',
      count: solicitacoes.length,
    },
    {
      type: 'okrs' as ReportType,
      title: 'Relatório de OKRs',
      description: 'Objetivos e resultados-chave',
      icon: Target,
      color: 'bg-purple-100 text-purple-600',
      count: okrs.length,
    },
    {
      type: 'colaboradores' as ReportType,
      title: 'Relatório de Colaboradores',
      description: 'Lista completa de colaboradores',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      count: colaboradores.length,
    },
    {
      type: 'folha-pagamento' as ReportType,
      title: 'Relatório de Folha de Pagamento',
      description: 'Folhas de pagamento dos colaboradores',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      count: getFolhasPagamento().length,
    },
    {
      type: 'folha-clientes' as ReportType,
      title: 'Relatório de Folha de Clientes',
      description: 'Folhas de pagamento dos clientes BPO',
      icon: Building2,
      color: 'bg-indigo-100 text-indigo-600',
      count: getFolhasClientes().length,
    },
  ];

  const handleExportCSV = () => {
    if (!selectedType) return;

    let csvContent = '';
    let filename = '';

    switch (selectedType) {
      case 'mrr':
        csvContent = 'Cliente,Plano,MRR,Data Início,Data Fim,Duração,Status\n';
        clientes.forEach(cliente => {
          if (cliente.servicosContratados?.planosHistorico?.length) {
            const planos = cliente.servicosContratados.planosHistorico;
            planos.forEach(plano => {
              const dataInicio = new Date(plano.dataInicio).toLocaleDateString('pt-BR');
              const dataFim = plano.dataFim ? new Date(plano.dataFim).toLocaleDateString('pt-BR') : '-';
              const status = !plano.dataFim ? 'Ativo' : 'Encerrado';
              csvContent += `"${cliente.dadosGerais.nome}","${plano.nomePlano}",${plano.mrr.toFixed(2)},${dataInicio},${dataFim},"${plano.dataInicio}",${status}\n`;
            });
          }
        });
        filename = 'relatorio-mrr.csv';
        break;

      case 'ponto':
        csvContent = 'Data,Entrada,Saida,Intervalo,Total,Banco\n';
        const expectedPerDay = 8 * 60;
        registros.forEach(r => {
          const entradaPunch = (r.punches || []).find((p: any) => p.type === 'entrada');
          const saidaPunch = ([...(r.punches || [])].reverse() as any[]).find((p) => p.type === 'saida');
          const entrada = entradaPunch?.hhmm ?? '';
          const saida = saidaPunch?.hhmm ?? '';
          const intervaloMin = (r.intervals || []).reduce((s: number, it: any) => s + (it.duracaoMinutos || 0), 0);
          const intervaloStr = intervaloMin > 0 ? minutesToHHMM(intervaloMin) : '';
          const totalStr = typeof r.totalMinutos === 'number' ? minutesToHHMM(r.totalMinutos) : '';
          const banco = formatBankMinutes((r.totalMinutos ?? 0) - expectedPerDay);
          csvContent += `${r.data},${entrada},${saida},${intervaloStr},${totalStr},${banco}\n`;
        });
        filename = 'relatorio-ponto.csv';
        break;
      
      case 'solicitacoes':
        csvContent = 'Tipo,Status,Data,Solicitante\n';
        solicitacoes.forEach(s => {
          csvContent += `${s.tipo},${s.status},${s.data},${s.solicitante}\n`;
        });
        filename = 'relatorio-solicitacoes.csv';
        break;
      
      case 'okrs':
        csvContent = 'Objetivo,Tipo,Status,Progresso\n';
        okrs.forEach(o => {
          csvContent += `${o.objetivo},${o.tipo},${o.status},${o.progresso}%\n`;
        });
        filename = 'relatorio-okrs.csv';
        break;
      
      case 'colaboradores':
        csvContent = 'Nome,Email,Cargo,Departamento,Status\n';
        colaboradores.forEach(c => {
          csvContent += `${c.nome},${c.email},${c.cargo},${c.departamento},${c.status}\n`;
        });
        filename = 'relatorio-colaboradores.csv';
        break;
      
      case 'folha-pagamento':
        csvContent = 'Colaborador,Função,Empresa,Contrato,Valor,Adicional,Reembolso,Desconto,Total,Situação,Data Pagamento\n';
        const folhasPagamento = getFolhasPagamento();
        folhasPagamento.forEach(f => {
          csvContent += `${f.colaborador.nomeCompleto},${f.colaborador.funcao},${f.colaborador.empresa},${f.colaborador.contrato},${f.valor.toFixed(2)},${f.adicional.toFixed(2)},${f.reembolso.toFixed(2)},${f.desconto.toFixed(2)},${f.valorTotal.toFixed(2)},${f.situacao},${f.dataPagamento || ''}\n`;
        });
        filename = 'relatorio-folha-pagamento.csv';
        break;
      
      case 'folha-clientes':
        csvContent = 'Cliente,Colaborador,Função,Empresa,CTT,Valor,Adicional,Reembolso,Desconto,Total,Situação,Data Pagamento\n';
        const folhasClientes = getFolhasClientes();
        folhasClientes.forEach(f => {
          csvContent += `${f.cliente.nome},${f.colaborador},${f.funcao},${f.empresa},${f.ctt || ''},${f.valor.toFixed(2)},${f.adicional.toFixed(2)},${f.reembolso.toFixed(2)},${f.desconto.toFixed(2)},${f.valorTotal.toFixed(2)},${f.situacao},${f.dataPagamento || ''}\n`;
        });
        filename = 'relatorio-folha-clientes.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExportJSON = () => {
    if (!selectedType) return;

    let data: any = [];
    let filename = '';

    switch (selectedType) {
      case 'mrr':
        data = clientes
          .filter(c => c.servicosContratados?.planosHistorico?.length)
          .map(cliente => ({
            cliente: cliente.dadosGerais.nome,
            cnpj: cliente.dadosGerais.cnpj,
            planos: cliente.servicosContratados.planosHistorico
          }));
        filename = 'relatorio-mrr.json';
        break;

      case 'ponto':
        data = registros;
        filename = 'relatorio-ponto.json';
        break;
      case 'solicitacoes':
        data = solicitacoes;
        filename = 'relatorio-solicitacoes.json';
        break;
      case 'okrs':
        data = okrs;
        filename = 'relatorio-okrs.json';
        break;
      case 'colaboradores':
        data = colaboradores;
        filename = 'relatorio-colaboradores.json';
        break;
      
      case 'folha-pagamento':
        data = getFolhasPagamento();
        filename = 'relatorio-folha-pagamento.json';
        break;
      
      case 'folha-clientes':
        data = getFolhasClientes();
        filename = 'relatorio-folha-clientes.json';
        break;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageBanner title="Relatórios" icon={<BarChart size={32} />} />

      {/* Seleção de tipo de relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedType === report.type;
          
          return (
            <Card
              key={report.type}
              onClick={() => setSelectedType(report.type)}
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {report.count}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
                {report.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Filtros e exportação */}
      {selectedType && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filtros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 dark:text-gray-300 mb-2">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Download size={20} />
                Exportar
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <FileText size={18} />
                  Exportar CSV
                </Button>
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText size={18} />
                  Exportar JSON
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-3">
                Os arquivos serão baixados automaticamente no formato selecionado.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Instruções */}
      {!selectedType && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400 dark:text-slate-500 dark:text-gray-500 dark:text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Selecione um tipo de relatório
            </h3>
            <p className="text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500">
              Escolha um dos cards acima para visualizar e exportar os dados
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}




