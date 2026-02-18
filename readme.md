# GreenLoop

Pilot-ready MVP for volunteer and event management:
- Google/Apple sign-in via Supabase Auth
- Role-based dashboards (volunteer/organizer/admin)
- Admin user list
- Event creation/listing
- Photo upload (for future CV)
- GPS capture in browser
- Basic security headers + rate limiting stub

## Run locally
1) Install
npm install

2) Configure env
Copy `.env.local.example` → `.env.local` and fill values. See `CREDENTIALS.md` for details.

3) Run
npm run dev

Open http://localhost:3000

## Supabase
Run SQL from supabase/schema.sql in Supabase SQL editor.
Enable providers: Google + Apple in Supabase Auth settings.
Add redirect URLs for local and production.

## Deploy to Vercel (live demo)

**Live:** [idea-one-pi.vercel.app](https://idea-one-pi.vercel.app)

**Repo:** [techpolicycomms/green-loop](https://github.com/techpolicycomms/green-loop)

1. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

2. **Deploy via Vercel**:
   - Go to [vercel.com](https://vercel.com) → Add New Project → Import `techpolicycomms/green-loop`
   - Add environment variables (see `.env.local.example` for required vars)
   - Deploy

3. **Configure Supabase Auth** (after deployment):
   - Supabase Dashboard → Authentication → URL Configuration
   - **Site URL:** your Vercel URL (e.g. `https://green-loop.vercel.app`)
   - **Redirect URLs:** add `https://YOUR_VERCEL_URL/auth/callback`

4. **Optional**: Connect a custom domain in Vercel project settings.