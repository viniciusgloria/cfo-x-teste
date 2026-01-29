export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Unauthorized' });
    return;
  }

  const token = auth.split(' ')[1];
  if (token !== 'mock-token') {
    res.status(401).json({ detail: 'Invalid token' });
    return;
  }

  res.status(200).json({
    id: 1,
    email: 'admin@cfohub.com',
    nome: 'Administrador',
    role: 'admin',
    avatar: null,
    tipo: 'CLT',
    primeiro_acesso: false,
  });
}
