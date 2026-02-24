# LémanLoop

**Geneva's circular lanyard programme** — a not-for-profit, community-owned platform that collects, grades, and reuses event lanyards instead of sending them to landfill.

> Every Geneva conference ends the same way: thousands of lanyards tossed in a bin. LémanLoop closes that loop.

**Live platform:** [green-loop-id.com](https://green-loop-id.com)  
**Repo:** [techpolicycomms/green-loop](https://github.com/techpolicycomms/green-loop)

---

## What is LémanLoop?

LémanLoop is a deposit-and-return system for event lanyards, built for Geneva's international event calendar. Organisers pay a refundable deposit; volunteers collect and grade lanyards at the venue exit; Grade A/B lanyards go back into a shared library, Grade C to certified upcycling partners. Nothing goes to landfill.

### Platform features

| Role | Capabilities |
|------|--------------|
| **Volunteer** | GPS check-in, lanyard grading (A/B/C), photo upload, karma tracking, event applications |
| **Organiser** | Event registration, volunteer application review, impact certificate |
| **Admin** | Full platform oversight, user and role management |

### Tech stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Auth:** Supabase Auth — Google OAuth (Apple optional)
- **Database:** Supabase (Postgres + RLS)
- **Storage:** Supabase Storage (avatars, photos)
- **Deployment:** Vercel

### Key routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing page or personal dashboard |
| `/login` | Google / Apple sign-in |
| `/volunteer` | Volunteer workflow: events, GPS check-in, grading, applications |
| `/organizer` | Organiser dashboard: event creation, volunteer management |
| `/admin` | Admin panel: user list, role management |
| `/profile` | Edit display name, avatar, bio, roles |
| `/about` | Mission, founder, donation |

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

Edit `.env.local` with your Supabase URL and anon key. See `CREDENTIALS.md` for details.

### 3. Set up the database

Run `supabase/schema.sql` and migrations in `supabase/migrations/` in the Supabase SQL editor.

### 4. Enable Google OAuth

Supabase Dashboard → Authentication → Providers → Google. Add the Supabase callback URL to your Google OAuth client's Authorized redirect URIs.

### 5. Add redirect URLs

Supabase Dashboard → Authentication → URL Configuration:

- `http://localhost:3000/auth/callback`
- `https://green-loop-id.com/auth/callback` (production)

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import `techpolicycomms/green-loop`
2. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
3. Deploy
4. Configure Supabase Auth → URL Configuration with your production URL
5. Optional: Connect custom domain (e.g. `green-loop-id.com`)

---

## Licence

MIT. See [LICENSE](LICENSE) for details.
