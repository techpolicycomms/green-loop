import { createServerClient } from "@/lib/supabaseServer";

export type Role = "volunteer" | "organizer" | "admin";

export async function requireUser() {
  const supabase = await createServerClient();
  // Use getSession() for reliable cookie-based auth in API routes (Next.js App Router)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as Role) ?? (user.user_metadata?.role as Role | undefined) ?? "volunteer";
  if (!allowed.includes(role)) throw new Error("FORBIDDEN");

  return { user, role };
}
