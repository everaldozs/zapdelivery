import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAuthHelpers, type AuthorizationHelpers } from '../lib/authMiddleware';

/**
 * Hook para verificações de autorização - VERSÃO CORRIGIDA SEM LOOPS
 * 
 * Usa cacheamento estático para evitar re-criações desnecessárias
 */
export function useAuthorization(): AuthorizationHelpers & {
  profile: ReturnType<typeof useAuth>['profile'];
  loading: boolean;
} {
  const { profile, loading } = useAuth();
  
  console.log('🔍 [useAuthorization] CORRIGIDO - Profile:', profile?.name, '- Role:', profile?.role_name);
  
  // Cache estático para evitar re-criações
  const authHelpers = useMemo(() => {
    console.log('🔧 [useAuthorization] Criando authHelpers otimizados');
    return createAuthHelpers(profile);
  }, [
    profile?.id,           // Apenas ID 
    profile?.role_name     // Apenas role
    // Removido status para reduzir re-renderizações
  ]);
  
  return {
    ...authHelpers,
    profile,
    loading
  };
}

/**
 * Hook para verificações de role - VERSÃO RESTAURADA
 */
export function useRoleCheck() {
  const { profile, isAdmin, isEstabelecimento, isAtendente } = useAuth();
  
  console.log('🎩 [useRoleCheck] Profile:', profile?.name, '- Role:', profile?.role_name);
  
  return {
    profile,
    isAdmin,
    isEstabelecimento,
    isAtendente,
    // Helpers baseados no role real
    canManageEstablishment: () => isAdmin() || isEstabelecimento(),
    canDeleteOrders: () => isAdmin() || isEstabelecimento(),
    canManageProducts: () => isAdmin() || isEstabelecimento(),
    canManageStaff: () => isAdmin() || isEstabelecimento(),
    isReadOnlyUser: () => isAtendente() && !isEstabelecimento() && !isAdmin()
  };
}