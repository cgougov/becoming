import { formatDayLabel, startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { EntryList, type EntryRow } from "./entry-list";

export async function TodayList({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  const { data } = await supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, collection_id")
    .eq("owner_id", userId)
    .gte("captured_at", startOfDayInTimeZone(now, timeZone).toISOString())
    .order("captured_at", { ascending: false });

  return (
    <section className="flex flex-col gap-3" aria-label="Today">
      <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">{formatDayLabel(now, timeZone)}</h2>
      <EntryList entries={(data ?? []) as EntryRow[]} timeZone={timeZone} empty="Nothing yet today. Anything counts." />
    </section>
  );
}
