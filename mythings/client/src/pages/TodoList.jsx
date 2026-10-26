import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { del, lines, patch, post, useApi } from '../api.js';
import { Btn, Card, Check, Empty, IconBtn, Icon, PB, PageHead, Seg, inp, useUI } from '../ui.jsx';

export default function TodoList() {
  const nav = useNavigate();
  const { toast, confirm } = useUI();
  const [items, load] = useApi('/items?kind=todo');
  const [f, setF] = useState('all');
  const [text, setText] = useState('');
  if (!items) return null;

  const L = items.filter(t => f === 'all' || (f === 'done') === t.done);
  const dn = items.filter(t => t.done).length;
  const pc = items.length ? Math.round((dn / items.length) * 100) : 0;

  const add = async () => {
    const titles = lines(text);
    if (!titles.length) return toast('Write at least one item.');
    await post('/items', { kind: 'todo', titles }); setText(''); load();
  };
  const rm = async t => { if (await confirm('Delete this item?', 'This cannot be undone.')) { await del('/items/' + t.id); load(); } };

  return (
    <>
      <PageHead t="List" />
      <Card className="grid gap-3">
        <textarea className={inp} rows={5} value={text} onChange={e => setText(e.target.value)}
          placeholder={'Buy groceries\nCall the dentist\nFinish the report'} />
        <div className="flex gap-2.5 flex-wrap">
          <Btn onClick={add}>Add items</Btn>
          <Btn v="ghost" onClick={async () => { await del('/items'); load(); }}>Clear done</Btn>
        </div>
      </Card>
      <Card>
        <div className="h-2 rounded-full bg-soft overflow-hidden my-1.5"><i className="block h-full grad transition-all" style={{ width: pc + '%' }} /></div>
        <p className="text-muted text-sm mb-2.5">{dn} of {items.length} done</p>
        <Seg value={f} onChange={setF} options={[['all', 'All'], ['open', 'Active'], ['done', 'Done']]} />
      </Card>
      <div className="grid gap-2.5">
        {L.map(t => (
          <div key={t.id} onClick={() => nav('/todo/list/' + t.id)}
            className={`bg-card rounded-2xl p-3 border-l-4 cursor-pointer hover:shadow-lg hover:shadow-violet-600/15 ${PB[t.done ? 'low' : 'med']}`}>
            <div className="flex items-center gap-3">
              <Check on={t.done} onClick={() => patch('/items/' + t.id, { done: !t.done }).then(load)} />
              <span className={`flex-1 ${t.done ? 'line-through text-muted' : ''}`}>{t.title}</span>
              <IconBtn onClick={e => { e.stopPropagation(); rm(t); }} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
            </div>
          </div>
        ))}
        {!L.length && <Empty t="Nothing here yet." />}
      </div>
    </>
  );
}
