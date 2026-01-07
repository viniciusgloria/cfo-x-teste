export interface OmieTestResult {
  ok: boolean;
  message: string;
  latencyMs: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Simulates testing Omie API credentials. In production, implement on backend to avoid CORS issues.
 * For real testing, use the Omie Developer Portal: https://developer.omie.com.br/
 */
export async function testOmieCredentials(appKey: string, appSecret: string): Promise<OmieTestResult> {
  const start = performance.now();

  // Basic validations
  if (!appKey?.trim() || !appSecret?.trim()) {
    const end = performance.now();
    return {
      ok: false,
      message: 'App Key e App Secret são obrigatórios',
      latencyMs: Math.round(end - start),
      timestamp: new Date().toISOString(),
    };
  }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  // Heuristic success: ensure plausible token length and format
  const looksValid = appKey.trim().length >= 10 && appSecret.trim().length >= 10 && /^[A-Za-z0-9]+$/.test(appKey.trim()) && /^[A-Za-z0-9]+$/.test(appSecret.trim());
  const end = performance.now();
  return {
    ok: looksValid,
    // message should be concise — we'll mark logs as simulated in the UI code
    message: looksValid ? 'Credenciais parecem válidas. Para teste real, use o Portal do Desenvolvedor da Omie.' : 'Formato das credenciais inválido. Verifique App Key e App Secret.',
    latencyMs: Math.round(end - start),
    timestamp: new Date().toISOString(),
    details: {
      keyLen: appKey.trim().length,
      secretLen: appSecret.trim().length,
      simulated: true,
      note: 'Devido a restrições de CORS, o teste real só é possível no backend ou via Portal do Desenvolvedor.',
    },
  };
}
