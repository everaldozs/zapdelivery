import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'Administrator' | 'Estabelecimento' | 'Atendente';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role_name: UserRole;
  status: string;
  estabelecimento_id: string | null;
  created_at: string;
  updated_at: string;
  // Dados do estabelecimento (quando aplicável)
  estabelecimento_nome?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  // Funções utilitárias de autorização
  hasRole: (role: UserRole) => boolean;
  canAccessEstabelecimento: (estabelecimentoId?: string) => boolean;
  isAdmin: () => boolean;
  isEstabelecimento: () => boolean;
  isAtendente: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select(`
          *,
          estabelecimentos (
            nome
          )
        `)
        .eq('id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Mapear os dados para o formato correto
      const profile: UserProfile = {
        ...data,
        estabelecimento_nome: data.estabelecimentos?.nome
      };

      return profile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  // Função para atualizar o perfil
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    async function getInitialSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        setSession(session);
        setUser(session?.user || null);
        
        // Buscar perfil se usuário estiver logado
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      }
      setLoading(false);
    }

    getInitialSession();

    // Listen for auth changes - IMPORTANTE: não usar async na callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user || null);
        
        // Buscar perfil quando usuário logar/deslogar
        if (session?.user) {
          fetchUserProfile(session.user.id).then(setProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      // Limpar dados locais primeiro
      setProfile(null);
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Limpar storage local
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar todos os cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out from Supabase:', error);
        // Mesmo com erro, continuar com a limpeza
      }
      
      // Aguardar um pouco para garantir que o logout foi processado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar redirecionamento para login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Erro completo no logout:', error);
      // Em caso de erro, forçar redirecionamento mesmo assim
      setProfile(null);
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  // Funções utilitárias de autorização
  const hasRole = (role: UserRole): boolean => {
    return profile?.role_name === role;
  };

  const canAccessEstabelecimento = (estabelecimentoId?: string): boolean => {
    if (!profile) return false;
    
    // Administrator pode acessar qualquer estabelecimento
    if (profile.role_name === 'Administrator') return true;
    
    // Se não especificou estabelecimento, verificar se usuário tem um
    if (!estabelecimentoId) return !!profile.estabelecimento_id;
    
    // Verificar se o estabelecimento solicitado é o mesmo do usuário
    return profile.estabelecimento_id === estabelecimentoId;
  };

  const isAdmin = (): boolean => hasRole('Administrator');
  const isEstabelecimento = (): boolean => hasRole('Estabelecimento');
  const isAtendente = (): boolean => hasRole('Atendente');

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    hasRole,
    canAccessEstabelecimento,
    isAdmin,
    isEstabelecimento,
    isAtendente,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}