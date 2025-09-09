import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tbtjsvvmrisukvqlhfgq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidGpzdnZtcmlzdWt2cWxoZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzQ0ODcsImV4cCI6MjA2Njk1MDQ4N30.Hi108NVjzyl2tL_ZgWiaB-JhZalQdG-DUodVCl4uMRs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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