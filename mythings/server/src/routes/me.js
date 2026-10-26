import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { q } from '../db.js';

const r = Router();
authenticator.options = { window: 1 };
const K = ['name', 'phone', 'loc', 'bio', 'theme', 'size', 'def_vis', 'mask'];
const bad = (res, c, error) => res.status(c).json({ error });

r.get('/', async (req, res) => {
  const [u] = await q(`select id,email,name,phone,loc,bio,theme,size,def_vis,mask,
    otp_secret is not null as otp, pk_hash is not null as has_pk from users where id=$1`, [req.uid]);
  res.json(u);
});

r.patch('/', async (req, res) => {
  const k = K.filter(x => x in req.body);
  if (k.length)
    await q(`update users set ${k.map((x, i) => `${x}=$${i + 2}`).join(',')} where id=$1`,
      [req.uid, ...k.map(x => req.body[x])]);
  res.json({ ok: true });
});

r.get('/stats', async (req, res) => {
  const [s] = await q(`select
    count(*) filter (where kind='todo' and not done)::int as open_todos,
    count(*) filter (where kind='task' and status<>'done')::int as active_tasks,
    count(*)::int as total from items where user_id=$1`, [req.uid]);
  const [j] = await q('select count(*)::int n from journal where user_id=$1', [req.uid]);
  const [f] = await q('select count(*)::int n from files where user_id=$1', [req.uid]);
  res.json({ ...s, journal: j.n, files: f.n });
});

r.post('/password', async (req, res) => {
  const { current = '', next = '' } = req.body;
  const [u] = await q('select pw_hash from users where id=$1', [req.uid]);
  if (!(await bcrypt.compare(current, u.pw_hash))) return bad(res, 403, 'Current password is wrong.');
  if (next.length < 8) return bad(res, 400, 'Use at least 8 characters.');
  await q('update users set pw_hash=$2 where id=$1', [req.uid, await bcrypt.hash(next, 12)]);
  res.json({ ok: true });
});

r.post('/passkey', async (req, res) => {
  const { current = '', next = '' } = req.body;
  const [u] = await q('select pk_hash from users where id=$1', [req.uid]);
  if (u.pk_hash && !(await bcrypt.compare(current, u.pk_hash))) return bad(res, 403, 'Current passkey is wrong.');
  if (next.length < 4) return bad(res, 400, 'Use at least 4 characters.');
  await q('update users set pk_hash=$2 where id=$1', [req.uid, await bcrypt.hash(next, 12)]);
  res.json({ ok: true });
});

r.post('/otp/start', async (req, res) => {
  const secret = authenticator.generateSecret();
  await q('update users set otp_pending=$2 where id=$1', [req.uid, secret]);
  res.json({ secret });
});

r.post('/otp/confirm', async (req, res) => {
  const [u] = await q('select otp_pending from users where id=$1', [req.uid]);
  if (!u.otp_pending || !authenticator.check(String(req.body.code || '').trim(), u.otp_pending))
    return bad(res, 400, 'That code did not match.');
  await q('update users set otp_secret=otp_pending, otp_pending=null where id=$1', [req.uid]);
  res.json({ ok: true });
});

r.delete('/otp', async (req, res) => {
  await q('update users set otp_secret=null, otp_pending=null where id=$1', [req.uid]);
  res.json({ ok: true });
});

r.get('/sessions', async (req, res) => res.json(await q(
  `select id,device,browser,ip,created_at,last_active,revoked,(id=$2) as current
   from sessions where user_id=$1 order by created_at desc limit 8`, [req.uid, req.sid])));

r.delete('/sessions/:id', async (req, res) => {
  await q('update sessions set revoked=true where id=$1 and user_id=$2', [req.params.id, req.uid]);
  res.json({ ok: true });
});

r.post('/logout', async (req, res) => {
  await q('update sessions set revoked=true where id=$1', [req.sid]);
  res.json({ ok: true });
});

r.get('/export', async (req, res) => {
  const [profile] = await q('select email,name,phone,loc,bio,theme,size,def_vis,mask from users where id=$1', [req.uid]);
  res.json({
    profile,
    items: await q('select id,kind,title,priority,status,done,created_at from items where user_id=$1', [req.uid]),
    subitems: await q('select item_id,title,done from subitems where user_id=$1', [req.uid]),
    files: await q(`select name,size,type,visibility,encode(data,'base64') as data,created_at
      from files where user_id=$1`, [req.uid]),
  });
});

r.delete('/', async (req, res) => {
  await q('delete from users where id=$1', [req.uid]);
  res.json({ ok: true });
});

export default r;
