// Unified catch-all mock API for frontend demo on Vercel
export default function handler(req, res) {
  const { slug = [] } = req.query;
  const method = req.method;
  const parts = Array.isArray(slug) ? slug : [slug];
  const first = parts[0] || '';
  const rest = parts.slice(1);

  // Shared mock data
  const mockUsers = [
    { id: '1', name: 'Administrador', email: 'admin@cfohub.com', role: 'admin', empresa: 'CFO X', ativo: true },
    { id: '2', name: 'João Silva', email: 'joao@empresa.com', role: 'colaborador', empresa: 'Cliente A', ativo: true },
  ];

  const mockClientes = [
    { id: 1, nome: 'Cliente A', status: 'ativo' },
    { id: 2, nome: 'Cliente B', status: 'inativo' },
  ];

  const exampleSnapshot = {
    total_revenue: 100000,
    total_cost: 60000,
    total_profit: 40000,
    total_margin: 40,
    channels: [
      { id: 'yampi', name: 'Yampi', revenue: 50000, cost: 30000, profit: 20000, margin: 40, cpa: 50, leads: 1000, conversions: 200 },
      { id: 'ml', name: 'Mercado Livre', revenue: 30000, cost: 18000, profit: 12000, margin: 40, cpa: 60, leads: 600, conversions: 100 },
    ],
    expenses: { marketing: 40000, operational: 10000, administrative: 8000, other: 2000 }
  };

  // ROUTES
  if (first === 'auth') {
    const sub = rest[0] || '';
    if (sub === 'login' && method === 'POST') {
      const { email, senha } = req.body || {};
      if (email === 'admin@cfohub.com' && senha === 'admin123') return res.status(200).json({ access_token: 'mock-token', token_type: 'bearer' });
      return res.status(401).json({ detail: 'Credenciais inválidas' });
    }
    if (sub === 'me' && method === 'GET') {
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) return res.status(401).json({ detail: 'Unauthorized' });
      const token = auth.split(' ')[1];
      if (token !== 'mock-token') return res.status(401).json({ detail: 'Invalid token' });
      return res.status(200).json({ id: 1, email: 'admin@cfohub.com', nome: 'Administrador', role: 'admin', avatar: null, tipo: 'CLT', primeiro_acesso: false });
    }
    if (sub === 'logout' && method === 'POST') return res.status(204).send('');
    if (sub === 'change-password' && method === 'POST') return res.status(204).send('');
    return res.status(404).json({ detail: 'auth mock not implemented', path: parts.join('/'), method });
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
    if (!id && method === 'GET') return res.status(200).json({ items: mockClientes, total: mockClientes.length });
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
