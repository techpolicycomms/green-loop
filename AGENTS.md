# AGENTS.md

## Cursor Cloud specific instructions

### Overview

LémanLoop is a single Next.js 15 (App Router) application — no monorepo, no Docker, no separate backend. All API logic runs as Next.js API routes. See `README.md` for full architecture and route table.

### Prerequisites

- **Node.js 20** (pinned in `.nvmrc`). Use `nvm use` to activate.
- **npm** as package manager (`package-lock.json`).
- **Supabase credentials** are required via env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. These must be injected as Cursor secrets and written to `.env.local` before the dev server will function. `RESEND_API_KEY` is optional (email sending degrades gracefully).

### Running the app

```bash
npm run dev    # starts Next.js dev server on port 3000
```

### Lint / Build / Test

```bash
npm run lint   # ESLint via next lint (requires .eslintrc.json)
npm run build  # production build — also runs lint + type-check
```

There are no automated test suites in this codebase. Manual testing is done via the browser.

### Secrets available

| Secret | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (required) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API access — use for creating/confirming test users, bypassing RLS |
| `RESEND_API_KEY` | Email sending (optional, graceful degradation) |
| `TEST_GOOGLE_EMAIL` | Google account for OAuth login testing |
| `TEST_GOOGLE_PASSWORD` | Password for test Google account — **currently outdated** (Google says "changed 7 months ago"). The account also has passkey/2FA enabled which blocks automated browser login. Update the secret with the current password to enable browser-based OAuth testing. |

### Creating test users without Google OAuth

Since Google OAuth is the only browser login method, use email/password auth via the Supabase API for automated testing:

```bash
# 1. Create user
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 2. Confirm email (requires service role key)
curl -X PUT "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users/<USER_ID>" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_confirm":true}'

# 3. Sign in to get access token
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 4. Set up profile via service role (bypasses RLS)
curl -X PATCH "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?id=eq.<USER_ID>" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"role":"organizer","display_name":"Test User","onboarding_complete":true}'
```

Pre-created test accounts (email-confirmed, onboarding complete):
- **Organizer**: `organizer.test@lemanloop.ch` / `TestOrganizer123!` (role: organizer, Marie Dupont)
- **Volunteer**: `volunteer.test@lemanloop.ch` / `TestVolunteer123!` (role: volunteer, Sophie Muller)

### Non-obvious notes

- **Middleware location**: The middleware MUST be at `src/middleware.ts` (not project root). Next.js with `src/` directory layout silently ignores middleware at the project root.
- The `.eslintrc.json` file must exist for `npm run lint` and `npm run build` to succeed. If missing, create it with `{"extends": "next/core-web-vitals"}`.
- The `next.config.mjs` provides fallback placeholder values for Supabase env vars, so the app compiles without real credentials but all Supabase features will fail.
- Authentication uses Google OAuth exclusively in the browser. For API-level testing, use the email/password test accounts above.
- The `.env.local` file is gitignored. The update script automatically creates it from Cursor secrets on each new VM.
- The CSP headers in `src/lib/securityHeaders.ts` must allow Google Fonts (`fonts.googleapis.com`), Zoho PageSense (`cdn.pagesense.io`), and Google OAuth (`accounts.google.com`) — otherwise client-side JS breaks.
- The `/demo` page provides a self-contained investor pitch simulation that doesn't require authentication.
