export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const snapshot = {
    canais: [
      { id: 'yampi', nome: 'Yampi', faturamento: 50000, gastoAds: 3000, pedidos: 200, roas: 16.67, cpa: 15, margem: 30 },
      { id: 'ml', nome: 'Mercado Livre', faturamento: 30000, gastoAds: 1800, pedidos: 100, roas: 16.67, cpa: 18, margem: 28 }
    ],
    funil: [
      { estagio: 'visitas', valor: 100000 },
      { estagio: 'leads', valor: 5000 },
      { estagio: 'conversoes', valor: 300 }
    ],
    diarias: [
      { data: '2026-01-29', faturamento: 10000, gastoAds: 800, pedidosPagos: 50, vendedores: 0, canceladas: 2 },
      { data: '2026-01-28', faturamento: 9000, gastoAds: 700, pedidosPagos: 45, vendedores: 0, canceladas: 1 }
    ],
    eventos: [],
    custos: {
      gateway: 2.5,
      transporte: 50,
      picking: 25,
      imposto: 15,
      checkout: 1.5
    },
    integracoes: []
  };

  res.status(200).json(snapshot);
}
