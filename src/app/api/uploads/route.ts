import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";

export async function POST(req: Request) {
  await requireRole(["volunteer", "organizer", "admin"]);

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // MVP: return metadata. Next step: upload to Supabase Storage bucket.
  return NextResponse.json({
    ok: true,
    name: file.name,
    type: file.type,
    size: file.size
  });
}
