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
  estabelecimento_nome?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
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

  // Função simplificada para buscar perfil
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Buscando perfil para:', email);
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profileData) {
        console.log('Perfil não encontrado, usando fallback');
        // Criar perfil fallback para admin
        const fallbackProfile: UserProfile = {
          id: userId,
          email: email,
          name: email.split('@')[0] || 'Admin',
          role_name: 'Administrator',
          status: 'active',
          estabelecimento_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        return;
      }

      // Mapear role_name
      let roleName: UserRole = 'Administrator';
      
      // Se tem role_id, buscar o role
      if (profileData.role_id) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role_name')
          .eq('id', profileData.role_id)
          .single();
          
        if (roleData?.role_name) {
          switch (roleData.role_name) {
            case 'admin_geral':
              roleName = 'Administrator';
              break;
            case 'estabelecimento':
              roleName = 'Estabelecimento';
              break;
            case 'atendente':
              roleName = 'Atendente';
              break;
            default:
              roleName = 'Administrator';
          }
        }
      }

      const userProfile: UserProfile = {
        id: profileData.id || userId,
        email: email,
        name: profileData.nome || email.split('@')[0] || 'Usuário',
        role_name: roleName,
        status: profileData.status || 'active',
        estabelecimento_id: profileData.estabelecimento_id,
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString(),
      };

      console.log('Perfil carregado:', userProfile);
      setProfile(userProfile);

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      // Perfil de emergência
      const emergencyProfile: UserProfile = {
        id: userId,
        email: email,
        name: email.split('@')[0] || 'Admin',
        role_name: 'Administrator',
        status: 'active',
        estabelecimento_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(emergencyProfile);
    }
  };

  // Inicialização simples - EXECUTA APENAS UMA VEZ
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Buscar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        setLoading(false);

      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const isAdmin = () => profile?.role_name === 'Administrator';
  const isEstabelecimento = () => profile?.role_name === 'Estabelecimento';
  const isAtendente = () => profile?.role_name === 'Atendente';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin,
    isEstabelecimento,
    isAtendente,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
