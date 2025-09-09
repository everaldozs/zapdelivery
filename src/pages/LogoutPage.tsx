import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutPage: React.FC = () => {
  const { signOut } = useAuth();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('Executando logout...');
        await signOut();
      } catch (error) {
        console.error('Erro no logout:', error);
        // Forçar redirecionamento mesmo com erro
        window.location.replace('/login');
      }
    };
    
    performLogout();
  }, [signOut]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Saindo do sistema...</p>
      </div>
    </div>
  );
};

export default LogoutPage;