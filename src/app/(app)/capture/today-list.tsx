import { startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { EntryList, type EntryRow } from "./entry-list";

/** Attach each entry's collection (slug, name) without a join, so a schema hiccup can't blank the list. */
export async function withCollections(userId: string, rows: EntryRow[]): Promise<EntryRow[]> {
  const ids = [...new Set(rows.map((r) => r.collection_id).filter((id): id is string => !!id))];
  if (ids.length === 0) return rows;
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("id, slug, name").eq("owner_id", userId).in("id", ids);
  const byId = new Map((data ?? []).map((c) => [c.id as string, { slug: c.slug as string, name: c.name as string }]));
  return rows.map((r) => ({ ...r, collection: r.collection_id ? (byId.get(r.collection_id) ?? null) : null }));
}

export async function TodayList({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  const { data, error } = await supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, collection_id")
    .eq("owner_id", userId)
    .gte("captured_at", startOfDayInTimeZone(now, timeZone).toISOString())
    .order("captured_at", { ascending: false });
  if (error) console.error("TodayList:", error.message);
  const entries = await withCollections(userId, (data ?? []) as EntryRow[]);

  return (
    <section className="flex flex-col gap-3" aria-label="Kept today">
      <h2 className="text-[13px] font-semibold text-muted">Today</h2>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          Couldn&apos;t load today ({error.message}).
        </p>
      ) : (
        <EntryList entries={entries} timeZone={timeZone} empty="Nothing yet today. Anything counts." />
      )}
    </section>
  );
}
