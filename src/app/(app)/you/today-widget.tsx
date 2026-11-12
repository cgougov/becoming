import Link from "next/link";
import { startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";

/** Today at a glance: how many captures, and the latest one. Intention + next step join in M5. */
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

  return (
    <Link href="/" className="block rounded-2xl border border-current/10 bg-current/[.03] p-4 transition-colors hover:bg-current/[.06]">
      <div className="flex items-baseline justify-between">
        <h2 className="font-medium">Today</h2>
        <span className="text-sm tabular-nums opacity-50">{n}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm opacity-70">
        {n === 0 ? "Nothing yet. Tap to drop something in." : latest?.body ?? "A photo."}
      </p>
    </Link>
  );
}
