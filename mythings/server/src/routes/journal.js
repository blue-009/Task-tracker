import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { q } from '../db.js';

const r = Router();

r.get('/', async (req, res) => res.json(await q(
  'select id,created_at from journal where user_id=$1 order by created_at desc', [req.uid])));

r.post('/', async (req, res) => {
  const { title = '', mood = '', body = '' } = req.body;
  if (!title.trim() || !body.trim()) return res.status(400).json({ error: 'Fill in all fields.' });
  await q('insert into journal(user_id,title,mood,body) values($1,$2,$3,$4)',
    [req.uid, title.trim().slice(0, 80), mood, body.trim()]);
  res.json({ ok: true });
});

r.post('/:id/unlock', async (req, res) => {
  const [u] = await q('select pk_hash from users where id=$1', [req.uid]);
  if (!u.pk_hash || !(await bcrypt.compare(req.body.key || '', u.pk_hash)))
    return res.status(403).json({ error: 'Wrong passkey.' });
  const [j] = await q('select id,title,mood,body,created_at from journal where id=$1 and user_id=$2',
    [req.params.id, req.uid]);
  j ? res.json(j) : res.sendStatus(404);
});

r.delete('/:id', async (req, res) => {
  await q('delete from journal where id=$1 and user_id=$2', [req.params.id, req.uid]);
  res.json({ ok: true });
});

export default r;
