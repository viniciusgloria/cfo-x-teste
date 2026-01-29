/**
 * ULTIMATE MOCK API HANDLER
 * Returns EXACT data structures expected by frontend stores
 */

export default function handler(req, res) {
  try {
    const { slug = [] } = req.query;
    const method = req.method;
    const parts = (Array.isArray(slug) ? slug : [slug]).filter(Boolean);
    const first = parts[0] || '';
    const second = parts[1] || '';

    // ==================== DATA GENERATORS ====================

    const mockUser = (id) => ({
      id: id,
      nome: `Usuário ${id}`,
      email: `user${id}@empresa.com`,
      role: id === 1 ? 'admin' : 'colaborador',
      ativo: true,
      avatar: null,
      tipo: 'CLT',
      primeiro_acesso: false
    });

    const mockCliente = (id) => ({
      id: id,
      nome: `Cliente ${id}`,
      nomeFantasia: `Fantasia ${id}`,
      status: id % 3 === 0 ? 'pendente' : 'ativo',
      cnpj: `${String(id).padStart(14, '0')}`,
      razao_social: `Razão Social ${id}`,
      email: `contato${id}@cliente${id}.com.br`,
      telefone: `11999${String(id).padStart(5, '0')}`,
      endereco: `Rua ${id}, ${100 + id}`,
      mrr: 1000 + id * 500,
      omie_sync: id % 2 === 0,
      data_inicio: '2024-01-15',
      created_at: new Date(2026, 0, 29 - id).toISOString(),
      updated_at: new Date(2026, 0, 29).toISOString()
    });

    const mockColaborador = (id) => ({
      id: id,
      nome: `Colaborador ${id}`,
      email: `colab${id}@empresa.com`,
      telefone: '11999999999',
      cargo: 'Analista',
      departamento: 'RH',
      ativo: true,
      dataAdmissao: '2024-01-15',
      cpf: `${String(id).padStart(11, '0')}`,
      rg: `${String(id).padStart(9, '0')}`,
      salario: 3000 + id * 500
    });

    const mockTarefa = (id) => ({
      id: id,
      titulo: `Tarefa ${id}`,
      descricao: `Descrição da tarefa ${id}`,
      status: ['pendente', 'em_progresso', 'concluida'][id % 3],
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      responsavel: `Colaborador ${id}`,
      projeto: `Projeto ${Math.ceil(id / 2)}`
    });

    const mockSolicitacao = (id) => ({
      id: id,
      tipo: ['folga', 'adiantamento', 'licenca'][id % 3],
      status: ['pendente', 'aprovada', 'rejeitada'][id % 3],
      dataSolicitacao: new Date(2026, 0, 29 - id).toISOString(),
      colaborador: mockColaborador(id),
      motivo: `Motivo da solicitação ${id}`
    });

    const mockNotificacao = (id) => ({
      id: id,
      titulo: `Notificação ${id}`,
      mensagem: `Mensagem ${id}`,
      tipo: ['info', 'aviso', 'erro'][id % 3],
      lida: id % 2 === 0,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString()
    });

    const mockDocumento = (id) => ({
      id: id,
      nome: `Documento ${id}.pdf`,
      tipo: 'pdf',
      tamanho: 1024 * (100 + id),
      dataUpload: new Date(2026, 0, 29 - id).toISOString(),
      uploadPor: `Usuário ${id}`,
      url: `https://example.com/docs/${id}.pdf`
    });

    const mockOKR = (id) => ({
      id: id,
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

    const mockAvaliacao = (id) => ({
      id: id,
      colaborador: mockColaborador(id),
      periodo: '2025 Q4',
      status: ['rascunho', 'finalizada'][id % 2],
      nota: 7 + (id % 3),
      dataAvaliacao: new Date(2026, 0, 29 - id).toISOString(),
      avaliador: `Gestor ${id}`
    });

    const mockBeneficio = (id) => ({
      id: id,
      nome: `Benefício ${id}`,
      descricao: `Descrição do benefício ${id}`,
      tipo: ['saude', 'alimentacao', 'transporte'][id % 3],
      valor: 100 * (id + 1),
      ativo: true
    });

    const mockFolha = (id) => ({
      id: id,
      mes: `2026-${String(id).padStart(2, '0')}`,
      total: 15000 * id,
      colaboradores: 10 + id,
      status: ['rascunho', 'processada', 'paga'][id % 3],
      dataProcessamento: new Date(2026, 0, 28).toISOString()
    });

    const mockChat = (id) => ({
      id: id,
      participantes: [`Usuário ${id}`, `Colaborador ${id + 1}`],
      ultimaMensagem: `Última mensagem do chat ${id}`,
      dataUltimaMensagem: new Date(2026, 0, 29 - (id % 3)).toISOString(),
      naoLidas: id % 2 === 0 ? id : 0
    });

    const mockMural = (id) => ({
      id: id,
      autor: `Usuário ${id}`,
      conteudo: `Post do mural número ${id}`,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      curtidas: id * 2,
      comentarios: id,
      tipo: ['comunicado', 'dica', 'celebracao'][id % 3]
    });

    const mockFeedback = (id) => ({
      id: id,
      de: `Usuário ${id}`,
      para: `Colaborador ${id + 1}`,
      conteudo: `Feedback construtivo número ${id}`,
      dataFeedback: new Date(2026, 0, 29 - id).toISOString(),
      categoria: ['desempenho', 'comportamento', 'desenvolvimento'][id % 3],
      publicado: id % 2 === 0
    });

    const mockLembrete = (id) => ({
      id: id,
      titulo: `Lembrete ${id}`,
      descricao: `Descrição do lembrete ${id}`,
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      concluido: id % 3 === 0
    });

    const mockPonto = (id) => ({
      id: id,
      colaborador: `Colaborador ${id}`,
      data: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      horaEntrada: `0${8 + (id % 2)}:00`,
      horaSaida: `1${7 + (id % 2)}:00`,
      horasTrabalho: 8 + (id % 2),
      tipo: ['presencial', 'remoto', 'hibrido'][id % 3]
    });

    const mockEvento = (id) => ({
      id: id,
      titulo: `Evento ${id}`,
      descricao: `Descrição do evento ${id}`,
      dataInicio: new Date(2026, 1, 1 + id).toISOString(),
      dataFim: new Date(2026, 1, 2 + id).toISOString(),
      local: `Sala ${id}`,
      participantes: id + 1,
      tipo: ['reuniao', 'treinamento', 'confraternizacao'][id % 3]
    });

    const mockAutomacao = (id) => ({
      id: id,
      nome: `Automação ${id}`,
      descricao: `Descrição da automação ${id}`,
      ativa: id % 2 === 0,
      tipo: ['email', 'sms', 'webhook'][id % 3],
      dataCriacao: new Date(2026, 0, 20).toISOString()
    });

    const mockRelatorio = (id) => ({
      id: id,
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
        return res.status(200).json(mockUser(1));
      }
      if (second === 'logout' && method === 'POST') {
        return res.status(204).send('');
      }
      if (second === 'change-password' && method === 'POST') {
        return res.status(200).json({ detail: 'Password changed' });
      }
    }

    // USERS - returns ARRAY
    if (first === 'users') {
      if (method === 'GET') {
        const limit = parseInt(req.query.limit) || 20;
        return res.status(200).json(Array.from({ length: limit }, (_, i) => mockUser(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockUser(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(mockUser(parseInt(second) || 1));
      }
    }

    // CLIENTES - returns ARRAY
    if (first === 'clientes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => mockCliente(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockCliente(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(mockCliente(parseInt(second) || 1));
      }
    }

    // COLABORADORES - returns ARRAY
    if (first === 'colaboradores') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 20 }, (_, i) => mockColaborador(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockColaborador(1));
      }
      if (second && method === 'GET') {
        return res.status(200).json(mockColaborador(parseInt(second) || 1));
      }
    }

    // TAREFAS - returns ARRAY
    if (first === 'tarefas') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 20 }, (_, i) => mockTarefa(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockTarefa(1));
      }
    }

    // SOLICITAÇÕES - returns ARRAY
    if (first === 'solicitacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => mockSolicitacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockSolicitacao(1));
      }
    }

    // NOTIFICAÇÕES - returns ARRAY
    if (first === 'notificacoes') {
      return res.status(200).json(Array.from({ length: 15 }, (_, i) => mockNotificacao(i + 1)));
    }

    // DOCUMENTOS - returns ARRAY
    if (first === 'documentos') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => mockDocumento(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockDocumento(1));
      }
    }

    // OKRs - returns ARRAY
    if (first === 'okrs') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 8 }, (_, i) => mockOKR(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockOKR(1));
      }
    }

    // AVALIAÇÕES - returns ARRAY
    if (first === 'avaliacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => mockAvaliacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockAvaliacao(1));
      }
    }

    // BENEFÍCIOS - returns ARRAY
    if (first === 'beneficios') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 8 }, (_, i) => mockBeneficio(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockBeneficio(1));
      }
    }

    // FOLHA - returns ARRAY
    if (first === 'folha' || first === 'folha-pagamento') {
      return res.status(200).json(Array.from({ length: 12 }, (_, i) => mockFolha(i + 1)));
    }

    // FOLHA CLIENTES - returns ARRAY
    if (first === 'folha-clientes') {
      return res.status(200).json(Array.from({ length: 10 }, (_, i) => mockFolha(i + 1)));
    }

    // CHAT - returns ARRAY
    if (first === 'chat') {
      return res.status(200).json(Array.from({ length: 8 }, (_, i) => mockChat(i + 1)));
    }

    // MURAL - returns ARRAY
    if (first === 'mural') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => mockMural(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockMural(1));
      }
    }

    // FEEDBACKS - returns ARRAY
    if (first === 'feedbacks') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 12 }, (_, i) => mockFeedback(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockFeedback(1));
      }
    }

    // LEMBRETES - returns ARRAY
    if (first === 'lembretes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 10 }, (_, i) => mockLembrete(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockLembrete(1));
      }
    }

    // PONTO - returns ARRAY
    if (first === 'ponto') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 25 }, (_, i) => mockPonto(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockPonto(1));
      }
    }

    // CALENDÁRIO - returns ARRAY
    if (first === 'calendario' || first === 'calendar') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 15 }, (_, i) => mockEvento(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockEvento(1));
      }
    }

    // AUTOMAÇÕES - returns ARRAY
    if (first === 'automacoes') {
      if (method === 'GET') {
        return res.status(200).json(Array.from({ length: 10 }, (_, i) => mockAutomacao(i + 1)));
      }
      if (method === 'POST') {
        return res.status(201).json(mockAutomacao(1));
      }
    }

    // RELATÓRIOS - returns ARRAY
    if (first === 'relatorios') {
      return res.status(200).json(Array.from({ length: 8 }, (_, i) => mockRelatorio(i + 1)));
    }

    // EMPRESA - returns OBJECT
    if (first === 'empresa') {
      return res.status(200).json({
        id: '1',
        nome: 'CFO X Consultoria',
        descricao: 'Plataforma de gestão empresarial',
        website: 'https://cfohub.com'
      });
    }

    // PERMISSÕES - returns ARRAY or OBJECT
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

    // CARGOS-SETORES - returns ARRAY
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
          canais: Array.from({ length: 3 }, (_, i) => ({
            id: `canal_${i + 1}`,
            nome: `Canal ${i + 1}`,
            faturamento: 50000 - i * 10000,
            gastoAds: 3000 - i * 500,
            pedidos: 200 - i * 30,
            roas: 16.67,
            cpa: 15 + i * 3,
            margem: 30 - i,
            alertas: []
          })),
          funil: [
            { estagio: 'visitas', valor: 100000 },
            { estagio: 'leads', valor: 5000 },
            { estagio: 'conversoes', valor: 300 }
          ],
          diarias: Array.from({ length: 7 }, (_, i) => ({
            data: new Date(2026, 0, 29 - i).toISOString().split('T')[0],
            faturamento: 10000 + Math.random() * 5000,
            gastoAds: 800 + Math.random() * 400,
            pedidosPagos: 50 + Math.random() * 20,
            vendedores: 0,
            canceladas: Math.floor(Math.random() * 3)
          })),
          eventos: [],
          custos: { gateway: 2.5, transporte: 50, picking: 25, imposto: 15, checkout: 1.5 },
          integracoes: []
        });
      }
    }

    // DEFAULT - returns ARRAY
    return res.status(200).json(Array.from({ length: 10 }, (_, i) => ({ id: i + 1, nome: `Item ${i + 1}` })));

  } catch (error) {
    console.error('Mock API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
