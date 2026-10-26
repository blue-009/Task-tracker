import { useCallback, useEffect, useState } from 'react';
import { get, tok } from './api.js';
import { Me } from './me.js';
import Auth from './pages/Auth.jsx';
import Shell from './components/Shell.jsx';

export default function App() {
  const [user, setUser] = useState(undefined);

  const load = useCallback(() => {
    if (!tok.get()) return setUser(null);
    return get('/me').then(setUser).catch(() => { tok.set(null); setUser(null); });
  }, []);
  useEffect(() => { load(); }, [load]);

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
