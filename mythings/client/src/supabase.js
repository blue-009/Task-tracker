import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Throws on error, returns data otherwise
export const ok = async p => {
  const { data, error } = await p;
  if (error) throw error;
  return data;
};