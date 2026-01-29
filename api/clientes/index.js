export default function handler(req, res) {
  const clientes = [
    { id: 1, nome: 'Cliente A', status: 'ativo' },
    { id: 2, nome: 'Cliente B', status: 'inativo' }
  ];

  if (req.method === 'GET') {
    res.status(200).json(clientes);
    return;
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    res.status(201).json({ id: Math.floor(Math.random() * 10000), ...body });
    return;
  }

  res.status(405).send('Method Not Allowed');
}
