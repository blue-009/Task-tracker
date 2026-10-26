import { useNavigate } from 'react-router-dom';
import { del, patch, post, useApi } from '../api.js';
import { Badge, Btn, Card, Empty, Icon, IconBtn, PB, PR, PageHead, inp, useUI } from '../ui.jsx';

const ST = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']];

export default function Tasks() {
  const nav = useNavigate();
  const { confirm } = useUI();
  const [items, load] = useApi('/items?kind=task');
  if (!items) return null;

  const add = async e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    await post('/items', { kind: 'task', titles: [v.title], priority: v.priority });
    e.target.reset(); load();
  };
  const mv = async (t, d) => {
    const n = ST.findIndex(s => s[0] === t.status) + d;
    if (ST[n]) { await patch('/items/' + t.id, { status: ST[n][0] }); load(); }
  };
  const rm = async t => {
    if (await confirm('Delete this task?', 'The task and all its items will be removed.')) { await del('/items/' + t.id); load(); }
  };

  return (
    <>
      <PageHead t="Tasks" />
      <Card>
        <form onSubmit={add} className="flex gap-2.5">
          <input className={inp} name="title" placeholder="Task title" required maxLength={120} />
          <select className={inp + ' !w-auto'} name="priority" defaultValue="med">
            <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
          </select>
          <Btn>Add</Btn>
        </form>
      </Card>
      <div className="grid md:grid-cols-3 gap-3.5 items-start">
        {ST.map(([k, l], ix) => {
          const L = items.filter(t => t.status === k);
          return (
            <div key={k} className="bg-soft rounded-2xl p-3.5 grid gap-2.5">
              <h3 className="font-bold flex justify-between items-center">{l} <Badge className="bg-card text-ink">{L.length}</Badge></h3>
              {L.map(t => (
                <div key={t.id} onClick={() => nav('/todo/task/' + t.id)}
                  className={`bg-card rounded-[14px] p-3 border-l-4 cursor-pointer hover:shadow-lg hover:shadow-violet-600/15 ${PB[t.priority]}`}>
                  <div className="font-bold text-[17px] leading-tight break-words">{t.title}</div>
                  <div className="flex items-center gap-0.5 mt-2" onClick={e => e.stopPropagation()}>
                    <Badge>{PR[t.priority]}</Badge><span className="flex-1" />
                    {ix > 0 && <IconBtn onClick={() => mv(t, -1)} aria-label="Move back">‹</IconBtn>}
                    {ix < 2 && <IconBtn onClick={() => mv(t, 1)} aria-label="Move forward">›</IconBtn>}
                    <IconBtn onClick={() => rm(t)} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
                  </div>
                </div>
              ))}
              {!L.length && <Empty t="Empty" />}
            </div>
          );
        })}
      </div>
    </>
  );
}
