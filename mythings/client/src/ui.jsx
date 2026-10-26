import { createContext, useCallback, useContext, useRef, useState } from 'react';

const UI = createContext();
export const useUI = () => useContext(UI);

const I = {
  dash: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
  todo: '<path d="M9 6h12M9 12h12M9 18h12M3 6l1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 8h7"/>',
  save: '<path d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7"/>',
  gear: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h0"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  down: '<path d="M12 4v11m-4-4 4 4 4-4M5 20h14"/>',
  out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};

export const Icon = ({ n, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={'shrink-0 ' + (className || 'w-[19px] h-[19px]')}
    dangerouslySetInnerHTML={{ __html: I[n] }} />
);

export const inp = 'w-full bg-bg border border-line rounded-xl px-3 py-2.5 focus:outline-2 focus:outline-purple-500 focus:outline-offset-1';
export const ROW = 'flex items-center gap-3 py-3 px-1 border-b border-line last:border-0';
export const PB = { high: 'border-l-red-500', med: 'border-l-amber-500', low: 'border-l-emerald-500' };
export const PR = { high: 'High', med: 'Medium', low: 'Low' };

export const Logo = ({ big }) => (
  <div className={`grad grid place-items-center text-white font-extrabold shadow-lg shadow-purple-500/40 ${big ? 'w-[72px] h-[72px] text-[32px] rounded-[22px]' : 'w-10 h-10 rounded-xl'}`}>M</div>
);

export const Card = ({ className = '', ...p }) => (
  <div {...p} className={`bg-card border border-line rounded-2xl p-[18px] ${className}`} />
);

const V = { p: 'grad text-white hover:brightness-110', ghost: 'bg-soft text-ink', danger: 'bg-red-500 text-white' };
export const Btn = ({ v = 'p', className = '', ...p }) => (
  <button {...p} className={`rounded-xl px-[18px] py-2.5 font-semibold whitespace-nowrap cursor-pointer ${V[v]} ${className}`} />
);

export const IconBtn = ({ className = '', ...p }) => (
  <button {...p} className={`w-[34px] h-[34px] rounded-[10px] grid place-items-center text-muted hover:bg-soft hover:text-ink cursor-pointer shrink-0 text-[22px] ${className}`} />
);

export const Badge = ({ children, className = 'bg-soft text-ink' }) => (
  <span className={`text-xs font-semibold px-2.5 py-[3px] rounded-full ${className}`}>{children}</span>
);

export const Seg = ({ value, onChange, options }) => (
  <div className="inline-flex bg-soft p-1 rounded-xl gap-0.5">
    {options.map(([k, l]) => (
      <button key={k} type="button" onClick={() => onChange(k)}
        className={`px-3.5 py-[7px] rounded-[9px] font-semibold cursor-pointer ${value === k ? 'bg-card text-ink shadow' : 'text-muted'}`}>{l}</button>
    ))}
  </div>
);

export const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange}
    className={`relative w-[46px] h-[26px] rounded-full shrink-0 cursor-pointer transition ${on ? 'grad' : 'bg-line'}`}>
    <i className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
  </button>
);

export const Check = ({ on, onClick }) => (
  <button type="button" onClick={e => { e.stopPropagation(); onClick(); }}
    className={`w-6 h-6 rounded-lg border-2 shrink-0 grid place-items-center text-white text-sm cursor-pointer ${on ? 'grad border-transparent' : 'border-line'}`}>{on ? '✓' : ''}</button>
);

export const PageHead = ({ t }) => <h1 className="text-[26px] font-bold tracking-tight">{t}</h1>;
export const Empty = ({ t }) => <p className="text-muted text-center py-[18px]">{t}</p>;

export const Stat = ({ icon, n, label }) => (
  <>
    {icon && <i className="grad text-white w-[38px] h-[38px] rounded-xl grid place-items-center mb-2"><Icon n={icon} /></i>}
    <b className="text-[30px] leading-[1.1]">{n}</b>
    <span className="text-muted text-[13px]">{label}</span>
  </>
);
export const STAT_BOX = 'bg-card border border-line rounded-2xl p-[18px] flex flex-col text-left';
export const GRID = 'grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]';
export const GRID2 = 'grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]';

export function UIProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [dlg, setDlg] = useState(null);
  const tm = useRef();
  const toast = useCallback(m => { setMsg(m); clearTimeout(tm.current); tm.current = setTimeout(() => setMsg(''), 2800); }, []);
  const confirm = useCallback((title, text, label = 'Delete') => new Promise(res => setDlg({ title, text, label, res })), []);
  const close = v => { dlg.res(v); setDlg(null); };
  return (
    <UI.Provider value={{ toast, confirm }}>
      {children}
      {dlg && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-5" onKeyDown={e => e.key === 'Escape' && close(false)}>
          <Card className="w-full max-w-sm text-center grid gap-3" role="dialog" aria-modal="true">
            <h3 className="font-bold">{dlg.title}</h3>
            {dlg.text && <p className="text-muted text-sm">{dlg.text}</p>}
            <div className="flex gap-2.5 justify-center">
              <Btn v="ghost" onClick={() => close(false)}>Cancel</Btn>
              <Btn v="danger" onClick={() => close(true)}>{dlg.label}</Btn>
            </div>
          </Card>
        </div>
      )}
      <div role="status" className={`fixed left-1/2 -translate-x-1/2 bottom-6 bg-violet-950 text-white px-4 py-2.5 rounded-xl z-[60] max-w-[90vw] transition ${msg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{msg}</div>
    </UI.Provider>
  );
}
