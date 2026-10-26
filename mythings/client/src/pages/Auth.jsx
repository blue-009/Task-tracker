import { useState } from 'react';
import { post, tok } from '../api.js';
import { Btn, Card, Logo, inp, useUI } from '../ui.jsx';

export default function Auth({ onDone }) {
  const { toast } = useUI();
  const [mode, setMode] = useState('login');
  const [pending, setPending] = useState(null);
  const title = { login: 'Welcome back', signup: 'Create your account', otp: 'Verification' }[mode];

  const submit = async e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    try {
      if (mode === 'signup') {
        if (v.password !== v.confirm) return toast('Passwords do not match.');
        tok.set((await post('/auth/signup', v)).token); onDone();
      } else if (mode === 'login') {
        const r = await post('/auth/login', v);
        if (r.pending) { setPending(r.pending); setMode('otp'); } else { tok.set(r.token); onDone(); }
      } else {
        tok.set((await post('/auth/otp', { pending, code: v.code })).token); onDone();
      }
    } catch (err) { toast(err.message); }
  };

  const link = (m, t) => <button type="button" className="text-purple-500 font-semibold cursor-pointer" onClick={() => setMode(m)}>{t}</button>;

  return (
    <div className="fixed inset-0 grid place-items-center p-5 bg-gradient-to-br from-violet-950 to-violet-700">
      <Card className="w-full max-w-sm text-center grid gap-3 justify-items-center px-[22px] py-7">
        <Logo big />
        <h2 className="text-xl font-bold">{title}</h2>
        <form key={mode} onSubmit={submit} className="w-full grid gap-3">
          {mode === 'signup' && <input className={inp} name="name" placeholder="Full name" required maxLength={60} />}
          {mode !== 'otp' && <input className={inp} name="email" type="email" placeholder="Email" autoComplete="username" required />}
          {mode !== 'otp' && <input className={inp} name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'} required />}
          {mode === 'signup' && <input className={inp} name="confirm" type="password" placeholder="Confirm password" autoComplete="new-password" required />}
          {mode === 'otp' && <input className={inp} name="code" inputMode="numeric" maxLength={6} placeholder="6-digit code" required autoFocus />}
          <Btn>{{ login: 'Sign in', signup: 'Create account', otp: 'Verify' }[mode]}</Btn>
        </form>
        <p className="text-muted text-sm">
          {mode === 'login' && <>New here? {link('signup', 'Create an account')}</>}
          {mode === 'signup' && <>Already have an account? {link('login', 'Sign in')}</>}
          {mode === 'otp' && link('login', 'Back to sign in')}
        </p>
      </Card>
    </div>
  );
}
