import { Link } from 'react-router-dom';
import { patch, useApi } from '../api.js';
import { useMe } from '../me.js';
import { Card, Check, Empty, GRID, GRID2, Icon, ROW, STAT_BOX, Stat } from '../ui.jsx';

export default function Dashboard() {
  const { user } = useMe();
  const [s, loadS] = useApi('/me/stats');
  const [todos, load] = useApi('/items?kind=todo');
  if (!s || !todos) return null;
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const od = todos.filter(t => !t.done);
  const stats = [
    ['todo', 'Open to-dos', s.open_todos, '/todo/list'],
    ['check', 'Active tasks', s.active_tasks, '/todo/task'],
    ['book', 'Journal entries', s.journal, '/journal'],
    ['save', 'Saved items', s.files, '/save'],
  ];
  return (
    <>
      <div className="grad text-white rounded-[22px] p-6 shadow-xl shadow-violet-600/25">
        <p className="opacity-85">{g}{user.name && ', ' + user.name.split(' ')[0]}</p>
        <h1 className="text-[26px] font-bold my-1">Welcome to MyThings</h1>
        <span className="opacity-85">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className={GRID}>
        {stats.map(([i, l, n, to]) => (
          <Link key={to} to={to} className={`${STAT_BOX} hover:shadow-lg hover:shadow-violet-600/15`}><Stat icon={i} n={n} label={l} /></Link>
        ))}
      </div>
      <div className={GRID2}>
        <Card>
          <h3 className="font-bold mb-1.5">Up next</h3>
          {od.slice(0, 5).map(t => (
            <div key={t.id} className={ROW}>
              <Check on={false} onClick={() => patch('/items/' + t.id, { done: true }).then(() => { load(); loadS(); })} />
              <span className="flex-1">{t.title}</span>
            </div>
          ))}
          {!od.length && <Empty t="All caught up." />}
        </Card>
        <Card>
          <h3 className="font-bold mb-1.5">Journal</h3>
          <div className={ROW}>
            <div className="w-11 h-11 rounded-xl bg-soft text-purple-600 grid place-items-center"><Icon n="lock" /></div>
            <div className="flex-1"><b>Locked</b><div className="text-muted text-sm">{s.journal} entries</div></div>
          </div>
        </Card>
      </div>
    </>
  );
}
