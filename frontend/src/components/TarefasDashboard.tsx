import React from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Tarefa } from '../types';

interface TarefasDashboardProps {
  tarefas: Tarefa[];
}

const TarefasDashboard: React.FC<TarefasDashboardProps> = ({ tarefas }) => {
  // Calcular métricas
  const aFazer = tarefas.filter((t) => t.status === 'a_fazer').length;
  const emAndamento = tarefas.filter((t) => t.status === 'fazendo').length;
  const concluidas = tarefas.filter((t) => t.status === 'feito').length;

  // Dados para gráfico de pizza (status)
  const statusChartData = [
    { name: 'A Fazer', value: aFazer, color: '#ef4444' },
    { name: 'Fazendo', value: emAndamento, color: '#eab308' },
    { name: 'Feito', value: concluidas, color: '#22c55e' },
  ].filter((item) => item.value > 0);

  // Dados para gráfico de barras (por colaborador)
  const colaboradorMap = new Map<string, number>();
  tarefas.forEach((t) => {
    t.colaboradorIds.forEach((id) => {
      colaboradorMap.set(id, (colaboradorMap.get(id) || 0) + 1);
    });
  });

  const colaboradorChartData = Array.from(colaboradorMap.entries())
    .slice(0, 10)
    .map(([id, count]) => ({
      nome: `Colaborador ${id.substring(0, 4)}`,
      tarefas: count,
    }));

  // Dados para gráfico de prioridade
  const prioridadeMap = new Map<string, number>();
  tarefas.forEach((t) => {
    prioridadeMap.set(t.prioridade, (prioridadeMap.get(t.prioridade) || 0) + 1);
  });

  const prioridadeData = [
    { name: 'Urgente', value: prioridadeMap.get('urgente') || 0, color: '#dc2626' },
    { name: 'Alta', value: prioridadeMap.get('alta') || 0, color: '#ea580c' },
    { name: 'Média', value: prioridadeMap.get('media') || 0, color: '#eab308' },
    { name: 'Baixa', value: prioridadeMap.get('baixa') || 0, color: '#2563eb' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Gráfico de Pizza - Status */}
      {statusChartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusChartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} tarefas`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Prioridade */}
          {prioridadeData.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tarefas por Prioridade</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={prioridadeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    label={{ position: 'top' }}
                  >
                    {prioridadeData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de Barras - Colaboradores */}
      {colaboradorChartData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Colaboradores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={colaboradorChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="tarefas" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TarefasDashboard;
