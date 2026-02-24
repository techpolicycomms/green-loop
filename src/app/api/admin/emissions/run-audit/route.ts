import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/authz";
import { GET as runGreenIctAudit } from "@/app/api/cron/green-ict-audit/route";

const RunAuditSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional()
});

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = RunAuditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cronSecret = process.env.GREEN_AUDIT_CRON_SECRET || process.env.CRON_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/api/cron/green-ict-audit", baseUrl);
  if (parsed.data.month) {
    url.searchParams.set("month", parsed.data.month);
  }

  const internalReq = new Request(url.toString(), {
    method: "GET",
    headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : undefined
  });

  return runGreenIctAudit(internalReq);
}
