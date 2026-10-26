import jwt from 'jsonwebtoken';
import { q } from './db.js';

export const sign = (p, exp = '7d') => jwt.sign(p, process.env.JWT_SECRET, { expiresIn: exp });
export const verify = t => jwt.verify(t, process.env.JWT_SECRET);

export const device = u => ({
  os: /Android/.test(u) ? 'Android' : /iPhone|iPad/.test(u) ? 'iOS' : /Windows/.test(u) ? 'Windows'
    : /Mac OS/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : 'Unknown OS',
  br: /Edg\//.test(u) ? 'Edge' : /OPR\//.test(u) ? 'Opera' : /Firefox\//.test(u) ? 'Firefox'
    : /Chrome\//.test(u) ? 'Chrome' : /Safari\//.test(u) ? 'Safari' : 'Browser',
});

export async function auth(req, res, next) {
  try {
    const p = verify((req.headers.authorization || '').replace('Bearer ', ''));
    if (p.pending) throw 0;
    const [s] = await q(
      'update sessions set last_active=now() where id=$1 and user_id=$2 and not revoked returning id',
      [p.sid, p.uid]);
    if (!s) throw 0;
    req.uid = p.uid; req.sid = p.sid;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
