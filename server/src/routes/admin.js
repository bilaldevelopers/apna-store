import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import requireAdmin from '../middleware/auth.js';

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const r = Router();
r.use(requireAdmin);
const wrap = (f) => (q, s, n) => f(q, s).catch(n);
const FIELDS = ['name', 'slug', 'description', 'sellingPrice', 'purchaseCost', 'category', 'images', 'variants', 'specs', 'stockQuantity', 'isActive', 'availabilityStatus'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));
const destroy = (imgs) => Promise.allSettled((imgs || []).map((i) => cloudinary.uploader.destroy(i.publicId)));

r.get('/me', (q, s) => s.json({ ok: true }));
r.get('/products', wrap(async (q, s) => s.json({ ok: true, data: await Product.find().select('+purchaseCost').sort('-createdAt').lean() })));
r.post('/products', wrap(async (q, s) => {
  const p = await Product.create(pick(q.body));
  s.status(201).json({ ok: true, data: p });
}));
r.put('/products/:id', wrap(async (q, s) => {
  const old = await Product.findById(q.params.id);
  if (!old) return s.status(404).json({ ok: false, error: 'Product not found' });
  const body = pick(q.body);
  if (body.images) {
    const keep = new Set(body.images.map((i) => i.publicId));
    await destroy(old.images.filter((i) => !keep.has(i.publicId)));
  }
  old.set(body);
  await old.save();
  s.json({ ok: true, data: old });
}));
r.patch('/products/:id/status', wrap(async (q, s) => {
  const upd = {};
  if (typeof q.body.isActive === 'boolean') upd.isActive = q.body.isActive;
  if (['in_stock', 'out_of_stock'].includes(q.body.availabilityStatus)) upd.availabilityStatus = q.body.availabilityStatus;
  const p = await Product.findByIdAndUpdate(q.params.id, upd, { new: true, runValidators: true });
  if (!p) return s.status(404).json({ ok: false, error: 'Product not found' });
  s.json({ ok: true, data: p });
}));
r.delete('/products/:id', wrap(async (q, s) => {
  const p = await Product.findByIdAndDelete(q.params.id);
  if (!p) return s.status(404).json({ ok: false, error: 'Product not found' });
  await destroy(p.images);
  s.json({ ok: true });
}));
r.post('/uploads/signature', rateLimit({ windowMs: 60000, limit: 30 }), (q, s) => {
  const params = { timestamp: Math.round(Date.now() / 1000), folder: 'products', allowed_formats: 'jpg,jpeg,png,webp' };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  s.json({ ok: true, data: { ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME } });
});
export default r;
