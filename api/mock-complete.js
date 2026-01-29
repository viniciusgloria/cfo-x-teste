// Ultra-comprehensive mock API - All pages fully functional
export default function handler(req, res) {
  try {
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
      nome: `Cliente ${id}`,
      dadosGerais: {
        nome: `Cliente ${id}`,
        nomeFantasia: `Fantasia ${id}`,
        cnpj: `${String(id).padStart(14, '0')}`,
        endereco: `Rua ${id}`,
        numero: String(100 + id),
        cidade: 'São Paulo',
        uf: 'SP',
        segmentoAtuacao: 'Varejo',
        site: `https://cliente${id}.com.br`
      },
      contatosPrincipais: {
        nomeSocio: `Sócio ${id}`,
        cpfSocio: `${String(id).padStart(11, '0')}`,
        emailPrincipal: `contato${id}@cliente${id}.com.br`,
        emailFinanceiro: `financeiro${id}@cliente${id}.com.br`,
        telefone: `11${9999 + id}9999`,
        whatsapp: `11${9999 + id}9999`
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
      rg: `${String(id).padStart(9, '0')}`,
      salario: 3000 + id * 500,
      funcao: 'Analista Sênior',
      gerente: `Gerente ${Math.ceil(id / 3)}`
    });

    const generateMockTarefa = (id) => ({
      id: String(id),
      titulo: `Tarefa ${id}`,
      descricao: `Descrição da tarefa ${id}`,
      status: ['pendente', 'em_progresso', 'concluida'][id % 3],
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      responsavel: `Colaborador ${id}`,
      responsavelId: String(id),
      projeto: `Projeto ${Math.ceil(id / 2)}`,
      dataCriacao: new Date(2026, 0, 20).toISOString(),
      dataAtualizacao: new Date(2026, 0, 25).toISOString(),
      estimativaHoras: 8 + id,
      horasGastas: 4 + (id % 5)
    });

    const generateMockSolicitacao = (id) => ({
      id: String(id),
      tipo: ['folga', 'adiantamento', 'licenca'][id % 3],
      status: ['pendente', 'aprovada', 'rejeitada'][id % 3],
      dataSolicitacao: new Date(2026, 0, 29 - id).toISOString(),
      dataDecisao: id % 2 === 0 ? new Date(2026, 0, 28 - id).toISOString() : null,
      colaborador: generateMockColaborador(id),
      motivo: `Motivo da solicitação ${id}`,
      dataInicio: new Date(2026, 1, id + 1).toISOString(),
      dataFim: new Date(2026, 1, id + 3).toISOString(),
      diasSolicitados: 2 + (id % 3),
      aprovadoPor: `Gestor ${id}`
    });

    const generateMockNotificacao = (id) => ({
      id: String(id),
      tipo: ['info', 'aviso', 'erro'][id % 3],
      titulo: `Notificação ${id}`,
      mensagem: `Mensagem da notificação ${id}`,
      lida: id % 2 === 0,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      referencia: { tipo: 'tarefa', id: String(id) },
      prioridade: ['baixa', 'normal', 'alta'][id % 3]
    });

    const generateMockDocumento = (id) => ({
      id: String(id),
      nome: `Documento ${id}.pdf`,
      tipo: ['contrato', 'nota', 'comprovante', 'planilha'][id % 4],
      tamanho: 1024 * (100 + id),
      dataUpload: new Date(2026, 0, 29 - id).toISOString(),
      uploadPor: `Usuário ${id}`,
      uploadPorId: String(id),
      url: `https://example.com/docs/${id}.pdf`,
      categoria: ['financeiro', 'rh', 'operacional'][id % 3],
      descricao: `Descrição do documento ${id}`
    });

    const generateMockOKR = (id) => ({
      id: String(id),
      objetivo: `Objetivo ${id}`,
      descricao: `Descrição do objetivo ${id}`,
      periodo: '2026 Q1',
      status: ['planejamento', 'em_progresso', 'concluido'][id % 3],
      progresso: (id * 15) % 100,
      responsavel: `Colaborador ${id}`,
      responsavelId: String(id),
      keyResults: [
        { id: '1', descricao: `KR 1.${id}`, progresso: (id * 20) % 100, meta: 100 },
        { id: '2', descricao: `KR 2.${id}`, progresso: (id * 25) % 100, meta: 100 }
      ],
      dataCriacao: new Date(2026, 0, 1).toISOString(),
      dataFinalizacao: new Date(2026, 3, 1).toISOString()
    });

    const generateMockAvaliacao = (id) => ({
      id: String(id),
      colaborador: generateMockColaborador(id),
      colaboradorId: String(id),
      periodo: '2025 Q4',
      status: ['rascunho', 'finalizada', 'fechada'][id % 3],
      nota: 7 + (id % 3),
      dataAvaliacao: new Date(2026, 0, 29 - id).toISOString(),
      avaliador: `Gestor ${id}`,
      avaliadorId: String(id),
      competencias: [
        { nome: 'Comunicação', nota: 8 },
        { nome: 'Liderança', nota: 7 },
        { nome: 'Técnica', nota: 8 }
      ],
      comentarios: `Avaliação do colaborador ${id}`
    });

    const generateMockBeneficio = (id) => ({
      id: String(id),
      nome: `Benefício ${id}`,
      descricao: `Descrição do benefício ${id}`,
      tipo: ['saude', 'alimentacao', 'transporte', 'conveniencia'][id % 4],
      valor: 100 * (id + 1),
      ativo: true,
      dataVigencia: new Date(2026, 0, 1).toISOString(),
      fornecedor: `Fornecedor ${id}`,
      contatoFornecedor: `contato${id}@fornecedor.com.br`,
      beneficiarios: 10 + id
    });

    const generateMockFolhaPagamento = (id) => ({
      id: String(id),
      mes: `2026-${String(id).padStart(2, '0')}`,
      total: 15000 * id,
      colaboradores: 10 + id,
      status: ['rascunho', 'processada', 'paga', 'auditada'][id % 4],
      dataProcessamento: new Date(2026, 0, 28).toISOString(),
      dataPagamento: new Date(2026, 0, 28).toISOString(),
      descontos: 1500 * id,
      encargos: 3000 * id,
      liquido: 10500 * id
    });

    const generateMockFolhaClientes = (id) => ({
      id: String(id),
      cliente: generateMockCliente(id),
      clienteId: id,
      mes: `2026-${String(id).padStart(2, '0')}`,
      valor: 5000 + id * 1000,
      status: ['pendente', 'processada', 'paga'][id % 3],
      servicosPrestados: [`Serviço ${id}-1`, `Serviço ${id}-2`],
      dataPagamento: new Date(2026, 0, 28).toISOString()
    });

    const generateMockChat = (id) => ({
      id: String(id),
      participantes: [`Usuário ${id}`, `Colaborador ${id + 1}`],
      participantesIds: [String(id), String(id + 1)],
      ultimaMensagem: `Última mensagem do chat ${id}`,
      dataUltimaMensagem: new Date(2026, 0, 29 - (id % 3)).toISOString(),
      naoLidas: id % 2 === 0 ? id : 0,
      tipo: 'privado'
    });

    const generateMockMuralPost = (id) => ({
      id: String(id),
      autor: `Usuário ${id}`,
      autorId: String(id),
      conteudo: `Post do mural número ${id}. Confira as novidades da empresa!`,
      dataCriacao: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      dataEdicao: new Date(2026, 0, 28 - (id % 5)).toISOString(),
      curtidas: id * 2,
      comentarios: id,
      tipo: ['comunicado', 'dica', 'celebracao', 'feedback'][id % 4],
      ativo: true,
      visibilidade: 'publico'
    });

    const generateMockFeedback = (id) => ({
      id: String(id),
      de: `Usuário ${id}`,
      deId: String(id),
      para: `Colaborador ${id + 1}`,
      paraId: String(id + 1),
      conteudo: `Feedback construtivo número ${id}`,
      dataFeedback: new Date(2026, 0, 29 - id).toISOString(),
      categoria: ['desempenho', 'comportamento', 'desenvolvimento', 'lideranca'][id % 4],
      publicado: id % 2 === 0,
      tipo: 'positivo'
    });

    const generateMockLembrete = (id) => ({
      id: String(id),
      titulo: `Lembrete ${id}`,
      descricao: `Descrição do lembrete ${id}`,
      dataVencimento: new Date(2026, 1, 1 + id).toISOString(),
      prioridade: ['baixa', 'media', 'alta'][id % 3],
      concluido: id % 3 === 0,
      criador: `Usuário ${id}`,
      criadorId: String(id),
      categoria: 'geral',
      dataCriacao: new Date(2026, 0, 29 - id).toISOString()
    });

    const generateMockPonto = (id) => ({
      id: String(id),
      colaborador: `Colaborador ${id}`,
      colaboradorId: String(id),
      data: new Date(2026, 0, 29 - (id % 5)).toISOString(),
      horaEntrada: `0${8 + (id % 2)}:00`,
      horaSaida: `1${7 + (id % 2)}:00`,
      horasTrabalho: 8 + (id % 2),
      tipo: ['presencial', 'remoto', 'hibrido'][id % 3],
      justificativa: id % 2 === 0 ? `Justificativa ${id}` : null,
      aprovado: id % 2 === 0
    });

    const generateMockCalendarioEvento = (id) => ({
      id: String(id),
      titulo: `Evento ${id}`,
      descricao: `Descrição do evento ${id}`,
      dataInicio: new Date(2026, 1, 1 + id).toISOString(),
      dataFim: new Date(2026, 1, 2 + id).toISOString(),
      horaInicio: `${9 + (id % 8)}:00`,
      horaFim: `${11 + (id % 8)}:00`,
      local: `Sala ${id}`,
      participantes: ['Participante 1', `Participante ${id + 1}`],
      participantesIds: [String(id), String(id + 1)],
      tipo: ['reuniao', 'treinamento', 'confraternizacao', 'apresentacao'][id % 4],
      organizador: `Organizador ${id}`,
      status: ['confirmado', 'pendente', 'cancelado'][id % 3]
    });

    const generateMockAutomacao = (id) => ({
      id: String(id),
      nome: `Automação ${id}`,
      descricao: `Descrição da automação ${id}`,
      ativa: id % 2 === 0,
      tipo: ['email', 'sms', 'webhook', 'workflow'][id % 4],
      trigger: `trigger_${id}`,
      acao: `acao_${id}`,
      dataCriacao: new Date(2026, 0, 20).toISOString(),
      dataUltimaExecucao: new Date(2026, 0, 29 - (id % 3)).toISOString(),
      totalExecucoes: 100 + id * 10,
      taxa_sucesso: 90 + (id % 10)
    });

    const generateMockRelatorio = (id) => ({
      id: String(id),
      nome: `Relatório ${id}`,
      descricao: `Descrição do relatório ${id}`,
      tipo: ['vendas', 'financeiro', 'rh', 'operacional'][id % 4],
      dataCriacao: new Date(2026, 0, 29 - id).toISOString(),
      dataUltimaatualizacao: new Date(2026, 0, 29 - (id % 3)).toISOString(),
      criador: `Usuário ${id}`,
      criadorId: String(id),
      periodoInicio: new Date(2026, 0, 1).toISOString(),
      periodoFim: new Date(2026, 0, 29).toISOString(),
      formato: ['pdf', 'excel', 'csv'][id % 3],
      status: 'disponivel'
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
        return res.status(200).json(
          Array.from({ length: 20 }, (_, i) => generateMockUser(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockUser(1));
      }
      if (rest[0] && method === 'GET') {
        const id = parseInt(rest[0]) || 1;
        return res.status(200).json(generateMockUser(id));
      }
    }

    // Clientes
    if (first === 'clientes') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 15 }, (_, i) => generateMockCliente(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockCliente(1));
      }
      if (rest[0] && method === 'GET') {
        const id = parseInt(rest[0]) || 1;
        return res.status(200).json(generateMockCliente(id));
      }
    }

    // Colaboradores
    if (first === 'colaboradores') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 20 }, (_, i) => generateMockColaborador(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockColaborador(1));
      }
      if (rest[0] && method === 'GET') {
        const id = parseInt(rest[0]) || 1;
        return res.status(200).json(generateMockColaborador(id));
      }
    }

    // Tarefas
    if (first === 'tarefas') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 20 }, (_, i) => generateMockTarefa(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockTarefa(1));
      }
      if (rest[0] && method === 'GET') {
        const id = parseInt(rest[0]) || 1;
        return res.status(200).json(generateMockTarefa(id));
      }
    }

    // Solicitações
    if (first === 'solicitacoes') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 15 }, (_, i) => generateMockSolicitacao(i + 1))
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
          Array.from({ length: 15 }, (_, i) => generateMockNotificacao(i + 1))
        );
      }
    }

    // Documentos
    if (first === 'documentos') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 12 }, (_, i) => generateMockDocumento(i + 1))
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
          Array.from({ length: 8 }, (_, i) => generateMockOKR(i + 1))
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
          Array.from({ length: 12 }, (_, i) => generateMockAvaliacao(i + 1))
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
          Array.from({ length: 8 }, (_, i) => generateMockBeneficio(i + 1))
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

    // Folha Clientes
    if (first === 'folha-clientes') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 10 }, (_, i) => generateMockFolhaClientes(i + 1))
        );
      }
    }

    // Chat
    if (first === 'chat') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 8 }, (_, i) => generateMockChat(i + 1))
        );
      }
    }

    // Mural
    if (first === 'mural') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 15 }, (_, i) => generateMockMuralPost(i + 1))
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
          Array.from({ length: 12 }, (_, i) => generateMockFeedback(i + 1))
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
          Array.from({ length: 10 }, (_, i) => generateMockLembrete(i + 1))
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
          Array.from({ length: 25 }, (_, i) => generateMockPonto(i + 1))
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
          Array.from({ length: 15 }, (_, i) => generateMockCalendarioEvento(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockCalendarioEvento(1));
      }
    }

    // Automações
    if (first === 'automacoes') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 10 }, (_, i) => generateMockAutomacao(i + 1))
        );
      }
      if (method === 'POST') {
        return res.status(201).json(generateMockAutomacao(1));
      }
    }

    // Relatórios
    if (first === 'relatorios') {
      if (method === 'GET') {
        return res.status(200).json(
          Array.from({ length: 8 }, (_, i) => generateMockRelatorio(i + 1))
        );
      }
    }

    // Empresa
    if (first === 'empresa') {
      return res.status(200).json({
        id: '1',
        nome: 'CFO X Consultoria',
        logo: null,
        descricao: 'Plataforma de gestão empresarial integrada',
        website: 'https://cfohub.com',
        funcionarios: 50,
        fundacao: '2020-01-01',
        segmento: 'Consultoria'
      });
    }

    // Permissões
    if (first === 'permissoes') {
      if (rest[0] === 'role') {
        const role = rest[1] || 'colaborador';
        return res.status(200).json({
          role,
          permissoes: ['read:dashboard', 'read:tarefas', 'read:clientes', 'read:colaboradores', 'write:tarefas']
        });
      }
      return res.status(200).json([
        { id: '1', nome: 'admin', descricao: 'Administrador' },
        { id: '2', nome: 'gestor', descricao: 'Gestor' },
        { id: '3', nome: 'colaborador', descricao: 'Colaborador' }
      ]);
    }

    // Cargos e Setores
    if (first === 'cargos-setores' || first === 'cargossetores') {
      return res.status(200).json([
        { id: '1', nome: 'Analista', setor: 'TI' },
        { id: '2', nome: 'Gerente', setor: 'Gestão' },
        { id: '3', nome: 'Consultor', setor: 'Consultoria' }
      ]);
    }

    // Default 404 - but with useful data for missing routes
    return res.status(200).json({
      message: 'Mock data endpoint',
      path: parts.join('/'),
      method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mock API Error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error in mock API',
      error: error.message 
    });
  }
}
