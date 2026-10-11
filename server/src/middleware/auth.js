import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
const admins = (process.env.ADMIN_UIDS || '').split(',').map((x) => x.trim()).filter(Boolean);
export default async function requireAdmin(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    const d = await getAuth().verifyIdToken(token);
    if (!admins.includes(d.uid)) return res.status(403).json({ ok: false, error: 'Not an administrator' });
    req.uid = d.uid;
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid or expired session' });
  }
}
