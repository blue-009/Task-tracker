import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Icon, IconBtn, Logo } from '../ui.jsx';
import { useMe } from '../me.js';
import { logout } from '../api.js';
import Dashboard from '../pages/Dashboard.jsx';
import TodoList from '../pages/TodoList.jsx';
import Tasks from '../pages/Tasks.jsx';
import TaskDetail from '../pages/TaskDetail.jsx';
import Journal from '../pages/Journal.jsx';
import Save from '../pages/Save.jsx';
import General from '../pages/General.jsx';
import Privacy from '../pages/Privacy.jsx';
import About from '../pages/About.jsx';

const NAV = [
  { to: '/', l: 'Dashboard', i: 'dash' },
  { h: 'Modules' },
  { id: 'todo', l: 'To-Do', i: 'todo', c: [['/todo/list', 'List'], ['/todo/task', 'Task']] },
  { to: '/journal', l: 'Journal', i: 'book' },
  { to: '/save', l: 'Save', i: 'save' },
  { h: 'System' },
  { id: 'settings', l: 'Settings', i: 'gear', c: [['/settings/general', 'General Settings'], ['/settings/privacy', 'Privacy']] },
  { to: '/about', l: 'About', i: 'info' },
];

const lk = a => `flex items-center gap-3 w-full rounded-xl text-left font-medium transition cursor-pointer ${a ? 'grad text-white shadow-lg shadow-violet-600/40' : 'text-violet-200 hover:bg-white/10 hover:text-white'}`;

export default function Shell() {
  const { user } = useMe();
  const { pathname } = useLocation();
  const [side, setSide] = useState(false);
  const [open, setOpen] = useState({ todo: true, settings: true });
  useEffect(() => { setSide(false); scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex min-h-dvh">
      <aside className={`fixed md:sticky top-0 left-0 h-dvh w-[270px] shrink-0 z-40 flex flex-col px-3.5 py-[22px] bg-gradient-to-b from-violet-950 to-[#1a0b3b] overflow-y-auto transition-transform ${side ? '' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-2 text-white text-xl font-bold"><Logo />MyThings</div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((n, i) =>
            n.h ? <p key={i} className="text-[11px] tracking-[.12em] uppercase text-violet-400 font-bold px-3 mt-[22px] mb-1.5">{n.h}</p>
            : n.c ? (
              <div key={n.id}>
                <button onClick={() => setOpen(o => ({ ...o, [n.id]: !o[n.id] }))} className={`${lk(false)} px-3 py-[11px]`}>
                  <Icon n={n.i} /><span className="flex-1">{n.l}</span>
                  <Icon n="chev" className={`w-4 h-4 transition ${open[n.id] ? 'rotate-180' : ''}`} />
                </button>
                {open[n.id] && (
                  <div className="ml-[22px] pl-2.5 border-l border-white/15 mt-1 flex flex-col gap-1">
                    {n.c.map(([to, l]) => (
                      <NavLink key={to} to={to} className={({ isActive }) => `${lk(isActive)} px-3 py-2 text-sm`}>{l}</NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `${lk(isActive)} px-3 py-[11px]`}>
                <Icon n={n.i} /><span>{n.l}</span>
              </NavLink>
            ))}
        </nav>
        <div className="flex items-center gap-2.5 pt-3 mt-3 border-t border-white/10 text-white">
          <div className="grad w-9 h-9 rounded-full grid place-items-center font-bold shrink-0">{(user.name || '?').trim().charAt(0).toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <b className="block truncate">{user.name || 'Your name'}</b>
            <small className="block truncate text-violet-400">{user.email}</small>
          </div>
          <IconBtn onClick={logout} aria-label="Sign out" className="!text-violet-200 hover:!bg-white/10 hover:!text-white"><Icon n="out" /></IconBtn>
        </div>
      </aside>
      {side && <div className="fixed inset-0 bg-black/50 z-[35] md:hidden" onClick={() => setSide(false)} />}

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5 bg-card border-b border-line font-bold">
          <IconBtn onClick={() => setSide(true)} aria-label="Open menu"><Icon n="menu" /></IconBtn>
          <div className="grad w-[34px] h-[34px] rounded-[10px] grid place-items-center text-white">M</div>MyThings
        </header>
        <main className="max-w-[1000px] mx-auto px-4 md:px-6 pt-5 md:pt-[30px] pb-16 flex flex-col gap-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todo/list" element={<TodoList />} />
            <Route path="/todo/list/:id" element={<TaskDetail />} />
            <Route path="/todo/task" element={<Tasks />} />
            <Route path="/todo/task/:id" element={<TaskDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/save" element={<Save />} />
            <Route path="/settings/general" element={<General />} />
            <Route path="/settings/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
