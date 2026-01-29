export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Accept any token and return success for demo purposes
  res.status(204).send('');
}
