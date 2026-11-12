import { startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { EntryList, type EntryRow } from "./entry-list";

export async function TodayList({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  const { data } = await supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, collection_id, collection:collections(slug, name)")
    .eq("owner_id", userId)
    .gte("captured_at", startOfDayInTimeZone(now, timeZone).toISOString())
    .order("captured_at", { ascending: false });
  const entries = (data ?? []) as unknown as EntryRow[];

  return (
    <section className="flex flex-col gap-3" aria-label="Kept today">
      <div className="flex items-baseline justify-between text-[13px] font-semibold text-muted">
        <h2>Kept today</h2>
        <span>{entries.length || ""}</span>
      </div>
      <EntryList entries={entries} timeZone={timeZone} empty="Nothing yet today. Anything counts." />
    </section>
  );
}
