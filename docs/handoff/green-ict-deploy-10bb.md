# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-10bb  
**date:** 2026-05-24  
**branch:** `sprint/green-ict-audit` (PR #9 → `main`)

## Done

- [x] Green ICT reporting implemented (issues #6, #7)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate (smoke tests, Green ICT routes, Stripe links)
- [x] `npm run lint` — pass (2026-05-24)
- [x] `npm run build` — pass (2026-05-24)
- [x] `npm run smoke` — pass (local dev server, 2026-05-24)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Preview (PR #9)** | https://green-loop-git-sprint-green-ict-audit-rahuls-projects-26acb4ad.vercel.app | Ready (Vercel SSO protected — HTTP 401 without auth) |
| **Vercel dashboard** | https://vercel.com/rahuls-projects-26acb4ad/green-loop/Rt6ceuoX2PcCVJwC2A6PRMgm3zPf | Ready |
| **Production** | https://www.green-loop-id.com | Live — `/transparency` returns 404 until merge + migration |
| **User live URL** | https://idea-one-pi.vercel.app | 404 — not this project |

## Blocked

1. **Supabase migration not applied** — apply `017_green_ict_audit.sql` before cron can persist reports and `/transparency` shows data on production.
2. **Preview behind Vercel SSO** — automated HTTP smoke against preview requires bypass token or merge to production.
3. **Green ICT cron smoke skipped locally** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local`.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Merge PR #9 to `main` and promote to production.
4. Run manual cron: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
5. Verify `/transparency` shows first monthly report on production.
