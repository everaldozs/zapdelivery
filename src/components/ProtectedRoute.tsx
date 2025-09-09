import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDefaultRouteForRole, canAccessRoute } from '../lib/authMiddleware';
import { clsx } from 'clsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Padrão true
  redirectToRoleDefault?: boolean; // Se deve redirecionar para rota padrão do role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectToRoleDefault = false 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();

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
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Se requer autenticação e não há usuário, redirecionar para login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se usuário está logado mas não tem perfil ativo, mostrar erro
  if (user && requireAuth && (!profile || !profile.ativo)) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <div className={clsx(
          'text-center p-8 rounded-lg shadow-lg max-w-md w-full',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}>
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={clsx(
            'text-lg font-semibold mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Perfil Inativo
          </h3>
          <p className={clsx(
            'text-sm mb-6',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {!profile 
              ? 'Seu perfil não foi encontrado. Entre em contato com o administrador para configurar sua conta.'
              : 'Sua conta está inativa. Entre em contato com o administrador para ativar sua conta.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  // Se deve redirecionar para rota padrão do role (usado principalmente no login)
  if (redirectToRoleDefault && profile) {
    const defaultRoute = getDefaultRouteForRole(profile);
    if (location.pathname !== defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // Verificar se o usuário pode acessar a rota atual
  if (profile && !canAccessRoute(profile, location.pathname)) {
    const defaultRoute = getDefaultRouteForRole(profile);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;