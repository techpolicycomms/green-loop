#!/usr/bin/env node
/**
 * Smoke tests for Green ICT reporting and Stripe donation links.
 * Usage: npm run smoke  (defaults to http://127.0.0.1:3000)
 */

const host = process.env.SMOKE_HOST ?? "127.0.0.1";
const port = process.env.PORT ?? "3000";
const BASE_URL = (process.env.BASE_URL ?? `http://${host}:${port}`).replace(/\/$/, "");

const STRIPE_LINKS = [
  {
    name: "Support CHF 5",
    url: "https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00"
  },
  {
    name: "Board member CHF 1000",
    url: "https://buy.stripe.com/5kQ6oH8Pc7bddlD7yE6sw01"
  }
];

const APP_ROUTES = [
  { path: "/transparency", expect: /Green ICT Audit/i },
  { path: "/about", expect: /buy\.stripe\.com/ },
  { path: "/admin/emissions", expect: /Green ICT Emissions Manager|Sign in|login/i }
];

async function fetchStatus(url, options = {}) {
  const res = await fetch(url, { redirect: "manual", ...options });
  return { status: res.status, ok: res.ok || res.status === 307 || res.status === 302 };
}

async function fetchText(url) {
  const res = await fetch(url);
  const text = await res.text();
  return { status: res.status, text, ok: res.ok };
}

async function smokeAppRoute({ path, expect }) {
  const url = `${BASE_URL}${path}`;
  const { status, text, ok } = await fetchText(url);
  if (!ok) {
    throw new Error(`${path}: HTTP ${status}`);
  }
  if (!expect.test(text)) {
    throw new Error(`${path}: missing expected content ${expect}`);
  }
  console.log(`✓ ${path} (${status})`);
}

async function smokeStripeLink({ name, url }) {
  const { status, ok } = await fetchStatus(url);
  if (!ok && status !== 303 && status !== 302) {
    throw new Error(`Stripe "${name}": HTTP ${status}`);
  }
  console.log(`✓ Stripe ${name} (${status})`);
}

async function smokeGreenIctCron() {
  const secret = process.env.GREEN_AUDIT_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    console.log("○ Green ICT cron: skipped (no GREEN_AUDIT_CRON_SECRET / CRON_SECRET)");
    return;
  }

  const month = process.env.SMOKE_AUDIT_MONTH ?? "2026-04";
  const url = `${BASE_URL}/api/cron/green-ict-audit?month=${month}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${secret}` }
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Green ICT cron: HTTP ${res.status} — ${JSON.stringify(body)}`);
  }
  if (!body.ok) {
    throw new Error(`Green ICT cron: unexpected response — ${JSON.stringify(body)}`);
  }
  console.log(`✓ Green ICT cron (${month}) scope2_location_kg=${body.summary?.scope2_location_kg}`);
}

async function main() {
  console.log(`Smoke testing ${BASE_URL}\n`);

  for (const route of APP_ROUTES) {
    await smokeAppRoute(route);
  }

  console.log("");
  for (const link of STRIPE_LINKS) {
    await smokeStripeLink(link);
  }

  console.log("");
  await smokeGreenIctCron();

  console.log("\nAll smoke checks passed.");
}

main().catch((err) => {
  console.error(`\nSmoke test failed: ${err.message}`);
  process.exit(1);
});
