/**
 * MOCK API HANDLER - COMPREHENSIVE
 * All endpoints return complete mock data for event presentation
 */

export default function handler(req, res) {
  try {
    const { slug = [] } = req.query;
    const method = req.method;
    const parts = (Array.isArray(slug) ? slug : [slug]).filter(Boolean);
    const first = parts[0] || '';
    const second = parts[1] || '';

    // ==================== MOCK DATA BUILDERS ====================

    const user = (id) => ({
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

    const cliente = (id) => ({
      id,
      nome: `Cliente ${id}`,
      nomeFantasia: `Fantasia ${id}`,
      status: id % 3 === 0 ? 'pendente' : 'ativo',
      dadosGerais: {
        nome: `Cliente ${id}`,
        cnpj: `${String(id).padStart(14, '0')}`,
        endereco: `Rua ${id}`,
        numero: String(100 + id),
        cidade: 'São Paulo',
        uf: 'SP'
      },
      contatosPrincipais: {
        nomeSocio: `Sócio ${id}`,
        emailPrincipal: `contato${id}@cliente${id}.com.br`,
        telefone: `11999${String(id).padStart(5, '0')}`
      }
    });

    const colaborador = (id) => ({
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

    const tarefa = (id) => ({
      id: String(id),
      titulo: `Tarefa ${id}`,
      descricao: `Descrição da tarefa ${id}`,
      status: ['pendente', 'em_progresso', 'concluida'][id % 3],
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      responsavel: `Colaborador ${id}`,
      projeto: `Projeto ${Math.ceil(id / 2)}`
    });

    const solicitacao = (id) => ({
      id: String(id),
      tipo: ['folga', 'adiantamento', 'licenca'][id % 3],
      status: ['pendente', 'aprovada', 'rejeitada'][id % 3],
      dataSolicitacao: new Date(2026, 0, 29 - id).toISOString(),
      colaborador: colaborador(id),
      motivo: `Motivo da solicitação ${id}`
    });

    const notificacao = (id) => ({
      id: String(id),
      titulo: `Notificação ${id}`,
      mensagem: `Mensagem ${id}`,
      tipo: ['info', 'aviso', 'erro'][id % 3],
      lida: id % 2 === 0,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString()
    });

    const documento = (id) => ({
      id: String(id),
      nome: `Documento ${id}.pdf`,
      tipo: 'pdf',
      tamanho: 1024 * (100 + id),
      dataUpload: new Date(2026, 0, 29 - id).toISOString(),
      uploadPor: `Usuário ${id}`,
      url: `https://example.com/docs/${id}.pdf`
    });

    const okr = (id) => ({
      id: String(id),
      objetivo: `Objetivo ${id}`,
      descricao: `Descrição do objetivo ${id}`,
      periodo: '2026 Q1',
      status: ['planejamento', 'em_progresso', 'concluido'][id % 3],
      progresso: (id * 15) % 100,
      responsavel: `Colaborador ${id}`,
      keyResults: [
        { id: '1', descricao: `KR 1.${id}`, progresso: (id * 20) % 100 },
        { id: '2', descricao: `KR 2.${id}`, progresso: (id * 25) % 100 }
      ]
    });

    const avaliacao = (id) => ({
      id: String(id),
      colaborador: colaborador(id),
      periodo: '2025 Q4',
      status: ['rascunho', 'finalizada'][id % 2],
      nota: 7 + (id % 3),
      dataAvaliacao: new Date(2026, 0, 29 - id).toISOString(),
      avaliador: `Gestor ${id}`
    });

    const beneficio = (id) => ({
      id: String(id),
      nome: `Benefício ${id}`,
      descricao: `Descrição do benefício ${id}`,
      tipo: ['saude', 'alimentacao', 'transporte'][id % 3],
      valor: 100 * (id + 1),
      ativo: true
    });

    const folhaPagamento = (id) => ({
      id: String(id),
      mes: `2026-${String(id).padStart(2, '0')}`,
      total: 15000 * id,
      colaboradores: 10 + id,
      status: ['rascunho', 'processada', 'paga'][id % 3],
      dataProcessamento: new Date(2026, 0, 28).toISOString()
    });

    const folhaClientes = (id) => ({
      id: String(id),
      cliente: cliente(id),
      mes: `2026-${String(id).padStart(2, '0')}`,
      valor: 5000 + id * 1000,
      status: ['pendente', 'processada', 'paga'][id % 3]
    });

    const chat = (id) => ({
      id: String(id),
      participantes: [`Usuário ${id}`, `Colaborador ${id + 1}`],
      ultimaMensagem: `Última mensagem do chat ${id}`,
      dataUltimaMensagem: new Date(2026, 0, 29 - (id % 3)).toISOString(),
      naoLidas: id % 2 === 0 ? id : 0
    });

    const muralPost = (id) => ({
      id: String(id),
      autor: `Usuário ${id}`,
      conteudo: `Post do mural número ${id}`,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      curtidas: id * 2,
      comentarios: id,
      tipo: ['comunicado', 'dica', 'celebracao'][id % 3]
    });

    const feedback = (id) => ({
      id: String(id),
      de: `Usuário ${id}`,
      para: `Colaborador ${id + 1}`,
      conteudo: `Feedback construtivo número ${id}`,
      dataFeedback: new Date(2026, 0, 29 - id).toISOString(),
      categoria: ['desempenho', 'comportamento', 'desenvolvimento'][id % 3],
      publicado: id % 2 === 0
    });

    const lembrete = (id) => ({
      id: String(id),
      titulo: `Lembrete ${id}`,
      descricao: `Descrição do lembrete ${id}`,
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      concluido: id % 3 === 0,
      criador: `Usuário ${id}`
    });

    const ponto = (id) => ({
      id: String(id),
      colaborador: `Colaborador ${id}`,
      data: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      horaEntrada: `0${8 + (id % 2)}:00`,
      horaSaida: `1${7 + (id % 2)}:00`,
      horasTrabalho: 8 + (id % 2),
      tipo: ['presencial', 'remoto', 'hibrido'][id % 3]
    });

    const evento = (id) => ({
      id: String(id),
      titulo: `Evento ${id}`,
      descricao: `Descrição do evento ${id}`,
      dataInicio: new Date(2026, 1, 1 + id).toISOString(),
      dataFim: new Date(2026, 1, 2 + id).toISOString(),
      local: `Sala ${id}`,
      participantes: id + 1,
      tipo: ['reuniao', 'treinamento', 'confraternizacao'][id % 3]
    });

    const automacao = (id) => ({
      id: String(id),
      nome: `Automação ${id}`,
      descricao: `Descrição da automação ${id}`,
      ativa: id % 2 === 0,
      tipo: ['email', 'sms', 'webhook'][id % 3],
      dataCriacao: new Date(2026, 0, 20).toISOString()
    });

    const relatorio = (id) => ({
      id: String(id),
      nome: `Relatório ${id}`,
      tipo: ['vendas', 'financeiro', 'rh'][id % 3],
      dataCriacao: new Date(2026, 0, 29 - id).toISOString(),
      status: 'disponivel'
    });

    // ==================== ROUTE HANDLERS ====================

    // AUTH
    if (first === 'auth') {
      if (second === 'login' && method === 'POST') {
        const { email, senha } = req.body || {};
        if (email === 'admin@cfohub.com' && senha === 'admin123') {
          return res.status(200).json({ access_token: 'mock-token-xyz', token_type: 'bearer' });
        }
        return res.status(401).json({ detail: 'Invalid credentials' });
      }
      if (second === 'me') {
        return res.status(200).json(user(1));
      }
      if (second === 'logout' && method === 'POST') {
        return res.status(204).send('');
      }
      if (second === 'change-password' && method === 'POST') {
        return res.status(200).json({ detail: 'Password changed' });
      }
    }

    // USERS
    if (first === 'users') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 20 }, (_, i) => user(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(user(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(user(parseInt(second) || 1));
      }
    }

    // CLIENTES
    if (first === 'clientes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => cliente(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(cliente(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(cliente(parseInt(second) || 1));
      }
    }

    // COLABORADORES
    if (first === 'colaboradores') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 20 }, (_, i) => colaborador(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(colaborador(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(colaborador(parseInt(second) || 1));
      }
    }

    // TAREFAS
    if (first === 'tarefas') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 20 }, (_, i) => tarefa(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(tarefa(1));
      }
    }

    // SOLICITAÇÕES
    if (first === 'solicitacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => solicitacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(solicitacao(1));
      }
    }

    // NOTIFICAÇÕES
    if (first === 'notificacoes') {
      return res.status(200).json(Array.from({ length: 15 }, (_, i) => notificacao(i + 1)));
    }

    // DOCUMENTOS
    if (first === 'documentos') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => documento(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(documento(1));
      }
    }

    // OKRs
    if (first === 'okrs') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 8 }, (_, i) => okr(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(okr(1));
      }
    }

    // AVALIAÇÕES
    if (first === 'avaliacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => avaliacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(avaliacao(1));
      }
    }

    // BENEFÍCIOS
    if (first === 'beneficios') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 8 }, (_, i) => beneficio(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(beneficio(1));
      }
    }

    // FOLHA DE PAGAMENTO
    if (first === 'folha' || first === 'folha-pagamento') {
      return res.status(200).json(Array.from({ length: 12 }, (_, i) => folhaPagamento(i + 1)));
    }

    // FOLHA CLIENTES
    if (first === 'folha-clientes') {
      return res.status(200).json(Array.from({ length: 10 }, (_, i) => folhaClientes(i + 1)));
    }

    // CHAT
    if (first === 'chat') {
      return res.status(200).json(Array.from({ length: 8 }, (_, i) => chat(i + 1)));
    }

    // MURAL
    if (first === 'mural') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => muralPost(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(muralPost(1));
      }
    }

    // FEEDBACKS
    if (first === 'feedbacks') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => feedback(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(feedback(1));
      }
    }

    // LEMBRETES
    if (first === 'lembretes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 10 }, (_, i) => lembrete(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(lembrete(1));
      }
    }

    // PONTO
    if (first === 'ponto') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 25 }, (_, i) => ponto(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(ponto(1));
      }
    }

    // CALENDÁRIO
    if (first === 'calendario' || first === 'calendar') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => evento(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(evento(1));
      }
    }

    // AUTOMAÇÕES
    if (first === 'automacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 10 }, (_, i) => automacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(automacao(1));
      }
    }

    // RELATÓRIOS
    if (first === 'relatorios') {
      return res.status(200).json(Array.from({ length: 8 }, (_, i) => relatorio(i + 1)));
    }

    // EMPRESA
    if (first === 'empresa') {
      return res.status(200).json({
        id: '1',
        nome: 'CFO X Consultoria',
        descricao: 'Plataforma de gestão empresarial',
        website: 'https://cfohub.com'
      });
    }

    // PERMISSÕES
    if (first === 'permissoes') {
      if (second === 'role') {
        return res.status(200).json({
          role: parts[2] || 'colaborador',
          permissoes: ['read:dashboard', 'read:tarefas', 'read:clientes']
        });
      }
      return res.status(200).json([
        { id: '1', nome: 'admin', descricao: 'Administrador' },
        { id: '2', nome: 'gestor', descricao: 'Gestor' },
        { id: '3', nome: 'colaborador', descricao: 'Colaborador' }
      ]);
    }

    // CARGOS E SETORES
    if (first === 'cargos-setores' || first === 'cargossetores') {
      return res.status(200).json([
        { id: '1', nome: 'Analista', setor: 'TI' },
        { id: '2', nome: 'Gerente', setor: 'Gestão' }
      ]);
    }

    // PERFORMANCE
    if (first === 'performance') {
      if (second === 'snapshot') {
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
    }

    // DEFAULT RESPONSE
    return res.status(200).json({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, nome: `Item ${i + 1}` }))
    });

  } catch (error) {
    console.error('Mock API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
