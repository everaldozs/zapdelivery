import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAuthHelpers, type AuthorizationHelpers } from '../lib/authMiddleware';

/**
 * Hook personalizado para verificações de autorização
 * 
 * Fornece métodos convenientes para verificar permissões
 * baseado no perfil do usuário autenticado
 */
export function useAuthorization(): AuthorizationHelpers & {
  profile: ReturnType<typeof useAuth>['profile'];
  loading: boolean;
} {
  const { profile, loading } = useAuth();
  
  const authHelpers = useMemo(() => {
    return createAuthHelpers(profile);
  }, [profile]);
  
  return {
    ...authHelpers,
    profile,
    loading
  };
}

/**
 * Hook para verificações específicas de role
 */
export function useRoleCheck() {
  const { profile, isAdmin, isEstabelecimento, isAtendente, hasRole } = useAuth();
  
  return {
    profile,
    isAdmin,
    isEstabelecimento,
    isAtendente,
    hasRole,
    // Helpers adicionais
    canManageEstablishment: () => isAdmin() || isEstabelecimento(),
    canDeleteOrders: () => isAdmin() || isEstabelecimento(),
    canManageProducts: () => isAdmin() || isEstabelecimento(),
    canManageStaff: () => isAdmin() || isEstabelecimento(),
    isReadOnlyUser: () => isAtendente() && !isEstabelecimento() && !isAdmin()
  };
}