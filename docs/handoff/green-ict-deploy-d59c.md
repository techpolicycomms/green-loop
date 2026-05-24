# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-d59c  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-d59c` → `main` (PR #9 merged)

## Done

- [x] Green ICT reporting implemented and merged via PR #9
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-d59c)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-d59c)
- [x] `npm run smoke` — pass local (`http://127.0.0.1:3000`)
- [x] `BASE_URL=https://www.green-loop-id.com npm run smoke` — pass (production)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live — `/transparency` returns 200, Green ICT Audit page |
| **Production transparency** | https://www.green-loop-id.com/transparency | Verified 2026-05-24 |
| **Production about (Stripe)** | https://www.green-loop-id.com/about | Stripe Payment Links present + reachable |
| **Vercel dashboard** | https://vercel.com/rahuls-projects-26acb4ad/green-loop | Active |
| **User live URL** | https://idea-one-pi.vercel.app | 404 — not linked to this project |

## Blocked

1. **Supabase migration may not be applied** — apply `017_green_ict_audit.sql` before cron persists reports and `/transparency` shows monthly data rows.
2. **Green ICT cron smoke skipped** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local`; set on Vercel to enable cron smoke + monthly automation.
3. **idea-one-pi.vercel.app** — deployment not found; production is `www.green-loop-id.com`.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production (if not already applied).
2. Set `GREEN_AUDIT_CRON_SECRET` on Vercel and confirm `SUPABASE_SERVICE_ROLE_KEY`.
3. Run manual cron: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report row on production.
5. Close duplicate open deploy-handoff PRs (#20–#28) once this verification PR is merged.
