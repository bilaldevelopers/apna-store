import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import app, { connectDB } from './app.js';

await connectDB();
app.listen(process.env.PORT || 5000, () => console.log('API running'));
