# Going live with SentryScope

This app is one Node process (Express) serving both the API and the built
React frontend as static files — so you only need to deploy **one service**.

## 1. Database — MongoDB Atlas (free tier is enough to start)

1. Create an account at https://www.mongodb.com/cloud/atlas/register
2. Create a free (M0) cluster.
3. Database Access → add a database user with a strong password.
4. Network Access → add `0.0.0.0/0` (allow from anywhere) if your host uses
   dynamic egress IPs, or the specific IP(s) of your host if it's static.
5. Connect → Drivers → copy the connection string, then put it in
   `server/.env` as `MONGODB_URI`, replacing `<user>`/`<password>` and
   picking a database name (e.g. `.../sentryscope?...`).

## 2. Email — Gmail SMTP (for the contact form + password reset)

1. Turn on 2-Step Verification on the Gmail account you want to send from.
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Put that 16-character app password (not your regular Gmail password) in
   `SMTP_PASS`, and set `SMTP_USER` to the Gmail address.
4. Set `CONTACT_EMAIL` to whichever inbox should actually receive contact-form
   submissions — this can be the same Gmail address or a different one.

Without SMTP configured, the contact form and password reset both still work
and save correctly — they just print the message/reset-link to the server
console instead of emailing it. Fine for testing, not for a live site.

## 3. Environment variables to set on your host

Every value in `server/.env` needs to be set on whatever platform you deploy
to (most hosts have an "Environment Variables" panel — do not commit `.env`
to git, it's already in `.gitignore`):

- `MONGODB_URI` (from step 1)
- `JWT_SECRET` — a long random string. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CLIENT_ORIGIN` — your real domain, e.g. `https://yourdomain.com`
  (must be exact — this is what CORS checks against)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` (step 2)
- `NODE_ENV=production`
- `PORT` — most hosts set this automatically; only set it if yours doesn't

## 4. Build and run

```bash
cd client && npm install && npm run build   # outputs client/dist
cd ../server && npm install
npm start                                   # serves API + client/dist together
```

Point your domain at wherever this process runs (Render, Railway, Fly.io, a
VPS behind Caddy/Nginx, etc.) on the `PORT` it listens on. Any of those
platforms can build both steps above automatically from a single "build
command" + "start command" pair — use `cd client && npm install && npm run
build && cd ../server && npm install` as the build command and `npm start
--prefix server` (or just `node server/src/index.js`) as the start command.

## 5. Before you actually open it up publicly

- Change `JWT_SECRET` to your own generated value (don't reuse the one that
  shipped in this zip for local dev).
- Register your own account, then in the Mongo shell / Atlas UI flip
  `isAdmin: true` on it if you want to view contact-form submissions via
  `GET /api/contact` (there's no admin UI for this yet — see README's "Next
  steps").
- Double-check `CLIENT_ORIGIN` matches your real domain exactly (including
  `https://` and no trailing slash), or the frontend won't be able to talk to
  the API.
- Consider putting the whole thing behind Cloudflare (free tier) for DDoS
  protection and a free TLS certificate if your host doesn't already provide
  HTTPS.
