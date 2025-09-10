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
 * VERSÃO SIMPLIFICADA - SEM VERIFICAÇÕES DE STATUS
 */
export function hasPermission(
  profile: UserProfile | null,
  config: PermissionConfig
): boolean {
  console.log('[authMiddleware] hasPermission - Profile:', profile?.name, 'Roles permitidos:', config.roles);
  
  // SIMPLIFICADO: apenas verificar se existe profile
  if (!profile) {
    console.log('[authMiddleware] hasPermission: false - sem profile');
    return false;
  }

  // Verificar se o role do usuário está na lista de roles permitidos
  if (!config.roles.includes(profile.role_name)) {
    console.log('[authMiddleware] hasPermission: false - role não permitido');
    return false;
  }

  // Administrator sempre tem acesso
  if (profile.role_name === 'Administrator') {
    console.log('[authMiddleware] hasPermission: true - é Administrator');
    return true;
  }

  // Se requer estabelecimento, verificar se usuário tem um
  if (config.requireEstabelecimento && !profile.estabelecimento_id) {
    console.log('[authMiddleware] hasPermission: false - requer estabelecimento mas não tem');
    return false;
  }

  // Se especificou estabelecimentos permitidos, verificar se usuário está na lista
  if (config.allowedEstabelecimentos && config.allowedEstabelecimentos.length > 0) {
    if (!profile.estabelecimento_id || !config.allowedEstabelecimentos.includes(profile.estabelecimento_id)) {
      console.log('[authMiddleware] hasPermission: false - estabelecimento não está na lista permitida');
      return false;
    }
  }

  console.log('[authMiddleware] hasPermission: true - todas as verificações passaram');
  return true;
}

/**
 * Verifica se o usuário pode executar uma ação específica
 * VERSÃO SIMPLIFICADA - SEM VERIFICAÇÕES DE STATUS
 */
export function canPerformAction(
  profile: UserProfile | null,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: 'pedidos' | 'produtos' | 'clientes' | 'estabelecimentos' | 'atendentes',
  resourceEstabelecimentoId?: string
): boolean {
  console.log('[authMiddleware] canPerformAction:', { action, resource, profile: profile?.name, role: profile?.role_name });
  
  // SIMPLIFICADO: apenas verificar se existe profile
  if (!profile) {
    console.log('[authMiddleware] canPerformAction: false - sem profile');
    return false;
  }

  const role = profile.role_name;

  // Administrator pode tudo
  if (role === 'Administrator') {
    console.log('[authMiddleware] canPerformAction: true - é Administrator');
    return true;
  }

  // Verificar permissões específicas por role e recurso
  switch (resource) {
    case 'pedidos':
      if (role === 'Estabelecimento') {
        // Estabelecimento pode fazer tudo nos próprios pedidos
        const result = !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
        console.log('[authMiddleware] canPerformAction (pedidos-estabelecimento):', result);
        return result;
      }
      if (role === 'Atendente') {
        // Atendente pode ler e atualizar, mas não deletar
        if (action === 'delete') {
          console.log('[authMiddleware] canPerformAction (pedidos-atendente): false - não pode deletar');
          return false;
        }
        const result = !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
        console.log('[authMiddleware] canPerformAction (pedidos-atendente):', result);
        return result;
      }
      console.log('[authMiddleware] canPerformAction (pedidos): false - role não permitido');
      return false;

    case 'produtos':
    case 'clientes':
      if (role === 'Estabelecimento') {
        // Estabelecimento pode gerenciar próprios produtos/clientes
        const result = !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
        console.log('[authMiddleware] canPerformAction (produtos/clientes-estabelecimento):', result);
        return result;
      }
      if (role === 'Atendente') {
        // Atendente pode apenas ler produtos e criar/editar clientes
        if (resource === 'produtos') {
          const result = action === 'read';
          console.log('[authMiddleware] canPerformAction (produtos-atendente):', result);
          return result;
        }
        if (resource === 'clientes') {
          const result = action !== 'delete';
          console.log('[authMiddleware] canPerformAction (clientes-atendente):', result);
          return result;
        }
      }
      console.log('[authMiddleware] canPerformAction (produtos/clientes): false - role não permitido');
      return false;

    case 'estabelecimentos':
      if (role === 'Estabelecimento') {
        // Estabelecimento pode apenas editar próprio perfil
        const result = action === 'update' && resourceEstabelecimentoId === profile.estabelecimento_id;
        console.log('[authMiddleware] canPerformAction (estabelecimentos-estabelecimento):', result);
        return result;
      }
      console.log('[authMiddleware] canPerformAction (estabelecimentos): false - role não permitido');
      return false; // Atendentes não podem gerenciar estabelecimentos

    case 'atendentes':
      if (role === 'Estabelecimento') {
        // Estabelecimento pode gerenciar próprios atendentes
        const result = !resourceEstabelecimentoId || resourceEstabelecimentoId === profile.estabelecimento_id;
        console.log('[authMiddleware] canPerformAction (atendentes-estabelecimento):', result);
        return result;
      }
      console.log('[authMiddleware] canPerformAction (atendentes): false - role não permitido');
      return false; // Atendentes não podem gerenciar outros atendentes

    default:
      console.log('[authMiddleware] canPerformAction: false - recurso desconhecido');
      return false;
  }
}

