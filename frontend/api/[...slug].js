// Comprehensive mock API for all pages on Vercel
export default function handler(req, res) {
  const { slug = [] } = req.query;
  const method = req.method;
  const parts = (Array.isArray(slug) ? slug : [slug]).filter(Boolean);
  const first = parts[0] || '';
  const rest = parts.slice(1);

  // ============= MOCK DATA GENERATORS =============
  
  const generateMockUser = (id) => ({
    id: String(id),
    nome: `Usuário ${id}`,
    email: `user${id}@empresa.com`,
    role: id === 1 ? 'admin' : 'colaborador',
    ativo: true,
    avatar: null,
    tipo: 'CLT',
    primeiro_acesso: false,
    departamento: 'Gestão',
    cargo: 'Gestor',
    telefone: '11999999999'
  });

  const generateMockCliente = (id) => ({
    id,
    dadosGerais: {
      nome: `Cliente ${id}`,
      nomeFantasia: `Fantasia ${id}`,
      cnpj: `${String(id).padStart(14, '0')}`,
      endereco: `Rua ${id}`,
      numero: String(100 + id),
      cidade: 'São Paulo',
      uf: 'SP',
      segmentoAtuacao: 'Varejo'
    },
    status: id % 3 === 0 ? 'pendente' : 'ativo',
    dataRegistro: new Date(2026, 0, 29 - id).toISOString()
  });

  const generateMockColaborador = (id) => ({
    id: String(id),
    nome: `Colaborador ${id}`,
    email: `colab${id}@empresa.com`,
    telefone: '11999999999',
    cargo: 'Analista',
    departamento: 'RH',
    ativo: true,
    dataAdmissao: '2024-01-15',
    cpf: `${String(id).padStart(11, '0')}`,
    salario: 3000 + id * 500
  });

  const generateMockTarefa = (id) => ({
    id: String(id),
    titulo: `Tarefa ${id}`,
    descricao: `Descrição da tarefa ${id}`,
    status: ['pendente', 'em_progresso', 'concluida'][id % 3],
    prioridade: ['baixa', 'media', 'alta'][id % 3],
    dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
    responsavel: `Colaborador ${id}`,
    projeto: `Projeto ${Math.ceil(id / 2)}`
  });

  const generateMockSolicitacao = (id) => ({
    id: String(id),
    tipo: ['folga', 'adiantamento', 'licenca'][id % 3],
    status: ['pendente', 'aprovada', 'rejeitada'][id % 3],
    dataSolicitacao: new Date(2026, 0, 29 - id).toISOString(),
    dataDecisao: id % 2 === 0 ? new Date(2026, 0, 28 - id).toISOString() : null,
    colaborador: generateMockColaborador(id),
    motivo: `Motivo da solicitação ${id}`
  });

  const generateMockNotificacao = (id) => ({
    id: String(id),
    tipo: ['info', 'aviso', 'erro'][id % 3],
    titulo: `Notificação ${id}`,
    mensagem: `Mensagem da notificação ${id}`,
    lida: id % 2 === 0,
    dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
    referencia: { tipo: 'tarefa', id: String(id) }
  });

  const generateMockDocumento = (id) => ({
    id: String(id),
    nome: `Documento ${id}.pdf`,
    tipo: ['contrato', 'nota', 'comprovante'][id % 3],
    tamanho: 1024 * (100 + id),
    dataUpload: new Date(2026, 0, 29 - id).toISOString(),
    uploadPor: `Usuário ${id}`,
    url: `https://example.com/docs/${id}.pdf`
  });

  const generateMockOKR = (id) => ({
    id: String(id),
    objetivo: `Objetivo ${id}`,
    descricao: `Descrição do objetivo ${id}`,
    periodo: '2026 Q1',
    status: ['planejamento', 'em_progresso', 'concluido'][id % 3],
    progresso: (id * 15) % 100,
    keyResults: [
      { id: '1', descricao: `KR 1.${id}`, progresso: (id * 20) % 100 },
      { id: '2', descricao: `KR 2.${id}`, progresso: (id * 25) % 100 }
    ]
  });

  const generateMockAvaliacao = (id) => ({
    id: String(id),
    colaborador: generateMockColaborador(id),
    periodo: '2025 Q4',
    status: ['rascunho', 'finalizada'][id % 2],
    nota: 7 + (id % 3),
    dataAvaliacao: new Date(2026, 0, 29 - id).toISOString(),
    avaliador: `Gestor ${id}`
  });

  const generateMockBeneficio = (id) => ({
    id: String(id),
    nome: `Benefício ${id}`,
    descricao: `Descrição do benefício ${id}`,
    tipo: ['saude', 'alimentacao', 'transporte'][id % 3],
    valor: 100 * (id + 1),
    ativo: true,
    dataVigencia: new Date(2026, 0, 1).toISOString()
  });

  const generateMockFolhaPagamento = (id) => ({
    id: String(id),
    mes: `2026-0${id}`,
    total: 15000 * id,
    colaboradores: 10 + id,
    status: ['rascunho', 'processada', 'paga'][id % 3],
    dataProcessamento: new Date(2026, 0, 28).toISOString()
  });

  const generateMockChat = (id) => ({
    id: String(id),
    participantes: [`Usuário ${id}`, `Colaborador ${id + 1}`],
    ultimaMensagem: `Última mensagem do chat ${id}`,
    dataUltimaMensagem: new Date(2026, 0, 29 - (id % 3)).toISOString(),
    naoLidas: id % 2 === 0 ? id : 0
  });

  const generateMockMuralPost = (id) => ({
    id: String(id),
    autor: `Usuário ${id}`,
    conteudo: `Post do mural número ${id}`,
    dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
    curtidas: id * 2,
    comentarios: id,
    tipo: ['comunicado', 'dica', 'celebracao'][id % 3]
  });

  const generateMockFeedback = (id) => ({
    id: String(id),
    de: `Usuário ${id}`,
    para: `Colaborador ${id + 1}`,
    conteudo: `Feedback construtivo número ${id}`,
    dataFeedback: new Date(2026, 0, 29 - id).toISOString(),
    categoria: ['desempenho', 'comportamento', 'desenvolvimento'][id % 3],
    publicado: id % 2 === 0
  });

  const generateMockLembrete = (id) => ({
    id: String(id),
    titulo: `Lembrete ${id}`,
    descricao: `Descrição do lembrete ${id}`,
    dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
    prioridade: ['baixa', 'media', 'alta'][id % 3],
    concluido: id % 3 === 0,
    criador: `Usuário ${id}`
  });

  const generateMockPonto = (id) => ({
    id: String(id),
    colaborador: `Colaborador ${id}`,
    data: new Date(2026, 0, 29 - (id % 5)).toISOString(),
    horaEntrada: `0${8 + (id % 2)}:00`,
    horaSaida: `1${7 + (id % 2)}:00`,
    horasTrabalho: 8 + (id % 2),
    tipo: ['presencial', 'remoto', 'hibrido'][id % 3]
  });

  const generateMockCalendarioEvento = (id) => ({
    id: String(id),
    titulo: `Evento ${id}`,
    descricao: `Descrição do evento ${id}`,
    dataInicio: new Date(2026, 1, 1 + id).toISOString(),
    dataFim: new Date(2026, 1, 2 + id).toISOString(),
    local: `Sala ${id}`,
    participantes: id + 1,
    tipo: ['reuniao', 'treinamento', 'confraternizacao'][id % 3]
  });

  // ============= ROUTE HANDLERS =============

  // Auth routes
  if (first === 'auth') {
    const sub = rest[0] || '';
    if (sub === 'login' && method === 'POST') {
      const { email, senha } = req.body || {};
      if (email === 'admin@cfohub.com' && senha === 'admin123') {
        return res.status(200).json({ access_token: 'mock-jwt-token-12345', token_type: 'bearer' });
      }
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    if (sub === 'me' && method === 'GET') {
      return res.status(200).json(generateMockUser(1));
    }
    if (sub === 'logout' && method === 'POST') {
      return res.status(204).send('');
    }
    if (sub === 'change-password' && method === 'POST') {
      return res.status(200).json({ detail: 'Password changed' });
    }
  }

  // Users
  if (first === 'users') {
    if (method === 'GET') {
      const limit = parseInt(req.query.limit) || 20;
      return res.status(200).json({
        items: Array.from({ length: limit }, (_, i) => generateMockUser(i + 1)),
        total: 50
      });
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockUser(1));
    }
    if (rest[0] && method === 'GET') {
      return res.status(200).json(generateMockUser(parseInt(rest[0]) || 1));
    }
  }

  // Clientes
  if (first === 'clientes') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 10 }, (_, i) => generateMockCliente(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockCliente(1));
    }
    if (rest[0] && method === 'GET') {
      return res.status(200).json(generateMockCliente(parseInt(rest[0]) || 1));
    }
  }

  // Colaboradores
  if (first === 'colaboradores') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 15 }, (_, i) => generateMockColaborador(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockColaborador(1));
    }
  }

  // Tarefas
  if (first === 'tarefas') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 12 }, (_, i) => generateMockTarefa(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockTarefa(1));
    }
  }

  // Solicitações
  if (first === 'solicitacoes') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 8 }, (_, i) => generateMockSolicitacao(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockSolicitacao(1));
    }
  }

  // Notificações
  if (first === 'notificacoes') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 10 }, (_, i) => generateMockNotificacao(i + 1))
      );
    }
  }

  // Documentos
  if (first === 'documentos') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 6 }, (_, i) => generateMockDocumento(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockDocumento(1));
    }
  }

  // OKRs
  if (first === 'okrs') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 5 }, (_, i) => generateMockOKR(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockOKR(1));
    }
  }

  // Avaliações
  if (first === 'avaliacoes') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 8 }, (_, i) => generateMockAvaliacao(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockAvaliacao(1));
    }
  }

  // Benefícios
  if (first === 'beneficios') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 6 }, (_, i) => generateMockBeneficio(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockBeneficio(1));
    }
  }

  // Folha de Pagamento
  if (first === 'folha' || first === 'folha-pagamento') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 12 }, (_, i) => generateMockFolhaPagamento(i + 1))
      );
    }
  }

  // Chat
  if (first === 'chat') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 5 }, (_, i) => generateMockChat(i + 1))
      );
    }
  }

  // Mural
  if (first === 'mural') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 10 }, (_, i) => generateMockMuralPost(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockMuralPost(1));
    }
  }

  // Feedbacks
  if (first === 'feedbacks') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 8 }, (_, i) => generateMockFeedback(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockFeedback(1));
    }
  }

  // Lembretes
  if (first === 'lembretes') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 7 }, (_, i) => generateMockLembrete(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockLembrete(1));
    }
  }

  // Ponto
  if (first === 'ponto') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 20 }, (_, i) => generateMockPonto(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockPonto(1));
    }
  }

  // Calendário
  if (first === 'calendario' || first === 'calendar') {
    if (method === 'GET') {
      return res.status(200).json(
        Array.from({ length: 10 }, (_, i) => generateMockCalendarioEvento(i + 1))
      );
    }
    if (method === 'POST') {
      return res.status(201).json(generateMockCalendarioEvento(1));
    }
  }

  // Empresa
  if (first === 'empresa') {
    return res.status(200).json({
      id: '1',
      nome: 'CFO X Consultoria',
      logo: null,
      descricao: 'Plataforma de gestão empresarial',
      website: 'https://cfohub.com'
    });
  }

  // Permissões
  if (first === 'permissoes') {
    if (rest[0] === 'role') {
      const role = rest[1] || 'colaborador';
      return res.status(200).json({
        role,
        permissoes: ['read:dashboard', 'read:tarefas', 'read:clientes', 'read:colaboradores']
      });
    }
    return res.status(200).json([
      { id: '1', nome: 'admin', descricao: 'Administrador' },
      { id: '2', nome: 'gestor', descricao: 'Gestor' },
      { id: '3', nome: 'colaborador', descricao: 'Colaborador' }
    ]);
  }

  // Default 404
  return res.status(404).json({
    detail: 'Mock endpoint not found',
    path: parts.join('/'),
    method
  });
}

  if (first === 'users') {
    const id = rest[0];
    if (!id && method === 'GET') {
      const email = req.query.email;
      if (email) return res.status(200).json(mockUsers.filter(u => u.email === email));
      return res.status(200).json(mockUsers);
    }
    if (!id && method === 'POST') {
      const body = req.body || {};
      const newUser = { id: String(Math.floor(Math.random() * 10000)), name: body.nome || body.name || 'Novo Usuário', email: body.email || 'novo@exemplo.com', role: body.role || 'colaborador', empresa: body.empresa || null, ativo: true };
      return res.status(201).json(newUser);
    }
    if (id && method === 'GET') return res.status(200).json(mockUsers.find(u => u.id === id) || mockUsers[0]);
    if (id && (method === 'PUT' || method === 'PATCH')) {
      const body = req.body || {};
      return res.status(200).json({ ...(mockUsers.find(u => u.id === id) || mockUsers[0]), ...body });
    }
    if (id && method === 'DELETE') return res.status(204).send('');
    if (rest[0] === 'email' && rest[1] && method === 'GET') {
      const email = decodeURIComponent(rest[1]);
      const found = mockUsers.find(u => u.email === email);
      if (found) return res.status(200).json(found);
      return res.status(404).json({ detail: 'Not found' });
    }
    return res.status(404).json({ detail: 'users mock not implemented', path: parts.join('/'), method });
  }

  if (first === 'clientes') {
    const id = rest[0];
    if (!id && method === 'GET') return res.status(200).json(mockClientes);
    if (!id && method === 'POST') return res.status(201).json({ id: Math.floor(Math.random() * 10000), ...(req.body || {}) });
    if (id && method === 'GET') return res.status(200).json(mockClientes.find(c => String(c.id) === id) || mockClientes[0]);
    if (id && method === 'PUT') return res.status(200).json({ id: Number(id), ...(req.body || {}) });
    if (id && method === 'DELETE') return res.status(204).send('');
    return res.status(404).json({ detail: 'clientes mock not implemented', path: parts.join('/'), method });
  }

  if (first === 'empresa') {
    if (method === 'POST' || method === 'PUT') return res.status(200).json({ success: true, ...(req.body || {}) });
    return res.status(404).json({ detail: 'empresa mock not implemented', path: parts.join('/'), method });
  }

  if (first === 'permissoes') {
    if (rest[0] === 'role' && rest[1] && method === 'GET') {
      const role = decodeURIComponent(rest[1]);
      if (role === 'admin') return res.status(200).json(['*']);
      if (role === 'gestor') return res.status(200).json(['read', 'write', 'manage']);
      return res.status(200).json(['read']);
    }
    return res.status(404).json({ detail: 'permissoes mock not implemented', path: parts.join('/'), method });
  }

  if (first === 'performance') {
    const sub = rest.join('/');
    if ((sub === 'snapshot' || sub === 'snapshot/') && method === 'GET') return res.status(200).json(exampleSnapshot);
    if (sub.startsWith('channels/') && method === 'GET') {
      const channelId = rest[1];
      return res.status(200).json({ id: channelId || 'yampi', name: channelId || 'yampi', revenue: 10000, cost: 6000, profit: 4000, margin: 40, cpa: 50, leads: 200, conversions: 40 });
    }
    if (sub === 'metrics/aggregated' && method === 'GET') return res.status(200).json({ revenue: 100000, cost: 60000, profit: 40000 });
    if (sub === 'events/realtime' && method === 'GET') return res.status(200).json({ items: [] });
    if (sub === 'costs/config' && method === 'GET') return res.status(200).json({ marketing_pct: 0.4, operational_pct: 0.1 });
    if (sub === 'funnel' && method === 'GET') return res.status(200).json({ funnel: { visits: 10000, leads: 1000, conversions: 200 } });
    if (sub === 'daily' && method === 'GET') return res.status(200).json({ days: [{ date: '2026-01-01', revenue: 1000, cost: 600 }] });
    if ((sub === 'channels' || sub === 'daily' || sub === 'events') && method === 'POST') return res.status(201).json({ success: true });
    return res.status(404).json({ detail: 'performance mock not implemented', path: parts.join('/'), method });
  }

  // fallback: return helpful message
  return res.status(404).json({ detail: 'Mock not implemented for this route', path: parts.join('/'), method });
}
