import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { z } from "zod";

const RemindSchema = z.object({
  user_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  type: z.enum(["event_reminder", "role_change", "welcome"])
});

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await req.json();
  const parsed = RemindSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Stub: Email sending requires Resend, SendGrid, or Supabase Edge Function
  // For MVP, return success. Integrate with email service later.
  return NextResponse.json({
    ok: true,
    message: "Reminder queued (email integration pending)",
    user_id: parsed.data.user_id,
    type: parsed.data.type
  });
}
