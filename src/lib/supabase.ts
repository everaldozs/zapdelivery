import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tbtjsvvmrisukvqlhfgq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidGpzdnZtcmlzdWt2cWxoZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzQ0ODcsImV4cCI6MjA2Njk1MDQ4N30.Hi108NVjzyl2tL_ZgWiaB-JhZalQdG-DUodVCl4uMRs'

console.log('🔗 [Supabase] Inicializando cliente...');
console.log('🔗 [Supabase] URL:', supabaseUrl);
console.log('🔗 [Supabase] Anon Key:', supabaseAnonKey?.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ [Supabase] Cliente inicializado com sucesso');

// Teste básico de conectividade
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('❌ [Supabase] Erro ao obter sessão:', error);
  } else {
    console.log('✅ [Supabase] Conectividade OK. Usuário:', session?.user?.email || 'Não logado');
  }
});

// Teste direto da consulta
setTimeout(() => {
  console.log('🧪 [Supabase] Testando consulta direta...');
  supabase
    .from('user_roles')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ [Supabase] Erro no teste direto:', error);
      } else {
        console.log('✅ [Supabase] Teste direto OK:', data?.length || 0, 'registros');
      }
    });
}, 1000);

// Utility function to get the current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Utility function to get auth session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}