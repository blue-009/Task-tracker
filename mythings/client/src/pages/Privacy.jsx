import { patch, post, useApi } from '../api.js';
import { useMe } from '../me.js';
import { Btn, Card, Empty, GRID, PageHead, ROW, STAT_BOX, Seg, Stat, Switch } from '../ui.jsx';
import { BackupCard, OtpCard, PasskeyCard, PasswordCard, SessionsCard } from './Security.jsx';

export default function Privacy() {
  const { user, setUser } = useMe();
  const [files, load] = useApi('/files');
  if (!files) return null;
  const pv = files.filter(x => x.visibility === 'private').length;
  const set = (k, v) => { setUser(u => ({ ...u, [k]: v })); patch('/me', { [k]: v }); };

  return (
    <>
      <PageHead t="Privacy" />
      <div className={GRID}>
        <div className={STAT_BOX}><Stat n={files.length - pv} label="Public files" /></div>
        <div className={STAT_BOX}><Stat n={pv} label="Private files" /></div>
      </div>
      <Card>
        <h3 className="font-bold mb-2.5">New files are</h3>
        <Seg value={user.def_vis} onChange={v => set('def_vis', v)} options={[['private', 'Private'], ['public', 'Public']]} />
        <div className={ROW + ' mt-2'}>
          <div className="flex-1"><b>Hide private file names</b></div>
          <Switch on={user.mask} onChange={() => set('mask', !user.mask)} label="Hide private file names" />
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center gap-2.5 mb-1.5">
          <h3 className="font-bold">Your files</h3>
          <Btn v="ghost" onClick={async () => { await post('/files/private-all'); load(); }}>Make all private</Btn>
        </div>
        {files.map(x => (
          <div key={x.id} className={ROW}>
            <div className="flex-1 min-w-0 truncate"><b>{x.name}</b></div>
            <span className="text-muted text-sm">{x.visibility === 'private' ? 'Private' : 'Public'}</span>
            <Switch on={x.visibility === 'private'} label="Private"
              onChange={() => patch('/files/' + x.id, { visibility: x.visibility === 'private' ? 'public' : 'private' }).then(load)} />
          </div>
        ))}
        {!files.length && <Empty t="No files to manage yet." />}
      </Card>
      <PasswordCard /><OtpCard /><PasskeyCard /><SessionsCard /><BackupCard />
    </>
  );
}
