import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
const e = import.meta.env;
export const auth = getAuth(initializeApp({ apiKey: e.VITE_FIREBASE_API_KEY, authDomain: e.VITE_FIREBASE_AUTH_DOMAIN, projectId: e.VITE_FIREBASE_PROJECT_ID }));
export const STORE = e.VITE_STORE_NAME || 'Your Store Name';
export const pkr = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;
export async function api(path, { method = 'GET', body, admin } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const res = await fetch(`${e.VITE_API_BASE_URL}${path}`, { method, headers, body: body && JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Request failed');
  return j.data;
}
export function waLink(p) {
  const num = (e.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const msg = `Hello, I would like to order:\n${p.name}\nRef: ${p._id}\nPrice: ${pkr(p.sellingPrice)}\n${location.origin}/product/${p.slug}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
export const soldOut = (p) => p.availabilityStatus === 'out_of_stock';
