export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const snapshot = {
    total_revenue: 100000,
    total_cost: 60000,
    total_profit: 40000,
    total_margin: 40,
    channels: [
      { id: 'yampi', name: 'Yampi', revenue: 50000, cost: 30000, profit: 20000, margin: 40, cpa: 50, leads: 1000, conversions: 200 },
      { id: 'ml', name: 'Mercado Livre', revenue: 30000, cost: 18000, profit: 12000, margin: 40, cpa: 60, leads: 600, conversions: 100 }
    ],
    expenses: { marketing: 40000, operational: 10000, administrative: 8000, other: 2000 }
  };

  res.status(200).json(snapshot);
}
