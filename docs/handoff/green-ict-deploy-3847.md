# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-3847  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-smoke-3847` → `sprint/green-ict-audit` (PR #9 → `main`)

## Done

- [x] Green ICT reporting implemented on `sprint/green-ict-audit` (issues #6, #7)
  - Monthly cron `/api/cron/green-ict-audit` + Vercel cron schedule
  - Public `/transparency` page
  - Admin `/admin/emissions` + APIs
  - Migration `017_green_ict_audit.sql`
- [x] Stripe donation smoke test script (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` updated (smoke tests, Green ICT routes, Stripe links)
- [x] `npm run lint` — pass
- [x] `npm run build` — pass
- [x] `npm run smoke` — pass (local dev server)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live (pre–Green ICT merge) |
| **Preview (PR #9)** | https://green-loop-git-sprint-green-ict-audit-rahuls-projects-26acb4ad.vercel.app | Deployed (Vercel SSO protected) |
| **Vercel dashboard** | https://vercel.com/rahuls-projects-26acb4ad/green-loop/FqD4jBsYDfwCVuAcz97JwnMVPzk8 | Ready |
| **User live URL** | https://idea-one-pi.vercel.app | 404 — not this project |

## Blocked

1. **Supabase migration not applied in target env** — cron returns fetch error; apply `017_green_ict_audit.sql` before first monthly report appears on `/transparency`.
2. **Preview URL behind Vercel SSO** — automated HTTP smoke against preview requires auth bypass or production promotion.
3. **Supabase env unreachable from VM** — `NEXT_PUBLIC_SUPABASE_URL` DNS resolution failed during cron test (secrets may be placeholders in this VM).

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Merge PR #9 to `main` and promote to production.
4. Run manual cron: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
5. Verify `/transparency` shows first monthly report on production.
