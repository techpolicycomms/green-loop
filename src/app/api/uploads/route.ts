import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const BUCKET = "photos";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_GRADES = ["A", "B", "C"];

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    const eventId = form.get("event_id") as string | null;
    // Lanyard grade metadata from volunteer form
    const grade = (form.get("grade") as string | null)?.toUpperCase();
    const material = form.get("material") as string | null;
    const quantity = parseInt((form.get("quantity") as string) ?? "1", 10);
    const checkInId = form.get("check_in_id") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF." }, { status: 400 });
    }
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

    // Save lanyard grade record if grade data is provided (non-fatal if it fails)
    if (grade && ALLOWED_GRADES.includes(grade)) {
      await supabase.from("lanyard_grades").insert({
        user_id: user.id,
        event_id: eventId || null,
        photo_id: photoRow.id,
        check_in_id: checkInId || null,
        quantity: isNaN(quantity) || quantity < 1 ? 1 : Math.min(quantity, 10000),
        grade,
        material: material || null
      });
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
