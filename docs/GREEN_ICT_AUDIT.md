# Green ICT Audit (Scope 1 + Scope 2)

This module provides monthly emissions accounting for digital operations, with transparent archived reports.

## Scope boundary

- Scope 1: direct emissions from owned/controlled fuel sources (if none, report `0` explicitly).
- Scope 2: electricity associated with operating the digital tool (Switzerland operations + EU cloud hosting).

## Default assumptions (current baseline)

- Switzerland electricity factor: `0.03 kgCO2e/kWh`
- EU cloud electricity factor: `0.25 kgCO2e/kWh`
- Estimated digital load split: `70% Switzerland`, `30% EU cloud`
- Methodology version: `v1-switzerland-eu-default`

## Monthly pipeline

1. Cron route runs monthly on the first day:
   - `GET /api/cron/green-ict-audit`
2. Route computes month totals from:
   - measured `emission_activity_logs` (if available)
   - estimated digital activity proxies (check-ins, grade records, quantities, events, active users)
3. Route stores/upserts:
   - activity logs (estimated entries)
   - archived monthly report in `emission_reports_monthly`
4. Public transparency page:
   - `/transparency`
5. Admin management page (measured inputs, offsets, manual trigger):
   - `/admin/emissions`
   - APIs:
     - `GET/POST /api/admin/emissions/activity`
     - `GET/POST /api/admin/emissions/offsets`
     - `GET /api/admin/emissions/reports`
     - `POST /api/admin/emissions/run-audit`

## Offsets

- Offsets are recorded in `emission_offsets`.
- Residual emissions are computed as gross emissions minus retired offsets.
- Reports show both location-based and market-based residuals.

## Environment variables

- `SUPABASE_SERVICE_ROLE_KEY` (required for cron aggregation)
- `NEXT_PUBLIC_SUPABASE_URL` (required)
- `GREEN_AUDIT_CRON_SECRET` (recommended; falls back to `CRON_SECRET`)
