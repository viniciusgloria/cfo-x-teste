export default function handler(req, res) {
  const { role } = req.query;
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const r = Array.isArray(role) ? role[0] : role;
  if (!r) return res.status(400).json({ detail: 'Missing role' });

  if (r === 'admin') return res.status(200).json(['*']);
  if (r === 'gestor') return res.status(200).json(['read', 'write', 'manage']);

  return res.status(200).json(['read']);
}
