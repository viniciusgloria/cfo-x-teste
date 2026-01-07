import { User } from '../types';

export const getAllowedPaths = (user: User | null, cargoNome?: string, setorNome?: string): string[] => {
  if (!user) return [];

  const base = [
    '/dashboard',
    '/notificacoes',
    '/tarefas',
    '/lembretes',
    '/mural',
    '/calendario',
    '/chat',
    '/documentos',
    '/feedbacks',
    '/solicitacoes'
  ];
  const management = ['/avaliacoes', '/colaboradores', '/okrs', '/folha-pagamento', '/folha-clientes', '/relatorios'];
  const adminOnly = ['/configuracoes'];

  if (user.role === 'admin') {
    return [...base, '/ponto', '/clientes', ...management, ...adminOnly];
  }

  if (user.role === 'gestor') {
    return [...base, '/ponto', '/clientes', ...management];
  }

  if (user.role === 'colaborador') {
    let paths = [...base];
    if (user.regime !== 'PJ') paths.push('/ponto');

    // Permissões adicionais baseadas em cargo/setor
    const hasManagementAccess = cargoNome?.toLowerCase().includes('gerente') ||
                               setorNome === 'TI' ||
                               setorNome === 'RH' ||
                               cargoNome?.toLowerCase().includes('coordenador');

    if (hasManagementAccess) {
      paths.push('/clientes');
      // Adicionar algumas páginas de gestão, mas não folha de pagamento
      paths.push('/avaliacoes', '/colaboradores', '/okrs', '/relatorios');
    }

    return paths;
  }

  if (user.role === 'cliente') {
    return ['/dashboard', '/clientes', '/chat', '/feedbacks'];
  }

  if (user.role === 'visitante') {
    return ['/dashboard', '/mural'];
  }

  return [];
};