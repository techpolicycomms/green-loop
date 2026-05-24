# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-0985  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-0985` → `main`

## Done

- [x] Green ICT reporting implemented (issues #6 merged, #7 code in main via PR #9)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-0985)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-0985)
- [x] `npm run smoke` — pass (local dev server, 2026-05-24)
- [x] `BASE_URL=https://www.green-loop-id.com npm run smoke` — pass (production, 2026-05-24)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live |
| **Transparency** | https://www.green-loop-id.com/transparency | Live (200) — awaiting first cron report |
| **About (Stripe CTAs)** | https://www.green-loop-id.com/about#donate | Live (200) |
| **Admin emissions** | https://www.green-loop-id.com/admin/emissions | Live (200) |
| **Preview (PR)** | _See PR body after Vercel deploy_ | Vercel SSO may apply |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND — not linked to this project |

## Blocked

1. **Supabase migration not applied** — apply `017_green_ict_audit.sql` before cron can persist reports and `/transparency` shows monthly data.
2. **`GREEN_AUDIT_CRON_SECRET` not set** — cron smoke skipped locally and on Vercel; set secret then run manual audit.
3. **idea-one-pi.vercel.app** — deployment not found; production is `green-loop-id.com` / Vercel `green-loop` project.
4. **Issue #7 still open** — admin inputs code is merged in main; close issue after migration + first audit verified.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Trigger first audit: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report on production.
5. Close GitHub issue #7 after ops checklist complete.
