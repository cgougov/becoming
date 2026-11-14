"use server";

import { revalidatePath } from "next/cache";
import { ownerFromPhotoPath } from "@/lib/photos/path";
import { createClient } from "@/lib/supabase/server";

export type CaptureResult = { ok: true; id?: string } | { ok: false; message: string };

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
  return { ok: true, id: created?.id as string | undefined };
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

/** Live tagging: the partner reads what you just kept and tags it. Returns how it read. */
export async function tagEntry(id: string): Promise<{ tone: "hard" | "neutral" | "good" | null }> {
  const { tagEntryWith } = await import("@/lib/partner/run-tagging");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tone: null };
  try {
    const r = await tagEntryWith(supabase, user.id, id);
    revalidatePath("/");
    revalidatePath("/you");
    return { tone: r.tone };
  } catch (e) {
    // Leave it unread: the shimmer stops on its own after two minutes and the nightly
    // safety net (/api/partner/tag) tries again.
    console.error("tagEntry:", e instanceof Error ? e.message : e);
    return { tone: null };
  }
}

/**
 * The person sets an entry's tags themselves (tap a tag → sheet → done). Replaces all tags on
 * the entry. New collection names become collections; new person names become people.
 */
export async function setEntryTags(
  entryId: string,
  input: { collectionIds: string[]; newCollections: string[]; personIds: string[]; newPeople: string[] },
): Promise<CaptureResult> {
  const { ensurePeople } = await import("@/lib/partner/run-tagging");
  const { normalizeCollectionName, slugify, RESERVED_SLUGS } = await import("@/lib/collections");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Signed out." };

  const collectionIds = [...input.collectionIds];
  if (input.newCollections.length) {
    const { count } = await supabase.from("collections").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
    let position = count ?? 0;
    for (const raw of input.newCollections) {
      const name = normalizeCollectionName(raw);
      const slug = name ? slugify(name) : null;
      if (!name || !slug || RESERVED_SLUGS.has(slug)) continue;
      const { data: existing } = await supabase.from("collections").select("id").eq("owner_id", user.id).eq("slug", slug).maybeSingle();
      if (existing) {
        collectionIds.push(existing.id as string);
        continue;
      }
      const { data: created } = await supabase
        .from("collections")
        .insert({ owner_id: user.id, slug, name, origin: "user", position: position++ })
        .select("id")
        .maybeSingle();
      if (created) collectionIds.push(created.id as string);
    }
  }
  const personIds = [...input.personIds, ...(await ensurePeople(supabase, user.id, input.newPeople))];

  const { error: delErr } = await supabase.from("entry_tags").delete().eq("entry_id", entryId).eq("owner_id", user.id);
  if (delErr) return { ok: false, message: delErr.message };
  const rows = [
    ...[...new Set(collectionIds)].map((cid) => ({ owner_id: user.id, entry_id: entryId, kind: "collection", collection_id: cid, source: "user" })),
    ...[...new Set(personIds)].map((pid) => ({ owner_id: user.id, entry_id: entryId, kind: "person", person_id: pid, source: "user" })),
  ];
  if (rows.length) {
    const { error } = await supabase.from("entry_tags").insert(rows);
    if (error) return { ok: false, message: error.message };
  }
  await supabase.from("entries").update({ tagged_at: new Date().toISOString() }).eq("id", entryId).eq("owner_id", user.id);
  revalidatePath("/");
  revalidatePath("/you");
  return { ok: true };
}
