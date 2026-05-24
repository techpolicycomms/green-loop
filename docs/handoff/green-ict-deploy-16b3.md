# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-16b3  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-16b3` (PR → `main`)

## Done

- [x] Green ICT reporting implemented (merged via PR #9)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-16b3)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-16b3)
- [x] `npm run smoke` — pass (local + production, 2026-05-24, deploy-commander-16b3)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live |
| **Transparency** | https://www.green-loop-id.com/transparency | Live — Green ICT Audit page (200) |
| **About (Stripe CTAs)** | https://www.green-loop-id.com/about#donate | Live — Payment Links present |
| **Admin emissions** | https://www.green-loop-id.com/admin/emissions | Live |
| **Preview (PR #24)** | https://green-loop-git-cursor-green-ict-fa19ca-rahuls-projects-26acb4ad.vercel.app | Ready |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND — not linked to this project |

## Blocked

1. **Supabase migration not applied** — apply `017_green_ict_audit.sql` before cron can persist reports and `/transparency` shows monthly data rows.
2. **Preview behind Vercel SSO** — automated HTTP smoke against preview requires bypass token or merge to production.
3. **Green ICT cron smoke skipped locally** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local`.
4. **idea-one-pi.vercel.app** — deployment not found; production is `green-loop-id.com`.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Run manual cron: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report row on production.
5. Close duplicate open PRs (#14–#23) once this handoff is merged.
