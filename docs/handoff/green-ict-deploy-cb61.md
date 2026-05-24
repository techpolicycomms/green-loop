# Deploy Commander Handoff — Green ICT Sprint

**agent_id:** deploy-commander-cb61  
**date:** 2026-05-24  
**branch:** `cursor/green-ict-deploy-cb61` → `main`

## Done

- [x] Green ICT reporting implemented (issues #6, #7 — merged via PR #9)
  - Monthly cron `GET /api/cron/green-ict-audit` + Vercel cron (`15 3 1 * *`)
  - Public `/transparency` page (published monthly Scope 1/2 reports)
  - Admin `/admin/emissions` + activity/offsets/reports/run-audit APIs
  - Migration `supabase/migrations/017_green_ict_audit.sql`
- [x] Stripe donation smoke test (`npm run smoke`) — Payment Links return HTTP 200
- [x] WCAG + ISO 27001 audit doc updates (`COMPLIANCE.md` §5 Green ICT)
- [x] `AGENTS.md` accurate — Green ICT + Stripe smoke documented
- [x] `npm run lint` — pass (2026-05-24, deploy-commander-cb61)
- [x] `npm run build` — pass (2026-05-24, deploy-commander-cb61)
- [x] `npm run smoke` — pass (local dev + production, 2026-05-24)

## Deploy URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | https://www.green-loop-id.com | Live — `/transparency` HTTP 200 |
| **Transparency** | https://www.green-loop-id.com/transparency | Verified — "Green ICT Audit" renders |
| **About (Stripe)** | https://www.green-loop-id.com/about#donate | Verified — Payment Links present |
| **Admin emissions** | https://www.green-loop-id.com/admin/emissions | Verified — smoke pass |
| **User live URL** | https://idea-one-pi.vercel.app | DEPLOYMENT_NOT_FOUND (404) — not linked to this Vercel project |
| **Preview (PR #23)** | https://green-loop-git-cursor-green-ict-540fde-rahuls-projects-26acb4ad.vercel.app | Ready (Vercel SSO protected — HTTP 401 without auth) |

## Blocked

1. **Supabase migration status unverified from VM** — outbound network to Supabase blocked; apply/confirm `017_green_ict_audit.sql` in Supabase dashboard before cron persists reports.
2. **Green ICT cron smoke skipped** — `GREEN_AUDIT_CRON_SECRET` not set in VM `.env.local`; set on Vercel and re-run `GREEN_AUDIT_CRON_SECRET=... npm run smoke`.
3. **idea-one-pi.vercel.app** — deployment not found; production is `www.green-loop-id.com`.

## Next agent task

1. Apply migration `017_green_ict_audit.sql` in Supabase production (if not already applied).
2. Set `GREEN_AUDIT_CRON_SECRET` + confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
3. Trigger first audit: `GET /api/cron/green-ict-audit?month=2026-04` with Bearer token.
4. Verify `/transparency` shows first monthly report after cron run.
5. Close duplicate open deploy PRs (#18–#22) once this handoff is merged.
