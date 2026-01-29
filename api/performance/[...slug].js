// Mock endpoints for /api/performance/*
export default function handler(req, res) {
  const { slug = [] } = req.query;
  const method = req.method;
  const path = Array.isArray(slug) ? '/' + slug.join('/') : '/' + slug;

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

  if (path === '/snapshot' && method === 'GET') {
    return res.status(200).json(exampleSnapshot);
  }

  const channelMatch = path.match(/^\/channels\/(.+)$/);
  if (channelMatch) {
    const channelId = channelMatch[1];
    if (method === 'GET') {
      return res.status(200).json({
        id: channelId,
        name: channelId,
        revenue: 10000,
        cost: 6000,
        profit: 4000,
        margin: 40,
        cpa: 50,
        leads: 200,
        conversions: 40,
      });
    }
    if (method === 'POST') {
      return res.status(201).json({ success: true });
    }
  }

  if (path === '/metrics/aggregated' && method === 'GET') {
    return res.status(200).json({ revenue: 100000, cost: 60000, profit: 40000 });
  }

  if (path === '/events/realtime' && method === 'GET') {
    return res.status(200).json({ items: [] });
  }

  if (path === '/costs/config') {
    if (method === 'GET') return res.status(200).json({ marketing_pct: 0.4, operational_pct: 0.1 });
    if (method === 'PUT') return res.status(200).json({ success: true });
  }

  if (path === '/integrations/health' && method === 'GET') {
    return res.status(200).json({ integrations: { yampi: 'ok', ml: 'ok' } });
  }

  if (path === '/funnel' && method === 'GET') {
    return res.status(200).json({ funnel: { visits: 10000, leads: 1000, conversions: 200 } });
  }

  if (path === '/daily' && method === 'GET') {
    return res.status(200).json({ days: [{ date: '2026-01-01', revenue: 1000, cost: 600 }] });
  }

  if ((path === '/channels' || path === '/daily' || path === '/events') && method === 'POST') {
    return res.status(201).json({ success: true });
  }

  return res.status(404).json({ detail: 'Mock not implemented for performance route', path, method });
}
