import { formatDayLabel, localDay, startOfDayInTimeZone } from "@/lib/entries/time";
import { tagOptions, withTags } from "@/lib/entries/tags";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_FIELDS, EntryList, type EntryRow } from "./entry-list";

const PAST_DAYS = 6;

/** Day is home: today open at the top, the last few days folded below. */
export async function DaysList({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  // Walk back day by day so DST changes don't shift a midnight.
  let since = startOfDayInTimeZone(now, timeZone);
  for (let i = 0; i < PAST_DAYS; i++) since = startOfDayInTimeZone(new Date(since.getTime() - 1), timeZone);

  const [{ data, error }, options] = await Promise.all([
    supabase
      .from("entries")
      .select(ENTRY_FIELDS)
      .eq("owner_id", userId)
      .gte("captured_at", since.toISOString())
      .order("captured_at", { ascending: false }),
    tagOptions(userId),
  ]);
  if (error) console.error("DaysList:", error.message);
  const entries = await withTags(userId, (data ?? []) as Omit<EntryRow, "tags">[]);

  const today = localDay(now, timeZone);
  const groups = new Map<string, EntryRow[]>();
  for (const e of entries) {
    const d = localDay(new Date(e.captured_at), timeZone);
    groups.set(d, [...(groups.get(d) ?? []), e]);
  }
  const past = [...groups.keys()].filter((d) => d !== today).sort().reverse();

  if (error) {
    return (
      <p className="text-sm text-red-400" role="alert">
        Couldn&apos;t load your days ({error.message}).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1" aria-label="Today">
        <h2 className="text-[13px] font-semibold text-muted">today · {formatDayLabel(now, timeZone).toLowerCase()}</h2>
        <EntryList entries={groups.get(today) ?? []} timeZone={timeZone} options={options} empty="nothing yet today. anything counts." />
      </section>
      {past.map((d) => {
        const list = groups.get(d) ?? [];
        const label = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(new Date(list[0].captured_at)).toLowerCase();
        return (
          <details key={d} className="group/day">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[13px] font-semibold text-muted [&::-webkit-details-marker]:hidden">
              <span>
                {label} · {list.length} kept
              </span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-open/day:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" />
              </svg>
            </summary>
            <EntryList entries={list} timeZone={timeZone} options={options} />
          </details>
        );
      })}
    </div>
  );
}
