// Quick2B Supabase Client Configuration
// Owner: CA Kanhaiya Soni (omizala9471@gmail.com)

const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta.env.VITE_SUPABASE_URL || '') 
  : '';
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '') 
  : '';

let _client = null;

export const getSupabase = async () => {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    _client = createClient(supabaseUrl, supabaseAnonKey);
    return _client;
  } catch (err) {
    console.warn('Supabase JS client not loaded, falling back to REST API', err);
    return null;
  }
};

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
