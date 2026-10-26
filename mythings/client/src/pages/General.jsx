import { supabase, ok } from '../supabase.js';
import { useMe } from '../me.js';
import { Btn, Card, GRID2, PageHead, Seg, inp, useUI } from '../ui.jsx';

const F = ({ l, ...p }) => <label className="flex flex-col gap-1.5 text-muted">{l}<input className={inp} {...p} /></label>;

export default function General() {
  const { user, setUser, reload } = useMe();
  const { toast } = useUI();

  const save = async e => {
    e.preventDefault();
    const { email, ...v } = Object.fromEntries(new FormData(e.target));
    try { await ok(supabase.from('profiles').update(v).eq('id', user.id)); await reload(); toast('Profile saved.'); }
    catch (err) { toast(err.message); }
  };
  const set = (k, v) => { setUser(u => ({ ...u, [k]: v })); ok(supabase.from('profiles').update({ [k]: v }).eq('id', user.id)).catch(() => {}); };

  return (
    <>
      <PageHead t="General Settings" />
      <Card className="grid gap-3">
        <h3 className="font-bold">Profile</h3>
        <div className="flex items-center gap-3.5">
          <div className="grad w-14 h-14 rounded-full grid place-items-center text-white text-[22px] font-bold">{(user.name || '?').trim().charAt(0).toUpperCase()}</div>
          <div><b>{user.name || 'Your name'}</b><div className="text-muted text-sm">{user.email}</div></div>
        </div>
        <form key={user.name + user.phone + user.loc + user.bio} onSubmit={save} className="grid gap-3">
          <div className={GRID2}>
            <F l="Full name" name="name" defaultValue={user.name} maxLength={60} />
            <F l="Email" name="email" type="email" defaultValue={user.email} readOnly />
            <F l="Phone" name="phone" type="tel" defaultValue={user.phone} maxLength={30} />
            <F l="Location" name="loc" defaultValue={user.loc} maxLength={60} />
          </div>
          <label className="flex flex-col gap-1.5 text-muted">About me
            <textarea className={inp} name="bio" rows={3} maxLength={300} defaultValue={user.bio} />
          </label>
          <div><Btn>Save profile</Btn></div>
        </form>
      </Card>
      <Card className="grid gap-3">
        <h3 className="font-bold">Appearance</h3>
        <div><p className="text-muted mb-1.5">Theme</p>
          <Seg value={user.theme} onChange={v => set('theme', v)} options={[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']]} /></div>
        <div><p className="text-muted mb-1.5">Text size</p>
          <Seg value={user.size} onChange={v => set('size', v)} options={[['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']]} /></div>
      </Card>
    </>
  );
}
