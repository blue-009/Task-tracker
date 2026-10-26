import { Router } from 'express';
import { q } from '../db.js';

const r = Router();

r.get('/', async (req, res) => res.json(await q(
  'select id,name,size,type,visibility,created_at from files where user_id=$1 order by created_at desc', [req.uid])));

r.post('/', async (req, res) => {
  const { name, type = 'file', visibility = 'private', data = '' } = req.body;
  const buf = Buffer.from(data, 'base64');
  if (!name) return res.status(400).json({ error: 'Missing name.' });
  if (buf.length > 1.5e6) return res.status(413).json({ error: name + ' is over 1.5 MB.' });
  await q('insert into files(user_id,name,size,type,visibility,data) values($1,$2,$3,$4,$5,$6)',
    [req.uid, name.slice(0, 200), buf.length, type, visibility, buf]);
  res.json({ ok: true });
});

r.post('/private-all', async (req, res) => {
  await q("update files set visibility='private' where user_id=$1", [req.uid]);
  res.json({ ok: true });
});

r.get('/:id/data', async (req, res) => {
  const [f] = await q("select name,type,encode(data,'base64') as data from files where id=$1 and user_id=$2",
    [req.params.id, req.uid]);
  f ? res.json(f) : res.sendStatus(404);
});

r.patch('/:id', async (req, res) => {
  await q('update files set visibility=$3 where id=$1 and user_id=$2', [req.params.id, req.uid, req.body.visibility]);
  res.json({ ok: true });
});

r.delete('/:id', async (req, res) => {
  await q('delete from files where id=$1 and user_id=$2', [req.params.id, req.uid]);
  res.json({ ok: true });
});

export default r;
