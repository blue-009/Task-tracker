import { useState } from 'react';
import { logout, saveBlob } from '../api.js';
import { supabase, ok, verifyPassword } from '../supabase.js';
import { useMe } from '../me.js';
import { Badge, Btn, Card, Switch, inp, useUI } from '../ui.jsx';

const form = e => Object.fromEntries(new FormData(e.target));

export function PasswordCard() {
  const { user } = useMe();
  const { toast } = useUI();
  const submit = async e => {
    e.preventDefault();
    const f = e.target, v = form(e);
    if (v.next.length < 8) return toast('Use at least 8 characters.');
    if (v.next !== v.confirm) return toast('Passwords do not match.');
    try { if (!(await verifyPassword(user.email, v.current))) throw new Error('Current password is wrong.');
      await ok(supabase.auth.updateUser({ password: v.next })); f.reset(); toast('Password saved.'); } catch (err) { toast(err.message); }
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">Security</h3>
      <form onSubmit={submit} className="grid gap-3">
        <input className={inp} name="current" type="password" placeholder="Current password" autoComplete="current-password" required />
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={inp} name="next" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" required />
          <input className={inp} name="confirm" type="password" placeholder="Confirm new password" autoComplete="new-password" required />
        </div>
        <div className="flex gap-2.5 flex-wrap"><Btn>Change password</Btn><Btn type="button" v="ghost" onClick={logout}>Sign out</Btn></div>
      </form>
    </Card>
  );
}

export function OtpCard() {
  const { user, reload } = useMe();
  const { toast } = useUI();
  const [secret, setSecret] = useState(null);
  const [factor, setFactor] = useState(null);

  const toggle = async () => {
    try {
      if (user.otp) {
        const { totp } = await ok(supabase.auth.mfa.listFactors());
        for (const f of totp) await ok(supabase.auth.mfa.unenroll({ factorId: f.id }));
        reload();
      } else {
        const { all } = await ok(supabase.auth.mfa.listFactors());
        for (const f of all.filter(f => f.status === 'unverified')) await supabase.auth.mfa.unenroll({ factorId: f.id });
        const f = await ok(supabase.auth.mfa.enroll({ factorType: 'totp' }));
        setFactor(f.id); setSecret(f.totp.secret);
      }
    } catch (err) { toast(err.message); }
  };
  const confirm = async e => {
    e.preventDefault();
    try {
      const ch = await ok(supabase.auth.mfa.challenge({ factorId: factor }));
      await ok(supabase.auth.mfa.verify({ factorId: factor, challengeId: ch.id, code: form(e).code.trim() }));
      setSecret(null); await reload(); toast('OTP is on.');
    } catch (err) { toast(err.message); }
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">OTP</h3>
      <div className="flex items-center gap-3">
        <div className="flex-1"><b>One-time code (OTP)</b></div>
        <Switch on={user.otp} onChange={toggle} label="OTP" />
      </div>
      {secret && (
        <form onSubmit={confirm} className="grid gap-3">
          <code className="block bg-soft rounded-xl p-3 text-base tracking-[.08em] break-words text-center">{secret.match(/.{1,4}/g).join(' ')}</code>
          <input className={inp} name="code" inputMode="numeric" maxLength={6} placeholder="6-digit code" required />
          <div className="flex gap-2.5"><Btn>Confirm and turn on</Btn><Btn type="button" v="ghost" onClick={() => setSecret(null)}>Cancel</Btn></div>
        </form>
      )}
    </Card>
  );
}

export function PasskeyCard() {
  const { user, reload } = useMe();
  const { toast } = useUI();
  const submit = async e => {
    e.preventDefault();
    const f = e.target, v = form(e);
    if (v.next.length < 4) return toast('Use at least 4 characters.');
    if (v.next !== v.confirm) return toast('Passkeys do not match.');
    try { await ok(supabase.rpc('set_journal_passkey', { current_key: v.current ?? '', new_key: v.next })); f.reset(); await reload(); toast('Passkey saved.'); } catch (err) { toast(err.message); }
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">Journal passkey</h3>
      <form onSubmit={submit} className="grid gap-3">
        {user.has_pk && <input className={inp} name="current" type="password" placeholder="Current passkey" required />}
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={inp} name="next" type="password" placeholder="New passkey (4+ characters)" required />
          <input className={inp} name="confirm" type="password" placeholder="Confirm passkey" required />
        </div>
        <div><Btn>{user.has_pk ? 'Change passkey' : 'Set passkey'}</Btn></div>
      </form>
    </Card>
  );
}

export function SessionsCard() {
  const { toast } = useUI();
  const out = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    toast(error ? error.message : 'Signed out of all other devices.');
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">Active sessions</h3>
      <p className="text-muted text-sm">You are signed in on this device. Sign out everywhere else with one click.</p>
      <div><Btn v="ghost" onClick={out}>Sign out other devices</Btn></div>
    </Card>
  );
}

export function BackupCard() {
  const { confirm, toast } = useUI();
  const exp = async () => {
    try {
      const [profile, items, subitems, files] = await Promise.all([
        ok(supabase.from('profiles').select('name,phone,loc,bio,theme,size,def_vis,mask').single()),
        ok(supabase.from('items').select('id,kind,title,priority,status,done,created_at')),
        ok(supabase.from('subitems').select('item_id,title,done')),
        ok(supabase.from('files').select('name,size,type,visibility,created_at')),
      ]);
      saveBlob('mythings-backup.json', new Blob([JSON.stringify({ profile, items, subitems, files }, null, 1)], { type: 'application/json' }));
    } catch (err) { toast(err.message); }
  };
  const rst = async () => {
    if (await confirm('Erase all data?', 'Your account and every task, list item, journal entry and file will be removed.', 'Erase everything')) {
      try { await ok(supabase.functions.invoke('delete-account')); logout(); } catch (err) { toast(err.message); }
    }
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">Data &amp; Backup</h3>
      <div className="flex gap-2.5 flex-wrap"><Btn v="ghost" onClick={exp}>Export backup</Btn><Btn v="danger" onClick={rst}>Reset all data</Btn></div>
    </Card>
  );
}
