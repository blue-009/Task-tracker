import { useQ } from '../api.js';
import { supabase } from '../supabase.js';
import { Card, GRID, Logo, PageHead, STAT_BOX, Stat } from '../ui.jsx';

export default function About() {
  const [s] = useQ(() => supabase.rpc('my_stats'));
  if (!s) return null;
  return (
    <>
      <PageHead t="About" />
      <Card className="text-center grid justify-items-center gap-1.5 !py-[30px]">
        <Logo big /><h2 className="text-xl font-bold">MyThings</h2>
        <p className="text-muted">Version 1.0</p>
      </Card>
      <div className={GRID}>
        <div className={STAT_BOX}><Stat n={s.total + s.journal + s.files} label="Total items" /></div>
      </div>
    </>
  );
}
