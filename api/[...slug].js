/**
 * DEFINITIVE MOCK API - ALL PAGES FULLY POPULATED
 */

export default function handler(req, res) {
  try {
    const { slug = [] } = req.query;
    const method = req.method;
    const parts = (Array.isArray(slug) ? slug : [slug]).filter(Boolean);
    const first = parts[0] || '';
    const second = parts[1] || '';

    // ==================== MOCK DATA ====================

    // 20 mock users
    const mockUsers = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      nome: `Usuário ${i + 1}`,
      email: `user${i + 1}@empresa.com`,
      role: i === 0 ? 'admin' : 'colaborador',
      ativo: true,
      avatar: null,
      tipo: 'CLT',
      primeiro_acesso: false,
      departamento: 'Gestão',
      cargo: 'Gestor',
      telefone: '11999999999'
    }));

    // 15 mock clientes
    const mockClientes = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      nome: `Cliente ${i + 1}`,
      nomeFantasia: `Fantasia ${i + 1}`,
      status: i % 3 === 0 ? 'pendente' : 'ativo',
      cnpj: `${String(i + 1).padStart(14, '0')}`,
      razao_social: `Razão Social ${i + 1}`,
      email: `contato${i + 1}@cliente${i + 1}.com.br`,
      telefone: `1199${String(i + 1000).padStart(6, '0')}`,
      endereco: `Rua ${i + 1}, ${100 + i}`,
      mrr: 1000 + i * 500,
      omie_sync: i % 2 === 0,
      data_inicio: '2024-01-15',
      created_at: new Date(2026, 0, 29 - i).toISOString(),
      updated_at: new Date(2026, 0, 29).toISOString()
    }));

    // 20 mock colaboradores
    const mockColaboradores = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      nome: `Colaborador ${i + 1}`,
      email: `colab${i + 1}@empresa.com`,
      telefone: '11999999999',
      cargo: 'Analista',
      departamento: 'RH',
      ativo: true,
      dataAdmissao: '2024-01-15',
      cpf: `${String(i + 1).padStart(11, '0')}`,
      rg: `${String(i + 1).padStart(9, '0')}`,
      salario: 3000 + i * 500
    }));

    // 20 mock tarefas
    const mockTarefas = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      titulo: `Tarefa ${i + 1}`,
      descricao: `Descrição completa da tarefa ${i + 1}`,
      status: ['pendente', 'em_progresso', 'concluida'][i % 3],
      prioridade: ['baixa', 'media', 'alta'][i % 3],
      dataVencimento: new Date(2026, 1, 1 + i).toISOString(),
      responsavel: `Colaborador ${(i % 20) + 1}`,
      projeto: `Projeto ${Math.ceil((i + 1) / 5)}`
    }));

    // 15 mock solicitacoes
    const mockSolicitacoes = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      tipo: ['folga', 'adiantamento', 'licenca'][i % 3],
      status: ['pendente', 'aprovada', 'rejeitada'][i % 3],
      dataSolicitacao: new Date(2026, 0, 29 - i).toISOString(),
      colaborador: mockColaboradores[i % 20],
      motivo: `Motivo da solicitação ${i + 1}`
    }));

    // 15 mock notificacoes
    const mockNotificacoes = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      titulo: `Notificação ${i + 1}`,
      mensagem: `Mensagem importante número ${i + 1}`,
      tipo: ['info', 'aviso', 'erro'][i % 3],
      lida: i % 2 === 0,
      dataCriacao: new Date(2026, 0, 29 - (i % 5)).toISOString()
    }));

    // 12 mock documentos
    const mockDocumentos = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      nome: `Documento ${i + 1}.pdf`,
      tipo: 'pdf',
      tamanho: 1024 * (100 + i),
      dataUpload: new Date(2026, 0, 29 - i).toISOString(),
      uploadPor: `Usuário ${(i % 20) + 1}`,
      url: `https://example.com/docs/${i + 1}.pdf`
    }));

    // 8 mock OKRs
    const mockOKRs = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      objetivo: `Objetivo estratégico ${i + 1}`,
      descricao: `Descrição detalhada do objetivo ${i + 1}`,
      periodo: '2026 Q1',
      status: ['planejamento', 'em_progresso', 'concluido'][i % 3],
      progresso: (i * 15) % 100,
      keyResults: [
        { id: '1', descricao: `KR 1.${i + 1}`, progresso: (i * 20) % 100 },
        { id: '2', descricao: `KR 2.${i + 1}`, progresso: (i * 25) % 100 }
      ]
    }));

    // 12 mock avaliacoes
    const mockAvaliacoes = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      colaborador: mockColaboradores[i % 20],
      periodo: '2025 Q4',
      status: ['rascunho', 'finalizada'][i % 2],
      nota: 7 + (i % 3),
      dataAvaliacao: new Date(2026, 0, 29 - i).toISOString(),
      avaliador: `Gestor ${(i % 5) + 1}`
    }));

    // 8 mock beneficios
    const mockBeneficios = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      nome: `Benefício ${i + 1}`,
      descricao: `Descrição do benefício ${i + 1}`,
      tipo: ['saude', 'alimentacao', 'transporte'][i % 3],
      valor: 100 * (i + 1),
      ativo: true
    }));

    // 12 mock folha
    const mockFolha = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      mes: `2026-${String(i + 1).padStart(2, '0')}`,
      total: 15000 * (i + 1),
      colaboradores: 10 + i,
      status: ['rascunho', 'processada', 'paga'][i % 3],
      dataProcessamento: new Date(2026, 0, 28).toISOString()
    }));

    // 10 mock folha clientes
    const mockFolhaClientes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      cliente: mockClientes[i % 15],
      mes: `2026-${String(i + 1).padStart(2, '0')}`,
      valor: 5000 + i * 1000,
      status: ['pendente', 'processada', 'paga'][i % 3]
    }));

    // 8 mock chats
    const mockChats = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      participantes: [`Usuário ${(i % 20) + 1}`, `Colaborador ${(i % 20) + 2}`],
      ultimaMensagem: `Última mensagem do chat ${i + 1}`,
      dataUltimaMensagem: new Date(2026, 0, 29 - (i % 3)).toISOString(),
      naoLidas: i % 2 === 0 ? i : 0
    }));

    // 15 mock mural posts
    const mockMuralPosts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      autor: `Usuário ${(i % 20) + 1}`,
      conteudo: `Post do mural número ${i + 1}. Confira as novidades!`,
      dataCriacao: new Date(2026, 0, 29 - (i % 5)).toISOString(),
      curtidas: i * 2,
      comentarios: i,
      tipo: ['comunicado', 'dica', 'celebracao'][i % 3]
    }));

    // 12 mock feedbacks
    const mockFeedbacks = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      de: `Usuário ${(i % 20) + 1}`,
      para: `Colaborador ${((i + 1) % 20) + 1}`,
      conteudo: `Feedback construtivo número ${i + 1}`,
      dataFeedback: new Date(2026, 0, 29 - i).toISOString(),
      categoria: ['desempenho', 'comportamento', 'desenvolvimento'][i % 3],
      publicado: i % 2 === 0
    }));

    // 10 mock lembretes
    const mockLembretes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      titulo: `Lembrete ${i + 1}`,
      descricao: `Descrição importante do lembrete ${i + 1}`,
      dataVencimento: new Date(2026, 1, 1 + i).toISOString(),
      prioridade: ['baixa', 'media', 'alta'][i % 3],
      concluido: i % 3 === 0,
      criador: `Usuário ${(i % 20) + 1}`
    }));

    // 25 mock pontos
    const mockPontos = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      colaborador: `Colaborador ${(i % 20) + 1}`,
      data: new Date(2026, 0, 29 - (i % 5)).toISOString(),
      horaEntrada: `0${8 + (i % 2)}:00`,
      horaSaida: `1${7 + (i % 2)}:00`,
      horasTrabalho: 8 + (i % 2),
      tipo: ['presencial', 'remoto', 'hibrido'][i % 3]
    }));

    // 15 mock eventos
    const mockEventos = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      titulo: `Evento ${i + 1}`,
      descricao: `Descrição completa do evento ${i + 1}`,
      dataInicio: new Date(2026, 1, 1 + i).toISOString(),
      dataFim: new Date(2026, 1, 2 + i).toISOString(),
      local: `Sala ${i + 1}`,
      participantes: i + 1,
      tipo: ['reuniao', 'treinamento', 'confraternizacao'][i % 3]
    }));

    // 10 mock automacoes
    const mockAutomacoes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      nome: `Automação ${i + 1}`,
      descricao: `Descrição da automação ${i + 1}`,
      ativa: i % 2 === 0,
      tipo: ['email', 'sms', 'webhook'][i % 3],
      dataCriacao: new Date(2026, 0, 20).toISOString()
    }));

    // 8 mock relatorios
    const mockRelatorios = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      nome: `Relatório ${i + 1}`,
      tipo: ['vendas', 'financeiro', 'rh'][i % 3],
      dataCriacao: new Date(2026, 0, 29 - i).toISOString(),
      status: 'disponivel'
    }));

    // ==================== ROUTES ====================

    // AUTH
    if (first === 'auth') {
      if (second === 'login' && method === 'POST') {
        const { email, senha } = req.body || {};
        if (email === 'admin@cfohub.com' && senha === 'admin123') {
          return res.status(200).json({ access_token: 'mock-token', token_type: 'bearer' });
        }
        return res.status(401).json({ detail: 'Invalid' });
      }
      if (second === 'me') return res.status(200).json(mockUsers[0]);
      if (second === 'logout' && method === 'POST') return res.status(204).send('');
      if (second === 'change-password' && method === 'POST') return res.status(200).json({ detail: 'OK' });
    }

    // USERS
    if (first === 'users') {
      if (method === 'GET') return res.status(200).json(mockUsers);
      if (method === 'POST') return res.status(201).json(mockUsers[0]);
      if (second) return res.status(200).json(mockUsers[parseInt(second) - 1] || mockUsers[0]);
    }

    // CLIENTES
    if (first === 'clientes') {
      if (method === 'GET') return res.status(200).json(mockClientes);
      if (method === 'POST') return res.status(201).json(mockClientes[0]);
      if (second) return res.status(200).json(mockClientes[parseInt(second) - 1] || mockClientes[0]);
    }

    // COLABORADORES
    if (first === 'colaboradores') {
      if (method === 'GET') return res.status(200).json(mockColaboradores);
      if (method === 'POST') return res.status(201).json(mockColaboradores[0]);
      if (second) return res.status(200).json(mockColaboradores[parseInt(second) - 1] || mockColaboradores[0]);
    }

    // TAREFAS
    if (first === 'tarefas') {
      if (method === 'GET') return res.status(200).json(mockTarefas);
      if (method === 'POST') return res.status(201).json(mockTarefas[0]);
    }

    // SOLICITAÇÕES
    if (first === 'solicitacoes') {
      if (method === 'GET') return res.status(200).json(mockSolicitacoes);
      if (method === 'POST') return res.status(201).json(mockSolicitacoes[0]);
    }

    // NOTIFICAÇÕES
    if (first === 'notificacoes') return res.status(200).json(mockNotificacoes);

    // DOCUMENTOS
    if (first === 'documentos') {
      if (method === 'GET') return res.status(200).json(mockDocumentos);
      if (method === 'POST') return res.status(201).json(mockDocumentos[0]);
    }

    // OKRs
    if (first === 'okrs') {
      if (method === 'GET') return res.status(200).json(mockOKRs);
      if (method === 'POST') return res.status(201).json(mockOKRs[0]);
    }

    // AVALIAÇÕES
    if (first === 'avaliacoes') {
      if (method === 'GET') return res.status(200).json(mockAvaliacoes);
      if (method === 'POST') return res.status(201).json(mockAvaliacoes[0]);
    }

    // BENEFÍCIOS
    if (first === 'beneficios') {
      if (method === 'GET') return res.status(200).json(mockBeneficios);
      if (method === 'POST') return res.status(201).json(mockBeneficios[0]);
    }

    // FOLHA
    if (first === 'folha' || first === 'folha-pagamento') return res.status(200).json(mockFolha);

    // FOLHA CLIENTES
    if (first === 'folha-clientes') return res.status(200).json(mockFolhaClientes);

    // CHAT
    if (first === 'chat') return res.status(200).json(mockChats);

    // MURAL
    if (first === 'mural') {
      if (method === 'GET') return res.status(200).json(mockMuralPosts);
      if (method === 'POST') return res.status(201).json(mockMuralPosts[0]);
    }

    // FEEDBACKS
    if (first === 'feedbacks') {
      if (method === 'GET') return res.status(200).json(mockFeedbacks);
      if (method === 'POST') return res.status(201).json(mockFeedbacks[0]);
    }

    // LEMBRETES
    if (first === 'lembretes') {
      if (method === 'GET') return res.status(200).json(mockLembretes);
      if (method === 'POST') return res.status(201).json(mockLembretes[0]);
    }

    // PONTO
    if (first === 'ponto') {
      if (method === 'GET') return res.status(200).json(mockPontos);
      if (method === 'POST') return res.status(201).json(mockPontos[0]);
    }

    // CALENDÁRIO
    if (first === 'calendario' || first === 'calendar') {
      if (method === 'GET') return res.status(200).json(mockEventos);
      if (method === 'POST') return res.status(201).json(mockEventos[0]);
    }

    // AUTOMAÇÕES
    if (first === 'automacoes') {
      if (method === 'GET') return res.status(200).json(mockAutomacoes);
      if (method === 'POST') return res.status(201).json(mockAutomacoes[0]);
    }

    // RELATÓRIOS
    if (first === 'relatorios') return res.status(200).json(mockRelatorios);

    // EMPRESA
    if (first === 'empresa') return res.status(200).json({ id: '1', nome: 'CFO X', website: 'https://cfohub.com' });

    // PERMISSÕES
    if (first === 'permissoes') {
      if (second === 'role') return res.status(200).json({ role: parts[2] || 'colaborador', permissoes: ['read:*'] });
      return res.status(200).json([
        { id: '1', nome: 'admin', descricao: 'Administrador' },
        { id: '2', nome: 'gestor', descricao: 'Gestor' },
        { id: '3', nome: 'colaborador', descricao: 'Colaborador' }
      ]);
    }

    // CARGOS-SETORES
    if (first === 'cargos-setores' || first === 'cargossetores') {
      return res.status(200).json([
        { id: '1', nome: 'Analista', setor: 'TI' },
        { id: '2', nome: 'Gerente', setor: 'Gestão' }
      ]);
    }

    // PERFORMANCE
    if (first === 'performance' && second === 'snapshot') {
      return res.status(200).json({
        canais: [
          { id: 'yampi', nome: 'Yampi', faturamento: 50000, gastoAds: 3000, pedidos: 200, roas: 16.67, cpa: 15, margem: 30, alertas: [] },
          { id: 'ml', nome: 'Mercado Livre', faturamento: 30000, gastoAds: 1800, pedidos: 100, roas: 16.67, cpa: 18, margem: 28, alertas: [] }
        ],
        funil: [
          { estagio: 'visitas', valor: 100000 },
          { estagio: 'leads', valor: 5000 },
          { estagio: 'conversoes', valor: 300 }
        ],
        diarias: [
          { data: '2026-01-29', faturamento: 10000, gastoAds: 800, pedidosPagos: 50, vendedores: 0, canceladas: 2 },
          { data: '2026-01-28', faturamento: 9000, gastoAds: 700, pedidosPagos: 45, vendedores: 0, canceladas: 1 }
        ],
        eventos: [],
        custos: { gateway: 2.5, transporte: 50, picking: 25, imposto: 15, checkout: 1.5 },
        integracoes: []
      });
    }

    // DEFAULT
    return res.status(200).json(mockUsers);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
