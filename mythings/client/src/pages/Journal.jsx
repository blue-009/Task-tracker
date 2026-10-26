import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, fmt, post, useApi } from '../api.js';
import { useMe } from '../me.js';
import { Btn, Card, Icon, IconBtn, PageHead, inp, useUI } from '../ui.jsx';

const MOOD = ['😊', '😌', '😐', '😢', '😤'];

export default function Journal() {
  const { user } = useMe();
  const { toast, confirm } = useUI();
  const [list, load] = useApi('/journal');
  const [open, setOpen] = useState({});
  const [ask, setAsk] = useState(null);

  useEffect(() => {
    const f = () => { if (document.hidden) { setOpen({}); setAsk(null); } };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  if (!list) return null;

  const create = async e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    try { await post('/journal', v); e.target.reset(); load(); } catch (err) { toast(err.message); }
  };
  const unlock = async (e, id) => {
    e.preventDefault();
    try { const j = await post(`/journal/${id}/unlock`, { key: e.target.elements.k.value }); setOpen(o => ({ ...o, [id]: j })); setAsk(null); }
    catch (err) { toast(err.message); }
  };
  const rm = async id => {
    if (await confirm('Delete this journal entry?', 'This cannot be undone.')) { await del('/journal/' + id); setOpen(({ [id]: _, ...o }) => o); load(); }
  };

  return (
    <>
      <PageHead t="Journal" />
      {!user.has_pk && (
        <Card className="grid gap-3 justify-items-center text-center">
          <p className="text-muted">Set a journal passkey to open your entries.</p>
          <Link to="/settings/privacy"><Btn>Open Privacy</Btn></Link>
        </Card>
      )}
      <Card>
        <form onSubmit={create} className="grid gap-3">
          <input className={inp} name="title" placeholder="Title" required maxLength={80} />
          <div className="flex gap-2">
            {MOOD.map((m, i) => (
              <label key={m}>
                <input type="radio" name="mood" value={m} defaultChecked={!i} className="peer sr-only" />
                <span className="grid place-items-center w-11 h-11 text-[22px] rounded-xl border-2 border-line cursor-pointer peer-checked:bg-soft peer-checked:border-purple-500">{m}</span>
              </label>
            ))}
          </div>
          <textarea className={inp} name="body" rows={4} placeholder="What is on your mind?" required />
          <div><Btn>Save entry</Btn></div>
        </form>
      </Card>
      {list.map(e => {
        const j = open[e.id];
        return j ? (
          <Card key={e.id}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[26px]">{j.mood}</span>
              <div className="flex-1"><b>{j.title}</b><div className="text-muted text-sm">{fmt(j.created_at)}</div></div>
              <Btn v="ghost" onClick={() => setOpen(({ [e.id]: _, ...o }) => o)}>Lock</Btn>
              <IconBtn onClick={() => rm(e.id)} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
            </div>
            <p className="whitespace-pre-wrap break-words">{j.body}</p>
          </Card>
        ) : (
          <Card key={e.id}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-soft text-purple-600 grid place-items-center"><Icon n="lock" /></div>
              <div className="flex-1"><b>Locked entry</b><div className="text-muted text-sm">{fmt(e.created_at)}</div></div>
              {user.has_pk && ask !== e.id && <Btn v="ghost" onClick={() => setAsk(e.id)}>Unlock</Btn>}
              <IconBtn onClick={() => rm(e.id)} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
            </div>
            {ask === e.id && (
              <form onSubmit={ev => unlock(ev, e.id)} className="flex gap-2.5 mt-3">
                <input className={inp} name="k" type="password" placeholder="Passkey" autoComplete="off" required autoFocus />
                <Btn>Unlock</Btn><Btn type="button" v="ghost" onClick={() => setAsk(null)}>Cancel</Btn>
              </form>
            )}
          </Card>
        );
      })}
    </>
  );
}
