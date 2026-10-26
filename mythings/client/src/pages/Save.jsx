import { useEffect, useState } from 'react';
import { fmt, saveBlob, sz, useQ } from '../api.js';
import { supabase, ok } from '../supabase.js';
import { useMe } from '../me.js';
import { Badge, Btn, Card, Empty, GRID2, Icon, IconBtn, PageHead, ROW, Seg, inp, useUI } from '../ui.jsx';

function Thumb({ f }) {
  const [u, setU] = useState();
  useEffect(() => { supabase.storage.from('files').createSignedUrl(f.path, 300).then(r => setU(r.data?.signedUrl)).catch(() => {}); }, [f.path]);
  return u ? <img src={u} alt="" className="w-full h-full object-cover" /> : null;
}

export default function Save() {
  const { user } = useMe();
  const { toast, confirm } = useUI();
  const [files, load] = useQ(() => supabase.from('files').select('id,name,size,type,visibility,path,created_at').order('created_at', { ascending: false }));
  const [f, setF] = useState('all');
  const [vis, setVis] = useState(user.def_vis);
  if (!files) return null;
  const saveFile = async (blob, name, type) => {
    const path = `${user.id}/${crypto.randomUUID()}`;
    await ok(supabase.storage.from('files').upload(path, blob, { contentType: type === 'file' ? 'application/octet-stream' : type }));
    try {
      await ok(supabase.from('files').insert({ name: name.slice(0, 200), size: blob.size, type, visibility: vis, path }));
    } catch (e) { await supabase.storage.from('files').remove([path]); throw e; }
  };
  const L = files.filter(x => f === 'all' || x.visibility === f);

  const upload = async e => {
    for (const file of e.target.files) {
      if (file.size > 1.5e6) { toast(file.name + ' is over 1.5 MB.'); continue; }
      try { await saveFile(file, file.name, file.type || 'file'); }
      catch (err) { toast(err.message); }
    }
    e.target.value = ''; load();
  };
  const note = async e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    try {
      await saveFile(new Blob([v.body.trim()], { type: 'text/plain' }), v.title.trim() + '.txt', 'text/plain');
      e.target.reset(); load();
    } catch (err) { toast(err.message); }
  };
  const dl = async x => { try { saveBlob(x.name, await ok(supabase.storage.from('files').download(x.path))); } catch (err) { toast(err.message); } };
  const rm = async x => { if (await confirm('Delete this file?', 'This cannot be undone.')) { await supabase.storage.from('files').remove([x.path]); await ok(supabase.from('files').delete().eq('id', x.id)); load(); } };

  return (
    <>
      <PageHead t="Save" />
      <Card className="grid gap-3">
        <div className={GRID2}>
          <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-purple-500/50 rounded-2xl p-5 cursor-pointer text-center text-purple-600 hover:bg-soft">
            <Icon n="save" className="w-7 h-7" /><b>Upload files</b>
            <span className="text-muted text-sm">Up to 1.5 MB each</span>
            <input type="file" multiple hidden onChange={upload} />
          </label>
          <form onSubmit={note} className="grid gap-3">
            <input className={inp} name="title" placeholder="Note title" required maxLength={60} />
            <textarea className={inp} name="body" rows={2} placeholder="Write a note to save" required />
            <div><Btn>Save note</Btn></div>
          </form>
        </div>
        <label className="flex items-center gap-3 text-muted">New items are
          <select className={inp + ' !w-auto'} value={vis} onChange={e => setVis(e.target.value)}>
            <option value="private">Private</option><option value="public">Public</option>
          </select>
        </label>
      </Card>
      <Seg value={f} onChange={setF} options={[['all', 'All'], ['public', 'Public'], ['private', 'Private']]} />
      <Card>
        {L.map(x => {
          const hid = x.visibility === 'private' && user.mask;
          return (
            <div key={x.id} className={ROW}>
              <div className="w-11 h-11 rounded-xl bg-soft text-purple-600 grid place-items-center text-[11px] font-bold overflow-hidden shrink-0">
                {hid ? <Icon n="lock" /> : x.type.startsWith('image/') ? <Thumb f={x} /> : (x.name.split('.').pop() || '').slice(0, 4).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate"><b>{hid ? 'Hidden private file' : x.name}</b></div>
                <div className="text-muted text-sm">{sz(x.size)} · {fmt(x.created_at)}</div>
              </div>
              <Badge className={x.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}>
                {x.visibility === 'public' ? 'Public' : 'Private'}
              </Badge>
              {!hid && <IconBtn onClick={() => dl(x)} aria-label="Download"><Icon n="down" className="w-[18px] h-[18px]" /></IconBtn>}
              <IconBtn onClick={() => rm(x)} aria-label="Delete"><Icon n="trash" className="w-[18px] h-[18px]" /></IconBtn>
            </div>
          );
        })}
        {!L.length && <Empty t="No saved items yet." />}
      </Card>
    </>
  );
}
