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

### Non-obvious notes

- The `.eslintrc.json` file must exist for `npm run lint` and `npm run build` to succeed. If it's missing, create it with `{"extends": "next/core-web-vitals", "rules": {"react/no-unescaped-entities": "warn"}}`. The `react/no-unescaped-entities` rule is set to `warn` instead of `error` because there is a pre-existing violation in `src/app/onboarding/page.tsx`.
- The `next.config.mjs` provides fallback placeholder values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, so the app will compile and start even without real credentials, but all Supabase-dependent features (auth, database, storage) will fail.
- Authentication uses Google OAuth exclusively (via Supabase Auth). Apple OAuth appears in the UI but is not actively used. Login testing requires a real Google account and properly configured Supabase Auth providers.
- The `.env.local` file is gitignored. The update script automatically creates it from Cursor secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`) on each new VM.
