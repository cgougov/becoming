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
