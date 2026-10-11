import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import pub from './routes/public.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || '').split(',') }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 60000, limit: 120 }));
app.use('/api', pub);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
app.use((e, req, res, next) => {
  const s = e.code === 11000 ? 409 : e.status || (e.name === 'ValidationError' || e.name === 'CastError' ? 400 : 500);
  if (s === 500) console.error(e);
  const msg = s === 500 ? 'Server error' : e.code === 11000 ? 'Slug already exists' : e.message;
  res.status(s).json({ ok: false, error: msg });
});
await mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT || 5000, () => console.log('API running'));
