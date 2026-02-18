# Idea One (GreenLoop MVP)

This is a pilot-ready MVP:
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
Copy .env.local.example -> .env.local and fill values from Supabase dashboard.

3) Run
npm run dev

Open http://localhost:3000

## Supabase
Run SQL from supabase/schema.sql in Supabase SQL editor.
Enable providers: Google + Apple in Supabase Auth settings.
Add redirect URLs for local and production.

## Deploy to Vercel (live demo)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy via Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New Project" → Import your repo
   - Set root directory to the folder containing `package.json` (project root)
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Dashboard → Settings → API
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Dashboard → Settings → API
   - Deploy

3. **Configure Supabase Auth**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to **Site URL** (e.g. `https://your-app.vercel.app`)
   - Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

4. **Optional**: Connect a custom domain in Vercel project settings.