/**
 * Determina a rota de redirecionamento baseada no role do usuário
 */
export function getDefaultRouteForRole(profile: UserProfile | null): string {
  if (!profile) return '/login';

  switch (profile.role_name) {
    case 'Administrator':
      return '/dashboard'; // Dashboard completo
    
    case 'Estabelecimento':
      return '/dashboard'; // Dashboard do estabelecimento
    
    case 'Atendente':
      return '/pedidos'; // Diretamente para o Kanban de pedidos
    
    default:
      return '/login';
  }
}

/**
 * Verifica se o usuário pode acessar uma rota específica
 * VERSÃO SIMPLIFICADA - SEM VERIFICAÇÕES DE STATUS
 */
export function canAccessRoute(
  profile: UserProfile | null,
  route: string
): boolean {
  console.log('[authMiddleware] canAccessRoute:', route, 'Profile:', profile?.name, 'Role:', profile?.role_name);
  
  // SIMPLIFICADO: apenas verificar se existe profile
  if (!profile) {
    console.log('[authMiddleware] canAccessRoute: false - sem profile');
    return false;
  }

  const role = profile.role_name;

  // Rotas públicas (após login)
  const publicRoutes = ['/perfil', '/minha-conta'];
  if (publicRoutes.includes(route)) {
    console.log('[authMiddleware] canAccessRoute: true - rota pública');
    return true;
  }

  // Administrator pode acessar tudo
  if (role === 'Administrator') {
    console.log('[authMiddleware] canAccessRoute: true - é Administrator');
    return true;
  }

  // Rotas específicas por role
  const roleRoutes: Record<UserRole, string[]> = {
    Administrator: ['*'], // Acesso a tudo
    
    Estabelecimento: [
      '/dashboard',
      '/pedidos',
      '/produtos',
      '/clientes',
      '/cardapio',
      '/categorias',
      '/estabelecimento',
      '/atendentes'
    ],
    
    Atendente: [
      '/pedidos', // Apenas Kanban de pedidos
      '/clientes' // Pode ver/criar clientes para pedidos
    ]
  };

  const allowedRoutes = roleRoutes[role] || [];
  
  // Verificar se a rota está permitida
  const result = allowedRoutes.includes('*') || allowedRoutes.some(allowedRoute => 
    route.startsWith(allowedRoute)
  );
  
  console.log('[authMiddleware] canAccessRoute:', result, 'Rotas permitidas:', allowedRoutes);
  return result;
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
    roles: ['Administrator'] as UserRole[]
  },
  
  // Dashboard do estabelecimento
  ESTABLISHMENT_DASHBOARD: {
    roles: ['Administrator', 'Estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Kanban de pedidos
  ORDERS_KANBAN: {
    roles: ['Administrator', 'Estabelecimento', 'Atendente'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Gerenciamento de produtos
  PRODUCT_MANAGEMENT: {
    roles: ['Administrator', 'Estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Gerenciamento de categorias
  CATEGORY_MANAGEMENT: {
    roles: ['Administrator', 'Estabelecimento'] as UserRole[]
    // Sem requireEstabelecimento para permitir Administrator sem restrições
  },
  
  // Gerenciamento de atendentes
  STAFF_MANAGEMENT: {
    roles: ['Administrator', 'Estabelecimento'] as UserRole[],
    requireEstabelecimento: true
  },
  
  // Apenas leitura para atendentes
  READ_ONLY_FOR_ATTENDANT: {
    roles: ['Administrator', 'Estabelecimento', 'Atendente'] as UserRole[]
  },
  
  // Gerenciamento de usuários do sistema (apenas Administrator)
  USER_MANAGEMENT: {
    roles: ['Administrator'] as UserRole[]
  },
  
  // Gerenciamento de tipos de usuários (apenas Administrator)
  USER_TYPES_MANAGEMENT: {
    roles: ['Administrator'] as UserRole[]
  }
} as const;