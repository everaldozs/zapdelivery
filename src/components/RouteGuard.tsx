import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import { PERMISSION_CONFIGS, type PermissionConfig } from '../lib/authMiddleware';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: PermissionConfig;
  fallbackRoute?: string;
  showUnauthorized?: boolean;
}

/**
 * Componente para proteger rotas baseado em permissões específicas
 * 
 * Diferente do ProtectedRoute que apenas verifica autenticação,
 * o RouteGuard verifica permissões específicas baseadas no role
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permission,
  fallbackRoute,
  showUnauthorized = false
}) => {
  const { hasPermission, profile, loading, getDefaultRoute } = useAuthorization();
  const location = useLocation();
  const { theme } = useTheme();

  // Loading state
  if (loading) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  // Se não há perfil, redirecionar para login
  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se há configuração de permissão, verificar
  if (permission && !hasPermission(permission)) {
    if (showUnauthorized) {
      return (
        <div className={clsx(
          'min-h-screen flex items-center justify-center p-4',
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        )}>
          <div className={clsx(
            'text-center p-8 rounded-lg shadow-lg max-w-md w-full',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          )}>
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className={clsx(
              'text-lg font-semibold mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Acesso Negado
            </h3>
            <p className={clsx(
              'text-sm mb-4',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Você não tem permissão para acessar esta página.
            </p>
            <p className={clsx(
              'text-xs mb-4',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Role atual: <span className="font-mono font-semibold">{profile.role_display_name}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
    
    // Redirecionar para rota apropriada ou fallback
    const redirectTo = fallbackRoute || getDefaultRoute();
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Componentes de proteção específicos para casos comuns
 */

// Apenas administradores gerais
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.FULL_DASHBOARD} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);

// Administradores e estabelecimentos
export const EstablishmentGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.ESTABLISHMENT_DASHBOARD} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);

// Todos os roles autenticados (Kanban)
export const OrdersGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.ORDERS_KANBAN}>
    {children}
  </RouteGuard>
);

// Apenas estabelecimentos e admins (produtos)
export const ProductGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.PRODUCT_MANAGEMENT} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);

// Gerenciamento de categorias (admin_geral e estabelecimento)
export const CategoryGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.CATEGORY_MANAGEMENT} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);

// Apenas estabelecimentos e admins (staff)
export const StaffGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.STAFF_MANAGEMENT} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);

// Gerenciamento de usuários do sistema (apenas admin_geral)
export const UserManagementGuard: React.FC<{ children: React.ReactNode; showUnauthorized?: boolean }> = ({ children, showUnauthorized }) => (
  <RouteGuard permission={PERMISSION_CONFIGS.USER_MANAGEMENT} showUnauthorized={showUnauthorized}>
    {children}
  </RouteGuard>
);