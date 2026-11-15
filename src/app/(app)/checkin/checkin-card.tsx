import { EVENING_HELLOS, MORNING_HELLOS } from "@/lib/checkins";
import { createClient } from "@/lib/supabase/server";
import { CheckinFlow } from "./checkin-flow";
import { lastNightTomorrow } from "./last-night";
import { pendingCheck } from "./pending";

/** Shows the morning check-in or the wind-down when it's due and not done or skipped. */
export async function CheckinCard({ userId, timeZone }: { userId: string; timeZone: string }) {
  const due = await pendingCheck(userId, timeZone);
  if (!due) return null;
  const pool = due.kind === "morning" ? MORNING_HELLOS : EVENING_HELLOS;
  const seed = [...due.day].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const lastNight = due.kind === "morning" ? await lastNightTomorrow(await createClient(), userId, timeZone) : null;
  return <CheckinFlow kind={due.kind} hello={pool[seed % pool.length]} pipDay={due.today} lastNight={lastNight} />;
}
