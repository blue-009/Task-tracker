import { useCallback, useEffect, useState } from 'react';
import { supabase, ok } from './supabase.js';
import { Me } from './me.js';
import Auth from './pages/Auth.jsx';
import Shell from './components/Shell.jsx';

export default function App() {
  const [user, setUser] = useState(undefined);

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setUser(null);
      const { data: a } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (a.nextLevel === 'aal2' && a.currentLevel !== 'aal2') return setUser(null); // 2FA not finished
      const [p, f] = await Promise.all([
        ok(supabase.from('profiles').select('*').single()),
        supabase.auth.mfa.listFactors(),
      ]);
      setUser({ ...p, email: session.user.email, otp: f.data.totp.length > 0 });
    } catch { setUser(null); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') setUser(null); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.classList.toggle('dark', user.theme === 'dark' || (user.theme === 'system' && mq.matches));
      document.documentElement.style.fontSize = { sm: '14px', md: '16px', lg: '18px' }[user.size];
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [user?.theme, user?.size]);

  if (user === undefined) return null;
  if (!user) return <Auth onDone={load} />;
  return <Me.Provider value={{ user, setUser, reload: load }}><Shell /></Me.Provider>;
}