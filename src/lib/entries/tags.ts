import { createClient } from "@/lib/supabase/server";

export interface Tag {
  kind: "collection" | "person";
  id: string;
  label: string;
  slug: string;
}

export interface TagOptions {
  collections: { id: string; slug: string; name: string }[];
  people: { id: string; slug: string; name: string }[];
}

/** Attach tags to entries without joins (a schema hiccup can't blank the list). */
export async function withTags<T extends { id: string }>(userId: string, rows: T[]): Promise<(T & { tags: Tag[] })[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data: tagRows } = await supabase
    .from("entry_tags")
    .select("entry_id, kind, collection_id, person_id")
    .eq("owner_id", userId)
    .in("entry_id", rows.map((r) => r.id));
  const colIds = [...new Set((tagRows ?? []).map((t) => t.collection_id as string | null).filter((x): x is string => !!x))];
  const personIds = [...new Set((tagRows ?? []).map((t) => t.person_id as string | null).filter((x): x is string => !!x))];
  const [{ data: cols }, { data: people }] = await Promise.all([
    colIds.length ? supabase.from("collections").select("id, slug, name").in("id", colIds) : Promise.resolve({ data: [] }),
    personIds.length ? supabase.from("people").select("id, slug, name").in("id", personIds) : Promise.resolve({ data: [] }),
  ]);
  const colById = new Map((cols ?? []).map((c) => [c.id as string, c]));
  const personById = new Map((people ?? []).map((p) => [p.id as string, p]));

  const byEntry = new Map<string, Tag[]>();
  for (const t of tagRows ?? []) {
    const list = byEntry.get(t.entry_id as string) ?? [];
    if (t.kind === "collection" && t.collection_id) {
      const c = colById.get(t.collection_id as string);
      if (c) list.push({ kind: "collection", id: c.id as string, label: c.name as string, slug: c.slug as string });
    } else if (t.kind === "person" && t.person_id) {
      const p = personById.get(t.person_id as string);
      if (p) list.push({ kind: "person", id: p.id as string, label: p.name as string, slug: p.slug as string });
    }
    byEntry.set(t.entry_id as string, list);
  }
  // People first (they matter most), then collections.
  return rows.map((r) => ({ ...r, tags: (byEntry.get(r.id) ?? []).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "person" ? -1 : 1)) }));
}

export async function tagOptions(userId: string): Promise<TagOptions> {
  const supabase = await createClient();
  const [{ data: cols }, { data: people }] = await Promise.all([
    supabase.from("collections").select("id, slug, name").eq("owner_id", userId).order("position"),
    supabase.from("people").select("id, slug, name").eq("owner_id", userId).order("name").limit(200),
  ]);
  return {
    collections: (cols ?? []).map((c) => ({ id: c.id as string, slug: c.slug as string, name: c.name as string })),
    people: (people ?? []).map((p) => ({ id: p.id as string, slug: p.slug as string, name: p.name as string })),
  };
}

export { READING_WINDOW_MS, isReading } from "./reading";
