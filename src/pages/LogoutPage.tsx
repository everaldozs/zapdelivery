import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// VERSÃO RADICAL: LOGOUT DIRETO SEM LOOPS!
const LogoutPage: React.FC = () => {
  
  useEffect(() => {
    console.log('🚪 [LogoutPage] LOGOUT RADICAL - Iniciando...');
    
    // FUNÇÃO ISOLADA - SEM DEPENDÊNCIAS DO AuthContext
    const performRadicalLogout = async () => {
      try {
        console.log('🔥 [LogoutPage] Executando logout DIRETO no Supabase...');
        
        // Limpar localStorage IMEDIATAMENTE
        localStorage.clear();
        sessionStorage.clear();
        
        // Logout direto no Supabase (sem await para ser mais rápido)
        supabase.auth.signOut().catch(err => {
          console.warn('⚠️ [LogoutPage] Erro no Supabase logout (ignorando):', err);
        });
        
        console.log('✅ [LogoutPage] Logout executado, redirecionando...');
        
        // Redirecionamento IMEDIATO e FORÇADO
        window.location.replace('/login');
        
      } catch (error) {
        console.error('❌ [LogoutPage] Erro no logout, forçando redirecionamento:', error);
        
        // FALLBACK: Forçar redirecionamento mesmo com erro
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/login');
      }
    };
    
    // Executar IMEDIATAMENTE
    performRadicalLogout();
    
  }, []); // ← SEM DEPENDÊNCIAS = SEM LOOPS!
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">🚀 Saindo do sistema (versão radical)...</p>
      </div>
    </div>
  );
};

export default LogoutPage;