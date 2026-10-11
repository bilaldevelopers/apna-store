import { Router } from 'express';
import Product from '../models/Product.js';
const r = Router();
const wrap = (f) => (q, s, n) => f(q, s).catch(n);
r.get('/products', wrap(async (q, s) => {
  s.json({ ok: true, data: await Product.find({ isActive: true }).sort('-createdAt').lean() });
}));
r.get('/products/:slug', wrap(async (q, s) => {
  const p = await Product.findOne({ slug: q.params.slug, isActive: true }).lean();
  if (!p) return s.status(404).json({ ok: false, error: 'Product not found' });
  s.json({ ok: true, data: p });
}));
r.get('/categories', wrap(async (q, s) => {
  s.json({ ok: true, data: await Product.distinct('category', { isActive: true }) });
}));
export default r;
