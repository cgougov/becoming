import type { PersonLast } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";

export interface PersonRow extends PersonLast {
  photo_path: string | null;
  note: string | null;
  count: number;
}

/** Everyone you've mentioned, with when you last kept something about them. */
export async function peopleWithLast(userId: string): Promise<PersonRow[]> {
  const supabase = await createClient();
  const [{ data: people }, { data: tags }] = await Promise.all([
    supabase.from("people").select("id, slug, name, close, photo_path, note").eq("owner_id", userId),
    supabase.from("entry_tags").select("person_id, entry_id").eq("owner_id", userId).eq("kind", "person"),
  ]);
  const entryIds = [...new Set((tags ?? []).map((t) => t.entry_id as string))];
  const { data: entries } = entryIds.length
    ? await supabase.from("entries").select("id, captured_at").in("id", entryIds)
    : { data: [] as { id: string; captured_at: string }[] };
  const when = new Map((entries ?? []).map((e) => [e.id as string, new Date(e.captured_at as string)]));

  const last = new Map<string, Date>();
  const count = new Map<string, number>();
  for (const t of tags ?? []) {
    const pid = t.person_id as string;
    count.set(pid, (count.get(pid) ?? 0) + 1);
    const d = when.get(t.entry_id as string);
    if (d && (!last.get(pid) || d > (last.get(pid) as Date))) last.set(pid, d);
  }

  return (people ?? [])
    .map((p) => ({
      id: p.id as string,
      slug: p.slug as string,
      name: p.name as string,
      close: !!p.close,
      photo_path: (p.photo_path as string | null) ?? null,
      note: (p.note as string | null) ?? null,
      last: last.get(p.id as string) ?? null,
      count: count.get(p.id as string) ?? 0,
    }))
    .sort((a, b) => Number(b.close) - Number(a.close) || (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));
}
