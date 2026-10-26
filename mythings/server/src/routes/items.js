import { Router } from 'express';
import { q } from '../db.js';

const r = Router();
const clean = a => (a || []).map(t => String(t).trim().slice(0, 120)).filter(Boolean);

r.get('/', async (req, res) => res.json(await q(
  `select id,kind,title,priority,status,done from items
   where user_id=$1 and kind=$2 order by created_at desc`, [req.uid, req.query.kind])));

r.post('/', async (req, res) => {
  const { kind, priority = 'med' } = req.body, L = clean(req.body.titles);
  if (!['todo', 'task'].includes(kind) || !L.length) return res.status(400).json({ error: 'Write at least one item.' });
  for (const t of [...L].reverse())
    await q('insert into items(user_id,kind,title,priority) values($1,$2,$3,$4)', [req.uid, kind, t, priority]);
  res.json({ ok: true });
});

r.delete('/', async (req, res) => {
  await q("delete from items where user_id=$1 and kind='todo' and done", [req.uid]);
  res.json({ ok: true });
});

r.patch('/subs/:sid', async (req, res) => {
  await q('update subitems set done=$3 where id=$1 and user_id=$2', [req.params.sid, req.uid, !!req.body.done]);
  res.json({ ok: true });
});

r.delete('/subs/:sid', async (req, res) => {
  await q('delete from subitems where id=$1 and user_id=$2', [req.params.sid, req.uid]);
  res.json({ ok: true });
});

r.get('/:id', async (req, res) => {
  const [t] = await q('select id,kind,title,priority,status,done from items where id=$1 and user_id=$2', [req.params.id, req.uid]);
  if (!t) return res.sendStatus(404);
  const subs = await q('select id,title,done from subitems where item_id=$1 order by created_at', [t.id]);
  res.json({ ...t, subs });
});

r.patch('/:id', async (req, res) => {
  const { done, status, priority } = req.body;
  const [x] = await q(`update items set done=coalesce($3,done), status=coalesce($4,status),
    priority=coalesce($5,priority) where id=$1 and user_id=$2 returning id`,
    [req.params.id, req.uid, done ?? null, status ?? null, priority ?? null]);
  x ? res.json(x) : res.sendStatus(404);
});

r.delete('/:id', async (req, res) => {
  await q('delete from items where id=$1 and user_id=$2', [req.params.id, req.uid]);
  res.json({ ok: true });
});

r.post('/:id/subs', async (req, res) => {
  const [t] = await q('select id from items where id=$1 and user_id=$2', [req.params.id, req.uid]);
  if (!t) return res.sendStatus(404);
  for (const s of clean(req.body.titles))
    await q('insert into subitems(item_id,user_id,title) values($1,$2,$3)', [t.id, req.uid, s]);
  res.json({ ok: true });
});

export default r;
