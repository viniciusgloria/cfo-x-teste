/**
 * Performance Service - Integração com API de Performance/CPA
 * 
 * ENDPOINTS NECESSÁRIOS NO BACKEND:
 * 
 * GET /performance/snapshot
 * - Query params: start_date, end_date (YYYY-MM-DD)
 * - Retorna: CpaSnapshot completo
 * 
 * GET /performance/channels/{channel_id}
 * - Query params: start_date, end_date (YYYY-MM-DD) 
 * - Retorna: métricas específicas do canal
 * 
 * ESTRUTURA ESPERADA DO CpaSnapshot:
 * {
 *   total_revenue: number,
 *   total_cost: number,
 *   total_profit: number,
 *   total_margin: number,
 *   channels: [
 *     {
 *       id: string,
 *       name: string,
 *       revenue: number,
 *       cost: number,
 *       profit: number,
 *       margin: number,
 *       cpa: number,
 *       leads: number,
 *       conversions: number
 *     }
 *   ],
 *   expenses: {
 *     marketing: number,
 *     operational: number,
 *     administrative: number,
 *     other: number
 *   }
 * }
 * 
 * COMO O FRONTEND USA OS DADOS:
 * - total_revenue, total_cost, total_profit, total_margin: Usados no resumo executivo
 * - channels: Transformados para gráficos de barras (receita por canal)
 * - expenses: Usados na distribuição de gastos (gráfico de pizza)
 * - Funções de transformação em PerformanceResultados.tsx convertem dados da API para formato do UI
 */

import { api } from './api';
import { CpaSnapshot, CpaChannelSnapshot } from '../types/performance';

class PerformanceService {
  private readonly basePath = '/api/performance';

  /**
   * Busca o snapshot completo de performance/CPA
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   * @returns Snapshot com métricas de canais, funil, diárias, eventos, custos e integrações
   */
  async getCpaSnapshot(startDate?: string, endDate?: string): Promise<CpaSnapshot> {
    const params: Record<string, string> = {
      cliente_id: '1' // TODO: Pegar do contexto do usuário logado
    };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    console.log('📡 Chamando API:', `${this.basePath}/snapshot`, 'params:', params);
    
    const result = await api.get<CpaSnapshot>(`${this.basePath}/snapshot`, params);
    
    console.log('📦 Resposta da API:', result);
    
    return result;
  }

  /**
   * Busca dados específicos de um canal (Yampi, Mercado Livre, etc)
   * @param channelId ID do canal (yampi, mercado-livre, tiktok-shop, shopify)
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   * @returns Dados completos do canal incluindo métricas, margens e distribuição de gastos
   */
  async getCpaChannelSnapshot(channelId: string, startDate?: string, endDate?: string): Promise<CpaChannelSnapshot> {
    const params: Record<string, string> = {
      cliente_id: '1' // TODO: Pegar do contexto do usuário logado
    };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return api.get<CpaChannelSnapshot>(`${this.basePath}/channels/${channelId}`, params);
  }

  /**
   * Busca métricas de um canal específico
   * @param channelId ID do canal (yampi, mercado-livre, tiktok-shop, etc)
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   */
  async getChannelMetrics(channelId: string, startDate?: string, endDate?: string) {
    const params: Record<string, string> = { channel_id: channelId };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return api.get(`${this.basePath}/channels/${channelId}`, params);
  }

  /**
   * Busca métricas agregadas de todos os canais
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   */
  async getAggregatedMetrics(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return api.get(`${this.basePath}/metrics/aggregated`, params);
  }

  /**
   * Busca eventos em tempo real
   * @param limit Limite de eventos a retornar (padrão: 50)
   */
  async getRealtimeEvents(limit: number = 50) {
    return api.get(`${this.basePath}/events/realtime`, { limit });
  }

  /**
   * Busca configurações de custos
   */
  async getCostsConfig() {
    return api.get(`${this.basePath}/costs/config`);
  }

  /**
   * Atualiza configurações de custos
   * @param costs Objeto com configurações de custos
   */
  async updateCostsConfig(costs: Record<string, number>) {
    return api.put(`${this.basePath}/costs/config`, costs);
  }

  /**
   * Busca status de integrações
   */
  async getIntegrationsHealth() {
    return api.get(`${this.basePath}/integrations/health`);
  }

  /**
   * Busca métricas do funil de conversão
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   */
  async getFunnelMetrics(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return api.get(`${this.basePath}/funnel`, params);
  }

  /**
   * Busca métricas diárias
   * @param startDate Data inicial no formato YYYY-MM-DD (opcional)
   * @param endDate Data final no formato YYYY-MM-DD (opcional)
   * @param channelId ID do canal (opcional, para filtrar por canal)
   */
  async getDailyMetrics(startDate?: string, endDate?: string, channelId?: string) {
    const params: Record<string, string> = {};
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (channelId) params.channel_id = channelId;
    
    return api.get(`${this.basePath}/daily`, params);
  }

  /**
   * Criar nova entrada de métricas de canal
   */
  async createChannelMetrics(metrics: any) {
    return api.post(`${this.basePath}/channels`, metrics);
  }

  /**
   * Criar nova entrada de métricas diárias
   */
  async createDailyMetrics(metrics: any) {
    return api.post(`${this.basePath}/daily`, metrics);
  }

  /**
   * Criar novo evento em tempo real
   */
  async createEvent(event: any) {
    return api.post(`${this.basePath}/events`, event);
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
