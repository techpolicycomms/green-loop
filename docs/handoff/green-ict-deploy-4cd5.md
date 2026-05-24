# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-4cd5  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-4cd5` → `main`

## Done

- [x] Green ICT reporting implemented (issues #6, #7 — merged via PR #9)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-4cd5)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-4cd5)
- [x] `npm run smoke` — pass local (`http://127.0.0.1:3000`) + production (`https://www.green-loop-id.com`)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live — `/transparency` returns 200 |
| **Transparency** | https://www.green-loop-id.com/transparency | Live |
| **About (Stripe CTAs)** | https://www.green-loop-id.com/about#donate | Live |
| **Admin emissions** | https://www.green-loop-id.com/admin/emissions | Live |
| **Preview (PR #28)** | https://green-loop-git-cursor-green-ict-e3a7e8-rahuls-projects-26acb4ad.vercel.app | Ready (Vercel SSO protected) |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND — not linked to this project |

## Blocked

1. **Supabase migration not applied** — apply `017_green_ict_audit.sql` before cron can persist reports and `/transparency` shows monthly data rows.
2. **Green ICT cron smoke skipped** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local` or Vercel env.
3. **idea-one-pi.vercel.app** — deployment not found; production is `green-loop-id.com`.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production.
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Trigger first audit: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report on production.
5. Close issue #7 (code merged, issue may still be open).
6. Close duplicate handoff PRs (#17–#27) after ops checklist complete.
