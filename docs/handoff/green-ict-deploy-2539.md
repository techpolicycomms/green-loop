# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-2539  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-2539` → `main`

## Done

- [x] Green ICT reporting implemented (issues #6 merged, #7 code in PR #9)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-2539)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-2539)
- [x] `npm run smoke` — pass local (`http://127.0.0.1:3000`) and production (`https://www.green-loop-id.com`)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live |
| **Transparency** | https://www.green-loop-id.com/transparency | Live — Green ICT page renders; no monthly report yet |
| **About (Stripe CTAs)** | https://www.green-loop-id.com/about#donate | Live — Payment Links present |
| **Admin emissions** | https://www.green-loop-id.com/admin/emissions | Live |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND — not linked to this project |

## Blocked

1. **Supabase migration not applied** — VM cannot reach Supabase host (`ENOTFOUND bubwzavexxjjckzbvthl.supabase.co`). Apply `017_green_ict_audit.sql` manually in Supabase dashboard or from a network with access.
2. **Green ICT cron smoke skipped** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local` or Vercel.
3. **First monthly report empty** — `/transparency` shows "No monthly report has been published yet" until cron runs with migration applied.
4. **idea-one-pi.vercel.app** — deployment not found; production is `www.green-loop-id.com`.
5. **Issue #7 still open** — admin inputs code merged via PR #9; close issue manually.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production (SQL editor or CLI).
2. Set `GREEN_AUDIT_CRON_SECRET` on Vercel production + preview.
3. Trigger first audit: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report on production.
5. Close GitHub issue #7 (admin inputs — already merged).
6. Link or retire `idea-one-pi.vercel.app` if still referenced externally.
