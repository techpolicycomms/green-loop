import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";
import { z } from "zod";
import { sendRoleChanged } from "@/lib/mailer";

const UpdateRoleSchema = z.object({
  role: z.enum(["volunteer", "organizer", "admin"])
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Fetch user's email before updating (for notification)
  const { data: existing } = await supabase
    .from("profiles")
    .select("email, display_name")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Notify the user about their role change (non-blocking)
  const email = existing?.email || "";
  if (email) {
    sendRoleChanged(email, id, {
      display_name: existing?.display_name || undefined,
      email,
      new_role: parsed.data.role
    }).catch(console.error);
  }

  return NextResponse.json(data);
}
