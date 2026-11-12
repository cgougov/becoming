"use server";

import { revalidatePath } from "next/cache";
import { ownerFromPhotoPath } from "@/lib/photos/path";
import { createClient } from "@/lib/supabase/server";

export type CaptureResult = { ok: true } | { ok: false; message: string };

/**
 * Save one entry. Nothing is required except that there's *something*: text or a photo.
 * Photos are uploaded by the browser straight to storage; we only get the path.
 */
export async function createEntry(input: { body?: string; photoPath?: string | null }): Promise<CaptureResult> {
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

  const { error } = await supabase.from("entries").insert({ owner_id: user.id, body, photo_path: photoPath, source: "capture" });
  if (error) return { ok: false, message: error.message };

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
