import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { del, lines, patch, post, useApi } from '../api.js';
import { Badge, Btn, Card, Check, Icon, IconBtn, PB, PR, inp, useUI } from '../ui.jsx';

const SL = { todo: 'To do', doing: 'In progress', done: 'Done' };

export default function TaskDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { confirm } = useUI();
  const [t, load] = useApi('/items/' + id);
  const [adding, setAdding] = useState(false);
  if (!t) return null;

  const dn = t.subs.filter(s => s.done).length;
  const pc = t.subs.length ? Math.round((dn / t.subs.length) * 100) : 0;
  const status = t.kind === 'task' ? SL[t.status] : t.done ? 'Done' : 'To do';

  const submit = async e => {
    e.preventDefault();
    const titles = lines(e.target.elements.t.value);
    if (titles.length) { await post(`/items/${id}/subs`, { titles }); e.target.reset(); load(); }
  };
  const rm = async s => { if (await confirm('Delete this item?', 'This cannot be undone.')) { await del('/items/subs/' + s.id); load(); } };

  return (
    <>
      <div><Btn v="ghost" onClick={() => nav(-1)}>‹ Back</Btn></div>
      <div className={`bg-card rounded-2xl p-[18px] border-l-4 ${PB[t.kind === 'task' ? t.priority : t.done ? 'low' : 'med']}`}>
        <h1 className="text-[26px] font-bold tracking-tight">{t.title}</h1>
        <div className="flex items-center gap-1 mt-2">
          {t.kind === 'task' && <Badge>{PR[t.priority]}</Badge>}<Badge>{status}</Badge>
        </div>
        <div className="h-2 rounded-full bg-soft overflow-hidden mt-3.5 mb-1.5"><i className="block h-full grad transition-all" style={{ width: pc + '%' }} /></div>
        <p className="text-muted text-sm">{dn} of {t.subs.length} done</p>
      </div>
      <Card className="grid gap-3">
        {adding ? (
          <form onSubmit={submit} className="grid gap-3">
            <textarea className={inp} name="t" rows={3} autoFocus required placeholder="Add an item, or paste a list (one per line)"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.form.requestSubmit(); } }} />
            <div className="flex gap-2.5"><Btn>Add</Btn><Btn type="button" v="ghost" onClick={() => setAdding(false)}>Cancel</Btn></div>
          </form>
        ) : <div><Btn onClick={() => setAdding(true)}>+ Add</Btn></div>}
        {t.subs.map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <Check on={s.done} onClick={() => patch('/items/subs/' + s.id, { done: !s.done }).then(load)} />
            <span className={`flex-1 ${s.done ? 'line-through text-muted' : ''}`}>{s.title}</span>
            <IconBtn onClick={() => rm(s)} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
          </div>
        ))}
        {!t.subs.length && <p className="text-muted text-sm">No items yet.</p>}
      </Card>
    </>
  );
}
