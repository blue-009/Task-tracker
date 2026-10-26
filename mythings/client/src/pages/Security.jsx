import { useState } from 'react';
import { ago, del, fmt, get, logout, post, saveBlob, useApi } from '../api.js';
import { useMe } from '../me.js';
import { Badge, Btn, Card, Switch, inp, useUI } from '../ui.jsx';

const form = e => Object.fromEntries(new FormData(e.target));

export function PasswordCard() {
  const { toast } = useUI();
  const submit = async e => {
    e.preventDefault();
    const f = e.target, v = form(e);
    if (v.next.length < 8) return toast('Use at least 8 characters.');
    if (v.next !== v.confirm) return toast('Passwords do not match.');
    try { await post('/me/password', v); f.reset(); toast('Password saved.'); } catch (err) { toast(err.message); }
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

  const toggle = async () => {
    if (user.otp) { await del('/me/otp'); reload(); }
    else setSecret((await post('/me/otp/start')).secret);
  };
  const confirm = async e => {
    e.preventDefault();
    try { await post('/me/otp/confirm', { code: form(e).code }); setSecret(null); await reload(); toast('OTP is on.'); }
    catch (err) { toast(err.message); }
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
    try { await post('/me/passkey', v); f.reset(); await reload(); toast('Passkey saved.'); } catch (err) { toast(err.message); }
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
  const [list, load] = useApi('/me/sessions');
  if (!list) return null;
  const status = s => s.current ? 'Active now' : s.revoked ? 'Signed out' : Date.now() - new Date(s.last_active) < 3e5 ? 'Active' : 'Idle';
  return (
    <Card>
      <h3 className="font-bold mb-1.5">Active sessions</h3>
      {list.map(s => (
        <div key={s.id} className="flex items-center gap-3 py-3 border-t border-line flex-wrap">
          <div className="flex-1">
            <b>{s.device} · {s.browser}</b>{s.current && <> <Badge className="bg-emerald-500/10 text-emerald-500">This device</Badge></>}
            <div className="text-muted text-sm">IP: {s.ip}</div>
            <div className="text-muted text-sm">
              Signed in {fmt(s.created_at)}, {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Last active {s.current ? 'just now' : ago(s.last_active)}
            </div>
          </div>
          <Badge className={status(s) === 'Signed out' ? 'bg-soft text-ink' : 'bg-emerald-500/10 text-emerald-500'}>{status(s)}</Badge>
          {!s.current && !s.revoked && <Btn v="ghost" onClick={async () => { await del('/me/sessions/' + s.id); load(); }}>Sign out</Btn>}
        </div>
      ))}
    </Card>
  );
}

export function BackupCard() {
  const { confirm } = useUI();
  const exp = async () => saveBlob('mythings-backup.json', new Blob([JSON.stringify(await get('/me/export'), null, 1)], { type: 'application/json' }));
  const rst = async () => {
    if (await confirm('Erase all data?', 'Your account and every task, list item, journal entry and file will be removed.', 'Erase everything')) {
      await del('/me'); logout();
    }
  };
  return (
    <Card className="grid gap-3">
      <h3 className="font-bold">Data &amp; Backup</h3>
      <div className="flex gap-2.5 flex-wrap"><Btn v="ghost" onClick={exp}>Export backup</Btn><Btn v="danger" onClick={rst}>Reset all data</Btn></div>
    </Card>
  );
}
