import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. For Vercel: Project Settings → Environment Variables, add both for Production (and Preview if needed), then redeploy so the Vite build can embed them.'
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}

/** Lazy client so the app shell can load if env is wrong; first Supabase call throws with setup instructions. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c as object, prop, c);
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(c);
    }
    return value;
  },
});
