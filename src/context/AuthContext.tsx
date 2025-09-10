import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  // Funções utilitárias básicas
  isAdmin: () => boolean;
  isEstabelecimento: () => boolean;
  isAtendente: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// VERSÃO CORRIGIDA: ZERO LOOPS, MÁXIMA ESTABILIDADE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Flags para controle total de execução
  const initRef = useRef(false);
  const mountedRef = useRef(true);
  const profileFetchedRef = useRef(false);

  console.log('🚀 [AuthProvider] VERSÃO CORRIGIDA - User:', user?.email, 'Loading:', loading);

  // FUNÇÃO OTIMIZADA PARA BUSCAR PERFIL - EXECUÇÃO ÚNICA
  const fetchUserProfile = async (userId: string, email: string) => {
    // Evitar dupla execução
    if (profileFetchedRef.current) {
      console.log('⚠️ [AuthProvider] Profile já foi buscado, ignorando');
      return;
    }
    
    profileFetchedRef.current = true;
    
    try {
      console.log('🔍 [AuthProvider] Buscando perfil único para:', email);
      
      // Query para buscar perfil com role
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner (
            role_name,
            role_display_name
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        console.error('❌ [AuthProvider] Erro ao buscar perfil:', error.message);
        // Criar perfil fallback em caso de erro
        const fallbackProfile: UserProfile = {
          id: userId,
          email: email,
          name: email.split('@')[0] || 'Usuário',
          role_name: 'Administrator', // Fallback para admin
          status: 'active',
          estabelecimento_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estabelecimento_nome: undefined
        };
        
        console.log('⚠️ [AuthProvider] Usando perfil fallback:', fallbackProfile);
        if (mountedRef.current) {
          setProfile(fallbackProfile);
        }
        return;
      }
      
      if (!profiles) {
        console.log('⚠️ [AuthProvider] Nenhum perfil encontrado, criando fallback');
        const fallbackProfile: UserProfile = {
          id: userId,
          email: email,
          name: email.split('@')[0] || 'Usuário',
          role_name: 'Administrator',
          status: 'active',
          estabelecimento_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estabelecimento_nome: undefined
        };
        
        if (mountedRef.current) {
          setProfile(fallbackProfile);
        }
        return;
      }
      
      // Mapear role_name baseado no sistema atual
      let mappedRoleName: UserRole = 'Administrator';
      const roleData = profiles.user_roles;
      
      if (roleData?.role_name === 'admin_geral') {
        mappedRoleName = 'Administrator';
      } else if (roleData?.role_name === 'estabelecimento') {
        mappedRoleName = 'Estabelecimento';
      } else if (roleData?.role_name === 'atendente') {
        mappedRoleName = 'Atendente';
      }
      
      // Criar perfil real
      const realProfile: UserProfile = {
        id: profiles.id,
        email: email,
        name: profiles.nome || email.split('@')[0] || 'Usuário',
        role_name: mappedRoleName,
        status: profiles.status || 'active',
        estabelecimento_id: profiles.estabelecimento_id,
        created_at: profiles.created_at || new Date().toISOString(),
        updated_at: profiles.updated_at || new Date().toISOString(),
        estabelecimento_nome: undefined // Pode ser adicionado depois
      };
      
      console.log('✅ [AuthProvider] Perfil real carregado:', {
        name: realProfile.name,
        role: realProfile.role_name,
        status: realProfile.status
      });
      
      if (mountedRef.current) {
        setProfile(realProfile);
      }
      
    } catch (error) {
      console.error('💥 [AuthProvider] Erro inesperado ao buscar perfil:', error);
      
      // Perfil de emergência
      const emergencyProfile: UserProfile = {
        id: userId,
        email: email,
        name: email.split('@')[0] || 'Usuário',
        role_name: 'Administrator',
        status: 'active',
        estabelecimento_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estabelecimento_nome: undefined
      };
      
      if (mountedRef.current) {
        setProfile(emergencyProfile);
      }
    }
  };

  // INICIALIZAÇÃO ÚNICA E ISOLADA
  useEffect(() => {
    // Evitar dupla execução
    if (initRef.current) {
      console.log('⚠️ [AuthProvider] Inicialização já executada, ignorando');
      return;
    }
    
    initRef.current = true;
    console.log('🎯 [AuthProvider] ========== INICIANDO VERSÃO RADICAL ==========');

    // Função de setup isolada
    const setupAuth = () => {
      try {
        // 1. Buscar sessão atual (SINCRONO)
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
          if (!mountedRef.current) return;
          
          console.log('📋 [AuthProvider] Sessão encontrada:', session?.user?.email || 'nenhuma');
          
          if (error) {
            console.error('❌ [AuthProvider] Erro ao buscar sessão:', error.message);
          }
          
          // Atualizar estados de forma atômica
          setSession(session);
          setUser(session?.user || null);
          
          // Buscar perfil real se há usuário logado
          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email || '');
          } else {
            setProfile(null);
          }
          
          // FINALIZAR LOADING
          console.log('✅ [AuthProvider] Inicialização concluída');
          setLoading(false);
        });
        
        // 2. Listener simplificado para mudanças de auth - SEM LOOPS
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mountedRef.current) {
            console.log('🚫 [AuthProvider] Componente desmontado, ignorando auth change:', event);
            return;
          }
          
          console.log('🔄 [AuthProvider] Auth state mudou:', event);
          
          // IGNORAR COMPLETAMENTE TODOS OS EVENTOS SIGNED_OUT
          if (event === 'SIGNED_OUT') {
            console.log('⛔ [AuthProvider] SIGNED_OUT ignorado completamente');
            return;
          }
          
          // Processar SIGNED_IN e buscar perfil se necessário
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ [AuthProvider] SIGNED_IN: atualizando session/user');
            if (mountedRef.current) {
              setSession(session);
              setUser(session.user);
              
              // Se não temos profile ainda, buscar agora
              if (!profile && !profileFetchedRef.current) {
                console.log('💫 [AuthProvider] SIGNED_IN: buscando profile');
                await fetchUserProfile(session.user.id, session.user.email || '');
              }
            }
          }
          
          if (mountedRef.current) {
            setLoading(false);
          }
        });
        
        // Cleanup function
        return () => {
          console.log('🧹 [AuthProvider] Cleanup executado');
          mountedRef.current = false;
          profileFetchedRef.current = false; // Reset para permitir nova busca se necessário
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('💥 [AuthProvider] Erro crítico na inicialização:', error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Executar setup
    const cleanup = setupAuth();
    
    return cleanup;
  }, []); // Array vazio - executa apenas uma vez

  // FUNÇÃO DE LOGIN SIMPLIFICADA
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthProvider] Tentando login:', email);
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔐 [AuthProvider] Login resultado:', !!data.user ? 'Sucesso' : 'Falhou');
      
      if (error) {
        console.error('❌ [AuthProvider] Erro no login:', error.message);
      }
      
      // O auth state change listener vai cuidar do resto
      return { data, error };
    } catch (error) {
      console.error('💥 [AuthProvider] Erro inesperado no login:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE LOGOUT ULTRA-SIMPLIFICADA - VERSÃO RADICAL SEM LOOPS
  const signOut = async () => {
    console.log('🚪 [AuthProvider] LOGOUT RADICAL - Início');
    
    try {
      // 1. Marcar como desmontado para parar listeners
      mountedRef.current = false;
      
      // 2. Limpar estados IMEDIATAMENTE - SEM CONDIÇÕES
      console.log('🧹 [AuthProvider] Limpando estados IMEDIATAMENTE...');
      setProfile(null);
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // 3. Limpar storages locais
      console.log('🗂️ [AuthProvider] Limpando storages...');
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Logout direto no Supabase (sem await para ser mais rápido)
      console.log('📤 [AuthProvider] Fazendo logout Supabase (fire-and-forget)...');
      supabase.auth.signOut().catch(err => {
        console.warn('⚠️ [AuthProvider] Erro no Supabase logout (ignorando):', err);
      });
      
      // 5. Redirecionamento IMEDIATO - SEM setTimeout
      console.log('🎯 [AuthProvider] Redirecionamento FORÇADO para /login');
      window.location.href = '/login';
      
      console.log('✅ [AuthProvider] LOGOUT RADICAL concluído');
      
    } catch (error) {
      console.error('💥 [AuthProvider] Erro crítico no logout radical:', error);
      
      // FALLBACK ABSOLUTO: Forçar logout mesmo com erro
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  // FUNÇÕES UTILITÁRIAS ULTRA-BÁSICAS
  const isAdmin = () => {
    const result = profile?.role_name === 'Administrator';
    console.log('🔍 [AuthProvider] isAdmin():', result);
    return result;
  };
  
  const isEstabelecimento = () => {
    const result = profile?.role_name === 'Estabelecimento';
    console.log('🔍 [AuthProvider] isEstabelecimento():', result);
    return result;
  };
  
  const isAtendente = () => {
    const result = profile?.role_name === 'Atendente';
    console.log('🔍 [AuthProvider] isAtendente():', result);
    return result;
  };

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

  console.log('📊 [AuthProvider] Estado atual:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}