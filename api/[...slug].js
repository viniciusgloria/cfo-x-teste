// Catch-all mock API for frontend demo on Vercel
export default function handler(req, res) {
  const { slug = [] } = req.query;
  const method = req.method;
  const path = Array.isArray(slug) ? '/' + slug.join('/') : '/' + slug;

  // Simple in-memory mock data (stateless per request)
  const mockUsers = [
    { id: '1', name: 'Administrador', email: 'admin@cfohub.com', role: 'admin', empresa: 'CFO X', isActive: true },
    { id: '2', name: 'João Silva', email: 'joao@empresa.com', role: 'colaborador', empresa: 'Cliente A', isActive: true },
  ];

  const mockClientes = [
    { id: 1, nome: 'Cliente A', status: 'ativo' },
    { id: 2, nome: 'Cliente B', status: 'inativo' },
  ];

  // ROUTING
  // /api/users
  if (path === '/users' && method === 'GET') {
    // support ?email= filter
    const email = req.query.email;
    if (email) {
      const found = mockUsers.filter(u => u.email === email);
      return res.status(200).json(found);
    }
    return res.status(200).json(mockUsers);
  }

  // /api/users (POST)
  if (path === '/users' && method === 'POST') {
    const body = req.body || {};
    const newUser = { id: String(Math.floor(Math.random() * 10000)), name: body.nome || body.name || 'Novo Usuário', email: body.email || 'novo@exemplo.com', role: body.role || 'colaborador', empresa: body.empresa || null, isActive: true };
    return res.status(201).json(newUser);
  }

  // /api/users/:id (GET, PUT, DELETE)
  const userIdMatch = path.match(/^\/users\/(\w+)$/);
  if (userIdMatch) {
    const id = userIdMatch[1];
    if (method === 'GET') {
      const u = mockUsers.find(x => x.id === id) || mockUsers[0];
      return res.status(200).json(u);
    }
    if (method === 'PUT' || method === 'PATCH') {
      const body = req.body || {};
      const updated = { ...(mockUsers.find(x => x.id === id) || mockUsers[0]), ...body };
      return res.status(200).json(updated);
    }
    if (method === 'DELETE') {
      return res.status(204).send('');
    }
  }

  // /api/users/email/:email
  const userEmailMatch = path.match(/^\/users\/email\/(.+)$/);
  if (userEmailMatch && method === 'GET') {
    const email = decodeURIComponent(userEmailMatch[1]);
    const found = mockUsers.find(u => u.email === email);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ detail: 'Not found' });
  }

  // /api/auth/change-password
  if (path === '/auth/change-password' && method === 'POST') {
    return res.status(204).send('');
  }

  // /api/clientes
  if (path === '/clientes' && method === 'GET') {
    return res.status(200).json(mockClientes);
  }
  if (path === '/clientes' && method === 'POST') {
    const body = req.body || {};
    const created = { id: Math.floor(Math.random() * 10000), ...body };
    return res.status(201).json(created);
  }
  const clienteIdMatch = path.match(/^\/clientes\/(\d+)$/);
  if (clienteIdMatch) {
    const id = Number(clienteIdMatch[1]);
    if (method === 'PUT') {
      const body = req.body || {};
      return res.status(200).json({ id, ...body });
    }
    if (method === 'DELETE') return res.status(204).send('');
    if (method === 'GET') return res.status(200).json(mockClientes.find(c => c.id === id) || mockClientes[0]);
  }

  // /api/empresa
  if (path === '/empresa' && (method === 'POST' || method === 'PUT')) {
    const body = req.body || {};
    return res.status(200).json({ success: true, ...body });
  }

  // /api/permissoes/role/:role
  const permMatch = path.match(/^\/permissoes\/role\/(.+)$/);
  if (permMatch && method === 'GET') {
    const role = decodeURIComponent(permMatch[1]);
    const perms = role === 'admin' ? ['*'] : ['read', 'write'];
    return res.status(200).json(perms);
  }

  // /api/performance basic
  if (path.startsWith('/performance') && method === 'GET') {
    return res.status(200).json({ items: [] });
  }

  // default: Not Found
  res.status(404).json({ detail: 'Mock not implemented for this route', path, method });
}
