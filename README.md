# SentryScope — OSINT Footprinting Platform

A dark, dashboard-style OSINT footprinting platform for **defensive security teams**. Every
module reads only publicly available data — public profile APIs, public DNS/WHOIS registries,
public Gravatar profiles, and breach corpora checked via k-anonymity. Nothing here bypasses
logins, accesses private accounts, or scrapes in violation of a platform's terms.

## What's built

**Frontend (`/client`)**
- Landing page (hero, features, how-it-works, platforms, security/ethics, screenshots, FAQ)
- Auth flow: Login, Register, Forgot/Reset Password
- Dashboard shell: sidebar, navbar, protected routing, profile menu, notifications
- Dashboard home: stat cards, activity chart, risk breakdown, recent investigations

**All investigation modules are fully live:**

| Module | What it does |
|---|---|
| **Username Search** | Checks a handle against ~48 real, working public profile endpoints across developer (GitHub, GitLab, Bitbucket, npm, CodePen, Replit, Kaggle…), competitive-programming (LeetCode, Codeforces, AtCoder, HackerRank…), social (Twitter/X, Instagram, Facebook, LinkedIn, Bluesky, Mastodon, Snapchat, VK…), media (YouTube, Twitch, Spotify, SoundCloud, Behance, Dribbble…), and gaming (Steam, Minecraft, Chess.com, Lichess, Roblox…) platforms |
| **Email Investigation** | Checks for a public Gravatar profile + verifies the domain's MX records |
| **Domain & WHOIS** | Real RDAP (WHOIS successor) + DNS-over-HTTPS lookups (A/MX/NS/TXT, registrar, dates) |
| **Tech Detection** | Fetches a site's HTML/headers and matches 19 framework/CMS/hosting signatures |
| **Metadata Analyzer** | Upload a PDF/DOCX/PPTX/image → extracts author, software, dates, GPS, hashes |
| **Image Analyzer** | Upload an image → EXIF, camera, embedded GPS, resolution, SHA-256/MD5 hash |
| **Password Exposure** | k-anonymity check against the HIBP Pwned Passwords API, entropy, crack-time estimate |
| **Relationship Graph** | Interactive Cytoscape graph built from live username-search results |
| **Timeline** | Live, in-session log of every investigation run, fed by all modules above |

**Backend (`/server`)** — Express API, MongoDB-backed via Mongoose
- Helmet (with an explicit CSP), CORS, auth-aware rate limiting, JWT auth
- Auth endpoints (register/login/me/forgot-password/reset-password) backed by a Mongoose
  `User` model; investigation history backed by an `Investigation` model — both persist
  across restarts
- Real controllers for every module above: username, email, domain, tech, metadata, image,
  password (proxy), all calling genuine public/free APIs — no scraping, no bypassing logins
- SSRF-guarded outbound fetches (private/internal/link-local/cloud-metadata addresses are
  blocked, including across redirects) for any endpoint that takes a user-supplied URL or domain

**Not built yet:** PDF/CSV/JSON report export, an admin UI for the contact-message list
(the API endpoint exists, gated by an `isAdmin` flag — see "Security notes" below).

## Getting started

### Prerequisites
- Node.js 18+ (for native `fetch` support)
- npm

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Open `.env` and set at minimum:
- `JWT_SECRET` — any long random string
- `CLIENT_ORIGIN` — defaults to `http://localhost:5173`, change if different

### 3. Run both apps

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to the server
on `http://localhost:4000` (see `client/vite.config.js`).

### 4. Try it out

1. Visit `http://localhost:5173` and register an account (persisted in MongoDB via
   `MONGODB_URI`)
2. From the dashboard sidebar, try any module:
   - **Username Search** → try a real GitHub handle like `torvalds`
   - **Domain & WHOIS** → try a domain you own, e.g. `example.com`
   - **Tech Detection** → try any public site
   - **Password Exposure** → check any password
   - **Metadata / Image Analyzer** → upload a PDF or photo
   - **Relationship Graph** → enter a username to see it visualized
   - **Timeline** → shows everything you've run this session

### 5. Run the server test suite

```bash
cd server
npm test
```

## Folder structure

```
osint-platform/
├── client/                  # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/      # ui/, layout/, auth/, landing/, dashboard/
│       ├── context/         # AuthContext, ToastContext, HistoryContext
│       ├── pages/           # LandingPage, auth/, dashboard/
│       └── utils/           # api client, domain lookup, password/tech analysis
└── server/                  # Node + Express backend (MVC)
    └── src/
        ├── config/          # rate limiters
        ├── controllers/     # auth, domain, tech, username, email, metadata, image, password, contact, history
        ├── middleware/      # requireAuth, requireAdmin, errorHandler, upload (multer)
        ├── models/          # Mongoose models: User, Investigation, Contact
        ├── routes/          # one route file per module
        └── utils/           # validators, ssrf.js (private-IP checks), guardedFetch.js (SSRF-safe fetch)
    └── test/                 # node:test suite — run with `npm test`
```

## Security notes

- **SSRF protection**: any endpoint that fetches a user-supplied URL/hostname (tech signature scan, domain homepage fetch, SSL cert check) goes through `guardedFetch`/`isPublicHostname` in `server/src/utils/`, which blocks private, loopback, link-local, and cloud-metadata addresses for both IPv4 and IPv6 — including addresses only reached via a redirect, and re-validates on every DNS resolution to guard against rebinding.
- **Admin access**: the `GET /api/contact` endpoint (viewing contact form submissions) requires `isAdmin: true` on the requesting user's document. There's no signup flow for this — flip it manually once, e.g. `db.users.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })` in a Mongo shell.
- **Password reset** is fully wired up (`/api/auth/forgot-password`, `/api/auth/reset-password`): a random token is hashed before storage, expires after 30 minutes, and is emailed via the same SMTP config as the contact form (falls back to a console log in dev if SMTP isn't configured).

## Ethical use

This platform is for educational use and authorized security assessments only. Only
investigate identifiers, domains, or infrastructure you own or have explicit written
authorization to assess. Do not use it to bypass authentication, access private accounts,
scrape platforms in violation of their terms, or infer sensitive personal information
about individuals without consent.

## Next steps

1. PDF/CSV/JSON report generation, pulling from the Timeline/history data
2. Expand username-search platform coverage (add more keyless public APIs)
3. JWT refresh/rotation with a revocation list, if this moves beyond a personal/demo deployment
4. Build an admin UI for the contact-message list now that the backend supports it (currently API-only)
