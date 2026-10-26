import { useCallback, useEffect, useState } from 'react';

export const tok = {
  get: () => localStorage.getItem('token'),
  set: t => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token')),
};

export async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tok.get() && { Authorization: 'Bearer ' + tok.get() }) },
    body: body && JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && tok.get()) { tok.set(null); location.reload(); }
  if (!r.ok) throw new Error(j.error || 'Something went wrong.');
  return j;
}
export const get = p => api(p);
export const post = (p, b) => api(p, 'POST', b || {});
export const patch = (p, b) => api(p, 'PATCH', b);
export const del = p => api(p, 'DELETE');

export function useApi(path) {
  const [data, setData] = useState(null);
  const load = useCallback(() => get(path).then(setData).catch(() => {}), [path]);
  useEffect(() => { load(); }, [load]);
  return [data, load];
}

export const logout = async () => { try { await post('/me/logout'); } catch {} tok.set(null); location.reload(); };

export const lines = s => s.split('\n')
  .map(x => x.trim().replace(/^(?:[-*•]\s*)?(?:\[[ xX]\]\s*)?/, '').trim()).filter(Boolean);

export const fmt = t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
export const sz = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
export const ago = t => {
  const m = Math.round((Date.now() - new Date(t)) / 6e4);
  return m < 1 ? 'Just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : fmt(t);
};

export const b64 = f => new Promise(r => { const x = new FileReader(); x.onload = () => r(x.result.split(',')[1]); x.readAsDataURL(f); });
export const enc = s => { let t = ''; new TextEncoder().encode(s).forEach(c => (t += String.fromCharCode(c))); return btoa(t); };
export const b64blob = (d, type) => new Blob([Uint8Array.from(atob(d), c => c.charCodeAt(0))], { type });
export function saveBlob(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}
