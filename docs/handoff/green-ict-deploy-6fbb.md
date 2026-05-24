# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-6fbb  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-6fbb` → `main`

## Done

- [x] Green ICT reporting implemented (issues #6, #7)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-6fbb)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-6fbb)
- [x] `npm run smoke` — pass (local dev server, 2026-05-24, deploy-commander-6fbb)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Preview (this PR)** | https://green-loop-git-cursor-green-ict-deploy-6fbb-rahuls-projects-26acb4ad.vercel.app | Pending Vercel build |
| **Preview (PR #12)** | https://green-loop-git-cursor-green-ict-b46aa7-rahuls-projects-26acb4ad.vercel.app | Ready (Vercel SSO — HTTP 401 without auth) |
| **Vercel dashboard** | https://vercel.com/rahuls-projects-26acb4ad/green-loop/Ca1MVaRasKPUWHza8sDaq7CYaazi | Ready |
| **Production** | https://www.green-loop-id.com | Live — `/transparency` returns 404 until merge + migration |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND (404) — not linked to this project |

## Blocked

1. **Supabase migration not applied** — apply `017_green_ict_audit.sql` before cron can persist reports and `/transparency` shows data on production.
2. **Preview behind Vercel SSO** — automated HTTP smoke against preview requires bypass token or merge to production.
3. **Green ICT cron smoke skipped locally** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local`.
4. **idea-one-pi.vercel.app** — deployment not found; project uses `green-loop-id.com` / Vercel `green-loop` project.
5. **Multiple open PRs** — #9–#12 cover the same sprint; merge one and close duplicates.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Merge this PR (or #12) to `main` and promote to production.
4. Run manual cron: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
5. Verify `/transparency` shows first monthly report on production.
