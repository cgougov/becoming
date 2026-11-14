"use server";

import { revalidatePath } from "next/cache";
import { RESERVED_SLUGS, normalizeCollectionName, slugify } from "@/lib/collections";
import { createClient } from "@/lib/supabase/server";

export type NewCollectionState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

/** "Keep track of something new": one input, in the user's words. The partner-proposed path comes later. */
export async function addCollection(_prev: NewCollectionState, formData: FormData): Promise<NewCollectionState> {
  const name = normalizeCollectionName(String(formData.get("name") ?? ""));
  const slug = name ? slugify(name) : null;
  if (!name || !slug) return { status: "error", message: "Give it a short name." };
  if (RESERVED_SLUGS.has(slug)) return { status: "error", message: "That name is taken by the app itself." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Signed out." };

  const { count } = await supabase.from("collections").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
  const { error } = await supabase
    .from("collections")
    .insert({ owner_id: user.id, slug, name, origin: "user", position: count ?? 0 });
  if (error) return { status: "error", message: error.code === "23505" ? "You already have that one." : error.message };

  revalidatePath("/you");
  return { status: "ok" };
}

async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

function ownsPath(path: string, userId: string) {
  return path.split("/")[0] === userId;
}

// ---- directions -------------------------------------------------------------

export type DirectionState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

export async function addDirection(_prev: DirectionState, formData: FormData): Promise<DirectionState> {
  const text = String(formData.get("text") ?? "").trim().replace(/\s+/g, " ");
  const horizon = String(formData.get("horizon") ?? "month");
  if (!text || text.length > 120) return { status: "error", message: "one line, in your words." };
  if (!["week", "month", "year"].includes(horizon)) return { status: "error", message: "pick week, month or year." };
  const c = await me();
  if (!c) return { status: "error", message: "Signed out." };
  const { error } = await c.supabase.from("directions").insert({ owner_id: c.user.id, text, horizon });
  if (error) return { status: "error", message: error.message };
  revalidatePath("/you");
  return { status: "ok" };
}

export async function archiveDirection(id: string): Promise<void> {
  const c = await me();
  if (!c) return;
  await c.supabase.from("directions").update({ archived_at: new Date().toISOString() }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you");
}

export async function setDirectionPhoto(id: string, path: string): Promise<void> {
  const c = await me();
  if (!c || !ownsPath(path, c.user.id)) return;
  await c.supabase.from("directions").update({ photo_path: path }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you");
}

// ---- collections ------------------------------------------------------------

export async function setCollectionCover(id: string, path: string): Promise<void> {
  const c = await me();
  if (!c || !ownsPath(path, c.user.id)) return;
  await c.supabase.from("collections").update({ cover_path: path }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you", "layout");
}

// ---- people -----------------------------------------------------------------

export async function setPersonClose(id: string, close: boolean): Promise<void> {
  const c = await me();
  if (!c) return;
  await c.supabase.from("people").update({ close }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you", "layout");
  revalidatePath("/");
}

export async function setPersonNote(id: string, note: string): Promise<void> {
  const c = await me();
  if (!c) return;
  const clean = note.trim().slice(0, 1000) || null;
  await c.supabase.from("people").update({ note: clean }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you", "layout");
}

export async function setPersonPhoto(id: string, path: string): Promise<void> {
  const c = await me();
  if (!c || !ownsPath(path, c.user.id)) return;
  await c.supabase.from("people").update({ photo_path: path }).eq("id", id).eq("owner_id", c.user.id);
  revalidatePath("/you", "layout");
}
