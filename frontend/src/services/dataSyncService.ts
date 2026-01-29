/**
 * Data Sync Service - Sincroniza dados de TODAS as APIs com os stores
 * Chamado uma vez quando o usuário loga
 */

import { useClientesStore } from '../store/clientesStore';
import clientesService from './clientesService';

export class DataSyncService {
  /**
   * Sincroniza TODOS os dados dos stores com a API
   * Chamado após login bem-sucedido
   */
  static async syncAllData() {
    console.log('🔄 Iniciando sincronização de dados...');
    
    try {
      // Carregar clientes e atualizar store
      const apiClientes = await clientesService.list();
      if (apiClientes && Array.isArray(apiClientes)) {
        const clientesStore = useClientesStore.getState();
        const clientes = apiClientes.map((apiCliente: any) => {
          // Converter de API para formato interno
          return {
            id: apiCliente.id,
            dadosGerais: {
              nome: apiCliente.nome,
              cnpj: apiCliente.cnpj || '',
              endereco: apiCliente.endereco || '',
              telefone: apiCliente.telefone || '',
              email: apiCliente.email || '',
            },
            contatosPrincipais: {
              nomeSocio: '',
              emailPrincipal: apiCliente.email || '',
              telefone: apiCliente.telefone || '',
            },
            outrosContatos: [],
            comunicacaoFluxo: {
              canalPreferencial: 'email' as const,
              horarioPreferencial: 'comercial' as const,
              pessoaContatoPrincipal: '',
            },
            servicosContratados: {
              previsaoInicio: apiCliente.data_inicio || '',
              bpoFinanceiro: false,
              assessoriaFinanceira: false,
              contabilidade: false,
              juridicoContratual: false,
              juridicoTributario: false,
              trading: false,
              planosHistorico: [],
            },
            omieConfig: {
              pertenceGrupo: false,
              appKey: '',
              appSecret: '',
              integracoes: {},
            },
            status: (apiCliente.status || 'ativo').toLowerCase() as any,
            mrr: apiCliente.mrr || 0,
            criadoEm: apiCliente.created_at || new Date().toISOString(),
            atualizadoEm: apiCliente.updated_at || new Date().toISOString(),
          };
        });
        
        // Atualizar store
        clientesStore.clientes = clientes;
        console.log('✅ Clientes sincronizados:', clientes.length);
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar dados:', error);
    }
  }
}

export default DataSyncService;
