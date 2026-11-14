import { anytimeKind } from "@/lib/checkins";
import { localDay, localHour } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { CheckinFlow } from "./checkin-flow";
import { pendingCheck } from "./pending";

/**
 * The mood bar: always at the top of Today, so a missed check-in is never missed for good.
 * Hidden while the morning check-in or wind-down card is showing (one ask at a time).
 */
export async function MoodBar({ userId, timeZone }: { userId: string; timeZone: string }) {
  if (await pendingCheck(userId, timeZone)) return null;
  const now = new Date();
  const today = localDay(now, timeZone);
  const supabase = await createClient();
  const { data } = await supabase
    .from("day_checks")
    .select("kind, mood, energy")
    .eq("owner_id", userId)
    .eq("day", today)
    .eq("skipped", false)
    .not("mood", "is", null);
  const rows = data ?? [];
  const last = rows.find((r) => r.kind === "evening") ?? rows[0];
  const current = last ? { mood: last.mood as number, energy: (last.energy as number) ?? 50 } : null;
  return <CheckinFlow variant="bar" kind={anytimeKind(localHour(now, timeZone))} hello="" pipDay={today} current={current} />;
}
