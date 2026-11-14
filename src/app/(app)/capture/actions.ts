"use server";

import { revalidatePath } from "next/cache";
import { ownerFromPhotoPath } from "@/lib/photos/path";
import { createClient } from "@/lib/supabase/server";

export type CaptureResult = { ok: true } | { ok: false; message: string };

/**
 * Save one entry. Nothing is required except that there's *something*: text or a photo.
 * Photos are uploaded by the browser straight to storage; we only get the path.
 */
export async function createEntry(input: { body?: string; photoPath?: string | null; momentId?: string | null }): Promise<CaptureResult> {
  const body = input.body?.trim() || null;
  const photoPath = input.photoPath || null;
  if (!body && !photoPath) return { ok: false, message: "Write something or add a photo." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You're signed out. Sign in again." };

  // Belt and braces: storage RLS already enforces this, but never link someone else's object.
  if (photoPath && ownerFromPhotoPath(photoPath) !== user.id) return { ok: false, message: "Bad photo path." };

  const { data: created, error } = await supabase
    .from("entries")
    .insert({ owner_id: user.id, body, photo_path: photoPath, source: input.momentId ? "check_in" : "capture" })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (input.momentId && created) {
    await supabase.from("moments").update({ status: "kept", entry_id: created.id }).eq("id", input.momentId).eq("owner_id", user.id).eq("status", "scheduled");
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteEntry(id: string): Promise<CaptureResult> {
  const supabase = await createClient();
  const { data: entry } = await supabase.from("entries").select("photo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("entries").delete().eq("id", id); // RLS scopes to owner
  if (error) return { ok: false, message: error.message };
  if (entry?.photo_path) await supabase.storage.from("photos").remove([entry.photo_path]);
  revalidatePath("/");
  return { ok: true };
}

/** Edit a kept thing in place. Nothing is locked. */
export async function updateEntryBody(id: string, body: string): Promise<CaptureResult> {
  const text = body.trim() || null;
  const supabase = await createClient();
  const { data: entry } = await supabase.from("entries").select("photo_path").eq("id", id).maybeSingle();
  if (!entry) return { ok: false, message: "That one's gone." };
  if (!text && !entry.photo_path) return deleteEntry(id); // emptied a text-only item: it's a delete
  const { error } = await supabase.from("entries").update({ body: text }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  revalidatePath("/you");
  return { ok: true };
}

/** "File now": run the partner's filing for the signed-in user on demand. */
export async function fileNow(): Promise<{ ok: true; filed: number; proposed: string | null } | { ok: false; message: string }> {
  const { runFilingFor } = await import("@/lib/partner/run-filing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Signed out." };
  try {
    const r = await runFilingFor(supabase, user.id);
    if (r.skipped === "unconfigured") return { ok: false, message: "The partner isn't connected yet (no API key)." };
    revalidatePath("/");
    revalidatePath("/you");
    return { ok: true, filed: r.filed, proposed: r.proposed };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
  }
}
