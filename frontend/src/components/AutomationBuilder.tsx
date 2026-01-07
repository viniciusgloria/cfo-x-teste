import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Power, ChevronDown, ChevronUp, FileText, CheckCircle, Clock, Repeat, Flag, User, Bell, Tag, FileCheck, Zap } from 'lucide-react';
import { Automacao, AutomacaoTrigger, AutomacaoAcao } from '../types';
import { useAutomacoeStore } from '../store/automacoeStore';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from './ui/ConfirmModal';

const AutomationBuilder: React.FC = () => {
  const { addToast } = useToast();
  const automacoes = useAutomacoeStore((s) => s.automacoes);
  const criarAutomacao = useAutomacoeStore((s) => s.criarAutomacao);
  const toggleAutomacao = useAutomacoeStore((s) => s.toggleAutomacao);
  const deletarAutomacao = useAutomacoeStore((s) => s.deletarAutomacao);
  const atualizarAutomacao = useAutomacoeStore((s) => s.atualizarAutomacao);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ nome: string; descricao: string; trigger: AutomacaoTrigger; acoes: { tipo: AutomacaoAcao; parametros: any }[] }>({ nome: '', descricao: '', trigger: 'tarefa_criada', acoes: [] });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    trigger: 'tarefa_criada' as AutomacaoTrigger,
    acoes: [{ tipo: 'enviar_notificacao' as AutomacaoAcao, parametros: { mensagem: '' } }],
  });

  const triggers: { value: AutomacaoTrigger; label: string }[] = [
    { value: 'tarefa_criada', label: 'Tarefa Criada' },
    { value: 'tarefa_completa', label: 'Tarefa Completa' },
    { value: 'vencimento_proximo', label: 'Vencimento Próximo' },
    { value: 'status_mudou', label: 'Status Mudou' },
    { value: 'prioridade_mudou', label: 'Prioridade Mudou' },
    { value: 'colaborador_atribuido', label: 'Colaborador Atribuído' },
  ];

  const acoesOptions: { value: AutomacaoAcao; label: string }[] = [
    { value: 'enviar_notificacao', label: 'Enviar Notificação' },
    { value: 'alterar_status', label: 'Alterar Status' },
    { value: 'alterar_prioridade', label: 'Alterar Prioridade' },
    { value: 'atribuir_colaborador', label: 'Atribuir Colaborador' },
    { value: 'adicionar_tag', label: 'Adicionar Tag' },
    { value: 'criar_tarefa_relacionada', label: 'Criar Tarefa Relacionada' },
  ];
  const handleNova = () => setShowForm(true);

  const handleCriar = () => {
    if (!formData.nome.trim()) {
      addToast('Nome da automação é obrigatório', 'error');
      return;
    }
    criarAutomacao({
      nome: formData.nome,
      descricao: formData.descricao,
      ativa: true,
      trigger: formData.trigger,
      condicoes: [],
      acoes: formData.acoes,
      criadoPor: 'usuario',
    } as any);
    addToast('Automação criada com sucesso!', 'success');
    setFormData({
      nome: '',
      descricao: '',
      trigger: 'tarefa_criada' as AutomacaoTrigger,
      acoes: [{ tipo: 'enviar_notificacao' as AutomacaoAcao, parametros: { mensagem: '' } }],
    });
    setShowForm(false);
  };

  const startEdit = (a: Automacao) => {
    setEditId(a.id);
    setEditData({ nome: a.nome, descricao: a.descricao || '', trigger: a.trigger, acoes: a.acoes || [] });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = () => {
    if (!editId) return;
    if (!editData.nome.trim()) {
      addToast('Nome é obrigatório', 'error');
      return;
    }
    atualizarAutomacao(editId, { nome: editData.nome, descricao: editData.descricao, trigger: editData.trigger, acoes: editData.acoes });
    addToast('Automação atualizada', 'success');
    setEditId(null);
  };

  const askDelete = (id: string) => {
    setConfirmDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = (reason?: string) => {
    if (confirmDeleteId) {
      deletarAutomacao(confirmDeleteId);
      addToast('Automação excluída', 'success');
    }
    setConfirmDeleteId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-transparent dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Minhas Automações</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Configure e gerencie suas automações</p>
        </div>
        <button
          onClick={handleNova}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nova
        </button>
      </div>

      {showForm ? (
        <div className="bg-blue-50 dark:bg-slate-900/60 border border-blue-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Criar Nova Automação</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Notificar tarefas urgentes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da automação..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Trigger</label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value as AutomacaoTrigger })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
              >
                {triggers.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Múltiplas ações */}
            <div className="space-y-3">
              {formData.acoes.map((acao, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded p-3 bg-white dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Ação #{idx + 1}</label>
                    {formData.acoes.length > 1 && (
                      <button
                        onClick={() => {
                          const novas = [...formData.acoes];
                          novas.splice(idx, 1);
                          setFormData({ ...formData, acoes: novas });
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <select
                    value={acao.tipo}
                    onChange={(e) => {
                      const novas = [...formData.acoes];
                      novas[idx] = { tipo: e.target.value as AutomacaoAcao, parametros: {} as any };
                      setFormData({ ...formData, acoes: novas });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 mb-2 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                  >
                    {acoesOptions.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>

                  {acao.tipo === 'enviar_notificacao' && (
                    <input
                      type="text"
                      value={acao.parametros.mensagem || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.mensagem = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      placeholder="Mensagem da notificação"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  )}

                  {acao.tipo === 'alterar_status' && (
                    <select
                      value={acao.parametros.status || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.status = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="fazendo">Fazendo</option>
                      <option value="concluida">Concluída</option>
                    </select>
                  )}

                  {acao.tipo === 'alterar_prioridade' && (
                    <select
                      value={acao.parametros.prioridade || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.prioridade = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  )}

                  {acao.tipo === 'atribuir_colaborador' && (
                    <input
                      type="text"
                      value={acao.parametros.colaboradorId || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.colaboradorId = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      placeholder="ID do colaborador"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  )}

                  {acao.tipo === 'adicionar_tag' && (
                    <input
                      type="text"
                      value={acao.parametros.tag || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.tag = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      placeholder="Nome da tag"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  )}

                  {acao.tipo === 'criar_tarefa_relacionada' && (
                    <input
                      type="text"
                      value={acao.parametros.titulo || ''}
                      onChange={(e) => {
                        const novas = [...formData.acoes];
                        novas[idx].parametros.titulo = e.target.value;
                        setFormData({ ...formData, acoes: novas });
                      }}
                      placeholder="Título da nova tarefa"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                    />
                  )}
                </div>
              ))}

              <button
                onClick={() => setFormData({ ...formData, acoes: [...formData.acoes, { tipo: 'enviar_notificacao' as AutomacaoAcao, parametros: {} as any }] })}
                className="text-blue-600 dark:text-emerald-400 hover:text-blue-800 dark:hover:text-emerald-300 text-sm font-medium"
              >
                + Adicionar ação
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCriar}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Criar Automação
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Zap size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-2">Crie automações personalizadas</h3>
            <p className="text-gray-600 dark:text-slate-400">Clique em "Nova" para começar.</p>
          </div>

          {/* Lista de Automações */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">Automações criadas</h4>
            {automacoes.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400">Nenhuma automação configurada.</p>
            ) : (
              <ul className="space-y-2">
                {automacoes.map((a) => (
                  <li key={a.id} className="border border-gray-200 dark:border-slate-700 rounded p-3 bg-white dark:bg-slate-900/50">
                    {editId === a.id ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editData.nome}
                            onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                            placeholder="Nome da automação"
                          />
                          <textarea
                            value={editData.descricao}
                            onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                            rows={2}
                            placeholder="Descrição"
                          />
                          <select
                            value={editData.trigger}
                            onChange={(e) => setEditData({ ...editData, trigger: e.target.value as AutomacaoTrigger })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                          >
                            {triggers.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Editar ações existentes */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Ações</p>
                          {editData.acoes.map((acao, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-900/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-slate-300">Ação #{idx + 1}</span>
                                {editData.acoes.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const novas = [...editData.acoes];
                                      novas.splice(idx, 1);
                                      setEditData({ ...editData, acoes: novas });
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                              <select
                                value={acao.tipo}
                                onChange={(e) => {
                                  const novas = [...editData.acoes];
                                  novas[idx] = { tipo: e.target.value as AutomacaoAcao, parametros: {} as any };
                                  setEditData({ ...editData, acoes: novas });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                              >
                                {acoesOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>

                              {acao.tipo === 'enviar_notificacao' && (
                                <input
                                  type="text"
                                  value={acao.parametros.mensagem || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.mensagem = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  placeholder="Mensagem"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                />
                              )}

                              {acao.tipo === 'alterar_status' && (
                                <select
                                  value={acao.parametros.status || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.status = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="fazendo">Fazendo</option>
                                  <option value="concluida">Concluída</option>
                                </select>
                              )}

                              {acao.tipo === 'alterar_prioridade' && (
                                <select
                                  value={acao.parametros.prioridade || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.prioridade = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                >
                                  <option value="baixa">Baixa</option>
                                  <option value="media">Média</option>
                                  <option value="alta">Alta</option>
                                  <option value="urgente">Urgente</option>
                                </select>
                              )}

                              {acao.tipo === 'atribuir_colaborador' && (
                                <input
                                  type="text"
                                  value={acao.parametros.colaboradorId || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.colaboradorId = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  placeholder="ID do colaborador"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                />
                              )}

                              {acao.tipo === 'adicionar_tag' && (
                                <input
                                  type="text"
                                  value={acao.parametros.tag || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.tag = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  placeholder="Tag"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                />
                              )}

                              {acao.tipo === 'criar_tarefa_relacionada' && (
                                <input
                                  type="text"
                                  value={acao.parametros.titulo || ''}
                                  onChange={(e) => {
                                    const novas = [...editData.acoes];
                                    novas[idx].parametros.titulo = e.target.value;
                                    setEditData({ ...editData, acoes: novas });
                                  }}
                                  placeholder="Título da nova tarefa"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100"
                                />
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => setEditData({ ...editData, acoes: [...editData.acoes, { tipo: 'enviar_notificacao' as AutomacaoAcao, parametros: {} as any }] })}
                            className="text-blue-600 dark:text-emerald-400 hover:text-blue-800 dark:hover:text-emerald-300 text-sm font-medium"
                          >
                            + Adicionar ação
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">Salvar</button>
                          <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded hover:bg-gray-300 dark:hover:bg-slate-700">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-slate-100">{a.nome}</p>
                          <p className="text-sm text-gray-600 dark:text-slate-400">Trigger: {triggers.find((t) => t.value === a.trigger)?.label}</p>
                        </div>
                        <span className={a.ativa ? 'text-green-600 dark:text-green-400 text-sm' : 'text-gray-500 dark:text-slate-400 text-sm'}>
                          {a.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    )}
                    {!editId && a.descricao && <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">{a.descricao}</p>}
                    {a.acoes?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Ações:</p>
                        <ul className="text-sm text-gray-700 dark:text-slate-400 list-disc ml-5">
                          {a.acoes.map((acao, idx) => (
                            <li key={idx}>
                              {acoesOptions.find((opt) => opt.value === acao.tipo)?.label || acao.tipo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toggleAutomacao(a.id)}
                        className={a.ativa ? 'px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200' : 'px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'}
                      >
                        {a.ativa ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => startEdit(a)}
                        disabled={!!editId && editId !== a.id}
                        className={`px-3 py-1.5 rounded ${editId && editId !== a.id ? 'bg-amber-50 text-amber-300 cursor-not-allowed' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => askDelete(a.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ConfirmModal
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Excluir automação?"
          />
        </div>
      )}
    </div>
  );
};

export default AutomationBuilder;
