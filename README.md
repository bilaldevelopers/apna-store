# Home Essentials Store (placeholder name)

## Setup
1. **MongoDB Atlas**: create a free cluster, a DB user, allow your IP, copy the connection string to `server/.env` (`MONGODB_URI`).
2. **Firebase**: create a project, enable Email/Password sign-in, and disable public sign-ups by only creating the admin user manually (Authentication → Users → Add user). Copy that user's UID into `ADMIN_UIDS`. Put the web config values in `client/.env`.
3. **Cloudinary**: copy cloud name, API key and secret into `server/.env`.
4. Copy `.env.example` to `.env` in both `server/` and `client/` and fill in. Set `VITE_WHATSAPP_NUMBER` in international format without `+` (e.g. `923001234567`).

## Run locally
    cd server && npm install && npm run dev
    cd client && npm install && npm run dev      # http://localhost:5173 ; admin at /admin

## Deploy (verify current free-tier terms first)
- Client: Cloudflare Pages (build `npm run build`, output `dist`, set `VITE_*` vars, add a SPA fallback so `/product/*` and `/admin` load `index.html`).
- Server: Express needs a Node host (e.g. Render/Railway/Fly). Free tiers may sleep when idle or require card details. Set `CLIENT_ORIGIN` to your Pages URL.

## Known limitations
Untested first version. No order records, no About/Contact pages, no category manager, no automated tests, no Cloudinary signing of file size limits (client checks 5 MB).
