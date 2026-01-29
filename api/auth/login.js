export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { email, senha } = req.body || {};

  if (email === 'admin@cfohub.com' && senha === 'admin123') {
    res.status(200).json({ access_token: 'mock-token', token_type: 'bearer' });
    return;
  }

  res.status(401).json({ detail: 'Credenciais inválidas' });
}
