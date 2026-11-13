import { localDay, startOfWeekInTimeZone, weekDays } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";

/** Seven soft dots: filled on days you kept something. No number, no streak. */
export async function WeekDots({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  const days = weekDays(now, timeZone);
  const today = localDay(now, timeZone);
  const { data } = await supabase
    .from("entries")
    .select("captured_at")
    .eq("owner_id", userId)
    .gte("captured_at", startOfWeekInTimeZone(now, timeZone).toISOString())
    .limit(500);
  const kept = new Set((data ?? []).map((r) => localDay(new Date(r.captured_at as string), timeZone)));
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex items-center justify-between px-1" aria-label="This week">
      {days.map((d, i) => {
        const on = kept.has(d);
        const isToday = d === today;
        const future = d > today;
        return (
          <div key={d} className="flex flex-col items-center gap-1.5">
            <span
              className={`h-[10px] w-[10px] rounded-full ${on ? "bg-accent" : future ? "bg-transparent ring-1 ring-foreground/10" : "bg-foreground/10"} ${isToday && !on ? "ring-2 ring-accent/50" : ""}`}
            />
            <span className={`text-[10px] font-semibold ${isToday ? "text-foreground" : "text-muted"}`}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
