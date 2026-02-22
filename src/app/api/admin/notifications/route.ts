import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/authz";

export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, subject, status, error_message, metadata, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const notifications = data ?? [];

  // Enrich with user profiles
  const userIds = [...new Set(notifications.map((n) => n.user_id).filter(Boolean))];
  const profilesRes = userIds.length
    ? await supabase.from("profiles").select("id, email, display_name").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );

  const enriched = notifications.map((n) => ({
    ...n,
    profile: n.user_id ? (profileMap[n.user_id] ?? null) : null
  }));

  return NextResponse.json(enriched);
}
