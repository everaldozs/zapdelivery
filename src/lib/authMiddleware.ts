import type { UserRole, UserProfile } from '../context/AuthContext';

/**
 * Middleware de autorização para o sistema hierárquico
 * 
 * Hierarquia de permissões:
 * - admin_geral: Acesso completo a tudo
 * - estabelecimento: Acesso ao próprio estabelecimento + gerenciamento de atendentes
 * - atendente: Apenas visualização/edição de pedidos do estabelecimento (sem exclusão)
 */

export interface PermissionConfig {
  roles: UserRole[];
  requireEstabelecimento?: boolean;
  allowedEstabelecimentos?: string[];
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 */
export function hasPermission(
  profile: UserProfile | null,
  config: PermissionConfig
): boolean {
  if (!profile || !profile.ativo) return false;

  // Verificar se o role do usuário está na lista de roles permitidos
  if (!config.roles.includes(profile.role_name)) return false;

  // Admin geral sempre tem acesso
  if (profile.role_name === 'admin_geral') return true;

  // Se requer estabelecimento, verificar se usuário tem um
  if (config.requireEstabelecimento && !profile.estabelecimento_id) return false;

  // Se especificou estabelecimentos permitidos, verificar se usuário está na lista
  if (config.allowedEstabelecimentos && config.allowedEstabelecimentos.length > 0) {
    if (!profile.estabelecimento_id || !config.allowedEstabelecimentos.includes(profile.estabelecimento_id)) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica se o usuário pode executar uma ação específica
 */
export function canPerformAction(
  profile: UserProfile | null,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: 'pedidos' | 'produtos' | 'clientes' | 'estabelecimentos' | 'atendentes',
  resourceEstabelecimentoId?: string
): boolean {
  if (!profile || !profile.ativo) return false;

  const role = profile.role_name;

  // Admin geral pode tudo
  if (role === 'admin_geral') return true;

  // Verificar permissões específicas por role e recurso
  switch (resource) {
    case 'pedidos':
      if (role === 'estabelecimento') {
        // Estabelecimento pode fazer tudo nos próprios pedidos
        return !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
      }
      if (role === 'atendente') {
        // Atendente pode ler e atualizar, mas não deletar
        if (action === 'delete') return false;
        return !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
      }
      return false;

    case 'produtos':
    case 'clientes':
      if (role === 'estabelecimento') {
        // Estabelecimento pode gerenciar próprios produtos/clientes
        return !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
      }
      if (role === 'atendente') {
        // Atendente pode apenas ler produtos e criar/editar clientes
        if (resource === 'produtos') return action === 'read';
        if (resource === 'clientes') return action !== 'delete';
      }
      return false;

    case 'estabelecimentos':
      if (role === 'estabelecimento') {
        // Estabelecimento pode apenas editar próprio perfil
        return action === 'update' && resourceEstabelecimentoId === profile.estabelecimento_id;
      }
      return false; // Atendentes não podem gerenciar estabelecimentos

    case 'atendentes':
      if (role === 'estabelecimento') {
        // Estabelecimento pode gerenciar próprios atendentes
        return !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
      }
      return false; // Atendentes não podem gerenciar outros atendentes

    default:
      return false;
  }
}

/**
 * Determina a rota de redirecionamento baseada no role do usuário
 */
export function getDefaultRouteForRole(profile: UserProfile | null): string {
  if (!profile) return '/login';

  switch (profile.role_name) {
    case 'admin_geral':
      return '/dashboard'; // Dashboard completo
    
    case 'estabelecimento':
      return '/dashboard'; // Dashboard do estabelecimento
    
    case 'atendente':
      return '/pedidos'; // Diretamente para o Kanban de pedidos
    
    default:
      return '/login';
  }
}

/**
 * Verifica se o usuário pode acessar uma rota específica
 */
export function canAccessRoute(
  profile: UserProfile | null,
  route: string
): boolean {
  if (!profile || !profile.ativo) return false;

  const role = profile.role_name;

  // Rotas públicas (após login)
  const publicRoutes = ['/perfil', '/minha-conta'];
  if (publicRoutes.includes(route)) return true;

  // Admin geral pode acessar tudo
  if (role === 'admin_geral') return true;

  // Rotas específicas por role
  const roleRoutes: Record<UserRole, string[]> = {
    admin_geral: ['*'], // Acesso a tudo
    
    estabelecimento: [
      '/dashboard',
      '/pedidos',
      '/produtos',
      '/clientes',
      '/cardapio',
      '/categorias', // ADICIONADO: Acesso às rotas de categorias
      '/estabelecimento',
      '/atendentes'
    ],
    
    atendente: [
      '/pedidos', // Apenas Kanban de pedidos
      '/clientes' // Pode ver/criar clientes para pedidos
    ]
  };

  const allowedRoutes = roleRoutes[role] || [];
  
  // Verificar se a rota está permitida
  return allowedRoutes.includes('*') || allowedRoutes.some(allowedRoute => 
    route.startsWith(allowedRoute)
  );
}

/**
 * Hook utilitário para verificações de autorização em componentes
 */
export interface AuthorizationHelpers {
  hasPermission: (config: PermissionConfig) => boolean;
  canPerformAction: (
    action: 'create' | 'read' | 'update' | 'delete',
    resource: 'pedidos' | 'produtos' | 'clientes' | 'estabelecimentos' | 'atendentes',
    resourceEstabelecimentoId?: string
  ) => boolean;
  canAccessRoute: (route: string) => boolean;
  getDefaultRoute: () => string;
}

export function createAuthHelpers(profile: UserProfile | null): AuthorizationHelpers {
  return {
    hasPermission: (config) => hasPermission(profile, config),
    canPerformAction: (action, resource, resourceId) => 
      canPerformAction(profile, action, resource, resourceId),
    canAccessRoute: (route) => canAccessRoute(profile, route),
    getDefaultRoute: () => getDefaultRouteForRole(profile)
  };
}

/**
 * Configurações de permissão pré-definidas para casos comuns
 */
export const PERMISSION_CONFIGS = {
  // Dashboard completo (apenas admin)
  FULL_DASHBOARD: {
    roles: ['admin_geral'] as UserRole[]
  },
  
  // Dashboard do estabelecimento
  ESTABLISHMENT_DASHBOARD: {
    roles: ['admin_geral', 'estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Kanban de pedidos
  ORDERS_KANBAN: {
    roles: ['admin_geral', 'estabelecimento', 'atendente'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Gerenciamento de produtos
  PRODUCT_MANAGEMENT: {
    roles: ['admin_geral', 'estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Gerenciamento de categorias
  CATEGORY_MANAGEMENT: {
    roles: ['admin_geral', 'estabelecimento'] as UserRole[]
    // Sem requireEstabelecimento para permitir admin_geral sem restrições
  },
  
  // Gerenciamento de atendentes
  STAFF_MANAGEMENT: {
    roles: ['admin_geral', 'estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Apenas leitura para atendentes
  READ_ONLY_FOR_ATTENDANT: {
    roles: ['admin_geral', 'estabelecimento', 'atendente'] as UserRole[]
  },
  
  // Gerenciamento de usuários do sistema (apenas admin_geral)
  USER_MANAGEMENT: {
    roles: ['admin_geral'] as UserRole[]
  }
} as const;