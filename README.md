# LémanLoop

**Geneva's circular lanyard programme** — a not-for-profit, community-owned platform that collects, grades, and reuses event lanyards instead of sending them to landfill.

> Every Geneva conference ends the same way: thousands of lanyards tossed in a bin.
> LémanLoop closes that loop.

**Live platform:** [idea-one-pi.vercel.app](https://idea-one-pi.vercel.app)
**Contact:** rahul@lemanloop.ch
**Donate:** [via Stripe](https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00)

---

## What is LémanLoop?

LémanLoop is a deposit-and-return system for event lanyards, built specifically for Geneva's dense international event calendar. Organisers pay a small refundable deposit; volunteers collect and grade lanyards at the venue exit; Grade A/B lanyards go back into a shared library, Grade C to certified upcycling partners. Nothing goes to landfill.

Structured as a **Swiss association (à but non lucratif)**, LémanLoop has no shareholders. Every franc of surplus is reinvested into the programme.

### Why it matters

| Stat | Detail |
|---|---|
| ~500 | lanyards generated per large Geneva event |
| 25 g | CO₂ saved per lanyard diverted from landfill |
| 3× | average reuse cycles before a lanyard is recycled |
| CHF 2 | deposit per lanyard — refunded when returned in Grade A or B |

### Target venues

Palexpo · CICG · Maison de la Paix · WTO · ICRC · WHO · UN Geneva · Geneva Marathon · Watches & Wonders

---

## How it works

```
1. Organiser registers the event
   └─ Pays CHF 2/lanyard deposit via LémanLoop

2. Volunteers collect at the venue exit
   └─ GPS check-in confirms presence at the collection point

3. Grade each lanyard
   └─ A = reuse as-is · B = clean then reuse · C = upcycle or material recycle

4. Route to the shared library or certified partners
   └─ Grade A/B → cleaned and returned to the lanyard library
   └─ Grade C → certified upcycling or material recycling

5. Organiser receives deposit refund + impact certificate
   └─ Verified CO₂ savings, lanyard counts, reuse cycles — CSR-report ready
```

---

## Platform features

### Roles

| Role | Capabilities |
|---|---|
| **Volunteer** | GPS check-in, lanyard grading (A/B/C + material), photo upload, karma tracking, application management |
| **Organiser** | Event registration, volunteer application review, impact certificate |
| **Admin** | Full platform oversight, user and role management |

New users automatically receive the `volunteer` role on first sign-in. Organisers and admins can be promoted via the admin panel.

### Volunteer karma rewards

Volunteers earn 10 karma points per lanyard documented.

| Points | Reward |
|---|---|
| 100 | Free community event ticket |
| 500 | Annual Geneva tram day-pass |
| 1 000 | Partner NGO membership |

### Lanyard grading system

| Grade | Condition | Routing |
|---|---|---|
| **A** | Clean, intact strap and clip | Immediate reuse |
| **B** | Minor soiling or wear | Reuse after cleaning |
| **C** | Broken clip, frayed strap, heavy soiling | Certified upcycling or material recycling |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Auth | Supabase Auth — Google OAuth (Apple optional) |
| Database | Supabase (Postgres + RLS) |
| Storage | Supabase Storage (photos bucket) |
| Validation | Zod |
| Deployment | Vercel |
| Language | TypeScript (strict) |

### Key routes

| Route | Purpose |
|---|---|
| `/` | Marketing page (logged-out) or personal dashboard (logged-in) |
| `/login` | Google / Apple sign-in |
| `/volunteer` | Volunteer workflow: events, GPS check-in, grading, photo upload, history |
| `/organizer` | Organiser dashboard: event creation, volunteer management |
| `/admin` | Admin panel: user list, role management |
| `/profile` | Edit display name, city, roles |
| `/about` | Mission, founder, donation |
| `/api/events` | Events CRUD |
| `/api/check-ins` | GPS check-in persistence |
| `/api/grades` | Lanyard grade submission |
| `/api/uploads` | Photo upload to Supabase Storage |
| `/api/admin/users` | Admin user list + role update |

---

## Run locally

### Prerequisites

- Node.js ≥ 20
- A Supabase project
- Google OAuth credentials (Cloud Console)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # optional
```

See `CREDENTIALS.md` for full details.

### 3. Set up the database

Run `supabase/schema.sql` in the Supabase SQL editor. This creates:

- `profiles` — id, email, role, display_name, city, avatar_url
- `events` — id, name, location, event_date, created_by
- `check_ins` — GPS records per volunteer per event
- `photos` — upload metadata linked to check-ins and grades
- RLS policies for all tables
- `handle_new_user` trigger — auto-creates profile with `role=volunteer` on first sign-in

### 4. Create the photos storage bucket

Supabase dashboard → Storage → New bucket:

- **Name:** `photos`
- **Public:** Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`

Add policies: authenticated insert, public read.

### 5. Enable Google OAuth

Supabase dashboard → Authentication → Providers → Google:

- Paste your Google **Client ID** and **Client Secret**
- In Google Cloud Console → Credentials → OAuth 2.0 client → Authorized redirect URIs, add:
  ```
  https://your-project.supabase.co/auth/v1/callback
  ```

### 6. Add redirect URLs

Supabase dashboard → Authentication → URL Configuration:

```
http://localhost:3000/auth/callback
https://your-vercel-url.vercel.app/auth/callback
```

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Via Vercel dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) → Import `techpolicycomms/green-loop`
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_SITE_URL   (your production URL)
   ```
3. Deploy

### Via Vercel CLI

```bash
npx vercel login
npx vercel --prod
```

### After deployment

Add your production URL to Supabase Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URL:** `https://your-app.vercel.app/auth/callback`

---

## Our principles

LémanLoop is built on four commitments written into how we govern and operate:

**Not for profit** — Structured as a Swiss association. Any surplus is reinvested directly into the programme. No shareholder ever benefits.

**Community ownership** — Volunteers, organisers, and donors who contribute are co-owners of the mission. Governance decisions are made openly.

**Open source** — The entire platform — from the grading algorithm to the CO₂ calculation model — is published under an open licence. Fork it, adapt it, run your own loop in another city.

**Open science** — Impact data, lanyard grade distributions, CO₂ savings methodologies, and research findings are published openly. Good environmental data should be a public good.

---

## Join the association

LémanLoop is free to join and community-owned. Whether you want to collect lanyards at one event or help build the platform, there is a place for you.

**Volunteer** — Collect and grade lanyards at Geneva events. Earn karma points redeemable for real rewards.
→ [Sign up on the platform](https://idea-one-pi.vercel.app/login)

**Register an event** — Pay the deposit, attract a volunteer team, receive a verified impact certificate for your CSR report.
→ [Create an organiser account](https://idea-one-pi.vercel.app/login)

**Donate** — Fund lanyard library expansion, volunteer training, platform development, and open science publishing. Every franc stays in the programme.
→ [Donate via Stripe](https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00) (CHF 10 · 25 · 100 or any amount)

**Contribute code** — Open a pull request, report a bug, or suggest a feature. The codebase is yours.
→ [github.com/techpolicycomms/green-loop](https://github.com/techpolicycomms/green-loop)

**Get in touch** — Questions, partnerships, press, or just want to say hello.
→ rahul@lemanloop.ch

---

## Founder

**Rahul Jha** founded LémanLoop after one too many events watching perfectly reusable lanyards head to landfill. Passionate about Geneva's role as a hub for international cooperation and sustainable innovation, he built LémanLoop as a community commons — open by design, mission-first.

---

## Licence

Open source. See `LICENSE` for details.
