import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { q } from '../db.js';
import { sign, verify, device } from '../auth.js';

const r = Router();
authenticator.options = { window: 1 };

async function session(req, uid) {
  const d = device(req.headers['user-agent'] || '');
  const [s] = await q(
    'insert into sessions(user_id,device,browser,ip) values($1,$2,$3,$4) returning id',
    [uid, d.os + ' device', d.br, req.ip]);
  return sign({ uid, sid: s.id });
}

r.post('/signup', async (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  const e = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: 'Enter a valid email.' });
  if (password.length < 8) return res.status(400).json({ error: 'Use at least 8 characters.' });
  if ((await q('select 1 from users where email=$1', [e])).length)
    return res.status(409).json({ error: 'That email already has an account.' });
  const [u] = await q('insert into users(name,email,pw_hash) values($1,$2,$3) returning id',
    [name.trim().slice(0, 60), e, await bcrypt.hash(password, 12)]);
  await q(`insert into items(user_id,kind,title,priority,status) values
    ($1,'task','Explore MyThings','med','todo'),
    ($1,'task','Plan the week','med','todo'),
    ($1,'task','Organize my files','low','doing')`, [u.id]);
  res.json({ token: await session(req, u.id) });
});

r.post('/login', async (req, res) => {
  const [u] = await q('select id,pw_hash,otp_secret from users where email=$1',
    [(req.body.email || '').trim().toLowerCase()]);
  if (!u || !(await bcrypt.compare(req.body.password || '', u.pw_hash)))
    return res.status(401).json({ error: 'Wrong email or password.' });
  if (u.otp_secret) return res.json({ pending: sign({ uid: u.id, pending: true }, '5m') });
  res.json({ token: await session(req, u.id) });
});

r.post('/otp', async (req, res) => {
  let p;
  try { p = verify(req.body.pending); } catch { return res.status(401).json({ error: 'Session expired.' }); }
  if (!p.pending) return res.status(401).json({ error: 'Session expired.' });
  const [u] = await q('select otp_secret from users where id=$1', [p.uid]);
  if (!authenticator.check(String(req.body.code || '').trim(), u.otp_secret))
    return res.status(401).json({ error: 'Wrong code.' });
  res.json({ token: await session(req, p.uid) });
});

export default r;
