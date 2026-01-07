/**
 * Clientes API Service
 */
import api from './api';

export interface ClienteAPI {
  id: number;
  nome: string;
  cnpj?: string;
  razao_social?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status: string;
  mrr: number;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: number;
  omie_id?: string;
  omie_sync: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClienteCreateDTO {
  nome: string;
  cnpj?: string;
  razao_social?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status?: string;
  mrr?: number;
  data_inicio?: string;
  responsavel_id?: number;
}

export interface ClienteUpdateDTO extends Partial<ClienteCreateDTO> {}

class ClientesService {
  async list(skip = 0, limit = 100): Promise<ClienteAPI[]> {
    return api.get<ClienteAPI[]>('/api/clientes', { skip, limit });
  }

  async get(id: number): Promise<ClienteAPI> {
    return api.get<ClienteAPI>(`/api/clientes/${id}`);
  }

  async create(data: ClienteCreateDTO): Promise<ClienteAPI> {
    return api.post<ClienteAPI>('/api/clientes', data);
  }

  async update(id: number, data: ClienteUpdateDTO): Promise<ClienteAPI> {
    return api.put<ClienteAPI>(`/api/clientes/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return api.delete(`/api/clientes/${id}`);
  }
}

export const clientesService = new ClientesService();
export default clientesService;
