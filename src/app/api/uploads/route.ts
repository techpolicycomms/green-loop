import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const BUCKET = "photos";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    const eventId = form.get("event_id") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const supabase = await createServerClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: photoRow, error: dbError } = await supabase
      .from("photos")
      .insert({
        user_id: user.id,
        storage_path: uploadData.path,
        file_name: file.name,
        file_size: file.size,
        event_id: eventId || null
      })
      .select("*")
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);

    return NextResponse.json({
      ok: true,
      id: photoRow.id,
      path: uploadData.path,
      url: urlData.publicUrl,
      name: file.name,
      size: file.size
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
