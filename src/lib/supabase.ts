import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig() {
  // Try environment variables first
  const metaEnv = (import.meta as any).env || {};
  let url = metaEnv.VITE_SUPABASE_URL || '';
  let anonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  // 1. Fallback to localStorage if manual override is specified
  const localUrl = localStorage.getItem('supabase_temp_url');
  const localKey = localStorage.getItem('supabase_temp_key');
  if (localUrl && localKey) {
    url = localUrl;
    anonKey = localKey;
  }

  // 2. Fallback to the live project credentials provided by the user
  if (!url || url === 'YOUR_SUPABASE_URL' || url.includes('YOUR_')) {
    url = 'https://fpzzsnhwppzkwhjehmvg.supabase.co';
  }
  if (!anonKey || anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwenpzbmh3cHB6a3doamVobXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDc0MzMsImV4cCI6MjA5NzUyMzQzM30.R7_zdpDilaNuvhYXezYdkVnDWt9fGAU1EEBEFXzUHkY';
  }

  const isConfigured = 
    url && 
    anonKey && 
    url !== 'YOUR_SUPABASE_URL' && 
    anonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    !url.includes('YOUR_');

  return {
    url,
    anonKey,
    isConfigured: !!isConfigured,
  };
}

export function resetSupabaseClient() {
  supabaseClient = null;
}

export function getSupabaseClient(): SupabaseClient {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    throw new Error('Supabase configuration is missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env/Secrets panel.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }

  return supabaseClient;
}
