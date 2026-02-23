# LÃ©manLoop

**Geneva's circular lanyard programme** â a not-for-profit, community-owned platform that collects, grades, and reuses event lanyards instead of sending them to landfill.

> Every Geneva conference ends the same way: thousands of lanyards tossed in a bin.
> LÃ©manLoop closes that loop.

**Live platform:** [idea-one-pi.vercel.app](https://idea-one-pi.vercel.app)
**Contact:** rahul@lemanloop.ch
**Donate:** [via Stripe](https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00)

---

## What is LÃ©manLoop?

LÃ©manLoop is a deposit-and-return system for event lanyards, built specifically for Geneva's dense international event calendar. Organisers pay a small refundable deposit; volunteers collect and grade lanyards at the venue exit; Grade A/B lanyards go back into a shared library, Grade C to certified upcycling partners. Nothing goes to landfill.

Structured as a **Swiss association (Ã  but non lucratif)**, LÃ©manLoop has no shareholders. Every franc of surplus is reinvested into the programme.

### Why it matters

| Stat | Detail |
|---|---|
| ~500 | lanyards generated per large Geneva event |
| 25 g | COâ saved per lanyard diverted from landfill |
| 3Ã | average reuse cycles before a lanyard is recycled |
| CHF 2 | deposit per lanyard â refunded when returned in Grade A or B |

### Target venues

Palexpo Â· CICG Â· Maison de la Paix Â· WTO Â· ICRC Â· WHO Â· UN Geneva Â· Geneva Marathon Â· Watches & Wonders

---

## How it works

```
1. Organiser registers the event
   ââ Pays CHF 2/lanyard deposit via LÃ©manLoop

2. Volunteers collect at the venue exit
   ââ GPS check-in confirms presence at the collection point

3. Grade each lanyard
   ââ A = reuse as-is Â· B = clean then reuse Â· C = upcycle or material recycle

4. Route to the shared library or certified partners
   ââ Grade A/B â cleaned and returned to the lanyard library
   ââ Grade C â certified upcycling or material recycling

5. Organiser receives deposit refund + impact certificate
   ââ Verified COâ savings, lanyard counts, reuse cycles â CSR-report ready
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
| Auth | Supabase Auth â Google OAuth (Apple optional) |
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

- Node.js â¥ 20
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

- `profiles` â id, email, role, display_name, city, avatar_url
- `events` â id, name, location, event_date, created_by
- `check_ins` â GPS records per volunteer per event
- `photos` â upload metadata linked to check-ins and grades
- RLS policies for all tables
- `handle_new_user` trigger â auto-creates profile with `role=volunteer` on first sign-in

### 4. Create the photos storage bucket

Supabase dashboard â Storage â New bucket:

- **Name:** `photos`
- **Public:** Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`

Add policies: authenticated insert, public read.

### 5. Enable Google OAuth

Supabase dashboard â Authentication â Providers â Google:

- Paste your Google **Client ID** and **Client Secret**
- In Google Cloud Console â Credentials â OAuth 2.0 client â Authorized redirect URIs, add:
  ```
  https://your-project.supabase.co/auth/v1/callback
  ```

### 6. Add redirect URLs

Supabase dashboard â Authentication â URL Configuration:

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

1. Go to [vercel.com/new](https://vercel.com/new) â Import `techpolicycomms/green-loop`
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

Add your production URL to Supabase Authentication â URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URL:** `https://your-app.vercel.app/auth/callback`

---

## Our principles

LÃ©manLoop is built on four commitments written into how we govern and operate:

**Not for profit** â Structured as a Swiss association. Any surplus is reinvested directly into the programme. No shareholder ever benefits.

**Community ownership** â Volunteers, organisers, and donors who contribute are co-owners of the mission. Governance decisions are made openly.

**Open source** â The entire platform â from the grading algorithm to the COâ calculation model â is published under an open licence. Fork it, adapt it, run your own loop in another city.

**Open science** â Impact data, lanyard grade distributions, COâ savings methodologies, and research findings are published openly. Good environmental data should be a public good.

---

## Join the association

LÃ©manLoop is free to join and community-owned. Whether you want to collect lanyards at one event or help build the platform, there is a place for you.

**Volunteer** â Collect and grade lanyards at Geneva events. Earn karma points redeemable for real rewards.
â [Sign up on the platform](https://idea-one-pi.vercel.app/login)

**Register an event** â Pay the deposit, attract a volunteer team, receive a verified impact certificate for your CSR report.
â [Create an organiser account](https://idea-one-pi.vercel.app/login)

**Donate** â Fund lanyard library expansion, volunteer training, platform development, and open science publishing. Every franc stays in the programme.
â [Donate via Stripe](https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00) (CHF 10 Â· 25 Â· 100 or any amount)

**Contribute code** â Open a pull request, report a bug, or suggest a feature. The codebase is yours.
â [github.com/techpolicycomms/green-loop](https://github.com/techpolicycomms/green-loop)

**Get in touch** â Questions, partnerships, press, or just want to say hello.
â rahul@lemanloop.ch

---

## Founder

**Rahul Jha** founded LÃ©manLoop after one too many events watching perfectly reusable lanyards head to landfill. Passionate about Geneva's role as a hub for international cooperation and sustainable innovation, he built LÃ©manLoop as a community commons â open by design, mission-first.

---

## Licence

Open source. See `LICENSE` for details.
