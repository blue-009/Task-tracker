import { useCallback, useEffect, useState } from 'react';
import { supabase, ok } from './supabase.js';

// Runs a Supabase query; returns [data, reload]
export function useQ(fn, deps = []) {
  const [data, setData] = useState(null);
  const load = useCallback(() => ok(fn()).then(setData).catch(e => console.error(e)), deps);
  useEffect(() => { load(); }, [load]);
  return [data, load];
}

export const logout = async () => { await supabase.auth.signOut(); location.reload(); };

export const lines = s => s.split('\n')
  .map(x => x.trim().replace(/^(?:[-*•]\s*)?(?:\[[ xX]\]\s*)?/, '').trim()).filter(Boolean);

export const fmt = t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
export const sz = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
export const ago = t => {
  const m = Math.round((Date.now() - new Date(t)) / 6e4);
  return m < 1 ? 'Just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : fmt(t);
};

export function saveBlob(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}
