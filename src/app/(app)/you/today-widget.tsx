import Link from "next/link";
import { startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { getTodayIntention } from "../intention/today-intention";

/** Today at a glance. Intention + next step join in M5. */
export async function TodayWidget({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("entries")
    .select("body, photo_path", { count: "exact" })
    .eq("owner_id", userId)
    .gte("captured_at", startOfDayInTimeZone(new Date(), timeZone).toISOString())
    .order("captured_at", { ascending: false })
    .limit(1);
  const latest = data?.[0];
  const n = count ?? 0;
  const intention = await getTodayIntention(userId, timeZone);

  return (
    <Link href="/" className="flex items-center justify-between gap-3 rounded-card bg-chip px-4 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">Today</span>
        {intention && (
          <span className={`truncate text-[13px] font-medium ${intention.done_at ? "text-muted line-through" : ""}`}>{intention.text}</span>
        )}
        <span className="truncate text-[13px] text-muted">
          {n === 0 ? "Nothing kept yet." : `${n} kept · ${latest?.body ?? "a photo"}`}
        </span>
      </div>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] flex-none text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M9 6l6 6-6 6" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
