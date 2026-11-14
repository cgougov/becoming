import { checkDay, checkWindow, type CheckKind } from "@/lib/checkins";
import { localDay, localHour } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";

/** The check-in that's due right now, if it hasn't been done or skipped. */
export async function pendingCheck(userId: string, timeZone: string): Promise<{ kind: CheckKind; day: string; today: string } | null> {
  const now = new Date();
  const hour = localHour(now, timeZone);
  const kind = checkWindow(hour);
  if (!kind) return null;
  const today = localDay(now, timeZone);
  const day = checkDay(kind, today, hour);
  const supabase = await createClient();
  const { data } = await supabase.from("day_checks").select("id").eq("owner_id", userId).eq("day", day).eq("kind", kind).maybeSingle();
  return data ? null : { kind, day, today };
}
