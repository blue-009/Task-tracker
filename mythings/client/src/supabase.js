import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

// Throws on error, returns data otherwise
export const ok = async p => {
  const { data, error } = await p;
  if (error) throw error;
  return data;
};

// Checks a password WITHOUT touching the current session (separate, non-persistent client)
export const verifyPassword = async (email, password) => {
  const tmp = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await tmp.auth.signInWithPassword({ email, password });
  return !error;
};
