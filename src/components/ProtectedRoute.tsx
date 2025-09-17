import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

// VERSÃO RADICAL: ZERO LOOPS, MÁXIMA SIMPLICIDADE
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();

  console.log('🛡️ [ProtectedRoute] RADICAL - User:', user?.email, 'Loading:', loading, 'Path:', location.pathname);

  // Loading ultra-simples
  if (loading) {
    console.log('⏳ [ProtectedRoute] Mostrando loading...');
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
            🚀 Carregando sistema...
          </p>
        </div>
      </div>
    );
  }

  // Se requer auth e não há usuário = login
  if (requireAuth && !user) {
    console.log('🔒 [ProtectedRoute] Redirecionando para login - sem usuário');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // PERMITIR ACESSO SEMPRE QUE HÁ USUÁRIO
  console.log('✅ [ProtectedRoute] Permitindo acesso ao conteúdo');
  return <>{children}</>;
};

export default ProtectedRoute;